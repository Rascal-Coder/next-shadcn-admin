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
import { RoleEditModal } from '@/features/roles/components/role-edit-modal';
import type { RoleListRow } from '@/features/roles/types';
import { BUILT_IN_ROLE_CODES } from '@/features/roles/utils/constants';
import { getRequestErrorMessage } from '@/lib/request';
import { isSuccess } from '@/lib/response-code';
import { roleControllerRemove } from '@/services/api/roles';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: RoleListRow;
  onRefresh: () => void;
}

export function CellAction({ data, onRefresh }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const builtIn = BUILT_IN_ROLE_CODES.has(data.code);

  const onConfirmDelete = async () => {
    setLoading(true);
    try {
      const res = (await roleControllerRemove(
        { id: data.id },
        { skipErrorHandler: true }
      )) as { code?: number; message?: string; msg?: string };
      if (!isSuccess(res.code)) {
        toast.error(res.message ?? res.msg ?? '删除失败');
        return;
      }
      toast.success('角色已删除');
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
      <RoleEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        roleId={editOpen ? data.id : null}
        roleLabel={`${data.name} · ${data.code}`}
        onSaved={() => {
          setEditOpen(false);
          onRefresh();
        }}
      />
      <Modal
        title='确认删除'
        description={`确定删除角色「${data.name}」（${data.code}）？此操作不可撤销。`}
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
            onClick={() => void onConfirmDelete()}
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
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            disabled={builtIn}
            onClick={() => !builtIn && setDeleteOpen(true)}
          >
            <IconTrash className='mr-2 h-4 w-4' /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
