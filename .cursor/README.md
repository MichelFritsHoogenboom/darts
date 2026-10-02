# Cursor config — darts

Project-local Cursor rules, commands, and skills for this Nuxt darts app. Not a shared/global team ruleset.

Also see root `AGENTS.md` for domain layout (`interfaces/`, `constants/`, `utils/`, no BEM).

## Rules (`.cursor/rules/`)

| Rule | What it covers |
| --- | --- |
| `styling` | Component first → else CSS utility in `assets/css/utilities/` → else scoped. No BEM. Tailwind for coarse layout only; tokens over hardcoded colors. |
| `accessible-motion` | Only when changing motion. CSS first; `@mixin animation` resets `animation`/`transition` under reduced motion. VueUse only for JS-driven motion. |
| `ssr-responsive` | Dexie/DOM client-only; responsive via CSS not `innerWidth`; avoid hydration mismatches (dev SSR / Pages SPA). |
| `database` | Dexie stack only: schema → `*Service` → `use*` → `dbExport` `TABLE_NAMES`. Indexed service queries; no Dexie in UI; no liveQuery. |
| `event-bus` | mitt via `$event` / `$listen` / `$unlisten`; same handler + unlisten on unmount; no Pinia for live score sync. |
| `fontawesome` | Specific FA icons (or `assets/icons` + `library.add`); no second icon system / whole packs. |
| `routing` | Paths via `utils/routes`; GH Pages `NUXT_APP_BASE_URL` / `NUXT_SPA` — don’t hardcode base or path literals. |
| `forms` | Reuse `FormButton` / `FormInput` / `FormSelect` / `FormCheckbox` from `components/form/`. |
| `testing` | Playwright + DB fixtures primary; Vitest only for pure `utils/`. No test/scenario edits unless asked. Refuse commits that mix app + tests. |
| `vue-global-rules` | Feature + `atoms`/`molecules`/`organisms`; shared lifted cross-feature. No `withDefaults`. Original SFC examples kept (props, emits, templates, no BEM). |
| `vue-accessibility` | Semantic HTML first; accessible names; keyboard; careful `aria-hidden`; disabled/loading for AT + keyboard. |
| `composables` | `use*` + matching filename; arrow functions; named exports; cleanup. No required `index.ts` (Nuxt auto-import). Pure helpers → `utils/`. |
| `typescript` | interface vs type, `import type`, utilities, arrow exports. Types in `interfaces/`, catalogs in `constants/` (`AGENTS.md`). |
| `structured-imports` | Group imports: Vendor → Types → Constants → Composables → Components → Utils (comment separators). Examples use `~/interfaces`, `~/composables`, `~/utils`. |
| `ordering-constants` | In SFCs: props → emits → constants → composables → refs → computed → methods. |
| `control-flow` | Braces on every `if`/`else`; no single-line if; prefer early returns. |

## Commands (`.cursor/commands/`)

| Command | Role |
| --- | --- |
| `/commit` | Commit **staged only** — never `git add`. Stop if nothing staged. Refuse mixed app + test/scenario staging. |
| `/commit-and-push` | `/commit` then `git push` (not on `main`; no force-push unless asked). |
| `/branch-review` | Review branch/diff against all project rules (Must fix / Should fix / Consider). |
| `/pr-create-or-update` | PR via `gh`: template if present, else English `## Summary` + `## Test plan`. |

## Skills (`.cursor/skills/`)

| Skill | Role |
| --- | --- |
| `branch-review` | Load `AGENTS.md` + rules, review the chosen diff, cite rule files in the report. |
| `pr-create-or-update` | Build PR title/body (template or English Summary + Test plan) and create/update with `gh`. |

## Agents (`.cursor/agents/`)

Role subagents — invoke with `/name` or ask the parent agent to delegate.

Board workflow (labels → Project Status): `.cursor/product/BOARD.md`. Agent GitHub auth (fine-grained, this repo only): `.cursor/AGENT-GITHUB-AUTH.md`.

| Agent | Role |
| --- | --- |
| `designer` | UI audit + responsiveness + new-feature UI in Vue/CSS; Design → Design review. |
| `front-end-developer` | Vue/TS implement & harden; lint/standards; Ready for development → In progress → QA review. |
| `qa` | Verify; scenarios (incl. early Ready drafts); story gaps; QA review → User review. |
| `database-engineer` | Dexie schema/indexes/services/export; same board flow as FE when ticketed. |
| `product-owner` | Concrete questions + sharper AC than intake; Backlog → Ready; pull designer/QA early. |
| `security-officer` | Threat review; flag Backlog issues; readonly fixes. |
