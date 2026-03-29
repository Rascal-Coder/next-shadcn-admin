import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import type { FormOption } from '@/types/base-form';

export type FlatMenuRow = {
  node: MenuTreeNodeView;
  depth: number;
};

/** TanStack Table 树表行：用 subRows 替代 children */
export type MenuTableRow = Omit<MenuTreeNodeView, 'children'> & {
  subRows?: MenuTableRow[];
};

/** 将 API 菜单树转为带 subRows 的表格数据 */
export function menuTreeToTableData(nodes: MenuTreeNodeView[]): MenuTableRow[] {
  return nodes.map(({ children, ...rest }) => ({
    ...rest,
    subRows:
      children && children.length > 0
        ? menuTreeToTableData(children)
        : undefined
  }));
}

function menuNodeMatchesSearch(node: MenuTreeNodeView, q: string): boolean {
  const hay = [
    node.name,
    node.path,
    node.activePath,
    node.icon,
    node.permission?.code,
    node.permission?.name
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

/**
 * 按关键词裁剪树：保留命中节点及其祖先路径；无关键词时返回原树。
 */
export function filterMenuTreeBySearch(
  nodes: MenuTreeNodeView[],
  search: string
): MenuTreeNodeView[] {
  const q = search.trim().toLowerCase();
  if (!q) return nodes;
  function walk(ns: MenuTreeNodeView[]): MenuTreeNodeView[] {
    const out: MenuTreeNodeView[] = [];
    for (const n of ns) {
      const filteredChildren = n.children?.length ? walk(n.children) : [];
      if (menuNodeMatchesSearch(n, q) || filteredChildren.length > 0) {
        out.push({
          ...n,
          children: filteredChildren
        });
      }
    }
    return out;
  }
  return walk(nodes);
}

/** 将菜单树前序展开为表格行（带层级深度） */
export function flattenMenuTree(
  nodes: MenuTreeNodeView[],
  depth = 0
): FlatMenuRow[] {
  const out: FlatMenuRow[] = [];
  for (const n of nodes) {
    out.push({ node: n, depth });
    if (n.children?.length) {
      out.push(...flattenMenuTree(n.children, depth + 1));
    }
  }
  return out;
}

/** 在树中按 id 查找节点 */
export function findMenuNodeById(
  nodes: MenuTreeNodeView[],
  id: string
): MenuTreeNodeView | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const f = findMenuNodeById(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

/** 收集节点及其所有后代的 id（含自身） */
export function collectDescendantIds(node: MenuTreeNodeView): Set<string> {
  const s = new Set<string>();
  function walk(n: MenuTreeNodeView) {
    s.add(n.id);
    n.children?.forEach(walk);
  }
  walk(node);
  return s;
}

/** 表单中表示「无父级 / 顶级」的下拉值，与 Select 的 value 对齐 */
export const MENU_PARENT_ROOT_VALUE = '__none__';

/** 表单中表示「不绑定权限」的下拉值 */
export const MENU_PERMISSION_NONE_VALUE = '__permission_none__';

function walkParentOptions(
  nodes: MenuTreeNodeView[],
  exclude: Set<string>,
  depth: number,
  out: FormOption[]
) {
  for (const n of nodes) {
    if (exclude.has(n.id)) continue;
    const prefix = depth > 0 ? `${'　'.repeat(depth)}` : '';
    out.push({ value: n.id, label: `${prefix}${n.name}` });
    if (n.children?.length) {
      walkParentOptions(n.children, exclude, depth + 1, out);
    }
  }
}

/**
 * 构建「父级菜单」下拉的选项；编辑时排除当前节点及其后代，避免成环。
 */
export function buildParentMenuOptions(
  nodes: MenuTreeNodeView[],
  excludeRootId: string | null
): FormOption[] {
  const exclude = new Set<string>();
  if (excludeRootId) {
    const node = findMenuNodeById(nodes, excludeRootId);
    if (node) {
      for (const id of collectDescendantIds(node)) {
        exclude.add(id);
      }
    }
  }
  const opts: FormOption[] = [
    { value: MENU_PARENT_ROOT_VALUE, label: '顶级（无父级）' }
  ];
  walkParentOptions(nodes, exclude, 0, opts);
  return opts;
}

export function parentFieldToApi(
  raw: string | undefined,
  mode: 'create' | 'edit'
): string | null | undefined {
  if (!raw || raw === MENU_PARENT_ROOT_VALUE) {
    return mode === 'edit' ? null : undefined;
  }
  return raw;
}

export function parentApiToField(parentId: string | undefined | null): string {
  const t = (parentId ?? '').trim();
  return t.length > 0 ? t : MENU_PARENT_ROOT_VALUE;
}
