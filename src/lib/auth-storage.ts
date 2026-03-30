'use client';

import { clearDashboardNavHistory } from '@/lib/dashboard-nav-history';
import { clearMenuBootstrapCache } from '@/lib/menu-bootstrap-cache';
import { useAuthStore } from '@/stores/auth-store';

export { AUTH_ACCESS_TOKEN_KEY } from '@/lib/auth-constants';
export {
  getAccessToken,
  syncAuthCookieFromStorage,
  useAuthStore
} from '@/stores/auth-store';

/**
 * 从登录/注册 data 中解析访问令牌。
 */
export function extractAccessToken(
  data: API.AuthSessionDataDto
): string | null {
  const t = data.accessToken;
  return t.length > 0 ? t : null;
}

/** 持久化登录/注册返回的令牌（Zustand persist + Cookie 同步），失败返回 false */
export function persistAuthFromLoginData(
  data: API.AuthSessionDataDto
): boolean {
  const token = extractAccessToken(data);
  if (!token) return false;
  if (typeof window === 'undefined') return false;
  try {
    useAuthStore.getState().setAccessToken(token);
    return true;
  } catch {
    return false;
  }
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    useAuthStore.getState().clearToken();
    clearMenuBootstrapCache();
    clearDashboardNavHistory();
  } catch {
    /* ignore */
  }
}
