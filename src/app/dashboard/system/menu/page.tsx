import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import MenuListingPage from '@/features/menus/components/menu-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: 菜单管理'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='菜单管理'
      pageDescription='维护系统侧栏菜单树、路由与激活路径（子路由高亮父级等场景）'
    >
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={10}
            rowCount={8}
            filterCount={1}
            withPagination={false}
            withViewOptions={false}
          />
        }
      >
        <MenuListingPage />
      </Suspense>
    </PageContainer>
  );
}
