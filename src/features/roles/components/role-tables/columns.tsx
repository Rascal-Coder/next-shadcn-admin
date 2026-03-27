'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { RoleListRow } from '@/features/roles/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CellAction } from '@/features/roles/components/role-tables/cell-action';

function formatDate(raw: string | undefined) {
  if (!raw) return '—';
  try {
    return format(new Date(raw), 'yyyy-MM-dd HH:mm');
  } catch {
    return raw;
  }
}

export function getRoleColumns(
  onRefresh: () => void
): ColumnDef<RoleListRow>[] {
  return [
    {
      id: 'serial',
      header: ({ column }: { column: Column<RoleListRow, unknown> }) => (
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
      accessorKey: 'code',
      header: ({ column }: { column: Column<RoleListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='权限字符' />
      ),
      cell: ({ cell }) => (
        <Badge variant='outline' className='font-mono text-xs'>
          {cell.getValue<string>()}
        </Badge>
      )
    },
    {
      accessorKey: 'name',
      header: ({ column }: { column: Column<RoleListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='角色名称' />
      ),
      cell: ({ cell }) => <div>{cell.getValue<string>()}</div>
    },
    {
      accessorKey: 'status',
      header: ({ column }: { column: Column<RoleListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ cell }) => {
        const s = cell.getValue<RoleListRow['status']>();
        return (
          <Badge variant={s === 'ACTIVE' ? 'default' : 'secondary'}>
            {s === 'ACTIVE' ? '正常' : '停用'}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'remark',
      header: ({ column }: { column: Column<RoleListRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='备注' />
      ),
      cell: ({ row }) => {
        const v = row.original.remark?.trim();
        if (!v) {
          return (
            <Badge
              variant='outline'
              className='text-muted-foreground border-dashed font-normal'
            >
              —
            </Badge>
          );
        }
        return (
          <div
            className='border-border/80 bg-muted/35 border-l-primary/35 max-w-[min(280px,38vw)] rounded-md border border-l-[3px] px-2.5 py-1.5'
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
      header: ({ column }: { column: Column<RoleListRow, unknown> }) => (
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
      header: ({ column }: { column: Column<RoleListRow, unknown> }) => (
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
        <CellAction data={row.original} onRefresh={onRefresh} />
      )
    }
  ];
}
