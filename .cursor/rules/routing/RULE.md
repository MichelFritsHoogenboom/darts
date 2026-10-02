---
description: App routes via utils/routes; GH Pages baseURL / SPA build
globs:
  - "**/*.vue"
  - "utils/routes.ts"
  - "nuxt.config.ts"
alwaysApply: false
---

# Routing & deploy base

## Paths

- Build paths with **`utils/routes.ts`** (`routes.home`, `routes.matchDetail(id)`, `routes.head2head.season(...)`, …).
- Use `navigateTo(...)` / `NuxtLink` with those helpers — do **not** hardcode path strings in pages/components when a `routes` entry exists or should.
- New screens: add a helper on `routes` first, then navigate.

Nuxt applies `app.baseURL` for you; keep route helpers as **app-relative** paths (e.g. `/setup`), not prefixed with the GitHub Pages subpath.

## Deploy (GitHub Pages)

| Env | Effect |
| --- | --- |
| `NUXT_APP_BASE_URL` | `app.baseURL` (e.g. `/darts/`) — set for Pages; default `/` |
| `NUXT_SPA=true` | Static SPA build (`ssr: false`); **dev keeps SSR** |

Do not assume SPA-only or a fixed `/darts/` prefix in app code. Client-only / hydration rules stay in `ssr-responsive`.

## Do / Don't

- ✅ `navigateTo(routes.head2head.index)`
- ❌ Don't scatter `'/head2head/...'` literals when `routes` covers it
- ❌ Don't bake `baseURL` into `utils/routes`
