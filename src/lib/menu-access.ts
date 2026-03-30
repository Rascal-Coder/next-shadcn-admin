import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import { normalizeAppPathname } from '@/lib/app-pathname';

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

/** 路由守卫所需：精确路径 + 仅 MENU 节点允许的前缀子路径（用于动态路由段等） */
export type MenuRouteAccess = {
  allowedPaths: Set<string>;
  /** 仅 MENU 类型：允许 pathname 为 `path/` 或 `activePath/` 下的子路径；DIRECTORY 不在此集合，避免目录 path 放行整棵子树 */
  wildcardPrefixRoots: Set<string>;
  /** 目录入口 path → 落地页（后端 redirectPath，或首个子 MENU），供守卫与侧栏与 redirect 一致 */
  directoryEntryAliases: Map<string, string>;
};

/** RSC → Client 传递时 Set/Map 需转为可 JSON 序列化结构 */
export type MenuRouteAccessPayload = {
  allowedPaths: string[];
  wildcardPrefixRoots: string[];
  directoryEntryAliases: [string, string][];
};

export function menuRouteAccessToPayload(
  access: MenuRouteAccess
): MenuRouteAccessPayload {
  return {
    allowedPaths: [...access.allowedPaths],
    wildcardPrefixRoots: [...access.wildcardPrefixRoots],
    directoryEntryAliases: [...access.directoryEntryAliases.entries()]
  };
}

export function menuRouteAccessFromPayload(
  p: MenuRouteAccessPayload
): MenuRouteAccess {
  return {
    allowedPaths: new Set(p.allowedPaths),
    wildcardPrefixRoots: new Set(p.wildcardPrefixRoots),
    directoryEntryAliases: new Map(p.directoryEntryAliases ?? [])
  };
}

/** 服务端拉取菜单树后注入 DashboardMenuProvider 的载荷 */
export type DashboardMenuBootstrapPayload = {
  menuNodesRaw: MenuTreeNodeView[];
  menuRouteAccess: MenuRouteAccessPayload;
  fallbackPath: string;
};

/**
 * 从菜单树提取路由访问信息（含 path、activePath；目录/菜单参与，按钮不参与页面路由）。
 */
export function collectMenuRouteAccess(
  nodes: MenuTreeNodeView[]
): MenuRouteAccess {
  const allowedPaths = new Set<string>();
  const wildcardPrefixRoots = new Set<string>();

  function visit(node: MenuTreeNodeView): void {
    if (node.menuType === 'BUTTON') {
      return;
    }

    const path = normalizeMenuRoutePath(node.path);
    if (path) {
      allowedPaths.add(path);
      if (node.menuType === 'MENU') {
        wildcardPrefixRoots.add(path);
      }
    }
    const active = normalizeMenuRoutePath(node.activePath);
    if (active) {
      allowedPaths.add(active);
      if (node.menuType === 'MENU') {
        wildcardPrefixRoots.add(active);
      }
    }

    for (const child of node.children ?? []) {
      visit(child);
    }
  }

  for (const n of nodes) {
    visit(n);
  }
  const directoryEntryAliases = collectDirectoryEntryAliases(nodes);
  return { allowedPaths, wildcardPrefixRoots, directoryEntryAliases };
}

function findNodeByNormalizedPath(
  nodes: MenuTreeNodeView[],
  pathname: string
): MenuTreeNodeView | null {
  const p = normalizeAppPathname(pathname);
  for (const n of nodes) {
    const path = normalizeMenuRoutePath(n.path);
    if (path === p) return n;
    const active = normalizeMenuRoutePath(n.activePath);
    if (active === p) return n;
    const nested = findNodeByNormalizedPath(n.children ?? [], pathname);
    if (nested) return nested;
  }
  return null;
}

function firstNavigableMenuPathInSubtree(
  node: MenuTreeNodeView
): string | null {
  const children = [...(node.children ?? [])]
    .filter((c) => c.visible && c.menuType !== 'BUTTON')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  for (const c of children) {
    if (c.menuType === 'MENU') {
      const url = normalizeMenuRoutePath(c.path);
      if (url) return url;
    }
    const nested = firstNavigableMenuPathInSubtree(c);
    if (nested) return nested;
  }
  return null;
}

function isSafeInternalRedirectPath(p: string | null): p is string {
  return !!p && p.startsWith('/') && !p.startsWith('//');
}

/** 单节点：优先后端 redirectPath，否则子树按 sortOrder 第一个 MENU */
export function resolveDirectoryEntryRedirectTargetForNode(
  node: MenuTreeNodeView
): string | null {
  const explicit = normalizeMenuRoutePath(node.redirectPath);
  if (isSafeInternalRedirectPath(explicit)) return explicit;
  return firstNavigableMenuPathInSubtree(node);
}

function shouldRegisterDirectoryEntryAlias(node: MenuTreeNodeView): boolean {
  if (node.menuType === 'BUTTON') return false;
  const p = normalizeMenuRoutePath(node.path);
  if (!p) return false;
  if (node.redirectPath?.trim()) return true;
  if (node.menuType === 'DIRECTORY') return true;
  return false;
}

function collectDirectoryEntryAliases(
  nodes: MenuTreeNodeView[]
): Map<string, string> {
  const map = new Map<string, string>();
  function walk(ns: MenuTreeNodeView[]): void {
    for (const n of ns) {
      const p = normalizeMenuRoutePath(n.path);
      if (p && shouldRegisterDirectoryEntryAlias(n)) {
        const t = resolveDirectoryEntryRedirectTargetForNode(n);
        if (t) map.set(p, t);
      }
      walk(n.children ?? []);
    }
  }
  walk(nodes);
  return map;
}

/** 由菜单树解析某 path 作为目录入口时的落地地址（与服务端 redirect 同源） */
export function resolveDirectoryEntryRedirectTarget(
  nodes: MenuTreeNodeView[],
  pathname: string
): string | null {
  const p = normalizeAppPathname(pathname);
  const found = findNodeByNormalizedPath(nodes, p);
  if (!found) return null;
  return resolveDirectoryEntryRedirectTargetForNode(found);
}

/**
 * 兼容：仅返回所有「精确路径」集合（不含子路径推断规则）。
 */
export function collectAllowedRoutePrefixes(
  nodes: MenuTreeNodeView[]
): Set<string> {
  return collectMenuRouteAccess(nodes).allowedPaths;
}

/** 当前路径是否在菜单允许范围内（精确 + 仅 MENU 路径前缀子路径） */
export function isRouteAllowedByMenuAccess(
  pathname: string,
  access: MenuRouteAccess
): boolean {
  const p = normalizeAppPathname(pathname);
  if (access.allowedPaths.has(p)) return true;
  const aliasTarget = access.directoryEntryAliases.get(p);
  if (aliasTarget) {
    return isRouteAllowedByMenuAccess(aliasTarget, access);
  }
  for (const prefix of access.wildcardPrefixRoots) {
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
