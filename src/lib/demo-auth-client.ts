'use client';

import { DEMO_SESSION_COOKIE } from '@/lib/demo-auth';

const MAX_AGE = 60 * 60 * 24 * 7;

export function setDemoSessionCookie() {
  document.cookie = `${DEMO_SESSION_COOKIE}=1; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearDemoSessionCookie() {
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0`;
}
