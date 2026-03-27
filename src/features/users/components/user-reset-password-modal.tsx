'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isSuccess } from '@/lib/response-code';
import { userControllerResetPassword } from '@/services/api/users';
import { IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type UserResetPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  userLabel: string;
  userEmail: string;
  onDone: () => void;
};

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  } catch {
    toast.error('复制失败');
  }
}

/** 管理员重置他人登录密码：POST 无 body，data 为 ResetPasswordResultDto（含 newPassword） */
export function UserResetPasswordModal({
  open,
  onClose,
  userId,
  userLabel,
  userEmail,
  onDone
}: UserResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!open) {
      setGeneratedPassword(null);
    }
  }, [open]);

  async function handleConfirm() {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await userControllerResetPassword({ id: userId });
      if (!isSuccess(res.code)) {
        return;
      }
      const plain = res.data?.newPassword?.trim() ?? '';
      if (plain) {
        setGeneratedPassword(plain);
        toast.success('密码已重置，请复制下方新密码并告知用户');
      } else {
        toast.success('密码已重置');
        onDone();
        onClose();
      }
    } catch {
      // 错误由 request 拦截器提示
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    onDone();
    onClose();
  }

  return (
    <Modal
      title='重置密码'
      description={`${userLabel} · ${userEmail}`}
      isOpen={open}
      onClose={() => {
        setGeneratedPassword(null);
        onClose();
      }}
    >
      {open && userId ? (
        <div className='space-y-4 pt-1'>
          {generatedPassword ? (
            <>
              <p className='text-muted-foreground text-sm'>
                新密码由系统生成，仅在此显示一次，请复制后安全告知该用户。
              </p>
              <div className='space-y-2'>
                <Label htmlFor='reset-pwd-plain'>新密码</Label>
                <div className='flex gap-2'>
                  <Input
                    id='reset-pwd-plain'
                    readOnly
                    className='font-mono'
                    value={generatedPassword}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    aria-label='复制新密码'
                    onClick={() => void copyToClipboard(generatedPassword)}
                  >
                    <IconCopy className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='flex flex-wrap gap-2 pt-2'>
                <Button type='button' onClick={handleFinish}>
                  完成
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className='text-muted-foreground text-sm'>
                确认后系统将随机生成新密码并立即生效。新密码仅会在下一步显示一次，请复制后安全告知该用户。
              </p>
              <div className='flex flex-wrap gap-2 pt-2'>
                <Button
                  type='button'
                  disabled={loading}
                  onClick={() => void handleConfirm()}
                >
                  {loading ? '处理中…' : '确认重置'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  disabled={loading}
                  onClick={onClose}
                >
                  取消
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
