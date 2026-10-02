---
description: mitt event bus — $event / $listen / $unlisten with cleanup
globs:
  - "**/*.vue"
  - "composables/**/*.ts"
  - "plugins/eventEmitter*.ts"
alwaysApply: false
---

# Event bus (mitt)

Cross-component game sync uses the client plugin `plugins/eventEmitter.client.ts` — not Pinia, not ad-hoc `provide`/`inject` for the same job.

## API

From `useNuxtApp()`:

| Helper | Role |
| --- | --- |
| `$event(name)` | Emit |
| `$listen(name, handler)` | Subscribe |
| `$unlisten(name, handler)` | Unsubscribe |

## Rules

- Emit from composables / coordinators (e.g. `useX01Game`); listen in components that need to refresh.
- Subscribe in `onMounted` (or equivalent); **always** `$unlisten` the **same handler reference** in `onBeforeUnmount`.
- Reuse existing event names when the meaning matches (`score-submitted`, `undo-last-turn`, `leg-finished`, `set-finished`, …). Add a new name only when the intent is new.
- Do not introduce a second global event system alongside mitt.

## Do / Don't

- ✅ `$listen` → work → `$unlisten` with the same function
- ❌ Don't leave listeners hanging after unmount
- ❌ Don't invent Pinia/stores just for live score UI sync
