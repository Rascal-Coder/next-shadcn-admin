import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { UserCreateHeaderButton } from '@/features/users/components/user-create-modal';
import UserListingPage from '@/features/users/components/user-listing';
import { UserListRefreshProvider } from '@/features/users/components/user-list-refresh-context';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: 用户管理'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <UserListRefreshProvider>
      <PageContainer
        scrollable={false}
        pageTitle='用户管理'
        pageDescription='管理系统用户：列表、新建、编辑与删除'
        pageHeaderAction={<UserCreateHeaderButton />}
      >
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={8} filterCount={0} />
          }
        >
          <UserListingPage />
        </Suspense>
      </PageContainer>
    </UserListRefreshProvider>
  );
}
