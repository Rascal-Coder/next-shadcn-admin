import { cache } from 'react';

import { normalizeAppPathname } from '@/lib/app-pathname';
import {
  buildDashboardMenuBootstrapFromNodes,
  type DashboardMenuBootstrapData,
  unwrapMenuTree
} from '@/lib/menu-tree-nav';
import {
  isRouteAllowedByMenuAccess,
  type MenuRouteAccess
} from '@/lib/menu-access';
import { isSuccess } from '@/lib/response-code';

function resolveServerApiBase(): string {
  const raw = (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ''
  ).trim();
  return raw.replace(/\/$/, '');
}

/**
 * 使用 Cookie 中的 Bearer 拉取菜单树并聚合路由权限。
 * 同一次 RSC 请求内去重，避免 layout 内重复请求。
 */
export const fetchDashboardMenuBootstrapFromBearerToken = cache(
  async function fetchDashboardMenuBootstrapFromBearerToken(
    token: string
  ): Promise<DashboardMenuBootstrapData | null> {
    const base = resolveServerApiBase();
    if (!base) return null;
    try {
      const res = await fetch(`${base}/api/menus/tree`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const body = (await res.json()) as {
        code?: number;
        data?: API.MenuTreeDataDto;
      };
      if (!isSuccess(body.code)) return null;
      return buildDashboardMenuBootstrapFromNodes(unwrapMenuTree(body));
    } catch {
      return null;
    }
  }
);

/**
 * 是否在服务端对当前路径触发 notFound：仅当菜单已成功解析且明确不包含该路径时。
 * `/dashboard` 只做重定向，不在此拦截；菜单未拉到或为空时交给客户端提示，避免误 404。
 */
export function shouldServerNotFoundDashboardPath(
  pathname: string,
  access: MenuRouteAccess | null
): boolean {
  const p = normalizeAppPathname(pathname);
  if (p === '/dashboard') return false;
  if (!access || access.allowedPaths.size === 0) return false;
  return !isRouteAllowedByMenuAccess(p, access);
}
