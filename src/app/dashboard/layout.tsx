import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import { DashboardMenuProvider } from '@/components/layout/dashboard-menu-provider';
import { DashboardRouteGuard } from '@/components/layout/dashboard-route-guard';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AUTH_ACCESS_TOKEN_KEY } from '@/lib/auth-constants';
import {
  menuRouteAccessToPayload,
  type DashboardMenuBootstrapPayload
} from '@/lib/menu-access';
import { fetchDashboardMenuBootstrapFromBearerToken } from '@/lib/server-menu-route-access';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn',
  robots: {
    index: false,
    follow: false
  }
};

/**
 * 仪表盘壳子：proxy 注入 pathname；服务端拉取菜单树并注入 Provider。
 * 不在此对「菜单未包含的路径」调用 notFound：整页 404 会进入历史栈，浏览器返回时易与客户端壳子/bfcache 状态不一致，导致上一页无法恢复。
 * 无菜单权限的路径由 DashboardRouteGuard 在壳内提示，并通过 Link 回到可访问地址（不使用 replace/assign）。
 * 未登录访问 /dashboard 由 proxy 重定向到登录页。
 */
export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_ACCESS_TOKEN_KEY)?.value?.trim();

  let initialMenuBootstrap: DashboardMenuBootstrapPayload | null = null;
  if (token) {
    const bootstrap = await fetchDashboardMenuBootstrapFromBearerToken(token);
    if (bootstrap) {
      initialMenuBootstrap = {
        menuNodesRaw: bootstrap.menuNodesRaw,
        menuRouteAccess: menuRouteAccessToPayload(bootstrap.menuRouteAccess),
        fallbackPath: bootstrap.fallbackPath
      };
    }
  }

  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <DashboardMenuProvider initialMenuBootstrap={initialMenuBootstrap}>
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <InfobarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <DashboardRouteGuard>{children}</DashboardRouteGuard>
            </SidebarInset>
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarProvider>
      </KBar>
    </DashboardMenuProvider>
  );
}
