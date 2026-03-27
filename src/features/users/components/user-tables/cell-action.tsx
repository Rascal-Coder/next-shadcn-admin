'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserEditModal } from '@/features/users/components/user-edit-modal';
import { UserResetPasswordModal } from '@/features/users/components/user-reset-password-modal';
import type { UserListRow } from '@/features/users/types';
import { getRequestErrorMessage } from '@/lib/request';
import { isSuccess } from '@/lib/response-code';
import { userControllerRemove } from '@/services/api/users';
import {
  IconDotsVertical,
  IconEdit,
  IconKey,
  IconTrash
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: UserListRow;
  onRefresh: () => void;
  currentUserId: string | null;
}

export function CellAction({
  data,
  onRefresh,
  currentUserId
}: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSelf = currentUserId !== null && data.id === currentUserId;
  /** 超管账号不在列表中提供编辑/删改等操作，避免误操作 */
  const isSuperAdmin = data.roleCode === 'super_admin';

  if (isSelf || isSuperAdmin) {
    return null;
  }

  const onConfirm = async () => {
    setLoading(true);
    try {
      const res = (await userControllerRemove(
        { id: data.id },
        { skipErrorHandler: true }
      )) as { code?: number; message?: string; msg?: string };
      if (!isSuccess(res.code)) {
        toast.error(res.message ?? res.msg ?? '删除失败');
        return;
      }
      toast.success('用户已删除');
      setDeleteOpen(false);
      onRefresh();
    } catch (e) {
      toast.error(getRequestErrorMessage(e, '删除失败，请稍后重试'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        userId={editOpen ? data.id : null}
        userLabel={data.name}
        userEmail={data.email}
        currentUserId={currentUserId}
        onSaved={() => {
          setEditOpen(false);
          onRefresh();
        }}
      />
      <UserResetPasswordModal
        open={resetPwdOpen}
        onClose={() => setResetPwdOpen(false)}
        userId={resetPwdOpen ? data.id : null}
        userLabel={data.name}
        userEmail={data.email}
        onDone={() => {
          onRefresh();
        }}
      />
      <Modal
        title='确认删除'
        description={`确定删除用户「${data.name}」(${data.email})？此操作不可撤销。`}
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      >
        <div className='flex w-full items-center justify-end space-x-2 pt-6'>
          <Button
            disabled={loading}
            variant='outline'
            type='button'
            onClick={() => setDeleteOpen(false)}
          >
            取消
          </Button>
          <Button
            disabled={loading}
            variant='destructive'
            type='button'
            onClick={() => void onConfirm()}
          >
            删除
          </Button>
        </div>
      </Modal>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>打开菜单</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <IconEdit className='mr-2 h-4 w-4' /> 编辑
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetPwdOpen(true)}>
            <IconKey className='mr-2 h-4 w-4' /> 重置密码
          </DropdownMenuItem>
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => setDeleteOpen(true)}
          >
            <IconTrash className='mr-2 h-4 w-4' /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
