'use client';

import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import {
  collectAllowedRoutePrefixes,
  MENU_ROUTE_GUARD_BYPASS_ROLE_CODES
} from '@/lib/menu-access';
import {
  filterSidebarMenuNodes,
  pickMenuFallbackPath,
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
  bypassMenuGuard: boolean;
  menuNodesRaw: MenuTreeNodeView[];
  menuNodesForSidebar: MenuTreeNodeView[];
  menuPrefixes: Set<string> | null;
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

export function DashboardMenuProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [bypassMenuGuard, setBypassMenuGuard] = useState(false);
  const [menuNodesRaw, setMenuNodesRaw] = useState<MenuTreeNodeView[]>([]);
  const [menuPrefixes, setMenuPrefixes] = useState<Set<string> | null>(null);
  const [fallbackPath, setFallbackPath] = useState('/dashboard/overview');

  const menuNodesForSidebar = useMemo(
    () => filterSidebarMenuNodes(menuNodesRaw),
    [menuNodesRaw]
  );

  useEffect(() => {
    syncAuthCookieFromStorage();
  }, []);

  useEffect(() => {
    const token = getAccessToken()?.trim();
    if (!token) {
      router.replace('/auth/sign-in');
      return;
    }

    const ac = new AbortController();
    setBootstrapped(false);

    void (async () => {
      try {
        const meRes = await userControllerMe({
          signal: ac.signal,
          skipErrorHandler: true
        });
        if (ac.signal.aborted) return;

        const meBody = meRes as { code?: number; data?: API.UserProfileDto };
        if (!isSuccess(meBody.code) || !meBody.data) {
          router.replace('/auth/sign-in');
          return;
        }

        const bypass = MENU_ROUTE_GUARD_BYPASS_ROLE_CODES.has(
          meBody.data.roleCode
        );
        setBypassMenuGuard(bypass);

        const treeRes = await menuControllerTree({
          signal: ac.signal,
          skipErrorHandler: true
        });
        if (ac.signal.aborted) return;

        const treeBody = treeRes as { code?: number; message?: string };
        let nodes: MenuTreeNodeView[] = [];

        if (!isSuccess(treeBody.code)) {
          if (!bypass) {
            setMenuPrefixes(null);
            setMenuNodesRaw([]);
            setBootstrapped(false);
            toast.error(
              treeBody.message ??
                '加载菜单权限失败，请确认后端已实现 GET /api/menus/tree'
            );
            return;
          }
          toast.error(
            treeBody.message ??
              '加载菜单树失败，侧边栏将回退为本地导航（仅超级管理员）'
          );
        } else {
          nodes = unwrapMenuTree(treeRes);
        }

        const prefixes = collectAllowedRoutePrefixes(nodes);

        if (!bypass) {
          if (prefixes.size === 0) {
            setMenuPrefixes(null);
            setMenuNodesRaw([]);
            setBootstrapped(false);
            toast.error('当前账号未分配任何可访问菜单');
            return;
          }
          setMenuPrefixes(prefixes);
        } else {
          setMenuPrefixes(null);
        }

        const fallback = pickMenuFallbackPath(nodes, prefixes);
        setMenuNodesRaw(nodes);
        setFallbackPath(fallback);
        setBootstrapped(true);
      } catch (e) {
        if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
        if (ac.signal.aborted) return;
        setMenuPrefixes(null);
        setMenuNodesRaw([]);
        setBootstrapped(false);
        toast.error(
          e instanceof Error ? e.message : '加载菜单权限失败，请稍后重试'
        );
      }
    })();

    return () => ac.abort();
  }, [router]);

  const value = useMemo(
    (): DashboardMenuContextValue => ({
      bootstrapped,
      bypassMenuGuard,
      menuNodesRaw,
      menuNodesForSidebar,
      menuPrefixes,
      fallbackPath
    }),
    [
      bootstrapped,
      bypassMenuGuard,
      menuNodesRaw,
      menuNodesForSidebar,
      menuPrefixes,
      fallbackPath
    ]
  );

  return (
    <DashboardMenuContext.Provider value={value}>
      {children}
    </DashboardMenuContext.Provider>
  );
}
