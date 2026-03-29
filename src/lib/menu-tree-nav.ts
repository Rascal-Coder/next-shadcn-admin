import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import { Icons } from '@/components/icons';
import {
  normalizeMenuRoutePath,
  pickFirstNavigableMenuPath
} from '@/lib/menu-access';

export function unwrapMenuTree(raw: unknown): MenuTreeNodeView[] {
  if (!raw || typeof raw !== 'object') return [];
  const data = (raw as { data?: API.MenuTreeDataDto }).data;
  return Array.isArray(data?.items) ? (data!.items as MenuTreeNodeView[]) : [];
}

function normalizePathname(pathname: string): string {
  const base = pathname.split('?')[0] ?? pathname;
  if (!base || base === '/') return '/';
  return base.replace(/\/+$/g, '') || '/';
}

export function filterSidebarMenuNodes(
  nodes: MenuTreeNodeView[]
): MenuTreeNodeView[] {
  return [...nodes]
    .filter((n) => n.visible && n.menuType !== 'BUTTON')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((n) => ({
      ...n,
      children: filterSidebarMenuNodes(n.children ?? [])
    }));
}

export function resolveMenuIconKey(
  icon?: string
): keyof typeof Icons | undefined {
  if (!icon?.trim()) return undefined;
  const k = icon.trim() as keyof typeof Icons;
  return k in Icons ? k : undefined;
}

/** 当前路由是否视为命中该节点（path 或 activePath） */
export function menuNodeMatchesPathname(
  pathname: string,
  node: MenuTreeNodeView
): boolean {
  const p = normalizePathname(pathname);
  for (const raw of [node.path, node.activePath]) {
    const route = normalizeMenuRoutePath(raw);
    if (!route) continue;
    if (p === route) return true;
    if (route !== '/' && p.startsWith(`${route}/`)) return true;
  }
  return false;
}

/** 子树内是否有任一导航节点匹配当前 path（用于展开父级） */
export function menuSubtreeHasActivePath(
  pathname: string,
  node: MenuTreeNodeView
): boolean {
  if (node.menuType !== 'BUTTON' && menuNodeMatchesPathname(pathname, node)) {
    return true;
  }
  for (const c of node.children ?? []) {
    if (menuSubtreeHasActivePath(pathname, c)) return true;
  }
  return false;
}

export type KbarMenuEntry = {
  id: string;
  name: string;
  section: string;
  url: string;
};

/** 从用户菜单树生成 KBar 可跳转项（仅带真实 path 的 MENU） */
export function collectKbarEntriesFromMenuTree(
  nodes: MenuTreeNodeView[],
  section = 'Navigation'
): KbarMenuEntry[] {
  const out: KbarMenuEntry[] = [];
  const sorted = [...nodes]
    .filter((n) => n.visible && n.menuType !== 'BUTTON')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const node of sorted) {
    const children = node.children ?? [];
    const subsection =
      children.length > 0 ? node.name.trim() || section : section;

    if (children.length > 0) {
      out.push(...collectKbarEntriesFromMenuTree(children, subsection));
    }

    if (node.menuType === 'MENU') {
      const url = normalizeMenuRoutePath(node.path);
      if (url) {
        out.push({
          id: `menu-${node.id}`,
          name: node.name,
          section,
          url
        });
      }
    }
  }

  return out;
}

export function pickMenuFallbackPath(
  nodes: MenuTreeNodeView[],
  prefixes: Set<string>
): string {
  const fromTree = pickFirstNavigableMenuPath(nodes);
  if (fromTree) return fromTree;
  const sorted = [...prefixes].sort(
    (a, b) => a.length - b.length || a.localeCompare(b)
  );
  return sorted[0] ?? '/dashboard/overview';
}
