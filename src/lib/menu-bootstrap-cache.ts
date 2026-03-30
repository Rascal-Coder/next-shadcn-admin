'use client';

import type { MenuTreeNodeView } from '@/features/roles/types/menu-tree-node';
import type { MenuRouteAccess } from '@/lib/menu-access';

const CACHE_KEY = 'dashboard_menu_bootstrap_v3';

type CachedPayload = {
  v: 3;
  /** 与当前 localStorage token 一致时才采用缓存，避免串号 */
  tokenSnapshot: string;
  menuNodesRaw: MenuTreeNodeView[];
  access: {
    allowedPaths: string[];
    wildcardPrefixRoots: string[];
    directoryEntryAliases: [string, string][];
  };
  fallbackPath: string;
};

function accessToJson(a: MenuRouteAccess): CachedPayload['access'] {
  return {
    allowedPaths: [...a.allowedPaths],
    wildcardPrefixRoots: [...a.wildcardPrefixRoots],
    directoryEntryAliases: [...a.directoryEntryAliases.entries()]
  };
}

function accessFromJson(s: CachedPayload['access']): MenuRouteAccess {
  return {
    allowedPaths: new Set(s.allowedPaths),
    wildcardPrefixRoots: new Set(s.wildcardPrefixRoots),
    directoryEntryAliases: new Map(s.directoryEntryAliases ?? [])
  };
}

export type MenuBootstrapRestored = {
  menuNodesRaw: MenuTreeNodeView[];
  menuRouteAccess: MenuRouteAccess;
  fallbackPath: string;
};

/**
 * 从 sessionStorage 恢复菜单与路由权限，用于 layout 重挂载（如从全局 404 返回）时避免整页空白。
 */
export function readMenuBootstrapCache(
  token: string
): MenuBootstrapRestored | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as CachedPayload;
    if (p.v !== 3) return null;
    if (p.tokenSnapshot !== token) return null;
    return {
      menuNodesRaw: p.menuNodesRaw,
      menuRouteAccess: accessFromJson(p.access),
      fallbackPath: p.fallbackPath
    };
  } catch {
    return null;
  }
}

export function writeMenuBootstrapCache(
  token: string,
  data: {
    menuNodesRaw: MenuTreeNodeView[];
    menuRouteAccess: MenuRouteAccess;
    fallbackPath: string;
  }
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedPayload = {
      v: 3,
      tokenSnapshot: token,
      menuNodesRaw: data.menuNodesRaw,
      access: accessToJson(data.menuRouteAccess),
      fallbackPath: data.fallbackPath
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearMenuBootstrapCache(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}
