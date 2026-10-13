# Claude Code config — darts

Claude Code reads rules, commands, skills and agents from `.claude/`. Cursor reads the same
material from `.cursor/`. To avoid maintaining two copies, **`.cursor/` holds the only real
files and everything in `.claude/` is a symlink into it.**

```text
.claude/rules/<name>.md          -> ../../.cursor/rules/<name>/RULE.md
.claude/commands/<name>.md       -> ../../.cursor/commands/<name>.md
.claude/skills/<name>/SKILL.md   -> ../../../.cursor/skills/<name>/SKILL.MD
.claude/agents/<name>.md         -> ../../.cursor/agents/<name>.md
```

This `README.md` is the only real file here.

## How one file serves both tools

Each source file carries the frontmatter keys of **both** tools. Each tool ignores the other's keys.

| Concern | Cursor key | Claude Code key |
| --- | --- | --- |
| When a rule loads | `globs:` + `alwaysApply: false` | `paths:` |
| Rule always loaded | `alwaysApply: true` | *(no `paths:` key)* |
| Agent write access | `readonly: true` | `tools:` (read-only list) |

So a rule's frontmatter repeats its globs under `paths:`. The `testing` and `ponytail` rules are
`alwaysApply: true` and deliberately have **no** `paths:`, which makes Claude load them always.

Path-scoped rules never show up under memory files in `/context`. Claude attaches them when it
*reads* a matching file (opening it in the editor doesn't count). `ctrl+o` shows them after the read.

## Rule scoping and what it costs

Every rule whose `paths:` match a file you read gets attached to the conversation. Reading one
`.vue` file pulls in ~1,270 lines of rules, a `.ts` file ~590. Two of those (`testing`, `ponytail`)
are always-on and load once per session, not per read.

Scoping decisions worth keeping:

| Rule | Scope | Why |
| --- | --- | --- |
| `typescript` | `**/*.ts` only | Its subject matter (enums, classes, type guards, utility types, type organisation in `interfaces/`) is not what you write in an SFC. Props/emits typing lives in `vue-global-rules`; the arrow-function and named-export preferences are in `AGENTS.md`, which is always loaded. Dropping `**/*.vue` cut ~390 lines off every component read. |

Deliberately left broad, despite the cost:

- `database` on `interfaces/**/*.ts`. Narrowing this to the files that currently import a `*Service`
  was tried and reverted: `leg.ts`, `set.ts` and `stats.ts` all construct services and `upsert`, so a
  third of the directory already persists itself, and the next factory to do so would be the one file
  that most needs the rule.

- `forms`, `fontawesome`, `routing`, `event-bus` (~124 lines combined on every `.vue`). These are
  "reuse what already exists instead of inventing a second one" rules. Their value is highest in a
  file that does **not** yet use `FormButton` / Font Awesome / `utils/routes` / mitt, so scoping them
  to current usage would switch them off exactly where they are needed.
- `accessible-motion` on `**/*.vue`. Motion lives in 10 of 48 components, spread over `form/`,
  `games/x01/`, `stats/`, `ui/` and `pages/` — no directory boundary to scope to, and the next
  transition could land anywhere.

Before narrowing a glob, check whether the rule is descriptive (describes code that is already
there — safe to scope by location) or prescriptive (tells you what to reach for before you write —
scope it broadly).

## Editing

1. Edit the file under `.cursor/` — never through the `.claude/` symlink path in a way that
   makes you think it is a separate file.
2. Changing a rule's globs? Update **both** `globs:` and `paths:`.
3. New rule: create `.cursor/rules/<name>/RULE.md` with both keys, then
   `ln -sfn ../../.cursor/rules/<name>/RULE.md .claude/rules/<name>.md`.
4. New skill: create `.cursor/skills/<name>/SKILL.MD`, then
   `mkdir -p .claude/skills/<name> && ln -sfn ../../../.cursor/skills/<name>/SKILL.MD .claude/skills/<name>/SKILL.md`.

Relink everything after adding files:

```bash
for d in .cursor/rules/*/;  do n=$(basename "$d"); ln -sfn "../../.cursor/rules/$n/RULE.md" ".claude/rules/$n.md"; done
for f in .cursor/commands/*.md; do n=$(basename "$f"); ln -sfn "../../.cursor/commands/$n" ".claude/commands/$n"; done
for d in .cursor/skills/*/; do n=$(basename "$d"); mkdir -p ".claude/skills/$n"; ln -sfn "../../../.cursor/skills/$n/SKILL.MD" ".claude/skills/$n/SKILL.md"; done
for f in .cursor/agents/*.md;   do n=$(basename "$f"); ln -sfn "../../.cursor/agents/$n" ".claude/agents/$n"; done
```

On Windows, git needs `core.symlinks=true` (and Developer Mode) to check these out as real links.

## What is here

Rules, commands, skills and agents are listed in [`.cursor/README.md`](../.cursor/README.md) — the same
set, reached through these symlinks. Two rules come from the shared
`superbrave/frontend-ai-rules` repo and were copied in (not subtreed) because they apply here:

| Rule | Why |
| --- | --- |
| `ponytail` | Always on. Simplest-solution-first ladder, root-cause fixes, shortest correct diff. Adapted: the "leave a test behind" clause defers to this project's `testing` rule (Playwright-first, no unsolicited test edits). |
| `bundle-splitting` | `manualChunks` belongs in `nuxt.config.ts`, never in `vite:extendConfig`. Measured wins only. |

Not copied from that repo: `formatting` (needs oxfmt/oxlint, not used here), `tailwind-styling`
(Tailwind 4 only; this app is Tailwind 3 via `@nuxtjs/tailwindcss`), `unit-tests` and the
`write-tests` skill (no Vitest installed). Revisit those if the toolchain changes.

## Not symlinked

Product docs stay at [`.cursor/product/`](../.cursor/product/) (`VISION.md`, `BOARD.md`) and agent
GitHub auth at [`.cursor/AGENT-GITHUB-AUTH.md`](../.cursor/AGENT-GITHUB-AUTH.md). The agents
reference those by repo-root-relative path, which both tools can read, so a second path to them
would only create ambiguity about where to write.

## Related

- Root [`CLAUDE.md`](../CLAUDE.md) imports [`AGENTS.md`](../AGENTS.md), so the domain layout
  (`interfaces/` / `constants/` / `utils/`, no BEM) loads in every session.
- `CLAUDE.local.md` and `.claude/settings.local.json` are gitignored for personal overrides.
