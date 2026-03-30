'use client';

import { AUTH_ACCESS_TOKEN_KEY } from '@/lib/auth-constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Zustand persist 在 localStorage 中的键名 */
export const AUTH_PERSIST_KEY = 'auth_session_v1';

const ACCESS_TOKEN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function syncAccessTokenCookie(token: string | null): void {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `${AUTH_ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${ACCESS_TOKEN_COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
    return;
  }
  document.cookie = `${AUTH_ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
}

type AuthState = {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (token: string) => {
        set({ accessToken: token });
        syncAccessTokenCookie(token);
      },
      clearToken: () => {
        set({ accessToken: null });
        syncAccessTokenCookie(null);
      }
    }),
    {
      name: AUTH_PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          syncAccessTokenCookie(state.accessToken);
        } else {
          syncAccessTokenCookie(null);
        }
      }
    }
  )
);

/** persist rehydrate 前，从与 Zustand 相同的 JSON 快照读取 token（供 axios 等同步调用） */
function readTokenFromPersistSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string | null };
    };
    const t = parsed.state?.accessToken;
    return t && t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const fromStore = useAuthStore.getState().accessToken;
  if (fromStore) return fromStore;
  return readTokenFromPersistSnapshot();
}

/** 将当前持久化 token 写回 Cookie，供 proxy / middleware 对齐 */
export function syncAuthCookieFromStorage(): void {
  syncAccessTokenCookie(getAccessToken());
}
