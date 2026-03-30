# 导航与路由 RBAC（菜单树）

## 概述

仪表盘导航由**后端菜单树**（菜单 API）驱动。完成引导后，侧栏、KBar 与 **`DashboardMenuProvider`** 共用同一套数据；**`DashboardRouteGuard`** 仅负责菜单就绪前的 loading、404 返回后的刷新与 `key` 重挂载，**不再**按 `MenuRouteAccess` 拦截或重定向 URL（深链需在接口层鉴权）。

**重要**：基于菜单的可见性与客户端路由校验属于 **UX 与前端路由策略**，不能替代 API 安全。接口、Server Actions 与敏感数据必须在**服务端**做鉴权。

## 心智模型

1. **在浏览器内**，「用户可打开哪些路由」来自接口返回的菜单树：各节点的 `path` 与 `activePath`。
2. **侧栏 / KBar** 展示该树（按可见性过滤，导航侧排除 `BUTTON`）。
3. **手动输入/收藏夹**直达某路径时，若侧栏未展示该入口，仍依赖**服务端**对该接口做权限校验；布局层不再做「无菜单则 replace」的客户端拦截。

## 核心文件

| 文件 | 职责 |
|------|------|
| `src/app/dashboard/layout.tsx` | 使用 `DashboardMenuProvider`，并用 `DashboardRouteGuard` 包裹页面 `children`。 |
| `src/components/layout/dashboard-menu-provider.tsx` | Token → `userControllerMe` → `menuControllerTree` → 生成 `MenuRouteAccess`、`fallbackPath`、侧栏节点；可选从 session 缓存恢复。 |
| `src/components/layout/dashboard-route-guard.tsx` | 菜单未就绪时 loading；就绪后渲染子路由；`popstate` 回 `/dashboard` 时 `requestAnimationFrame` 后 `router.refresh()`；`key={pathname}` 强制子树重挂载。 |
| `src/lib/menu-access.ts` | `collectMenuRouteAccess`、`isRouteAllowedByMenuAccess`、路径工具函数。 |
| `src/lib/menu-tree-nav.ts` | 侧栏过滤、`pickMenuFallbackPath`、KBar 条目、高亮/激活路径匹配。 |
| `src/lib/menu-bootstrap-cache.ts` | 以 token 为键的 `sessionStorage` 缓存，避免 layout 重挂载时整壳空白。 |

## `MenuRouteAccess`（`collectMenuRouteAccess`）

- 跳过 **`BUTTON`** 节点（非页面路由）。
- 每个节点的 **`path`**、**`activePath`**（规范化后）进入 **`allowedPaths`**。
- **`wildcardPrefixRoots`** 仅收录 **`menuType === 'MENU'`** 的路径（**不含 `DIRECTORY`**），避免目录 path 误放行整棵子树；仅 MENU 路由可对子路径（如动态段）做前缀放行。

## 路径放行规则（`isRouteAllowedByMenuAccess`）

1. 规范化 pathname（去掉 query；除根路径 `/` 外去掉尾部斜杠）。
2. 与 **`allowedPaths`** **精确**匹配 → 放行。
3. 否则若 pathname 形如 **`prefix/...`**，且 `prefix` 属于 **`wildcardPrefixRoots`**（且 `prefix !== '/'`）→ 放行。

## `fallbackPath`（侧栏 / 缓存）

- 由 **`pickMenuFallbackPath`** 决定，用于侧栏默认首链、缓存写入等：**树前序**第一个可导航 path → 否则最短允许前缀 → 否则 `/dashboard/overview`。

## Loading 与交互保障

- 在 **`bootstrapped`** 且 **`menuRouteAccess`** 有效之前，显示 **loading 占位**。
- 用 **`<Fragment key={pathname}>`** 包裹 **`children`**，从 404 等返回后强制子树重挂载，减轻白屏。

## 引导与缓存

- 访问 `/dashboard` 时在需要时拉菜单；无 token → 跳转登录。
- **从缓存恢复后**若接口失败，可保留缓存数据并 Toast 提示，而非清空整页。
- 缓存与当前 token 绑定，写入 `menuNodesRaw`、`MenuRouteAccess`、`fallbackPath`。

## 浏览器历史（`popstate`）

- 监听 **`popstate`**：若 URL 仍在 `/dashboard` 下，在**下一帧 `requestAnimationFrame`** 后执行 **`router.refresh()`**，减轻后退/前进时 RSC 子树偶发不恢复的问题。
