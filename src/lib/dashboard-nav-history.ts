import { normalizeAppPathname } from '@/lib/app-pathname';

export const DASHBOARD_NAV_CURRENT_KEY = 'dashboard:nav-current';
export const DASHBOARD_NAV_PREV_KEY = 'dashboard:nav-prev';

/**
 * 全局 404 等场景：优先用 session 里记录的仪表盘路径作为 Link 目标，避免仅靠 history.back 与壳状态不一致。
 */
export function readStoredDashboardNavPathPreferPrev(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const rawPrev = sessionStorage.getItem(DASHBOARD_NAV_PREV_KEY);
    const rawCur = sessionStorage.getItem(DASHBOARD_NAV_CURRENT_KEY);
    const prev = rawPrev ? normalizeAppPathname(rawPrev) : null;
    const cur = rawCur ? normalizeAppPathname(rawCur) : null;
    if (prev && prev.startsWith('/dashboard')) return prev;
    if (cur && cur.startsWith('/dashboard')) return cur;
    return null;
  } catch {
    return null;
  }
}

export function clearDashboardNavHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DASHBOARD_NAV_CURRENT_KEY);
    sessionStorage.removeItem(DASHBOARD_NAV_PREV_KEY);
  } catch {
    /* ignore */
  }
}
