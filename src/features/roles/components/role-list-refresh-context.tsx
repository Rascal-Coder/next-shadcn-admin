'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode
} from 'react';

type RoleListRefreshContextValue = {
  setRefresh: (fn: () => void) => void;
  refresh: () => void;
};

const RoleListRefreshContext =
  createContext<RoleListRefreshContextValue | null>(null);

export function RoleListRefreshProvider({ children }: { children: ReactNode }) {
  const refreshRef = useRef<() => void>(() => {});
  const setRefresh = useCallback((fn: () => void) => {
    refreshRef.current = fn;
  }, []);
  const refresh = useCallback(() => {
    refreshRef.current();
  }, []);

  return (
    <RoleListRefreshContext.Provider value={{ setRefresh, refresh }}>
      {children}
    </RoleListRefreshContext.Provider>
  );
}

export function useRoleListRefresh() {
  const ctx = useContext(RoleListRefreshContext);
  if (!ctx) {
    throw new Error('useRoleListRefresh 必须在 RoleListRefreshProvider 内使用');
  }
  return ctx;
}
