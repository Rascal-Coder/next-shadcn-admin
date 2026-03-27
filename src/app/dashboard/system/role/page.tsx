import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { RoleCreateHeaderButton } from '@/features/roles/components/role-create-modal';
import RoleListingPage from '@/features/roles/components/role-listing';
import { RoleListRefreshProvider } from '@/features/roles/components/role-list-refresh-context';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: 角色管理'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <RoleListRefreshProvider>
      <PageContainer
        scrollable={false}
        pageTitle='角色管理'
        pageDescription='管理系统角色、菜单勾选与权限字符'
        pageHeaderAction={<RoleCreateHeaderButton />}
      >
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={8} filterCount={0} />
          }
        >
          <RoleListingPage />
        </Suspense>
      </PageContainer>
    </RoleListRefreshProvider>
  );
}
