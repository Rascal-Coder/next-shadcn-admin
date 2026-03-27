'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { UserListRow } from '@/features/users/types';
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
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='序号' />
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
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='姓名' />
      ),
      cell: ({ cell }) => <div>{cell.getValue<string>()}</div>
    },
    {
      accessorKey: 'roleCode',
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='主角色' />
      ),
      cell: ({ cell }) => (
        <Badge variant='outline' className='font-mono text-xs'>
          {cell.getValue<string>()}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ cell }) => {
        const s = cell.getValue<UserListRow['status']>();
        return (
          <Badge variant={s === 'ACTIVE' ? 'default' : 'secondary'}>
            {s === 'ACTIVE' ? '正常' : '停用'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'email',
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='邮箱' />
      ),
      cell: ({ row }) => {
        const email = row.original.email;
        return (
          <div
            className='border-border bg-muted/50 text-muted-foreground inline-flex max-w-[min(320px,40vw)] items-center gap-1 rounded-full border py-1 pr-1 pl-3'
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
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='备注' />
      ),
      cell: ({ row }) => {
        const v = row.original.remark?.trim();
        if (!v) {
          return (
            <Badge
              variant='outline'
              className='text-muted-foreground border-dashed font-normal'
              aria-label='暂无备注'
            >
              暂无备注
            </Badge>
          );
        }
        return (
          <div
            className='border-border/80 bg-muted/35 border-l-primary/35 max-w-[min(300px,38vw)] rounded-md border border-l-[3px] px-2.5 py-1.5 shadow-xs'
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
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='创建时间' />
      ),
      cell: ({ cell }) => (
        <span className='text-muted-foreground tabular-nums'>
          {formatDate(cell.getValue<string>())}
        </span>
      )
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }: { column: Column<UserListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='更新时间' />
      ),
      cell: ({ cell }) => (
        <span className='text-muted-foreground tabular-nums'>
          {formatDate(cell.getValue<string>())}
        </span>
      )
    },
    {
      id: 'actions',
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
