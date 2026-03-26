import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import UserListingPage from '@/features/users/components/user-listing';
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
    <PageContainer
      scrollable={false}
      pageTitle='用户管理'
      pageDescription='管理系统用户（GET /api/users）'
    >
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={1} />
        }
      >
        <UserListingPage />
      </Suspense>
    </PageContainer>
  );
}
