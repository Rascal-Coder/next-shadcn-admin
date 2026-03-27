'use client';

import { Modal } from '@/components/ui/modal';
import { UserEditContent } from './user-edit-page';

type UserEditModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  /** 用于弹窗标题区展示，例如姓名 */
  userLabel: string;
  userEmail: string;
  /** 当前登录用户 id，用于禁止编辑自己 */
  currentUserId: string | null;
  onSaved: () => void;
};

/** 列表内编辑用户：弹窗内加载详情并提交，不跳转独立路由 */
export function UserEditModal({
  open,
  onClose,
  userId,
  userLabel,
  userEmail,
  currentUserId,
  onSaved
}: UserEditModalProps) {
  return (
    <Modal
      title='编辑用户'
      description={`${userLabel} · ${userEmail}`}
      isOpen={open}
      onClose={onClose}
    >
      {open && userId ? (
        <UserEditContent
          userId={userId}
          currentUserId={currentUserId}
          onSuccess={onSaved}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
  );
}
