'use client';

import { FormInput } from '@/components/forms/form-input';
import type { FormOption } from '@/types/base-form';
import { FormSwitch } from '@/components/forms/form-switch';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  MENU_PARENT_ROOT_VALUE,
  MENU_PERMISSION_NONE_VALUE,
  buildParentMenuOptions,
  parentApiToField,
  parentFieldToApi
} from '@/features/menus/utils/menu-tree-helpers';
import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import { isSuccess } from '@/lib/response-code';
import {
  menuControllerCreate,
  menuControllerFindOne,
  menuControllerUpdate
} from '@/services/api/menus';
import { roleControllerPermissionCatalog } from '@/services/api/roles';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const menuTypeOptions: FormOption[] = [
  { value: 'DIRECTORY', label: '目录' },
  { value: 'MENU', label: '菜单' },
  { value: 'BUTTON', label: '按钮' }
];

const schema = z.object({
  parentId: z.string(),
  name: z.string().min(1, '请输入菜单名称').max(128, '名称过长'),
  path: z.string().min(1, '请输入路由地址').max(200, '路由地址过长'),
  icon: z.string().min(1, '请输入菜单图标').max(50, '图标过长'),
  /** 对应后端 component，可与前端组件路径或重定向配置对应 */
  component: z.string().max(500, '内容过长').optional(),
  /** 用于子路由高亮父级菜单等场景 */
  activePath: z.string().max(500, '内容过长').optional(),
  sortOrder: z.number().int().min(0, '排序不能为负').default(0),
  visible: z.boolean(),
  menuType: z.enum(['DIRECTORY', 'MENU', 'BUTTON']),
  /** 绑定 Casbin 权限字典项；目录可不绑定 */
  permissionId: z.string()
});

export type MenuFormValues = z.infer<typeof schema>;

type MenuFormProps = {
  mode: 'create' | 'edit';
  menuId?: string | null;
  /** 新建子菜单时预选的父级 id */
  defaultParentId?: string | null;
  tree: MenuTreeNodeView[];
  onSuccess: () => void;
  onCancel: () => void;
};

function toPatchBody(values: MenuFormValues): API.UpdateMenuDto {
  const component = values.component?.trim();
  const activePath = values.activePath?.trim();
  const parentId = parentFieldToApi(values.parentId, 'edit');
  const pid = values.permissionId?.trim();
  const permissionId =
    pid && pid !== MENU_PERMISSION_NONE_VALUE ? pid : undefined;
  return {
    // 顶级菜单时后端要求传 null 以清空父级
    parentId: (parentId === null
      ? null
      : parentId) as API.UpdateMenuDto['parentId'],
    name: values.name.trim(),
    path: values.path.trim(),
    icon: values.icon.trim(),
    component: component ? component : undefined,
    activePath: activePath ? activePath : undefined,
    sortOrder: values.sortOrder,
    visible: values.visible,
    menuType: values.menuType,
    permissionId
  };
}

