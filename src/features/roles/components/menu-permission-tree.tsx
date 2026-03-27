'use client';

import TreeView, { type TreeViewItem } from '@/components/tree-view';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import { toggleSubtreeSelection } from '@/features/roles/utils/menu-tree';
import * as React from 'react';

type MenuPermissionTreeProps = {
  nodes: MenuTreeNodeView[];
  value: Set<string>;
  onChange: (next: Set<string>) => void;
  disabled?: boolean;
  className?: string;
};

/** 展示菜单节点绑定的权限（API 为 PermissionItemDto；兼容历史 string） */
function formatMenuPermissionLabel(
  permission: MenuTreeNodeView['permission']
): string | null {
  if (permission == null) return null;
  if (typeof permission === 'string') return permission;
  return permission.code || permission.name || null;
}

function buildNodeMap(
  nodes: MenuTreeNodeView[],
  map = new Map<string, MenuTreeNodeView>()
): Map<string, MenuTreeNodeView> {
  for (const n of nodes) {
    map.set(n.id, n);
    if (n.children?.length) buildNodeMap(n.children, map);
  }
  return map;
}

/** 将菜单树转为 TreeView 所需结构；权限码拼进 name（组件仅支持单行文案） */
function menuNodesToTreeData(
  nodes: MenuTreeNodeView[],
  value: Set<string>
): TreeViewItem[] {
  return nodes.map((node) => {
    const perm = formatMenuPermissionLabel(node.permission);
    const name = perm ? `${node.name} · ${perm}` : node.name;
    return {
      id: node.id,
      name,
      type: node.children?.length ? 'folder' : 'file',
      checked: value.has(node.id),
      children: node.children?.length
        ? menuNodesToTreeData(node.children, value)
        : undefined
    };
  });
}

/** 菜单权限树：基于 TreeView，级联勾选，value 为已选菜单 id 集合 */
export function MenuPermissionTree({
  nodes,
  value,
  onChange,
  disabled,
  className
}: MenuPermissionTreeProps) {
  const nodeMap = React.useMemo(() => buildNodeMap(nodes), [nodes]);
  const data = React.useMemo(
    () => menuNodesToTreeData(nodes, value),
    [nodes, value]
  );

  const handleCheckChange = React.useCallback(
    (item: TreeViewItem, _checked: boolean) => {
      if (disabled) return;
      const node = nodeMap.get(item.id);
      if (!node) return;
      onChange(toggleSubtreeSelection(node, value));
    },
    [disabled, nodeMap, onChange, value]
  );

  if (!nodes.length) {
    return <p className='text-muted-foreground text-sm'>暂无菜单数据</p>;
  }

  return (
    <ScrollArea
      className={cn('h-[min(360px,50vh)] rounded-md border p-3', className)}
    >
      <div className={cn('pr-3', disabled && 'pointer-events-none opacity-60')}>
        <TreeView
          data={data}
          showCheckboxes
          onCheckChange={handleCheckChange}
          showExpandAll={false}
          showSearch={false}
          showSelectionToolbar={false}
          showItemHoverCard={false}
          getIcon={() => null}
          className='border-0 bg-transparent'
        />
      </div>
    </ScrollArea>
  );
}
