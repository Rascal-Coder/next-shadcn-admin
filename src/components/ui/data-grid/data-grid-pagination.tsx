import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useDataGrid } from './data-grid';

interface DataGridPaginationProps {
  sizes?: number[];
  sizesInfo?: string;
  sizesLabel?: string;
  sizesDescription?: string;
  sizesSkeleton?: ReactNode;
  more?: boolean;
  moreLimit?: number;
  infoSkeleton?: ReactNode;
  className?: string;
  rowsPerPageLabel?: string;
  previousPageLabel?: string;
  nextPageLabel?: string;
  ellipsisText?: string;
  /** 自定义「当前范围 / 总数」文案，不传则使用英文默认 */
  formatResultsSummary?: (from: number, to: number, total: number) => string;
}

function DataGridPagination(props: DataGridPaginationProps) {
  const { table, recordCount, isLoading } = useDataGrid();

  const defaultProps: Partial<DataGridPaginationProps> = {
    sizes: [5, 10, 25, 50, 100],
    sizesLabel: 'Show',
    sizesDescription: 'per page',
    sizesSkeleton: <Skeleton className='h-8 w-44' />,
    moreLimit: 5,
    more: false,
    infoSkeleton: <Skeleton className='h-8 w-60' />,
    rowsPerPageLabel: 'Rows per page',
    previousPageLabel: 'Go to previous page',
    nextPageLabel: 'Go to next page',
    ellipsisText: '...'
  };

  const mergedProps: DataGridPaginationProps = { ...defaultProps, ...props };

  const btnBaseClasses = 'size-7 p-0 text-sm';
  const btnArrowClasses = btnBaseClasses + ' rtl:transform rtl:rotate-180';
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, recordCount);
  const pageCount = table.getPageCount();

  const paginationInfo = mergedProps.formatResultsSummary
    ? mergedProps.formatResultsSummary(from, to, recordCount)
    : recordCount === 0
      ? '0 results'
      : `${from}–${to} of ${recordCount}`;

  // Pagination limit logic
  const paginationMoreLimit = mergedProps?.moreLimit || 5;

  // Determine the start and end of the pagination group
  const currentGroupStart =
    Math.floor(pageIndex / paginationMoreLimit) * paginationMoreLimit;
  const currentGroupEnd = Math.min(
    currentGroupStart + paginationMoreLimit,
    pageCount
  );

  // Render page buttons based on the current group
  const renderPageButtons = () => {
    const buttons = [];
    for (let i = currentGroupStart; i < currentGroupEnd; i++) {
      buttons.push(
        <Button
          key={i}
          size='sm'
          variant='ghost'
          className={cn(btnBaseClasses, 'text-muted-foreground', {
            'bg-accent text-accent-foreground': pageIndex === i
          })}
          onClick={() => {
            if (pageIndex !== i) {
              table.setPageIndex(i);
            }
          }}
        >
          {i + 1}
        </Button>
      );
    }
    return buttons;
  };

  // Render a "previous" ellipsis button if there are previous pages to show
  const renderEllipsisPrevButton = () => {
    if (currentGroupStart > 0) {
      return (
        <Button
          size='sm'
          className={btnBaseClasses}
          variant='ghost'
          onClick={() => table.setPageIndex(currentGroupStart - 1)}
        >
          {mergedProps.ellipsisText}
        </Button>
      );
    }
    return null;
  };

  // Render a "next" ellipsis button if there are more pages to show after the current group
  const renderEllipsisNextButton = () => {
    if (currentGroupEnd < pageCount) {
      return (
        <Button
          className={btnBaseClasses}
          variant='ghost'
          size='sm'
          onClick={() => table.setPageIndex(currentGroupEnd)}
        >
          {mergedProps.ellipsisText}
        </Button>
      );
    }
    return null;
  };

  return (
    <div
      data-slot='data-grid-pagination'
      className={cn(
        'flex grow flex-col flex-wrap items-center justify-between gap-2.5 py-2.5 sm:flex-row sm:py-0',
        mergedProps?.className
      )}
    >
      {/* 左侧每页条数 */}
      <div className='order-2 flex flex-wrap items-center gap-2 sm:order-0'>
        {isLoading ? (
          mergedProps?.sizesSkeleton
        ) : (
          <>
            <div className='text-muted-foreground text-sm'>
              {mergedProps.rowsPerPageLabel}
            </div>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                table.setPageSize(newPageSize);
              }}
            >
              <SelectTrigger
                className={cn(
                  'w-fit min-w-16 shadow-none',
                  'focus-visible:border-border focus-visible:ring-border/50 focus-visible:ring-1'
                )}
                size='sm'
              >
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent side='top' className='min-w-[50px]'>
                {mergedProps?.sizes?.map((size: number) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      {/* 中间分页 */}
      <div className='order-1 flex items-center gap-1 sm:order-0'>
        {isLoading ? (
          mergedProps?.infoSkeleton
        ) : pageCount > 1 ? (
          <>
            <Button
              size='icon'
              variant='ghost'
              className={btnArrowClasses}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>{mergedProps.previousPageLabel}</span>
              <ChevronLeftIcon className='size-4' />
            </Button>

            {renderEllipsisPrevButton()}

            {renderPageButtons()}

            {renderEllipsisNextButton()}

            <Button
              size='icon'
              variant='ghost'
              className={btnArrowClasses}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>{mergedProps.nextPageLabel}</span>
              <ChevronRightIcon className='size-4' />
            </Button>
          </>
        ) : null}
      </div>
      {/* 右侧总条数 */}
      <div className='text-muted-foreground order-3 text-sm text-nowrap sm:order-0'>
        {isLoading ? mergedProps?.infoSkeleton : paginationInfo}
      </div>
    </div>
  );
}

export { DataGridPagination, type DataGridPaginationProps };
