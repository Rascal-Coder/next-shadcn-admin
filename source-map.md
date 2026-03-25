# 源码地图（Source Map）

本文档说明本仓库中与**菜单 / 导航**、**用户与会话**、**角色与权限（RBAC）**相关的代码位置，并给出**国际化（i18n）**集成时的推荐落点。实施新功能时，优先对照此处再改代码。

---

## 1. 菜单管理（导航 / 侧边栏 / 命令面板）

| 用途 | 路径 | 说明 |
|------|------|------|
| 菜单数据来源（单一真源） | `src/config/nav-config.ts` | `navItems` 数组；支持嵌套 `items`；可配置 `access`（见下文 RBAC） |
| 侧栏消费菜单 | `src/components/layout/app-sidebar.tsx` | `useFilteredNavItems(navItems)`；品牌区、用户区展示也在此 |
| Cmd+K 快捷跳转 | `src/components/kbar/index.tsx` | 同样基于 `navItems` + `useFilteredNavItems`，与侧栏保持同步 |
| 导航项过滤钩子 | `src/hooks/use-nav.ts` | **当前为直通** `return items`；动态菜单 / 按角色隐藏应在此集中实现 |
| 面包屑 / 路径标题 | `src/hooks/use-breadcrumbs.tsx` | 依赖 `navItems` 解析当前路径 |
| 导航类型 | `src/types/index.ts` | `NavItem`、`PermissionCheck` |
| 图标键名 | `src/components/icons.tsx` | `NavItem.icon` 对应 `Icons` 的 key |

**后续做「菜单管理」（后台可配置菜单）时的建议：**

- **短期**：继续由 API / DB 拉取菜单树，在构建 `navItems` 时合并进 `nav-config` 的导出，或直接在 `use-nav` 内合并静态 + 远程数据后再过滤。
- **长期**：将「运行时菜单」与静态兜底分离；侧栏与 kbar 始终只读同一份 `NavItem[]`，避免两处配置分叉。

---

## 2. 用户管理

| 用途 | 路径 | 说明 |
|------|------|------|
| 登录 UI | `src/features/auth/components/sign-in-view.tsx` | 演示：提交后写 Cookie 并跳转控制台 |
| 注册 UI | `src/features/auth/components/sign-up-view.tsx` | 同上模式 |
| 演示会话（客户端） | `src/lib/demo-auth-client.ts` | `setDemoSessionCookie` / `clearDemoSessionCookie` |
| 演示会话常量 | `src/lib/demo-auth.ts` | `DEMO_SESSION_COOKIE` 名称 |
| 侧栏展示的用户信息 | `src/components/layout/app-sidebar.tsx` | 当前为常量 `USER_MENU`（姓名、邮箱、头像路径），非真实用户源 |
| 头部用户区占位 | `src/components/layout/user-nav.tsx` | **当前 `return null`**，可在此接真实用户菜单 |
| 组织切换（Clerk API） | `src/components/org-switcher.tsx` | 使用 `@clerk/nextjs`；若未安装依赖或未接 Clerk，需替换或移除 |

**说明：** 当前模板以**演示 Cookie 登录**为主，无完整用户 CRUD。后续用户管理（列表、编辑、禁用等）建议：

- 页面：`src/app/dashboard/users/`（或你命名的路由）+ `src/features/users/components/`（表格、表单模式同 `AGENTS.md` / dashboard-dev skill）
- 数据：`src/constants/mock-api.ts` 可继续作 mock；接后端后改为 Server Actions / Route Handlers

---

## 3. 角色管理与 RBAC

| 用途 | 路径 | 说明 |
|------|------|------|
| 权限字段类型 | `src/types/index.ts` | `PermissionCheck`：`permission`、`role`、`plan`、`feature`、`requireOrg` |
| 菜单项上的 access | `src/config/nav-config.ts` | 注释中有示例；**当前 `navItems` 未使用 `access`** |
| 侧栏 / kbar 过滤入口 | `src/hooks/use-nav.ts` | 应在此根据「当前用户角色 / 权限」过滤 `navItems` |
| 设计说明 | `docs/nav-rbac.md` | **导航可见性仅为 UX**；真正鉴权必须在服务端（API、Server Actions、页面级） |

**后续做「角色管理」时：**

- **角色定义**：可落在 `src/types/` 或由服务端 schema 生成类型。
- **角色与路由**：页面级守卫建议 `src/middleware.ts`（若引入）或各 layout / server 组件内校验。
- **与菜单联动**：在 `use-nav` 中读取会话或 React Context 中的 `role` / `permissions`，与 `NavItem.access` 对齐；`docs/nav-rbac.md` 中的示例与 AGENTS.md 的 `nav-config` 表格一致。

---

## 4. 国际化（i18n）

| 状态 | 说明 |
|------|------|
| 当前仓库 | **未集成** `next-intl` 等库；文案多为组件内硬编码英文字符串 |

**推荐集成方向（App Router）：**

1. 选用 **`next-intl`**（或官方 i18n 方案），增加 `messages/zh.json`、`messages/en.json` 等。
2. **路由**：常见做法为 `src/app/[locale]/...`，把现有 `app` 下页面迁入 locale 段；`middleware` 中检测 `Accept-Language` 或 Cookie 做默认语言。
3. **与菜单联动**：`nav-config` 中的 `title` / `description` 改为使用 message key，在侧栏与 kbar 渲染时用 `useTranslations('nav')`（客户端）或服务端 `getTranslations` 解析。
4. **与 metadata**：页面 `metadata` / `generateMetadata` 需按 locale 返回 `title`、`description`（见 Next.js Metadata 文档）。

集成后可在本文件中追加一节「消息文件路径」与「locale 布局文件」的具体路径。

---

## 5. 布局与入口速查

| 用途 | 路径 |
|------|------|
| 控制台根布局（侧栏 + Header + KBar） | `src/app/dashboard/layout.tsx` |
| 各业务页面 | `src/app/dashboard/<segment>/page.tsx` |
| 功能模块 UI | `src/features/<name>/components/` |
| 全局样式与主题 | `src/styles/globals.css`、`src/styles/theme.css`、`src/components/themes/` |

---

## 6. 文档与规范

| 文档 | 内容 |
|------|------|
| `AGENTS.md` | 命令、目录约定、nav、RBAC 字段表、主题 |
| `docs/nav-rbac.md` | 导航 RBAC 架构与客户端过滤说明 |
| `.agents/skills/dashboard-dev/SKILL.md` | 从零加页面、feature、nav、表格的逐步模板 |

---

*上次更新：依当前仓库结构整理；你在完成菜单后台、用户模块、角色服务或 i18n 路由后，可在此文件追加「实际 API / 表结构 / 环境变量」链接，方便团队同步。*
