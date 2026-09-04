# Agent notes — darts

Project conventions for Cursor agents. Keep this file short and actionable.

## Updating this file

When the user states a preference or convention that is **not** already covered here:

1. Ask whether it should be added to `AGENTS.md`.
2. Only edit this file after they confirm.
3. Never add preferences silently.

## TypeScript / utils

- Prefer `export const name = (...) => {}` over `export function name()`.
- Prefer named exports; no default export on util modules unless something actually imports it.