export function MenuForm({
  mode,
  menuId,
  defaultParentId,
  tree,
  onSuccess,
  onCancel
}: MenuFormProps) {
  const [detailLoading, setDetailLoading] = useState(mode === 'edit');
  const [detailError, setDetailError] = useState<string | null>(null);
  const [permissionOptions, setPermissionOptions] = useState<FormOption[]>([]);
  const [permissionCatalogLoading, setPermissionCatalogLoading] =
    useState(true);

  const parentOptions = useMemo(
    () =>
      buildParentMenuOptions(tree, mode === 'edit' ? (menuId ?? null) : null),
    [tree, mode, menuId]
  );

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(schema) as Resolver<MenuFormValues>,
    defaultValues: {
      parentId: defaultParentId?.trim()
        ? defaultParentId!
        : MENU_PARENT_ROOT_VALUE,
      name: '',
      path: '',
      icon: '',
      component: '',
      activePath: '',
      sortOrder: 1,
      visible: true,
      menuType: 'MENU',
      permissionId: MENU_PERMISSION_NONE_VALUE
    }
  });

  useEffect(() => {
    const ac = new AbortController();
    setPermissionCatalogLoading(true);
    void (async () => {
      try {
        const res = await roleControllerPermissionCatalog({
          signal: ac.signal,
          skipErrorHandler: true
        });
        if (ac.signal.aborted) return;
        const body = res as { code?: number; data?: API.PermissionCatalogDto };
        const items = body.data?.items;
        if (!isSuccess(body.code) || !Array.isArray(items)) {
          setPermissionOptions([
            { value: MENU_PERMISSION_NONE_VALUE, label: '不绑定权限' }
          ]);
          return;
        }
        setPermissionOptions([
          { value: MENU_PERMISSION_NONE_VALUE, label: '不绑定权限' },
          ...items.map((p) => ({
            value: p.id,
            label: `${p.name}（${p.code}）`
          }))
        ]);
      } catch (e) {
        if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
        if (ac.signal.aborted) return;
        setPermissionOptions([
          { value: MENU_PERMISSION_NONE_VALUE, label: '不绑定权限' }
        ]);
      } finally {
        if (!ac.signal.aborted) setPermissionCatalogLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !menuId) return;
    const ac = new AbortController();
    setDetailLoading(true);
    setDetailError(null);
    void (async () => {
      try {
        const res = await menuControllerFindOne(
          { id: menuId },
          { signal: ac.signal, skipErrorHandler: true }
        );
        if (ac.signal.aborted) return;
        const body = res as { code?: number; data?: API.MenuDetailDto };
        if (!isSuccess(body.code) || !body.data) {
          setDetailError('无法加载菜单详情');
          return;
        }
        const d = body.data;
        form.reset({
          parentId: parentApiToField(d.parentId),
          name: d.name,
          path: d.path ?? '',
          icon: d.icon ?? '',
          component: d.component ?? '',
          activePath: d.activePath ?? '',
          sortOrder: d.sortOrder,
          visible: d.visible,
          menuType: d.menuType,
          permissionId: d.permission?.id
            ? d.permission.id
            : MENU_PERMISSION_NONE_VALUE
        });
        // 字典中可能未包含历史权限项，补一条以免 Select 无匹配值
        if (d.permission?.id) {
          const p = d.permission;
          setPermissionOptions((prev) =>
            prev.some((o) => o.value === p.id)
              ? prev
              : [...prev, { value: p.id, label: `${p.name}（${p.code}）` }]
          );
        }
      } catch (e) {
        if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
        if (ac.signal.aborted) return;
        setDetailError(
          e instanceof Error ? e.message : '加载菜单详情失败，请稍后重试'
        );
      } finally {
        if (!ac.signal.aborted) setDetailLoading(false);
      }
    })();
    return () => ac.abort();
  }, [mode, menuId, form]);

  async function onSubmit(values: MenuFormValues) {
    try {
      if (mode === 'create') {
        const body: API.CreateMenuDto = {
          name: values.name.trim(),
          path: values.path.trim(),
          icon: values.icon.trim(),
          sortOrder: values.sortOrder,
          visible: values.visible,
          menuType: values.menuType
        };
        const pid = parentFieldToApi(values.parentId, 'create');
        if (typeof pid === 'string') body.parentId = pid;
        const c = values.component?.trim();
        if (c) body.component = c;
        const ap = values.activePath?.trim();
        if (ap) body.activePath = ap;
        const perm = values.permissionId?.trim();
        if (perm && perm !== MENU_PERMISSION_NONE_VALUE) {
          body.permissionId = perm;
        }

        const res = await menuControllerCreate(body);
        if (!isSuccess(res.code)) return;
        toast.success('菜单已创建');
        onSuccess();
        return;
      }

      if (!menuId) return;
      const res = await menuControllerUpdate(
        { id: menuId },
        toPatchBody(values)
      );
      if (!isSuccess(res.code)) return;
      toast.success('菜单已更新');
      onSuccess();
    } catch {
      // 错误由 request 拦截器提示
    }
  }

  if (permissionCatalogLoading || detailLoading) {
    return (
      <p className='text-muted-foreground text-sm'>
        {permissionCatalogLoading ? '加载权限字典…' : '加载菜单详情…'}
      </p>
    );
  }

  if (detailError) {
    return (
      <p className='text-destructive text-sm' role='alert'>
        {detailError}
      </p>
    );
  }

  return (
    <Form<MenuFormValues>
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-4'
    >
      <FormField
        control={form.control}
        name='parentId'
        render={({ field }) => (
          <FormItem>
            <FormLabel>父级菜单</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={form.formState.isSubmitting}
            >
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='请选择' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {parentOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>不选默认为顶级菜单。</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormInput
        control={form.control}
        name='name'
        label='菜单名称'
        required
        placeholder='请输入菜单名称或 i18n key'
        description='此标识将决定菜单在不同语言下的显示名称。'
      />

      <FormField
        control={form.control}
        name='menuType'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              类型
              <span className='ml-1 text-red-500'>*</span>
            </FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={form.formState.isSubmitting}
            >
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='请选择' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {menuTypeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormInput
        control={form.control}
        name='path'
        label='路由地址'
        required
        placeholder='请输入路由地址'
        maxLength={200}
        description='最多 200 字符'
      />

      <FormInput
        control={form.control}
        name='icon'
        label='菜单图标'
        required
        placeholder='请输入菜单图标类名'
        maxLength={50}
        description='最多 50 字符'
      />

      <FormField
        control={form.control}
        name='permissionId'
        render={({ field }) => (
          <FormItem>
            <FormLabel>绑定权限</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={form.formState.isSubmitting}
            >
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='请选择' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {permissionOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              与 Casbin 权限标识对应；角色勾选该菜单时汇总此权限。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormInput
        control={form.control}
        name='component'
        label='重定向地址'
        placeholder='请输入'
        description='对应后端 component 字段，可选。'
      />

      <FormInput
        control={form.control}
        name='activePath'
        label='激活路径'
        placeholder='用于子路由高亮父级菜单，如 /dashboard/overview'
        description='用于子路由高亮父级菜单等场景；留空表示不单独配置。'
      />

      <FormInput
        control={form.control}
        name='sortOrder'
        label='排序'
        type='number'
        min={0}
      />

      <FormSwitch
        control={form.control}
        name='visible'
        label='在菜单中显示'
        showDescription={false}
      />

      <div className='flex flex-wrap justify-end gap-2 pt-2'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={form.formState.isSubmitting}
        >
          取消
        </Button>
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '提交中…' : '确认'}
        </Button>
      </div>
    </Form>
  );
}
