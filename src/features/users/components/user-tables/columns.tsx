'use client';

import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { UserListRow } from '@/features/users/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Text } from 'lucide-react';

function formatDate(raw: string) {
  try {
    return format(new Date(raw), 'yyyy-MM-dd HH:mm');
  } catch {
    return raw;
  }
}

export const columns: ColumnDef<UserListRow>[] = [
  {
    accessorKey: 'id',
    header: ({ column }: { column: Column<UserListRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ cell }) => (
      <span className='max-w-[220px] truncate font-mono text-xs'>
        {cell.getValue<string>()}
      </span>
    )
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<UserListRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='姓名' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>()}</div>,
    meta: {
      label: '姓名',
      placeholder: '搜索姓名或邮箱…',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'email',
    header: ({ column }: { column: Column<UserListRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='邮箱' />
    ),
    cell: ({ cell }) => (
      <span className='text-muted-foreground'>
        {cell.getValue<UserListRow['email']>()}
      </span>
    )
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
  }
];
