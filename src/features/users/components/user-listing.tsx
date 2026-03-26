'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { userControllerList } from '@/services/api/users';
import { useEffect, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import type { UserListRow } from '../types';
import { UserTable } from './user-tables';
import { columns } from './user-tables/columns';

/** 解析 openapi 请求返回的统一响应体中的 data */
function unwrapListPayload(
  raw: unknown
): { items: UserListRow[]; total: number } | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = (raw as { data?: API.UserListDataDto }).data;
  if (!data?.items || typeof data.total !== 'number') return null;
  return { items: data.items, total: data.total };
}

export default function UserListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));

  const [rows, setRows] = useState<UserListRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await userControllerList({
          page,
          pageSize: perPage
        });
        if (cancelled) return;
        const parsed = unwrapListPayload(res);
        if (parsed) {
          setRows(parsed.items);
          setTotalItems(parsed.total);
        } else {
          setRows([]);
          setTotalItems(0);
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setTotalItems(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, perPage]);

  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={5}
        rowCount={8}
        filterCount={1}
        withPagination
        withViewOptions
      />
    );
  }

  return (
    <UserTable<UserListRow, unknown>
      data={rows}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
