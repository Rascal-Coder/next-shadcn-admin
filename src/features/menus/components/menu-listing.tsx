'use client';

import { Modal } from '@/components/ui/modal';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  DataGrid,
  DataGridContainer
} from '@/components/ui/data-grid/data-grid';
import { DataGridTable } from '@/components/ui/data-grid/data-grid-table';
import { MenuManageModal } from '@/features/menus/components/menu-manage-modal';
import {
  filterMenuTreeBySearch,
  findMenuNodeById,
  menuTreeToTableData,
  type MenuTableRow
} from '@/features/menus/utils/menu-tree-helpers';
import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import { getRequestErrorMessage } from '@/lib/request';
import { isSuccess } from '@/lib/response-code';
import { menuControllerRemove, menuControllerTree } from '@/services/api/menus';
import {
  ColumnDef,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconFolderPlus,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

/** 每层缩进（与 tailwind spacing 对齐，保证子行明显右移） */
const TREE_INDENT_REM = 1.5;

function unwrapTreePayload(raw: unknown): MenuTreeNodeView[] {
  if (!raw || typeof raw !== 'object') return [];
  const data = (raw as { data?: API.MenuTreeDataDto }).data;
  return Array.isArray(data?.items) ? (data!.items as MenuTreeNodeView[]) : [];
}

const menuTypeLabel: Record<API.MenuTreeNodeDto['menuType'], string> = {
  DIRECTORY: '目录',
  MENU: '菜单',
  BUTTON: '按钮'
};

export default function MenuListingPage() {
  const [tree, setTree] = useState<MenuTreeNodeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [manageOpen, setManageOpen] = useState(false);
  const [manageMode, setManageMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MenuTreeNodeView | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await menuControllerTree({
        signal: controller.signal,
        skipErrorHandler: true
      });
      if (controller.signal.aborted) return;
      if (!isSuccess((res as { code?: number }).code)) {
        setTree([]);
        setError('菜单树加载失败');
        return;
      }
      setTree(unwrapTreePayload(res));
    } catch (e) {
      if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
      if (controller.signal.aborted) return;
      setTree([]);
      setError(e instanceof Error ? e.message : '加载菜单失败，请稍后重试');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  const filteredTree = useMemo(
    () => filterMenuTreeBySearch(tree, search),
    [tree, search]
  );

  const tableData = useMemo(
    () => menuTreeToTableData(filteredTree),
    [filteredTree]
  );

  useEffect(() => {
    if (search.trim()) setExpanded(true);
  }, [search]);

  const openCreate = useCallback((parentId: string | null) => {
    setManageMode('create');
    setEditingId(null);
    setDefaultParentId(parentId);
    setManageOpen(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setManageMode('edit');
    setEditingId(id);
    setDefaultParentId(null);
    setManageOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<MenuTableRow>[]>(
    () => [
      {
        id: 'name',
        header: '菜单名称',
        meta: {
          headerClassName: 'min-w-[200px]',
          cellClassName: 'min-w-0 max-w-[min(100vw,36rem)]'
        },
        cell: ({ row }) => {
          const node = row.original;
          const canExpand = row.getCanExpand();
          const depth = row.depth;
          return (
            <div
              className='flex max-w-[min(100vw,36rem)] min-w-0 items-center gap-0.5'
              style={{
                // TanStack row.depth：子级 ≥1，每层 1.5rem，避免与父级文字左对齐
                paddingLeft: `calc(${depth} * ${TREE_INDENT_REM}rem)`
              }}
            >
              <button
                type='button'
                className='text-muted-foreground hover:bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-sm disabled:pointer-events-none disabled:opacity-100'
                onClick={row.getToggleExpandedHandler()}
                disabled={!canExpand}
                aria-expanded={row.getIsExpanded()}
                aria-label={canExpand ? '展开或折叠子菜单' : undefined}
              >
                {canExpand ? (
                  row.getIsExpanded() ? (
                    <IconChevronDown className='size-4' />
                  ) : (
                    <IconChevronRight className='size-4' />
                  )
                ) : (
                  <span className='inline-block w-4' aria-hidden />
                )}
              </button>
              <span className='truncate font-medium'>{node.name}</span>
            </div>
          );
        }
      },
      {
        id: 'icon',
        header: '图标',
        meta: {
          headerClassName: 'w-[120px]',
          cellClassName: 'w-[120px]'
        },
        cell: ({ row }) => {
          const node = row.original;
          return (
            <span
              className='max-w-[120px] truncate font-mono text-xs'
              title={node.icon ?? undefined}
            >
              {node.icon?.trim() ? node.icon : '—'}
            </span>
          );
        }
      },
      {
        id: 'path',
        header: '路由',
        meta: {
          headerClassName: 'min-w-[120px]',
          cellClassName: 'min-w-0 max-w-[200px]'
        },
        cell: ({ row }) => (
          <span className='max-w-[200px] truncate font-mono text-xs'>
            {row.original.path ?? '—'}
          </span>
        )
      },
      {
        id: 'activePath',
        header: '激活路径',
        meta: {
          headerClassName: 'min-w-[120px]',
          cellClassName: 'min-w-0 max-w-[200px]'
        },
        cell: ({ row }) => {
          const v = row.original.activePath?.trim();
          return (
            <span className='max-w-[200px] truncate font-mono text-xs'>
              {v ? v : '—'}
            </span>
          );
        }
      },
      {
        id: 'menuType',
        header: '类型',
        meta: { headerClassName: 'whitespace-nowrap' },
        cell: ({ row }) => (
          <Badge variant='outline'>
            {menuTypeLabel[row.original.menuType]}
          </Badge>
        )
      },
      {
        id: 'sortOrder',
        header: '排序',
        meta: {
          headerClassName: 'w-[72px]',
          cellClassName: 'w-[72px]'
        },
        cell: ({ row }) => row.original.sortOrder
      },
      {
        id: 'visible',
        header: '显示',
        meta: {
          headerClassName: 'w-[88px]',
          cellClassName: 'w-[88px]'
        },
        cell: ({ row }) =>
          row.original.visible ? (
            <Badge>是</Badge>
          ) : (
            <Badge variant='secondary'>否</Badge>
          )
      },
      {
        id: 'permission',
        header: '权限',
        meta: {
          headerClassName: 'min-w-[100px]',
          cellClassName: 'min-w-0 max-w-[140px]'
        },
        cell: ({ row }) => {
          const code = row.original.permission?.code?.trim();
          return (
            <span
              className='max-w-[140px] truncate text-xs'
              title={row.original.permission?.code}
            >
              {code ? code : '—'}
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: () => <span className='sr-only'>操作</span>,
        meta: {
          headerClassName: 'w-[56px]',
          cellClassName: 'w-[56px]'
        },
        cell: ({ row }) => {
          const node = row.original;
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>打开菜单</span>
                  <IconDotsVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openEdit(node.id)}>
                  <IconEdit className='mr-2 h-4 w-4' /> 编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openCreate(node.id)}>
                  <IconFolderPlus className='mr-2 h-4 w-4' /> 添加子菜单
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    const { subRows: _sr, ...base } = node;
                    setDeleteTarget(
                      findMenuNodeById(tree, node.id) ??
                        ({ ...base, children: [] } as MenuTreeNodeView)
                    );
                    setDeleteOpen(true);
                  }}
                >
                  <IconTrash className='mr-2 h-4 w-4' /> 删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    [openCreate, openEdit, tree]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = (await menuControllerRemove(
        { id: deleteTarget.id },
        { skipErrorHandler: true }
      )) as { code?: number; message?: string; msg?: string };
      if (!isSuccess(res.code)) {
        toast.error(res.message ?? res.msg ?? '删除失败');
        return;
      }
      toast.success('菜单已删除');
      setDeleteOpen(false);
      setDeleteTarget(null);
      void load();
    } catch (e) {
      toast.error(getRequestErrorMessage(e, '删除失败，请稍后重试'));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={10}
        rowCount={8}
        filterCount={1}
        withPagination={false}
        withViewOptions={false}
      />
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertTitle>无法加载菜单</AlertTitle>
        <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <span>{error}</span>
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

  const rowModel = table.getRowModel();
  const hasTree = tree.length > 0;
  const emptyMessage = !hasTree
    ? '暂无菜单，点击「新增菜单」开始配置。'
    : '没有匹配的菜单，请调整搜索关键词。';

  return (
    <>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative max-w-md flex-1'>
          <IconSearch className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            type='search'
            placeholder='搜索名称、路由、图标、权限…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-9 pl-9'
            aria-label='筛选菜单'
          />
        </div>
        <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => void load()}
          >
            <IconRefresh className='mr-1.5 size-4' />
            刷新
          </Button>
          <Button type='button' size='sm' onClick={() => openCreate(null)}>
            <IconPlus className='mr-1.5 size-4' />
            新增菜单
          </Button>
        </div>
      </div>

      <MenuManageModal
        open={manageOpen}
        mode={manageMode}
        menuId={editingId}
        defaultParentId={defaultParentId}
        tree={tree}
        onClose={() => setManageOpen(false)}
        onSaved={() => {
          setManageOpen(false);
          void load();
        }}
      />

      <Modal
        title='确认删除'
        description={`确定删除菜单「${deleteTarget?.name ?? ''}」？子菜单及关联角色菜单将由服务端级联处理。`}
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
      >
        <div className='flex w-full items-center justify-end space-x-2 pt-6'>
          <Button
            disabled={deleteLoading}
            variant='outline'
            type='button'
            onClick={() => {
              setDeleteOpen(false);
              setDeleteTarget(null);
            }}
          >
            取消
          </Button>
          <Button
            disabled={deleteLoading}
            variant='destructive'
            type='button'
            onClick={() => void onConfirmDelete()}
          >
            删除
          </Button>
        </div>
      </Modal>

      <DataGridContainer className='bg-card gap-0 overflow-hidden shadow-xs'>
        <DataGrid
          table={table}
          recordCount={rowModel.rows.length}
          emptyMessage={emptyMessage}
          tableLayout={{
            width: 'auto',
            rowBorder: true,
            headerBackground: true,
            headerBorder: true,
            headerSticky: false
          }}
          tableClassNames={{
            base: 'text-sm',
            body: 'bg-card',
            bodyRow: 'bg-card'
          }}
        >
          <div className='bg-card overflow-x-auto'>
            <DataGridTable />
          </div>
        </DataGrid>
      </DataGridContainer>
    </>
  );
}
