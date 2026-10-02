---
description: Testing — Playwright primary; do not touch tests unless asked; never mix with app commits
globs:
  - "**/*.spec.ts"
  - "**/*.test.ts"
  - "**/e2e/**/*"
  - "**/tests/**/*"
  - "**/playwright/**/*"
alwaysApply: true
---

# Testing

## Do not change tests unless asked

When implementing app/domain features or fixes: **do not** create, update, or delete tests, e2e specs, scenarios, or fixtures unless the user **explicitly** asks in that request.

- Do not “also update the tests” to match new behaviour on your own.
- Do not rewrite expectations to make a suite green after an app change unless asked.
- If tests will likely fail after an app change, you may **mention** that — still leave test files untouched until asked.

## Strategy

| Layer | Role | Prefer |
| --- | --- | --- |
| **Playwright (primary)** | Regressions on real flows + IndexedDB state | Smoke and critical paths with seeded DB |
| **Vitest on pure utils** | Edge cases in domain math/logic | `utils/` only (scoring, averages, checkout, stats helpers) |
| **Component unit tests** | Avoid | Do not mount Vue SFCs unless explicitly asked |

AI often rewrites unit tests together with implementation so they stay green without catching regressions. Prefer e2e asserts on **user-visible behaviour** and known stats over brittle component mounts.

## Commits: never mix app and tests

Test/scenario files must **not** be in the same commit as production/app code.

**Test/scenario paths** (non-exhaustive):

- Playwright / e2e specs and helpers
- Vitest / `*.spec.ts` / `*.test.ts`
- DB fixtures and seed JSON used by tests (`assets/db/**` when used as fixtures, `e2e/fixtures/**`, etc.)
- Test-only config (Playwright/Vitest config) when changed for those tests

**If a commit (or staged set) mixes app code with any of the above: do not commit.** Stop and tell the user. Do **not** auto-split, unstage, or invent a multi-commit flow unless the user asks you to split.

- App-only commits: fine.
- Test/scenario-only commits: fine (only after the user asked for test work); message should state what contract/expectation changed.

## Playwright

- Seed state via the existing DB export format (`utils/dbExport.ts`) and fixtures under `assets/db/` (or smaller dedicated fixtures under e.g. `e2e/fixtures/`).
- Typical setup: empty / isolated IndexedDB → import JSON → navigate → act → assert.
- Assert outcomes a human would notice: score remaining, leg/set/match won, visible averages/checkouts, correct navigation — not internal private state unless necessary.
- Keep the suite small and high-value (critical paths first). Prefer stable selectors (`getByRole`, labels, `data-testid` when needed).
- Do not invent Netlify/Crowdin or other unrelated app tooling in test docs.

## Vitest (utils only)

When the user has asked for util unit tests, or when adding tests for pure helpers in `utils/`:

- File next to the util or under a clear `__tests__` / `*.spec.ts` convention for utils — **not** a large component-test tree.
- AAA (Arrange–Act–Assert); descriptive names; cover edge cases (bust, checkout boundaries, empty ranges, averages with no darts).
- No Vue Test Utils / `mount()` for SFCs as the default.

## Do / Don't

- ✅ Leave tests/scenarios alone unless the user asked
- ✅ Playwright + importable DB fixtures for app behaviour (when asked)
- ✅ Unit tests for pure `utils/` domain logic (when asked)
- ✅ Refuse to commit when app and test/scenario files are mixed
- ❌ Don't update tests “to match” an app change without being asked
- ❌ Don't auto-split mixed commits — stop and report
- ❌ Don't default to Vue component unit tests
- ❌ Don't “fix” by mirroring implementation details that change with every refactor
- ❌ Don't expand a Vitest component suite copied from other projects
