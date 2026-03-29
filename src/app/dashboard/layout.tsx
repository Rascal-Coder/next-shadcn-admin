import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import { DashboardMenuProvider } from '@/components/layout/dashboard-menu-provider';
import { DashboardRouteGuard } from '@/components/layout/dashboard-route-guard';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <DashboardMenuProvider>
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
