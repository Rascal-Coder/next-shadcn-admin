'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { UserCreateForm } from './user-form';
import { useUserListRefresh } from './user-list-refresh-context';
import { IconPlus } from '@tabler/icons-react';
// import { useRouter } from 'next/navigation';
import { useState } from 'react';

type UserCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

/** 新建用户弹窗：与编辑弹窗同一套交互 */
export function UserCreateModal({
  open,
  onClose,
  onSaved
}: UserCreateModalProps) {
  return (
    <Modal
      title='新建用户'
      description='填写邮箱与初始密码以创建账号。创建后可由管理员分配角色与权限。'
      isOpen={open}
      onClose={onClose}
    >
      {open ? <UserCreateForm onSuccess={onSaved} onCancel={onClose} /> : null}
    </Modal>
  );
}

/** 用户管理页页头：打开新建弹窗并在成功后刷新列表 */
export function UserCreateHeaderButton() {
  const [open, setOpen] = useState(false);
  const { refresh } = useUserListRefresh();
  // const router = useRouter();

  return (
    <>
      <Button type='button' onClick={() => setOpen(true)}>
        <IconPlus className='mr-2 h-4 w-4' />
        新建用户
      </Button>
      <UserCreateModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          refresh();
          // router.refresh();
        }}
      />
    </>
  );
}
