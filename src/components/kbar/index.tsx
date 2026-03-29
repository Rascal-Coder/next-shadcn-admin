'use client';
import { useDashboardMenu } from '@/components/layout/dashboard-menu-provider';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { navItems } from '@/config/nav-config';
import { useFilteredNavItems } from '@/hooks/use-nav';
import { collectKbarEntriesFromMenuTree } from '@/lib/menu-tree-nav';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';

function KBarInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);
  const menuCtx = useDashboardMenu();

  const actions = useMemo(() => {
    const navigateTo = (url: string) => {
      router.push(url);
    };

    if (!menuCtx.bootstrapped) {
      return [];
    }

    if (menuCtx.bypassMenuGuard && menuCtx.menuNodesForSidebar.length === 0) {
      return filteredItems.flatMap((navItem) => {
        const baseAction =
          navItem.url !== '#'
            ? {
                id: `${navItem.title.toLowerCase()}Action`,
                name: navItem.title,
                shortcut: navItem.shortcut,
                keywords: navItem.title.toLowerCase(),
                section: 'Navigation',
                subtitle: `Go to ${navItem.title}`,
                perform: () => navigateTo(navItem.url)
              }
            : null;

        const childActions =
          navItem.items?.map((childItem) => ({
            id: `${childItem.title.toLowerCase()}Action`,
            name: childItem.title,
            shortcut: childItem.shortcut,
            keywords: childItem.title.toLowerCase(),
            section: navItem.title,
            subtitle: `Go to ${childItem.title}`,
            perform: () => navigateTo(childItem.url)
          })) ?? [];

        return baseAction ? [baseAction, ...childActions] : childActions;
      });
    }

    return collectKbarEntriesFromMenuTree(menuCtx.menuNodesForSidebar).map(
      (e) => ({
        id: e.id,
        name: e.name,
        shortcut: undefined,
        keywords: e.name.toLowerCase(),
        section: e.section,
        subtitle: e.name,
        perform: () => navigateTo(e.url)
      })
    );
  }, [router, filteredItems, menuCtx]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

export default function KBar({ children }: { children: React.ReactNode }) {
  return <KBarInner>{children}</KBarInner>;
}

const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
