'use client';

import { Button } from '@/components/ui/button';
import {
  DataGrid,
  DataGridContainer
} from '@/components/ui/data-grid/data-grid';
import { DataGridColumnVisibility } from '@/components/ui/data-grid/data-grid-column-visibility';
import { DataGridPagination } from '@/components/ui/data-grid/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid/data-grid-table';
import { useDataTable } from '@/hooks/use-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';

interface UserTableParams<TData extends object, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export function UserTable<TData extends object, TValue>({
  data,
  totalItems,
  columns
}: UserTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    shallow: false,
    debounceMs: 500,
    manualSorting: false
  });

  return (
    <DataGridContainer className='bg-card gap-0 overflow-hidden shadow-xs'>
      <DataGrid<TData>
        table={table}
        recordCount={totalItems}
        emptyMessage='暂无用户'
        tableLayout={{
          width: 'auto',
          rowBorder: true,
          headerBackground: true,
          headerBorder: true
        }}
        tableClassNames={{
          base: 'text-sm',
          body: 'bg-card',
          bodyRow: 'bg-card'
        }}
      >
        <div className='bg-muted/30 border-border flex items-center justify-end border-b px-3 py-2.5'>
          <DataGridColumnVisibility<TData>
            table={table}
            trigger={
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='focus-visible:ring-border/60 gap-1.5 shadow-none focus-visible:ring-1'
              >
                <Settings2 className='size-4' aria-hidden />
                列设置
              </Button>
            }
          />
        </div>
        <div className='bg-card overflow-x-auto'>
          <DataGridTable />
        </div>
        <div className='bg-muted/20 border-border border-t px-3 py-2'>
          <DataGridPagination
            className='py-0'
            rowsPerPageLabel='每页行数'
            previousPageLabel='上一页'
            nextPageLabel='下一页'
            ellipsisText='…'
            formatResultsSummary={(from, to, total) =>
              total === 0 ? '暂无数据' : `第 ${from}–${to} 条，共 ${total} 条`
            }
          />
        </div>
      </DataGrid>
    </DataGridContainer>
  );
}
