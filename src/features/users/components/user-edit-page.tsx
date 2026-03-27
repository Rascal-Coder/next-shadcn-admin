'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getRequestErrorMessage } from '@/lib/request';
import { isSuccess } from '@/lib/response-code';
import { userControllerFindOne } from '@/services/api/users';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UserEditForm } from './user-form';

type UserEditContentProps = {
  userId: string;
  currentUserId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

/** 拉取用户详情后渲染编辑表单（仅列表弹窗） */
export function UserEditContent({
  userId,
  currentUserId,
  onSuccess,
  onCancel
}: UserEditContentProps) {
  const [user, setUser] = useState<API.UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await userControllerFindOne(
        { id: userId },
        { signal: controller.signal, skipErrorHandler: true }
      );
      if (controller.signal.aborted) return;
      const body = res as { code?: number; data?: API.UserProfileDto };
      if (!isSuccess(body.code) || !body.data) {
        setUser(null);
        setError('无法加载用户信息');
        return;
      }
      setUser(body.data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
      if (controller.signal.aborted) return;
      setUser(null);
      setError(getRequestErrorMessage(e, '加载用户失败'));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  if (loading) {
    return (
      <div className='mx-auto w-full max-w-lg space-y-4'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-40 w-full' />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertTitle>无法加载用户</AlertTitle>
        <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <span>{error ?? '未找到用户'}</span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => void load()}
          >
            重试
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (currentUserId !== null && user.id === currentUserId) {
    return (
      <Alert>
        <AlertCircle className='size-4' />
        <AlertTitle>无法在此编辑当前账号</AlertTitle>
        <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <span>请使用「系统 · 账户」等入口修改自己的资料。</span>
          <Button type='button' variant='outline' size='sm' onClick={onCancel}>
            关闭
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <UserEditForm
      userId={userId}
      initialUser={user}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}
