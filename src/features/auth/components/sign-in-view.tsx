'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setDemoSessionCookie } from '@/lib/demo-auth-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { InteractiveGridPattern } from './interactive-grid';

export default function SignInViewPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setDemoSessionCookie();
    router.push('/dashboard/overview');
    router.refresh();
  }

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden min-h-screen w-full flex-col overflow-hidden p-10 text-white lg:flex dark:border-r'>
        <div className='pointer-events-none absolute inset-0 z-0 bg-zinc-900' />
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='relative z-20 flex shrink-0 items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Logo
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>登录</CardTitle>
              <CardDescription>
                演示表单：提交后写入本地演示 Cookie 并进入控制台（非真实认证）。
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit} className='flex flex-col gap-6'>
              <CardContent className='space-y-4 pb-0'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>邮箱</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    placeholder='you@example.com'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>密码</Label>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    placeholder='••••••••'
                    minLength={4}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className='flex flex-col gap-3'>
                <Button type='submit' className='w-full' disabled={pending}>
                  {pending ? '正在进入…' : '继续'}
                </Button>
                <p className='text-muted-foreground text-center text-xs'>
                  没有账号？{' '}
                  <Link
                    href='/auth/sign-up'
                    className='text-primary font-medium underline underline-offset-4'
                  >
                    去注册
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className='text-muted-foreground px-8 text-center text-sm'>
            继续即表示你同意我们的{' '}
            <Link
              href='/terms-of-service'
              className='hover:text-primary underline underline-offset-4'
            >
              服务条款
            </Link>{' '}
            与{' '}
            <Link
              href='/privacy-policy'
              className='hover:text-primary underline underline-offset-4'
            >
              隐私政策
            </Link>
            。
          </p>
        </div>
      </div>
    </div>
  );
}
