<h1 align="center">基于 Next.js 与 Shadcn UI 的管理后台模板</h1>

<div align="center">使用 Next.js 16、shadcn/ui、Tailwind CSS、TypeScript 搭建的开源管理后台脚手架</div>

## 概览

这是一个基于 **Next.js 16、Shadcn UI、TypeScript 与 Tailwind CSS** 的**开源管理后台脚手架**。

提供可用于生产环境的**控制台 UI**，包含认证入口、图表、表格、表单以及按功能组织的目录结构，适合 **SaaS、内部工具与管理后台**。

### 技术栈

- 框架 — [Next.js 16](https://nextjs.org/16)
- 语言 — [TypeScript](https://www.typescriptlang.org)
- 样式 — [Tailwind CSS v4](https://tailwindcss.com)
- 组件 — [Shadcn-ui](https://ui.shadcn.com)
- 图表 — [Recharts](https://recharts.org) • [Evil Charts](https://evilcharts.com/)
- 校验 — [Zod](https://zod.dev)
- 状态 — [Zustand](https://zustand-demo.pmnd.rs)
- 查询参数状态 — [Nuqs](https://nuqs.47ng.com/)
- 表格 — [Tanstack Data Tables](https://ui.shadcn.com/docs/components/data-table) • [Dice table](https://www.diceui.com/docs/components/data-table)
- 表单 — [React Hook Form](https://ui.shadcn.com/docs/components/form)
- Command+K — [kbar](https://kbar.vercel.app/)
- 代码检查 — [ESLint](https://eslint.org)
- 提交钩子 — [Husky](https://typicode.github.io/husky/)
- 格式化 — [Prettier](https://prettier.io)
- 主题 — [tweakcn](https://tweakcn.com/)

## 功能特性

- 🧱 预置**管理后台布局**（侧栏、顶栏、内容区）

- 📊 **分析总览**页，含卡片与图表

- 📋 **数据表**支持服务端搜索、筛选与分页

- 💳 **计费与订阅**相关页面示例（B2B 方案与功能开关需自行对接）

- 🔒 **RBAC 导航** — 基于组织、权限、角色的客户端导航过滤（服务端仍需校验）

- ℹ️ **信息条（Infobar）**组件，用于页面提示与上下文说明

- 🧩 **Shadcn UI** + Tailwind 样式

- 🎨 **多主题**（6+ 套主题，可快速切换）

- 🧠 按功能划分目录，便于扩展

- ⚙️ 适合 **SaaS 控制台**、内部工具与客户管理端

## 适用场景

可用本模板构建：

- SaaS 管理后台

- 内部工具与运营面板

- 数据分析控制台

- 客户项目后台

- 新的 Next.js 管理 UI 起点工程

## 按功能组织的目录

```plaintext
src/
├── app/                           # Next.js App Router
│   ├── dashboard/                 # 控制台路由组
│   │   ├── overview/              # 分析（并行路由）
│   │   ├── product/               # 产品 CRUD
│   │   ├── kanban/                # 看板
│   └── api/                       # API 路由
│
├── components/                    # 共享组件
│   ├── ui/                        # 基础 UI
│   ├── layout/                    # 布局
│   ├── themes/                    # 主题系统
│   └── kbar/                      # Command+K
│
├── features/                      # 功能模块
│   ├── overview/
│   ├── products/
│   ├── kanban/
│
├── lib/
├── hooks/
├── config/                        # 导航、信息条、表格等配置
├── constants/                     # Mock 数据
├── styles/
│   └── themes/                    # 各主题 CSS
└── types/
```

## 快速开始

> [!NOTE]  
> 本模板使用 **Next.js 16（App Router）**、**React 19** 与 **Shadcn UI**。本地运行步骤：

- 执行 `bun install`
- 复制环境变量示例：`cp env.example.txt .env.local`（Windows 可手动复制并重命名）
- 在 `.env.local` 中填写认证、数据库等所需变量
- 执行 `bun run dev`

##### 环境变量

详见仓库根目录的 `env.example.txt`，按你的认证与后端服务逐项配置。

##### 认证

按所选方案在 `src/app/auth`、`middleware` 与 Provider 中完成接入

完成后访问 http://localhost:3000 。

> [!WARNING]  
> 克隆或 Fork 后，与上游同步时可能产生冲突，合并前请先备份或审阅变更。

---

## 部署

仓库内含生产向 Dockerfile（`Dockerfile` 使用 Node，`Dockerfile.bun` 使用 Bun），输出模式为 standalone。更多部署方式见 [Next.js 部署文档](https://nextjs.org/docs/app/getting-started/deploying)。

### Docker

**构建镜像：**

将示例中的环境变量替换为你项目中需要的 `NEXT_PUBLIC_*` 与运行时密钥。

```bash
# Node.js
docker build \
  -t shadcn-dashboard .

# 或 Bun
docker build -f Dockerfile.bun \
  -t shadcn-dashboard .
```

**运行容器：**

```bash
docker run -d -p 3000:3000 \
  --restart unless-stopped \
  --name shadcn-dashboard \
  shadcn-dashboard
```

按实际认证与数据库补充更多 `-e` 环境变量。

### ⭐ 支持

若本模板对你有帮助，欢迎点亮 Star ⭐
