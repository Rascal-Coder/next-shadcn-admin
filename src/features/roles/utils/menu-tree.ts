import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';

/** 收集节点及其所有后代 id（用于级联勾选） */
export function flattenNodeAndDescendantIds(node: MenuTreeNodeView): string[] {
  const ids: string[] = [node.id];
  if (node.children?.length) {
    for (const c of node.children) {
      ids.push(...flattenNodeAndDescendantIds(c));
    }
  }
  return ids;
}

/** 当前子树是否全部选中 */
export function isSubtreeFullySelected(
  node: MenuTreeNodeView,
  selected: Set<string>
): boolean {
  const all = flattenNodeAndDescendantIds(node);
  return all.length > 0 && all.every((id) => selected.has(id));
}

/** 当前子树是否部分选中（用于半选态） */
export function isSubtreePartiallySelected(
  node: MenuTreeNodeView,
  selected: Set<string>
): boolean {
  const all = flattenNodeAndDescendantIds(node);
  const n = all.filter((id) => selected.has(id)).length;
  return n > 0 && n < all.length;
}

/** 比较两个 Set 是否包含相同字符串 */
export function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) {
    if (!b.has(x)) return false;
  }
  return true;
}

/** 切换节点：全选或清空该节点及其后代 */
export function toggleSubtreeSelection(
  node: MenuTreeNodeView,
  selected: Set<string>
): Set<string> {
  const next = new Set(selected);
  const all = flattenNodeAndDescendantIds(node);
  const full = isSubtreeFullySelected(node, selected);
  if (full) {
    all.forEach((id) => next.delete(id));
  } else {
    all.forEach((id) => next.add(id));
  }
  return next;
}
