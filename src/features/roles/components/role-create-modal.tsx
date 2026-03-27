'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { RoleForm } from '@/features/roles/components/role-form';
import { useRoleListRefresh } from '@/features/roles/components/role-list-refresh-context';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

type RoleCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function RoleCreateModal({
  open,
  onClose,
  onSaved
}: RoleCreateModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-h-[min(90vh,920px)] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>新建角色</DialogTitle>
          <DialogDescription>
            填写权限字符、名称与菜单勾选；权限字符创建后不可在此修改。
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <RoleForm mode='create' onSuccess={onSaved} onCancel={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function RoleCreateHeaderButton() {
  const [open, setOpen] = useState(false);
  const { refresh } = useRoleListRefresh();

  return (
    <>
      <Button type='button' onClick={() => setOpen(true)}>
        <IconPlus className='mr-2 h-4 w-4' />
        新建角色
      </Button>
      <RoleCreateModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          refresh();
        }}
      />
    </>
  );
}
