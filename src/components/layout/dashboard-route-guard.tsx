'use client';

import { isRouteAllowedByMenuPrefixes } from '@/lib/menu-access';
import { useDashboardMenu } from '@/components/layout/dashboard-menu-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function DashboardRouteGuard({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { bootstrapped, bypassMenuGuard, menuPrefixes, fallbackPath } =
    useDashboardMenu();
  const blockedToastRef = useRef(false);

  useEffect(() => {
    if (!bootstrapped) return;
    if (bypassMenuGuard) return;
    if (!menuPrefixes) return;
    if (isRouteAllowedByMenuPrefixes(pathname, menuPrefixes)) {
      blockedToastRef.current = false;
      return;
    }
    if (blockedToastRef.current) return;
    blockedToastRef.current = true;
    toast.error('无权访问该页面');
    router.replace(fallbackPath);
  }, [
    bootstrapped,
    bypassMenuGuard,
    fallbackPath,
    menuPrefixes,
    pathname,
    router
  ]);

  if (!bootstrapped) {
    return null;
  }

  if (!bypassMenuGuard) {
    if (!menuPrefixes || menuPrefixes.size === 0) {
      return null;
    }
    if (!isRouteAllowedByMenuPrefixes(pathname, menuPrefixes)) {
      return null;
    }
  }

  return <>{children}</>;
}
