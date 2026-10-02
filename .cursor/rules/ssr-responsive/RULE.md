---
description: SSR-safe client APIs (Dexie/DOM) and CSS-first responsive layout
globs:
  - "**/*.vue"
  - "**/*.ts"
alwaysApply: false
---

# SSR & responsive

Dev runs with SSR on; GitHub Pages builds as SPA. Write code that stays safe in both.

## Client-only APIs

Do **not** touch browser-only APIs during setup/SSR. That includes Dexie/IndexedDB, `window`, `document`, `localStorage`.

- Load DB data and touch the DOM in `onMounted` (or behind `import.meta.client` / explicit client-only helpers).
- Utils that use `document` (e.g. download/export) must only run from a user action or client lifecycle — never at module top level or during SSR render.

## Responsive layout

- Prefer CSS / Tailwind breakpoints (`sm:`, `md:`, …) for layout differences.
- Do **not** branch the whole UI on `window.innerWidth` / `matchMedia` in script for the first paint — that causes server/client markup mismatches in SSR.

## Hydration

First paint must match between server and client. Avoid values that differ only on the client (`Date.now()`, `Math.random()`, unstable locale formatting) in the initial template unless shown after mount.

## Do / Don't

- ✅ Dexie reads/writes after mount or in client-only paths
- ✅ Responsive via CSS utilities / media queries
- ❌ Don't call IndexedDB or `document`/`window` at module top level
- ❌ Don't use JS viewport checks to swap initial layout markup
