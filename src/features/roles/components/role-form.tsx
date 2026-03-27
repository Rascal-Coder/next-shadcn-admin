'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect, type FormOption } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { MenuPermissionTree } from '@/features/roles/components/menu-permission-tree';
import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import { setsEqual } from '@/features/roles/utils/menu-tree';
import { isSuccess } from '@/lib/response-code';
import { menuControllerTree } from '@/services/api/menus';
import {
  roleControllerCreate,
  roleControllerFindOne,
  roleControllerUpdate
} from '@/services/api/roles';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const statusOptions: FormOption[] = [
  { value: 'ACTIVE', label: '正常' },
  { value: 'DISABLED', label: '停用' }
];

const codeField = z
  .string()
  .min(1, '请输入权限字符')
  .regex(/^[a-z0-9_]+$/, '仅小写字母、数字、下划线')
  .max(64, '权限字符过长');

const createSchema = z.object({
  code: codeField,
  name: z.string().min(1, '请输入角色名称').max(128, '名称过长'),
  status: z.enum(['ACTIVE', 'DISABLED']),
  remark: z.string().max(500, '备注过长').optional()
});

const editSchema = z.object({
  name: z.string().min(1, '请输入角色名称').max(128, '名称过长'),
  status: z.enum(['ACTIVE', 'DISABLED']),
  remark: z.string().max(500, '备注过长').optional()
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

function unwrapMenuTreePayload(raw: unknown): MenuTreeNodeView[] {
  if (!raw || typeof raw !== 'object') return [];
  const data = (raw as { data?: API.MenuTreeDataDto }).data;
  return Array.isArray(data?.items) ? (data!.items as MenuTreeNodeView[]) : [];
}

type RoleFormProps = {
  mode: 'create' | 'edit';
  /** 编辑模式必填 */
  roleId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function RoleForm({ mode, roleId, onSuccess, onCancel }: RoleFormProps) {
  const [menuNodes, setMenuNodes] = useState<MenuTreeNodeView[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [menuIds, setMenuIds] = useState<Set<string>>(() => new Set());
  const initialMenuIdsRef = useRef<Set<string>>(new Set());

  const [detailLoading, setDetailLoading] = useState(mode === 'edit');
  const [detailError, setDetailError] = useState<string | null>(null);
  const [roleCodeDisplay, setRoleCodeDisplay] = useState<string | null>(null);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      code: '',
      name: '',
      status: 'ACTIVE',
      remark: ''
    }
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
      remark: ''
    }
  });

  const loadMenuTree = useCallback(async (signal: AbortSignal) => {
    setMenuLoading(true);
    setMenuError(null);
    try {
      const res = await menuControllerTree({
        signal,
        skipErrorHandler: true
      });
      if (signal.aborted) return;
      if (!isSuccess((res as { code?: number }).code)) {
        setMenuNodes([]);
        setMenuError('菜单树加载失败');
        return;
      }
      setMenuNodes(unwrapMenuTreePayload(res));
    } catch (e) {
      if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
      if (signal.aborted) return;
      setMenuNodes([]);
      setMenuError(
        e instanceof Error ? e.message : '菜单树加载失败，请稍后重试'
      );
    } finally {
      if (!signal.aborted) setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void loadMenuTree(ac.signal);
    return () => ac.abort();
  }, [loadMenuTree]);

  useEffect(() => {
    if (mode !== 'edit' || !roleId) return;
    const ac = new AbortController();
    setDetailLoading(true);
    setDetailError(null);
    void (async () => {
      try {
        const res = await roleControllerFindOne(
          { id: roleId },
          { signal: ac.signal, skipErrorHandler: true }
        );
        if (ac.signal.aborted) return;
        const body = res as { code?: number; data?: API.RoleDetailDto };
        if (!isSuccess(body.code) || !body.data) {
          setDetailError('无法加载角色详情');
          return;
        }
        const r = body.data;
        setRoleCodeDisplay(r.code);
        editForm.reset({
          name: r.name,
          status: r.status,
          remark: r.remark ?? ''
        });
        const ids = new Set(r.menuIds ?? []);
        initialMenuIdsRef.current = new Set(ids);
        setMenuIds(ids);
      } catch (e) {
        if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
        if (ac.signal.aborted) return;
        setDetailError(
          e instanceof Error ? e.message : '加载角色详情失败，请稍后重试'
        );
      } finally {
        if (!ac.signal.aborted) setDetailLoading(false);
      }
    })();
    return () => ac.abort();
  }, [mode, roleId, editForm]);

  async function onSubmitCreate(values: CreateValues) {
    try {
      const body: API.CreateRoleDto = {
        code: values.code.trim(),
        name: values.name.trim(),
        status: values.status
      };
      const r = values.remark?.trim();
      if (r) body.remark = r;
      if (menuIds.size > 0) body.menuIds = Array.from(menuIds);

      const res = await roleControllerCreate(body);
      if (!isSuccess(res.code)) return;
      toast.success('角色已创建');
      onSuccess();
    } catch {
      // 错误由 request 拦截器提示
    }
  }

  async function onSubmitEdit(values: EditValues) {
    if (!roleId) return;
    try {
      const body: API.UpdateRoleDto = {
        name: values.name.trim(),
        status: values.status,
        // UpdateRoleDto 仅支持 string，空串表示清空备注
        remark: (values.remark ?? '').trim()
      };

      if (!setsEqual(initialMenuIdsRef.current, menuIds)) {
        body.menuIds = Array.from(menuIds);
      }

      const res = await roleControllerUpdate({ id: roleId }, body);
      if (!isSuccess(res.code)) return;
      toast.success('角色已更新');
      onSuccess();
    } catch {
      // 错误由 request 拦截器提示
    }
  }

  if (mode === 'edit' && detailError) {
    return (
      <p className='text-destructive text-sm' role='alert'>
        {detailError}
      </p>
    );
  }

  const treeDisabled = menuLoading || !!menuError;

  return (
    <div className='space-y-4'>
      {mode === 'edit' && roleCodeDisplay ? (
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <span className='text-muted-foreground'>权限字符</span>
          <Badge variant='outline' className='font-mono text-xs'>
            {roleCodeDisplay}
          </Badge>
        </div>
      ) : null}

      {mode === 'create' ? (
        <Form
          form={createForm}
          onSubmit={createForm.handleSubmit(onSubmitCreate)}
          className='space-y-4'
        >
          <FormInput
            control={createForm.control}
            name='code'
            label='权限字符'
            placeholder='如 custom_role'
            required
          />
          <FormInput
            control={createForm.control}
            name='name'
            label='角色名称'
            required
          />
          <FormSelect
            control={createForm.control}
            name='status'
            label='状态'
            options={statusOptions}
            required
          />
          <FormTextarea
            control={createForm.control}
            name='remark'
            label='备注'
            config={{ rows: 3, maxLength: 500 }}
          />
          <section className='space-y-2'>
            <p className='text-sm font-medium'>菜单权限</p>
            {menuLoading ? (
              <p className='text-muted-foreground text-sm'>加载菜单树…</p>
            ) : menuError ? (
              <p className='text-destructive text-sm' role='alert'>
                {menuError}
              </p>
            ) : (
              <MenuPermissionTree
                nodes={menuNodes}
                value={menuIds}
                onChange={setMenuIds}
                disabled={treeDisabled}
              />
            )}
          </section>
          <div className='flex flex-wrap gap-2 pt-2'>
            <Button type='submit' disabled={createForm.formState.isSubmitting}>
              {createForm.formState.isSubmitting ? '创建中…' : '创建'}
            </Button>
            <Button type='button' variant='outline' onClick={onCancel}>
              取消
            </Button>
          </div>
        </Form>
      ) : (
        <Form
          form={editForm}
          onSubmit={editForm.handleSubmit(onSubmitEdit)}
          className='space-y-4'
        >
          <FormInput
            control={editForm.control}
            name='name'
            label='角色名称'
            required
          />
          <FormSelect
            control={editForm.control}
            name='status'
            label='状态'
            options={statusOptions}
            required
          />
          <FormTextarea
            control={editForm.control}
            name='remark'
            label='备注'
            config={{ rows: 3, maxLength: 500 }}
          />
          <section className='space-y-2'>
            <p className='text-sm font-medium'>菜单权限</p>
            {menuLoading ? (
              <p className='text-muted-foreground text-sm'>加载菜单树…</p>
            ) : menuError ? (
              <p className='text-destructive text-sm' role='alert'>
                {menuError}
              </p>
            ) : (
              <MenuPermissionTree
                nodes={menuNodes}
                value={menuIds}
                onChange={setMenuIds}
                disabled={treeDisabled}
              />
            )}
          </section>
          <div className='flex flex-wrap gap-2 pt-2'>
            <Button
              type='submit'
              disabled={
                editForm.formState.isSubmitting || detailLoading || !roleId
              }
            >
              {editForm.formState.isSubmitting ? '保存中…' : '保存'}
            </Button>
            <Button type='button' variant='outline' onClick={onCancel}>
              取消
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
