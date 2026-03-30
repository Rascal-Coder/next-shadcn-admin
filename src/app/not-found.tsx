'use client';

import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { readStoredDashboardNavPathPreferPrev } from '@/lib/dashboard-nav-history';
import { normalizeAppPathname } from '@/lib/app-pathname';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const DASHBOARD_HOME = '/dashboard/overview';

export type NotFoundProps = {
  /** 整页（默认）或仪表盘主内容区嵌入 */
  variant?: 'page' | 'embed';
  /** 嵌入壳内时的说明文案 */
  embedDescription?: string;
  /** 嵌入壳内时主/次按钮（显式 href，与菜单守卫一致） */
  embedLinks?: {
    primary: { href: string; label: string };
    secondary: { href: string; label: string };
  };
};

export default function NotFound({
  variant = 'page',
  embedDescription,
  embedLinks
}: NotFoundProps = {}) {
  if (variant === 'embed' && embedLinks) {
    return (
      <NotFoundShell
        compact
        description={embedDescription}
        actions={
          <>
            <Button asChild variant='default' size='sm'>
              <Link href={embedLinks.primary.href}>
                {embedLinks.primary.label}
              </Link>
            </Button>
            <Button asChild variant='outline' size='sm'>
              <Link href={embedLinks.secondary.href}>
                {embedLinks.secondary.label}
              </Link>
            </Button>
          </>
        }
      />
    );
  }

  return <NotFoundPageDefault />;
}

/** 全局路由 not-found：用 session / router.back */
function NotFoundPageDefault() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const nPath = normalizeAppPathname(pathname);
  const stored = readStoredDashboardNavPathPreferPrev();
  const canLinkToStored =
    stored != null && stored !== nPath && stored.startsWith('/dashboard');

  return (
    <NotFoundShell
      actions={
        <>
          {canLinkToStored ? (
            <Button asChild variant='default' size='lg'>
              <Link href={stored}>回到上次仪表盘页</Link>
            </Button>
          ) : (
            <Button onClick={() => router.back()} variant='default' size='lg'>
              Go back
            </Button>
          )}
          <Button asChild variant='ghost' size='lg'>
            <Link href={DASHBOARD_HOME}>Back to Home</Link>
          </Button>
        </>
      }
    />
  );
}

function NotFoundShell({
  compact,
  description,
  actions
}: {
  compact?: boolean;
  description?: string;
  actions: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col items-center justify-center px-4 text-center',
        compact
          ? 'text-muted-foreground min-h-0 flex-1 gap-4 py-12 text-sm'
          : 'min-h-screen'
      )}
    >
      <span
        className={cn(
          'from-foreground bg-linear-to-b to-transparent bg-clip-text font-extrabold text-transparent',
          compact
            ? 'text-6xl leading-none sm:text-7xl'
            : 'text-[10rem] leading-none'
        )}
      >
        404
      </span>
      {description ? (
        <p className='text-foreground max-w-md text-base font-medium'>
          {description}
        </p>
      ) : null}
      <h2
        className={cn(
          'font-heading font-bold',
          compact ? 'text-lg' : 'my-2 text-2xl'
        )}
      >
        Something&apos;s missing
      </h2>
      <p className={cn(!compact && 'max-w-md')}>
        Sorry, the page you are looking for doesn&apos;t exist or has been
        moved.
      </p>
      <div
        className={cn(
          'flex flex-wrap justify-center gap-2',
          compact ? 'mt-4' : 'mt-8'
        )}
      >
        {actions}
      </div>
    </div>
  );
}
