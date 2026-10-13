---
description: Vendor chunk splitting — where manualChunks belongs and how to keep it healthy (nuxt.config.ts)
globs:
  - "**/nuxt.config.ts"
paths:
  - "**/nuxt.config.ts"
alwaysApply: false
---

# Vendor chunk splitting

Split a large vendor dependency out of the entry chunk with
`vite.build.rollupOptions.output.manualChunks` in `nuxt.config.ts`.

## Configure it in `nuxt.config.ts`, not in a hook

Nuxt sets `manualChunks` to `undefined` on the server build, after merging
`nuxt.options.vite` and **before** the `vite:extendConfig` hook. Config in
`nuxt.config.ts` is therefore client-only for free, and `vite.$client` is not
needed. In `vite:extendConfig` that protection has already run, so check
`isClient` yourself or the SSR build fails with
`EXTERNAL_MODULES_CANNOT_BE_INCLUDED_IN_MANUAL_CHUNKS` on any externalised
dependency.

```ts
// ✅ GOOD — nuxt.config.ts, client-only by construction
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            dexie: ['dexie'],
          },
        },
      },
    },
  },
});
```

```ts
// ❌ BAD — reaches the server build, breaks `nuxt build`
nuxt.hook('vite:extendConfig', (config) => {
  config.build.rollupOptions.output.manualChunks = { dexie: ['dexie'] };
});
```

## Every group needs a measured win

Add a group only when you have measured the difference, and put the number in
the commit message (e.g. `-549 KiB`). No speculative grouping: a chunk that
saves nothing adds a request for nothing. Measure against
`pnpm generate:gh-pages`, since that SPA build is what ships.

## Keep the list in sync with `package.json`

The object form force-includes each listed module, so a dependency that is
removed or renamed without updating the list fails the client build with
`UNRESOLVED_ENTRY: Could not resolve entry module "…"`. Removing a dependency
means grepping `nuxt.config.ts` for it.

## Assign a module to one group only

A module listed under two aliases fails with
`INVALID_CHUNK: Cannot assign "…" to the "x" chunk as it is already in the "y"
chunk`. Watch for packages that pull in a shared dependency you also list
separately.
