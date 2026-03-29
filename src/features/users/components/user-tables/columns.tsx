'use client';

import { Badge } from '@/components/ui/badge';
import { DataGridColumnHeader } from '@/components/ui/data-grid/data-grid-column-header';
import type { UserListRow } from '@/features/users/types';
import { cn } from '@/lib/utils';
import { IconCopy } from '@tabler/icons-react';
import { Column, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CellAction } from './cell-action';

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  } catch {
    toast.error('复制失败');
  }
}

function formatDate(raw: string) {
  try {
    return format(new Date(raw), 'yyyy-MM-dd HH:mm');
  } catch {
    return raw;
  }
}

export function getUserColumns(
  onRefresh: () => void,
  currentUserId: string | null
): ColumnDef<UserListRow>[] {
  return [
    {
      id: 'serial',
      meta: { headerTitle: '序号' },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='序号' />
      ),
      cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        const serial = pageIndex * pageSize + row.index + 1;
        return (
          <Badge
            variant='outline'
            className='text-muted-foreground min-w-8 justify-center px-2 font-mono tabular-nums'
            aria-label={`第 ${serial} 条`}
          >
            {serial}
          </Badge>
        );
      },
      enableSorting: false
    },
    {
      accessorKey: 'name',
      meta: { headerTitle: '姓名' },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='姓名' />
      ),
      cell: ({ cell }) => (
        <span className='text-foreground text-sm font-medium'>
          {cell.getValue<string>()}
        </span>
      )
    },
    {
      accessorKey: 'roleCode',
      meta: { headerTitle: '主角色' },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='主角色' />
      ),
      cell: ({ cell }) => (
        <Badge variant='outline' className='font-mono text-xs'>
          {cell.getValue<string>()}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      meta: { headerTitle: '状态' },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='状态' />
      ),
      cell: ({ cell }) => {
        const s = cell.getValue<UserListRow['status']>();
        const active = s === 'ACTIVE';
        return (
          <Badge
            variant='outline'
            className={cn(
              'font-medium',
              active
                ? 'border-primary/30 bg-primary/10 text-primary shadow-none'
                : 'text-muted-foreground'
            )}
          >
            {active ? '正常' : '停用'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'email',
      meta: { headerTitle: '邮箱' },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='邮箱' />
      ),
      cell: ({ row }) => {
        const email = row.original.email;
        return (
          <div
            className='border-border bg-muted/40 text-muted-foreground inline-flex max-w-[min(320px,40vw)] items-center gap-1 rounded-full border py-1 pr-1 pl-3 shadow-none'
            title={email}
          >
            <span className='min-w-0 flex-1 truncate font-mono text-xs leading-none'>
              {email}
            </span>
            <button
              type='button'
              className='text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors'
              aria-label='复制邮箱'
              title='复制邮箱'
              onClick={() => copyToClipboard(email)}
            >
              <IconCopy className='size-3.5' stroke={1.5} />
            </button>
          </div>
        );
      }
    },
    {
      accessorKey: 'remark',
      meta: {
        headerTitle: '备注',
        cellClassName: 'whitespace-normal align-top'
      },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='备注' />
      ),
      cell: ({ row }) => {
        const v = row.original.remark?.trim();
        if (!v) {
          return (
            <span
              className='text-muted-foreground bg-muted/30 border-border inline-flex max-w-[min(300px,38vw)] items-center rounded-full border px-3 py-1 text-xs'
              aria-label='暂无备注'
            >
              暂无备注
            </span>
          );
        }
        return (
          <div
            className='border-border bg-muted/25 max-w-[min(300px,38vw)] rounded-lg border px-2.5 py-1.5'
            title={v}
          >
            <p className='text-foreground/90 line-clamp-2 text-sm leading-relaxed wrap-break-word'>
              {v}
            </p>
          </div>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      meta: { headerTitle: '创建时间' },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='创建时间' />
      ),
      cell: ({ cell }) => (
        <span className='text-muted-foreground tabular-nums'>
          {formatDate(cell.getValue<string>())}
        </span>
      )
    },
    {
      accessorKey: 'updatedAt',
      meta: { headerTitle: '更新时间' },
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataGridColumnHeader column={column} title='更新时间' />
      ),
      cell: ({ cell }) => (
        <span className='text-muted-foreground tabular-nums'>
          {formatDate(cell.getValue<string>())}
        </span>
      )
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <CellAction
          data={row.original}
          onRefresh={onRefresh}
          currentUserId={currentUserId}
        />
      )
    }
  ];
}
