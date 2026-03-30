'use client';

import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import type {
  DashboardMenuBootstrapPayload,
  MenuRouteAccess
} from '@/lib/menu-access';
import {
  buildDashboardMenuBootstrapFromNodes,
  dashboardMenuBootstrapFromPayload,
  filterSidebarMenuNodes,
  unwrapMenuTree
} from '@/lib/menu-tree-nav';
import { getAccessToken, syncAuthCookieFromStorage } from '@/lib/auth-storage';
import { isSuccess } from '@/lib/response-code';
import { menuControllerTree } from '@/services/api/menus';
import { userControllerMe } from '@/services/api/users';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { toast } from 'sonner';

export type DashboardMenuContextValue = {
  bootstrapped: boolean;
  menuNodesRaw: MenuTreeNodeView[];
  menuNodesForSidebar: MenuTreeNodeView[];
  /** 为 null 表示未加载成功或无可用菜单路径 */
  menuRouteAccess: MenuRouteAccess | null;
  fallbackPath: string;
};

const DashboardMenuContext = createContext<DashboardMenuContextValue | null>(
  null
);

export function useDashboardMenu(): DashboardMenuContextValue {
  const ctx = useContext(DashboardMenuContext);
  if (!ctx) {
    throw new Error(
      'useDashboardMenu must be used within DashboardMenuProvider'
    );
  }
  return ctx;
}

export function DashboardMenuProvider({
  children,
  initialMenuBootstrap = null
}: {
  children: ReactNode;
  /** 服务端已拉取 /api/menus/tree 时传入，客户端不再重复请求菜单树 */
  initialMenuBootstrap?: DashboardMenuBootstrapPayload | null;
}) {
  const router = useRouter();
  const [serverBootstrap] = useState(() =>
    initialMenuBootstrap != null
      ? dashboardMenuBootstrapFromPayload(initialMenuBootstrap)
      : null
  );

  const [bootstrapped, setBootstrapped] = useState(() => !!serverBootstrap);
  const [menuNodesRaw, setMenuNodesRaw] = useState<MenuTreeNodeView[]>(
    () => serverBootstrap?.menuNodesRaw ?? []
  );
  const [menuRouteAccess, setMenuRouteAccess] =
    useState<MenuRouteAccess | null>(
      () => serverBootstrap?.menuRouteAccess ?? null
    );
  const [fallbackPath, setFallbackPath] = useState(
    () => serverBootstrap?.fallbackPath ?? '/dashboard/overview'
  );

  const menuNodesForSidebar = useMemo(
    () => filterSidebarMenuNodes(menuNodesRaw),
    [menuNodesRaw]
  );

  useEffect(() => {
    syncAuthCookieFromStorage();
  }, []);

  /** 服务端已注入菜单时仅校验会话；否则 me + tree 拉取后用 buildDashboardMenuBootstrapFromNodes 统一聚合 */
  useEffect(() => {
    const token = getAccessToken()?.trim();
    if (!token) {
      router.replace('/auth/sign-in');
      return;
    }

    let alive = true;
    const ac = new AbortController();

    void (async () => {
      try {
        const meRes = await userControllerMe({
          signal: ac.signal,
          skipErrorHandler: true
        });
        if (!alive || ac.signal.aborted) return;
        const meBody = meRes as { code?: number; data?: API.UserProfileDto };
        if (!isSuccess(meBody.code) || !meBody.data) {
          router.replace('/auth/sign-in');
          return;
        }

        if (serverBootstrap) {
          if (serverBootstrap.menuRouteAccess.allowedPaths.size === 0) {
            toast.error('当前账号未分配任何可访问菜单');
          }
          return;
        }

        const treeRes = await menuControllerTree({
          signal: ac.signal,
          skipErrorHandler: true
        });
        if (!alive || ac.signal.aborted) return;

        const treeBody = treeRes as { code?: number; message?: string };

        if (!isSuccess(treeBody.code)) {
          setMenuRouteAccess(null);
          setMenuNodesRaw([]);
          setBootstrapped(true);
          toast.error(
            treeBody.message ??
              '加载菜单权限失败，请确认后端已实现 GET /api/menus/tree'
          );
          return;
        }

        const bootstrap = buildDashboardMenuBootstrapFromNodes(
          unwrapMenuTree(treeRes)
        );

        if (bootstrap.menuRouteAccess.allowedPaths.size === 0) {
          toast.error('当前账号未分配任何可访问菜单');
        }

        setMenuRouteAccess(bootstrap.menuRouteAccess);
        setMenuNodesRaw(bootstrap.menuNodesRaw);
        setFallbackPath(bootstrap.fallbackPath);
        setBootstrapped(true);
      } catch (e) {
        if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
        if (ac.signal.aborted) return;
        if (!alive) return;
        if (!serverBootstrap) {
          setMenuRouteAccess(null);
          setMenuNodesRaw([]);
          setBootstrapped(true);
          toast.error(
            e instanceof Error ? e.message : '加载菜单权限失败，请稍后重试'
          );
        } else {
          router.replace('/auth/sign-in');
        }
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [router, serverBootstrap]);

  const value = useMemo(
    (): DashboardMenuContextValue => ({
      bootstrapped,
      menuNodesRaw,
      menuNodesForSidebar,
      menuRouteAccess,
      fallbackPath
    }),
    [
      bootstrapped,
      menuNodesRaw,
      menuNodesForSidebar,
      menuRouteAccess,
      fallbackPath
    ]
  );

  return (
    <DashboardMenuContext.Provider value={value}>
      {children}
    </DashboardMenuContext.Provider>
  );
}
