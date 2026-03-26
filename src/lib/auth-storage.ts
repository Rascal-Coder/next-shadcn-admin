'use client';

/** localStorage 中访问令牌的键名 */
const ACCESS_TOKEN_KEY = 'auth_access_token';

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
    return true;
  } catch {
    return false;
  }
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
