'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-h-[min(90vh,920px)] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '新增菜单' : '编辑菜单'}
          </DialogTitle>
          <DialogDescription>
            配置路由、图标与激活路径；激活路径用于子路由高亮父级菜单等场景。
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
