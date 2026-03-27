'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { RoleForm } from '@/features/roles/components/role-form';

type RoleEditModalProps = {
  open: boolean;
  onClose: () => void;
  /** 编辑中的角色 id，关闭时应置空以卸载表单 */
  roleId: string | null;
  /** 弹窗副标题展示 */
  roleLabel: string;
  onSaved: () => void;
};

export function RoleEditModal({
  open,
  onClose,
  roleId,
  roleLabel,
  onSaved
}: RoleEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-h-[min(90vh,920px)] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>编辑角色</DialogTitle>
          <DialogDescription>{roleLabel}</DialogDescription>
        </DialogHeader>
        {open && roleId ? (
          <RoleForm
            mode='edit'
            roleId={roleId}
            onSuccess={onSaved}
            onCancel={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
