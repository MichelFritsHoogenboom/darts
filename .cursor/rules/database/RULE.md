---
description: Dexie / IndexedDB architecture — services, indexes, one consistent stack
globs:
  - "database/**"
  - "composables/use*.ts"
  - "utils/dbExport.ts"
  - "plugins/database*.ts"
  - "interfaces/**/*.ts"
alwaysApply: false
---

# Database (Dexie)

Keep the existing stack. One way to add or change entities — not parallel shortcuts per type.

Client-only / SSR timing stays in `ssr-responsive`. Playwright fixtures / export format stay in `testing`.

## Stack (one path)

1. Types in `interfaces/`
2. Table + indexes in `database/schema.ts` (new Dexie `version(n)`; keep older versions; use `.upgrade` when transforming data)
3. `*Service` extending `BaseService` for reads/writes and domain queries
4. UI via `composables/use*` → service (manual `ref` load/refresh — no `useLiveQuery` / `liveQuery`)
5. New or renamed table → also update `TABLE_NAMES` in `utils/dbExport.ts`

Init stays in `plugins/database.client.ts` / `ensureDatabase()`.

## Boundaries

- IndexedDB access only under `database/` (and export via `utils/dbExport.ts`).
- Do **not** import Dexie / `getDatabase` from components or pages.
- Do **not** put table queries in SFCs — domain lookups belong on the matching service.
- Entity factories in `interfaces/` may call services; that is an existing exception, not a reason to query from UI.

## Speed & indexes

- Prefer `table.where("<indexedField>").equals(...)` (or equivalent) on services.
- Do **not** default to `toArray()` + filter in UI, or load whole tables when an index exists for the lookup.
- New frequent lookups / stats filters → add a schema index (new version) and query through the service the same way as existing `*Service` methods.
- Stats should stay easy to index and query by the keys you filter on (`playerId`, `matchId`, `setId`, …).

## Writes

Pass plain data into Dexie — `toRaw(...)` or `cloneCompetition*` helpers. Do not upsert Vue proxies.

## Do / Don't

- ✅ Same path for every entity: schema → service → composable → export list
- ✅ Indexed service queries for lookups and stats
- ❌ Don't invent a second access style for one table type
- ❌ Don't query Dexie from components/pages
- ❌ Don't introduce live-query reactivity unless the project deliberately adopts it
