/**
 * 菜单树节点视图（与 openapi2ts 的 API.MenuTreeNodeDto 对齐，children 递归为同视图类型）
 */

export type MenuTreeNodeView = Omit<API.MenuTreeNodeDto, 'children'> & {
  children: MenuTreeNodeView[];
};
