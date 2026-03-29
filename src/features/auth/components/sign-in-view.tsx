'use client';

import { FormInput } from '@/components/forms/form-input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { persistAuthFromLoginData } from '@/lib/auth-storage';
import { isSuccess } from '@/lib/response-code';
import { cn } from '@/lib/utils';
import { authControllerLogin } from '@/services/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { InteractiveGridPattern } from './interactive-grid';

const signInSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z.string().min(4, '密码至少 4 位')
});

type SignInFormValues = z.infer<typeof signInSchema>;

function safePostLoginPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/dashboard/overview';
  }
  return raw;
}

export default function SignInViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin12345!'
    }
  });

  async function onSubmit(values: SignInFormValues) {
    try {
      const res = await authControllerLogin({
        email: values.email.trim(),
        password: values.password
      });
      if (!isSuccess(res.code)) {
        return;
      }
      // 与注册页一致：将 accessToken 写入 localStorage，后续请求拦截器才能带上 Authorization
      if (!persistAuthFromLoginData(res.data)) {
        toast.error('登录成功但未返回有效令牌，请重试');
        return;
      }
      const nextPath = safePostLoginPath(searchParams.get('redirect'));
      router.push(nextPath);
      router.refresh();
    } catch {
      // 网络层错误由 request 拦截器统一 Toast
    }
  }

  const pending = form.formState.isSubmitting;

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
                使用邮箱与密码登录；成功后保存访问令牌并进入控制台。
              </CardDescription>
            </CardHeader>
            <Form
              form={form}
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-6'
            >
              <CardContent className='space-y-4 pb-0'>
                <FormInput
                  control={form.control}
                  name='email'
                  type='email'
                  label='邮箱'
                  placeholder='you@example.com'
                  autoComplete='email'
                  required
                />
                <FormInput
                  control={form.control}
                  name='password'
                  type='password'
                  label='密码'
                  placeholder='••••••••'
                  autoComplete='current-password'
                  required
                />
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
            </Form>
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
