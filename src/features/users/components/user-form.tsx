'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect, type FormOption } from '@/components/forms/form-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { isSuccess } from '@/lib/response-code';
import {
  userControllerCreate,
  userControllerUpdate
} from '@/services/api/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const statusOptions: FormOption[] = [
  { value: 'ACTIVE', label: '正常' },
  { value: 'DISABLED', label: '停用' }
];

const createSchema = z.object({
  email: z.email('请输入有效邮箱'),
  password: z.string().min(6, '密码至少 6 位'),
  name: z.string().optional(),
  status: z.enum(['ACTIVE', 'DISABLED'])
});

const editSchema = z.object({
  email: z.email('请输入有效邮箱'),
  name: z.string().min(1, '请输入姓名'),
  status: z.enum(['ACTIVE', 'DISABLED'])
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

type UserCreateFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

/** 新建用户表单（仅用于弹窗，与编辑弹窗字段布局一致） */
export function UserCreateForm({ onSuccess, onCancel }: UserCreateFormProps) {
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      status: 'ACTIVE'
    }
  });

  async function onSubmit(values: CreateValues) {
    try {
      const body: API.CreateUserDto = {
        email: values.email.trim(),
        password: values.password,
        status: values.status
      };
      const nameTrimmed = values.name?.trim();
      if (nameTrimmed) body.name = nameTrimmed;

      const res = await userControllerCreate(body);
      if (!isSuccess(res.code)) {
        return;
      }
      toast.success('用户已创建');
      onSuccess();
    } catch {
      // 错误由 request 拦截器提示
    }
  }

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <FormInput
        control={form.control}
        name='email'
        label='邮箱'
        type='email'
        required
      />
      <FormInput
        control={form.control}
        name='password'
        label='密码'
        type='password'
        required
      />
      <FormInput control={form.control} name='name' label='姓名' />
      <FormSelect
        control={form.control}
        name='status'
        label='状态'
        options={statusOptions}
        required
      />
      <div className='flex flex-wrap gap-2 pt-2'>
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '创建中…' : '创建'}
        </Button>
        <Button type='button' variant='outline' onClick={onCancel}>
          取消
        </Button>
      </div>
    </Form>
  );
}

type UserEditFormProps = {
  userId: string;
  initialUser: API.UserProfileDto;
  onSuccess: () => void;
  onCancel: () => void;
};

/** 编辑用户表单（仅列表弹窗使用，由上层拉取 initialUser 后传入） */
export function UserEditForm({
  userId,
  initialUser,
  onSuccess,
  onCancel
}: UserEditFormProps) {
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      email: initialUser.email,
      name: initialUser.name,
      status: initialUser.status
    }
  });

  async function onSubmit(values: EditValues) {
    try {
      const body: API.UpdateUserDto = {
        email: values.email.trim(),
        name: values.name.trim(),
        status: values.status
      };

      const res = await userControllerUpdate({ id: userId }, body);
      if (!isSuccess(res.code)) {
        return;
      }
      toast.success('用户已更新');
      onSuccess();
    } catch {
      // 错误由 request 拦截器提示
    }
  }

  const formBody = (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <FormInput
        control={form.control}
        name='email'
        label='邮箱'
        type='email'
        required
      />
      <FormInput control={form.control} name='name' label='姓名' required />
      <FormSelect
        control={form.control}
        name='status'
        label='状态'
        options={statusOptions}
        required
      />
      <div className='flex flex-wrap gap-2 pt-2'>
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '保存中…' : '保存'}
        </Button>
        <Button type='button' variant='outline' onClick={onCancel}>
          取消
        </Button>
      </div>
    </Form>
  );

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-2 text-sm'>
        <span className='text-muted-foreground'>主角色</span>
        <Badge variant='outline' className='font-mono text-xs'>
          {initialUser.roleCode}
        </Badge>
      </div>
      {formBody}
    </div>
  );
}
