/**
 * 与菜单 path 比对前统一格式：去掉 query/hash，保证以 `/` 开头，除根外去掉尾部斜杠。
 */
export function normalizeAppPathname(pathname: string): string {
  let p = pathname.trim();
  const q = p.indexOf('?');
  const h = p.indexOf('#');
  if (q !== -1) p = p.slice(0, q);
  if (h !== -1) p = p.slice(0, h);
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/+/g, '/');
  p = p.replace(/\/+$/g, '');
  return p.length > 0 ? p : '/';
}
