'use client';

import { AUTH_ACCESS_TOKEN_KEY } from '@/lib/auth-constants';

const ACCESS_TOKEN_KEY = AUTH_ACCESS_TOKEN_KEY;

export { AUTH_ACCESS_TOKEN_KEY };

const ACCESS_TOKEN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function syncAccessTokenCookie(token: string | null): void {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${ACCESS_TOKEN_COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
    return;
  }
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
}

/**
 * 从登录/注册 data 中解析访问令牌。
 */
export function extractAccessToken(
  data: API.AuthSessionDataDto
): string | null {
  const t = data.accessToken;
  return t.length > 0 ? t : null;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** 持久化登录/注册返回的令牌，失败返回 false（例如 accessToken 为空） */
export function persistAuthFromLoginData(
  data: API.AuthSessionDataDto
): boolean {
  const token = extractAccessToken(data);
  if (!token) return false;
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    syncAccessTokenCookie(token);
    return true;
  } catch {
    return false;
  }
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    syncAccessTokenCookie(null);
  } catch {
    /* ignore */
  }
}

/** 将 localStorage 中的令牌同步到 Cookie（升级或无痕恢复会话时 middleware 可识别） */
export function syncAuthCookieFromStorage(): void {
  const token = getAccessToken();
  syncAccessTokenCookie(token);
}
