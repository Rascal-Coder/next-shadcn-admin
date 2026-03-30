'use client';

import { useDashboardMenu } from '@/components/layout/dashboard-menu-provider';
import {
  DASHBOARD_NAV_CURRENT_KEY,
  DASHBOARD_NAV_PREV_KEY
} from '@/lib/dashboard-nav-history';
import { normalizeAppPathname } from '@/lib/app-pathname';
import { isRouteAllowedByMenuAccess } from '@/lib/menu-access';
import NotFound from '@/app/not-found';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';

/**
 * 仪表盘主内容：菜单未就绪时 loading；就绪后按菜单校验 pathname。
 * 无权限时不使用 replace/assign：壳内提示，用 Link 回到上次允许路径或 fallback（客户端 push，历史栈正常可返回）。
 */
function readNavCurrentFromSession(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DASHBOARD_NAV_CURRENT_KEY);
    return raw ? normalizeAppPathname(raw) : null;
  } catch {
    return null;
  }
}

export function DashboardRouteGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { bootstrapped, menuRouteAccess, fallbackPath } = useDashboardMenu();
  const lastAllowedDashboardPathRef = useRef<string | null>(null);

  if (lastAllowedDashboardPathRef.current == null) {
    const fromSession = readNavCurrentFromSession();
    if (fromSession) {
      lastAllowedDashboardPathRef.current = fromSession;
    }
  }

  useLayoutEffect(() => {
    try {
      if (lastAllowedDashboardPathRef.current == null) {
        const raw = sessionStorage.getItem(DASHBOARD_NAV_CURRENT_KEY);
        if (raw) {
          lastAllowedDashboardPathRef.current = normalizeAppPathname(raw);
        }
      }
    } catch {
      /* ignore */
    }

    if (
      !bootstrapped ||
      !menuRouteAccess ||
      menuRouteAccess.allowedPaths.size === 0
    ) {
      return;
    }

    if (isRouteAllowedByMenuAccess(pathname, menuRouteAccess)) {
      const n = normalizeAppPathname(pathname);
      lastAllowedDashboardPathRef.current = n;
      try {
        sessionStorage.setItem(DASHBOARD_NAV_CURRENT_KEY, n);
      } catch {
        /* ignore */
      }
      return;
    }

    const back = lastAllowedDashboardPathRef.current;
    if (back && back.startsWith('/dashboard')) {
      const cur = normalizeAppPathname(pathname);
      if (back !== cur) {
        try {
          sessionStorage.setItem(DASHBOARD_NAV_PREV_KEY, back);
        } catch {
          /* ignore */
        }
      }
    }
  }, [pathname, bootstrapped, menuRouteAccess]);

  if (!bootstrapped) {
    return (
      <div
        className='flex flex-1 flex-col gap-6 p-6'
        aria-busy
        aria-label='菜单与权限加载中'
      >
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-8 w-48 max-w-full' />
          <Skeleton className='h-4 w-96 max-w-full' />
        </div>
        <Skeleton className='min-h-[200px] flex-1 rounded-lg' />
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <Skeleton className='h-24 rounded-lg' />
          <Skeleton className='h-24 rounded-lg' />
          <Skeleton className='h-24 rounded-lg' />
        </div>
      </div>
    );
  }

  if (!menuRouteAccess || menuRouteAccess.allowedPaths.size === 0) {
    return (
      <div className='flex flex-1 flex-col'>
        <div className='text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center text-sm'>
          <p>当前账号没有可访问的菜单路径。</p>
          <p>请联系管理员分配权限，或重新登录后再试。</p>
        </div>
      </div>
    );
  }

  const routeAllowed = isRouteAllowedByMenuAccess(pathname, menuRouteAccess);

  if (!routeAllowed) {
    const safeReturn = normalizeAppPathname(
      lastAllowedDashboardPathRef.current ??
        fallbackPath ??
        '/dashboard/overview'
    );
    const homeHref = normalizeAppPathname(
      fallbackPath ?? '/dashboard/overview'
    );

    return (
      <NotFound
        variant='embed'
        embedDescription='当前路径不在您的菜单权限内。请从侧栏选择可访问页面，或使用下方链接返回。'
        embedLinks={{
          primary: { href: safeReturn, label: '返回上一可访问页面' },
          secondary: { href: homeHref, label: '进入默认首页' }
        }}
      />
    );
  }

  return children;
}
