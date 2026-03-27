'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode
} from 'react';

type UserListRefreshContextValue = {
  /** 由列表页挂载时注册当前拉取函数 */
  setRefresh: (fn: () => void) => void;
  /** 页头等处创建/变更成功后调用，刷新当前列表数据 */
  refresh: () => void;
};

const UserListRefreshContext =
  createContext<UserListRefreshContextValue | null>(null);

export function UserListRefreshProvider({ children }: { children: ReactNode }) {
  const refreshRef = useRef<() => void>(() => {});
  const setRefresh = useCallback((fn: () => void) => {
    refreshRef.current = fn;
  }, []);
  const refresh = useCallback(() => {
    refreshRef.current();
  }, []);

  return (
    <UserListRefreshContext.Provider value={{ setRefresh, refresh }}>
      {children}
    </UserListRefreshContext.Provider>
  );
}

export function useUserListRefresh() {
  const ctx = useContext(UserListRefreshContext);
  if (!ctx) {
    throw new Error('useUserListRefresh 必须在 UserListRefreshProvider 内使用');
  }
  return ctx;
}
