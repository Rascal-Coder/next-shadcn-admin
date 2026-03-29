import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';

/** 与内置超级管理员一致时跳过菜单路由校验（仍受后端 API 鉴权） */
export const MENU_ROUTE_GUARD_BYPASS_ROLE_CODES = new Set(['super_admin']);

/** 菜单 path / activePath 与前端 pathname 对齐时使用 */
export function normalizeMenuRoutePath(
  raw: string | undefined | null
): string | null {
  if (raw === undefined || raw === null) return null;
  const t = raw.trim();
  if (!t || t === '#') return null;
  let p = t.startsWith('/') ? t : `/${t}`;
  p = p.replace(/\/+$/g, '');
  return p.length > 0 ? p : '/';
}

/**
 * 从菜单树提取当前用户可访问的前缀路径（含 path、activePath；目录/菜单参与，按钮不参与页面路由）。
 */
export function collectAllowedRoutePrefixes(
  nodes: MenuTreeNodeView[]
): Set<string> {
  const prefixes = new Set<string>();

  function visit(node: MenuTreeNodeView): void {
    if (node.menuType === 'BUTTON') {
      return;
    }

    const path = normalizeMenuRoutePath(node.path);
    if (path) {
      prefixes.add(path);
    }
    const active = normalizeMenuRoutePath(node.activePath);
    if (active) {
      prefixes.add(active);
    }

    for (const child of node.children ?? []) {
      visit(child);
    }
  }

  for (const n of nodes) {
    visit(n);
  }
  return prefixes;
}

function normalizePathname(pathname: string): string {
  const base = pathname.split('?')[0] ?? pathname;
  if (!base || base === '/') return '/';
  return base.replace(/\/+$/g, '') || '/';
}

/** 当前路径是否在菜单允许的某一前缀下 */
export function isRouteAllowedByMenuPrefixes(
  pathname: string,
  prefixes: Set<string>
): boolean {
  const p = normalizePathname(pathname);
  if (prefixes.has(p)) return true;
  for (const prefix of prefixes) {
    if (prefix === '/') continue;
    if (p.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

/** 按树前序取第一个可导航 path，作为无权访问时的回退地址 */
export function pickFirstNavigableMenuPath(
  nodes: MenuTreeNodeView[]
): string | null {
  for (const node of nodes) {
    if (node.menuType !== 'BUTTON') {
      const path = normalizeMenuRoutePath(node.path);
      if (path) return path;
    }
    const nested = pickFirstNavigableMenuPath(node.children ?? []);
    if (nested) return nested;
  }
  return null;
}
