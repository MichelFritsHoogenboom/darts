# Agent notes — darts

Project conventions for Cursor agents. Keep this file short and actionable.

## Updating this file

When the user states a preference or convention that is **not** already covered here:

1. Ask whether it should be added to `AGENTS.md`.
2. Only edit this file after they confirm.
3. Never add preferences silently.

## TypeScript / exports

- Prefer `export const name = (...) => {}` over `export function name()`.
- Prefer named exports; no default export on util modules unless something actually imports it.

## File placement

| Layer         | Owns                                                               |
| ------------- | ------------------------------------------------------------------ |
| `interfaces/` | Types and interfaces                                               |
| `constants/`  | Domain constants / catalogs (keys, labels lists, enums-as-objects) |
| `utils/`      | Pure functions only — no types or constant catalogs                |

## CSS / Vue classes

- No BEM. Use plain scoped class names (`header`, `actions`, `row`) or nested selectors under one root class. Avoid `block__element--modifier`.

## Utils — placement and reuse

Before adding helpers in a component or inventing a new util file, check **all** of `utils/` and put the helper where the domain already lives (or extract there if a duplicate exists).

| File                          | Owns                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `utils/averages.ts`           | Three-dart / first-nine / scoring averages, `maxAverage`, `buildBestAverages` |
| `utils/stats.ts`              | Stat display/compare/aggregate helpers                                        |
| `constants/stats.ts`          | Score/checkout range key catalogs for UI                                      |
| `interfaces/stats.ts`         | `PlayerStats`, ranges, `BestAverages`, compare types                          |
| `utils/score.ts`              | Score-level predicates/helpers (e.g. checkout detection)                      |
| `utils/match.ts`              | Match-level helpers (winner counts, match-config summary)                     |
| `utils/player.ts`             | Player display names, silhouettes, id helpers                                 |
| `utils/rivalry.ts`            | Head-to-head / edition standings and rivalry overview                         |
| `utils/competition.ts`        | Cloning competition / edition / config                                        |
| `utils/array.ts`              | Generic array helpers                                                         |
| `utils/date.ts`               | Date formatting / relative checks                                             |
| `utils/dartScoring.ts`        | Checkout suggestions / achievable scores                                      |
| `utils/routes.ts`             | App route builders                                                            |
| `utils/dbExport.ts`           | DB export format                                                              |
| `utils/editionPlayerStats.ts` | Edition DB metric updates + camel season tallies                              |

Stats ranges, checkout hit/thrown, compare-better, display formatters (`—` vs `0`, percentages, hit/thrown), and aggregations over `ScoreRanges` / `CheckoutRanges` belong in shared stats utils — **not** only in a season/edition file and **not** copied into Vue components (`SeasonComparison`, `PlayerComponent`, `Checkouts`, etc.).

- Name helpers by **domain**, not by the first screen that needed them. Prefer `BestAverages` over `EditionBestAverages` if the same shape is used after a match/set/leg.
- If a helper is only used while updating edition player stats in the DB, `utils/editionPlayerStats.ts` (or a clearer rename later) is fine; pure format/compare/aggregate helpers should live with general stats/score/averages instead.
- Prefer one shared implementation over parallel locals (e.g. `maxAverage` in both a util and `PlayerComponent`).
- Assume domain data is defined when the type/contract says so; avoid defensive `?? 0` / optional chaining unless the type is actually optional.
