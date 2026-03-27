'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { roleControllerList } from '@/services/api/roles';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import type { RoleListRow } from '@/features/roles/types';
import { RoleTable } from '@/features/roles/components/role-tables';
import { getRoleColumns } from '@/features/roles/components/role-tables/columns';
import { useRoleListRefresh } from '@/features/roles/components/role-list-refresh-context';

function unwrapListPayload(
  raw: unknown
): { items: RoleListRow[]; total: number } | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = (raw as { data?: API.RoleListDataDto }).data;
  if (!data?.items || typeof data.total !== 'number') return null;
  return { items: data.items, total: data.total };
}

export default function RoleListingPage() {
  const { setRefresh } = useRoleListRefresh();
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));

  const [rows, setRows] = useState<RoleListRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await roleControllerList(
        { page, pageSize: perPage },
        { signal: controller.signal, skipErrorHandler: true }
      );
      if (controller.signal.aborted) return;
      const parsed = unwrapListPayload(res);
      if (parsed) {
        setRows(parsed.items);
        setTotalItems(parsed.total);
      } else {
        setRows([]);
        setTotalItems(0);
        setError('列表数据格式异常，请稍后重试');
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.code === 'ERR_CANCELED') return;
      if (controller.signal.aborted) return;
      setRows([]);
      setTotalItems(0);
      setError(e instanceof Error ? e.message : '加载角色列表失败，请稍后重试');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    void load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  useEffect(() => {
    setRefresh(load);
    return () => setRefresh(() => {});
  }, [load, setRefresh]);

  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={8}
        rowCount={8}
        filterCount={0}
        withPagination
        withViewOptions
      />
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertTitle>无法加载角色列表</AlertTitle>
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

  return (
    <RoleTable<RoleListRow, unknown>
      data={rows}
      totalItems={totalItems}
      columns={getRoleColumns(load)}
    />
  );
}
