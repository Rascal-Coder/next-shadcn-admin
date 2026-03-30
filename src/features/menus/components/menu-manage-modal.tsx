'use client';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { MenuForm } from '@/features/menus/components/menu-form';
import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';

type MenuManageModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  menuId?: string | null;
  defaultParentId?: string | null;
  tree: MenuTreeNodeView[];
  onClose: () => void;
  onSaved: () => void;
};

/** 菜单新增/编辑：使用右侧抽屉，便于长表单滚动且不打断列表上下文 */
export function MenuManageModal({
  open,
  mode,
  menuId,
  defaultParentId,
  tree,
  onClose,
  onSaved
}: MenuManageModalProps) {
  return (
    <Drawer direction='right' open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className='flex h-full max-h-screen min-h-0 w-full flex-col gap-0 border-l p-0 sm:max-w-lg'>
        <DrawerHeader className='border-border shrink-0 border-b text-left'>
          <DrawerTitle>
            {mode === 'create' ? '新增菜单' : '编辑菜单'}
          </DrawerTitle>
          <DrawerDescription>
            配置路由、图标与激活路径；激活路径用于子路由高亮父级菜单等场景。
          </DrawerDescription>
        </DrawerHeader>
        <div className='flex min-h-0 flex-1 flex-col px-4 pt-4 pb-4'>
          {open ? (
            <MenuForm
              key={`${mode}-${menuId ?? 'new'}-${defaultParentId ?? ''}`}
              mode={mode}
              menuId={menuId}
              defaultParentId={defaultParentId}
              tree={tree}
              onSuccess={onSaved}
              onCancel={onClose}
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
