'use client';

import { Icons } from '@/components/icons';
import { navItems } from '@/config/nav-config';
import type { NavItem } from '@/types';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export type BreadcrumbSegment = {
  title: string;
  link: string;
  /** 解析后每级都会补齐 */
  icon: keyof typeof Icons;
};

const DEFAULT_CRUMB_ICON: keyof typeof Icons = 'page';

/** 精确路径覆盖（优先于侧栏配置，用于自定义层级文案） */
const routeMapping: Record<
  string,
  { title: string; link: string; icon?: keyof typeof Icons }[]
> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' }
  ]
};

const SLUG_ICON: Record<string, keyof typeof Icons> = {
  dashboard: 'dashboard',
  overview: 'dashboard',
  product: 'product',
  kanban: 'kanban',
  employee: 'employee',
  'sign-in': 'login',
  account: 'account'
};

function findNavTrail(
  pathname: string,
  items: NavItem[],
  trail: NavItem[] = []
): NavItem[] | null {
  for (const item of items) {
    const nextTrail = [...trail, item];
    if (item.url !== '#' && item.url === pathname) {
      return nextTrail;
    }
    if (item.items?.length) {
      const found = findNavTrail(pathname, item.items, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

function findNavItemByUrl(url: string, items: NavItem[]): NavItem | null {
  if (!url || url === '#') return null;
  for (const item of items) {
    if (item.url !== '#' && item.url === url) return item;
    if (item.items?.length) {
      const found = findNavItemByUrl(url, item.items);
      if (found) return found;
    }
  }
  return null;
}

function navItemsToSegments(
  items: NavItem[]
): { title: string; link: string; icon?: keyof typeof Icons }[] {
  return items.map((item) => ({
    title: item.title,
    link: item.url,
    icon: item.icon
  }));
}

function segmentsFromPath(
  pathname: string
): { title: string; link: string; icon?: keyof typeof Icons }[] {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    return {
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      link: path
    };
  });
}

function resolveSegmentIcon(segment: {
  title: string;
  link: string;
  icon?: keyof typeof Icons;
}): keyof typeof Icons {
  if (segment.icon) return segment.icon;

  const fromNav = findNavItemByUrl(segment.link, navItems);
  if (fromNav?.icon) return fromNav.icon;

  if (segment.link === '#') {
    const t = segment.title.toLowerCase();
    if (t === 'account') return 'account';
    return 'workspace';
  }

  const slug = segment.link.split('/').filter(Boolean).pop() ?? '';
  if (slug && SLUG_ICON[slug]) return SLUG_ICON[slug];

  const titleSlug = segment.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  if (titleSlug && SLUG_ICON[titleSlug]) return SLUG_ICON[titleSlug];

  const lower = segment.title.toLowerCase();
  if (lower === 'dashboard') return 'dashboard';
  if (lower === 'product') return 'product';
  if (lower === 'employee') return 'employee';
  if (lower === 'kanban') return 'kanban';

  return DEFAULT_CRUMB_ICON;
}

function withResolvedIcons(
  segments: { title: string; link: string; icon?: keyof typeof Icons }[]
): BreadcrumbSegment[] {
  return segments.map((s) => ({
    title: s.title,
    link: s.link,
    icon: resolveSegmentIcon(s)
  }));
}

export function useBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname();

  return useMemo(() => {
    const mapped = routeMapping[pathname];
    if (mapped) return withResolvedIcons(mapped);

    const trail = findNavTrail(pathname, navItems);
    if (trail?.length) {
      return withResolvedIcons(navItemsToSegments(trail));
    }

    return withResolvedIcons(segmentsFromPath(pathname));
  }, [pathname]);
}
