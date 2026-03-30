import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { AUTH_ACCESS_TOKEN_KEY } from '@/lib/auth-constants';
import { DASHBOARD_PATHNAME_HEADER } from '@/lib/dashboard-pathname-header';

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get(AUTH_ACCESS_TOKEN_KEY)?.value?.trim();
    if (!token) {
      const signIn = new URL('/auth/sign-in', request.url);
      signIn.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signIn);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(DASHBOARD_PATHNAME_HEADER, pathname);
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
