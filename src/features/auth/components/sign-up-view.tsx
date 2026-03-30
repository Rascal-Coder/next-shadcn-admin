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
import { authControllerRegister } from '@/services/api/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { InteractiveGridPattern } from './interactive-grid';

const signUpSchema = z.object({
  name: z.string(),
  email: z.email('请输入有效的邮箱地址'),
  password: z.string().min(4, '密码至少 4 位')
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpViewPage() {
  const router = useRouter();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  async function onSubmit(values: SignUpFormValues) {
    try {
      const nameTrimmed = values.name.trim();
      const body: API.RegisterDto = {
        email: values.email.trim(),
        password: values.password
      };
      if (nameTrimmed !== '') {
        body.name = nameTrimmed;
      }
      const res = await authControllerRegister(body);
      if (!isSuccess(res.code)) {
        return;
      }
      if (!persistAuthFromLoginData(res.data)) {
        toast.info('注册成功，请使用新账号登录');
        router.push('/auth/sign-in');
        return;
      }
      router.push('/dashboard/overview');
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
              <CardTitle>注册</CardTitle>
              <CardDescription>
                使用邮箱与密码注册；若后端在 data
                中返回令牌将自动登录并进入控制台。
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
                  name='name'
                  type='text'
                  label='姓名（可选）'
                  placeholder='张三'
                  autoComplete='name'
                />
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
                  autoComplete='new-password'
                  required
                />
              </CardContent>
              <CardFooter className='flex flex-col gap-3'>
                <Button type='submit' className='w-full' disabled={pending}>
                  {pending ? '正在进入…' : '创建并进入'}
                </Button>
                <p className='text-muted-foreground text-center text-xs'>
                  已有账号？{' '}
                  <Link
                    href='/auth/sign-in'
                    className='text-primary font-medium underline underline-offset-4'
                  >
                    去登录
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
