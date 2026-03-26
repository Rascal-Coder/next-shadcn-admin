# AGENTS.md

Reference for AI agents and contributors: **stack, layout, conventions, and workflows**. User-facing setup stays in `README.md`; deep dives live in `/docs`.

**Stack at a glance:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 · shadcn/ui · Bun (preferred).

---

## Contents

- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Commands](#commands)
- [Environment](#environment)
- [Code style](#code-style)
- [Themes](#themes)
- [Navigation and RBAC](#navigation-and-rbac)
- [Data fetching and tables](#data-fetching-and-tables)
- [Errors](#errors)
- [Testing](#testing)
- [Deployment](#deployment)
- [Feature cleanup](#feature-cleanup)
- [Common tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [External docs](#external-docs)
- [Agent checklist](#agent-checklist)

---

## Technology stack

Exact versions: see `package.json`. Pinned below for quick orientation.

| Layer        | Choices                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| Runtime      | Next.js 16.0.10, React 19.2.0, TypeScript 5.7.2 (`strict`)                                                     |
| UI & CSS     | Tailwind v4 (`@import 'tailwindcss'`), PostCSS + `@tailwindcss/postcss`, shadcn/ui (Radix), OKLCH theme tokens |
| State & URLs | Zustand 5.x, Nuqs, React Hook Form + Zod                                                                       |
| Data & viz   | TanStack Table, Recharts; mocks in `src/constants/mock-api.ts`                                                 |
| Tooling      | ESLint (core-web-vitals), Prettier + Tailwind plugin, Husky, lint-staged                                       |
| Containers   | `Dockerfile` (Node), `Dockerfile.bun` (Bun)                                                                    |

---

## Project structure

Illustrative tree; prefer the repo for authoritative paths.

```
src/
├── app/                      # App Router
│   ├── auth/                 # Auth routes
│   ├── dashboard/            # Dashboard
│   │   ├── overview/         # Parallel routes (@area_stats, @bar_stats, …)
│   │   ├── product/
│   │   └── kanban/
│   ├── api/                  # Route handlers (if any)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── global-error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                   # shadcn primitives (avoid editing in place)
│   ├── layout/               # Shell: sidebar, header, …
│   ├── forms/
│   ├── themes/
│   ├── kbar/
│   └── icons.tsx
├── features/                 # Feature modules (overview, products, kanban, …)
├── config/                   # e.g. nav-config.ts (nav + RBAC)
├── hooks/
├── lib/
├── types/
└── styles/                   # globals.css, theme.css, themes/*.css

docs/                         # nav-rbac.md, themes.md, …
Dockerfile · Dockerfile.bun · .dockerignore
```

---

## Commands

| Goal                        | Command                                                     |
| --------------------------- | ----------------------------------------------------------- |
| Install                     | `bun install`                                               |
| Dev (http://localhost:3000) | `bun run dev`                                               |
| Production build            | `bun run build`                                             |
| Production server           | `bun run start`                                             |
| Lint                        | `bun run lint` · `bun run lint:fix` · `bun run lint:strict` |
| Format                      | `bun run format` · `bun run format:check`                   |
| Git hooks                   | `bun run prepare`                                           |

---

## Environment

Copy `env.example.txt` → `.env.local`. Expose client values with the `NEXT_PUBLIC_` prefix.

---

## Code style

**TypeScript**

- Keep `strict` on; prefer explicit return types on public APIs.
- Prefer `interface` for object shapes; use `@/*` for `src` imports.

**Prettier** (project defaults)

```json
{
  "singleQuote": true,
  "jsxSingleQuote": true,
  "semi": true,
  "trailingComma": "none",
  "tabWidth": 2,
  "arrowParens": "always"
}
```

**ESLint** (high level)

- `no-unused-vars`, `no-console`, `react-hooks/exhaustive-deps`: warn
- `import/no-unresolved`: off (TypeScript resolves)

**React / Next**

- Components: `function ComponentName() {}`; props: `{ComponentName}Props`.
- Merge classes with `cn()`.
- Default to **Server Components**; add `'use client'` only for browser APIs, subscriptions, or event handlers.

---

## Themes

Built-in theme names: `vercel` (default), `claude`, `neobrutualism`, `supabase`, `mono`, `notebook`, `light-green`, `zen`, `astro-vista`, `whatsapp`.

| Concern         | Location                                 |
| --------------- | ---------------------------------------- |
| Theme CSS       | `src/styles/themes/{theme-name}.css`     |
| Registry        | `src/components/themes/theme.config.ts`  |
| Fonts           | `src/components/themes/font.config.ts`   |
| Active provider | `src/components/themes/active-theme.tsx` |

**Add a theme:** (1) CSS file with `[data-theme='your-theme']`, (2) import in `src/styles/theme.css`, (3) append to `THEMES` in `theme.config.ts`, (4) optional fonts / default. Details: `docs/themes.md`.

---

## Navigation and RBAC

Config: `src/config/nav-config.ts`.

```typescript
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    shortcut: ['d', 'd'],
    access: { requireOrg: true }
  }
];
```

| Field        | Meaning             |
| ------------ | ------------------- |
| `requireOrg` | Active org required |
| `permission` | Named permission    |
| `role`       | Named role          |
| `plan`       | Subscription plan   |
| `feature`    | Feature flag        |

`useFilteredNavItems()` in `src/hooks/use-nav.ts` adjusts the sidebar for UX only; **authorize on the server**.

---

## Data fetching and tables

- **Fetch in Server Components** by default (async components).
- **URL state:** `nuqs` (`useQueryState`, etc.).
- **Tables:** columns under `features/*/components/*-tables/columns.tsx`, shared table UI `src/components/ui/table/data-table.tsx`, parsers `src/lib/parsers.ts`.

---

## Errors

- `global-error.tsx`: root error UI.
- Segment `error.tsx` files: localized fallbacks.

Hook reporting into your observability layer at boundaries or layout level as needed.

---

## Testing

No test runner ships with the template. Suggested adds: Vitest/Jest (unit), React Testing Library (components), Playwright (E2E). Layout: `src/__tests__/`, `src/features/*/tests/`, `e2e/`.

---

## Deployment

**Vercel:** connect repo → env vars in dashboard → deploy.

**Env:** mirror `.env.local` secrets on the host; prefix browser keys with `NEXT_PUBLIC_`.

**Docker:** `output: 'standalone'` in `next.config.ts`; build-time `NEXT_PUBLIC_*` can be `--build-arg`; runtime secrets via `-e`. Images: `Dockerfile` / `Dockerfile.bun`.

**Images:** set `images.remotePatterns` in `next.config` for remote hosts.

---

## Feature cleanup

`scripts/cleanup.js` removes optional modules (interactive, dry-run, list).

```bash
node scripts/cleanup.js --interactive
node scripts/cleanup.js kanban chat notifications themes
node scripts/cleanup.js --dry-run kanban
node scripts/cleanup.js --list
```

Requires git history (≥1 commit) unless `--force`. You may delete the script after use; postinstall messaging may trim related hints on next dev start.

---

## Common tasks

| Task          | Steps                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- |
| Page          | `src/app/dashboard/.../page.tsx` + item in `nav-config.ts` + UI under `src/features/...` |
| API route     | `src/app/api/.../route.ts` with `GET`/`POST`/…                                           |
| shadcn widget | `npx shadcn add <component>`                                                             |
| Theme         | [Themes](#themes) + `docs/themes.md`                                                     |

---

## Troubleshooting

| Issue       | Checks                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| Tailwind    | v4 `@import 'tailwindcss'`; `@tailwindcss/postcss` in PostCSS            |
| Theme       | `[data-theme]` matches `theme.config.ts`; file imported from `theme.css` |
| Missing nav | `access` in `nav-config`; user/org context matches server rules          |

---

## External docs

- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)

---

## Agent checklist

1. **`cn()`** for `className`; no string concatenation.
2. **Features** live under `src/features/` when adding product logic.
3. **`'use client'`** only when required (browser APIs, hooks, events).
4. **Types:** avoid `any` on shared surfaces.
5. **Match** existing patterns before inventing new ones.
6. **`NEXT_PUBLIC_`** for any env read in the browser.
7. **Do not** edit `src/components/ui/*` primitives directly; wrap or compose.
