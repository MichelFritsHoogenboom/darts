---
name: branch-review
description: >-
  Reviews git changes against project Cursor rules for standards compliance:
  default branch vs main; also commit-range, staged, or working-tree diffs.
  Use for review, branch review, rules review, staged/uncommitted review, or
  pre-merge compliance checks.
---

# Branch review (rules vs `main`)

## Goal

Judge the chosen **git diff** against **all** project rules (`AGENTS.md` + `.cursor/rules`). Report **concrete violations** with **rule citations** — not generic style opinions.

## Protection: nothing on `main`

1. **Branch vs `main` (default)** — If HEAD is `main` (or `master` when that is the integration branch), **stop**. Ask for a feature branch. Do not load rules or produce a branch-vs-main report.
2. **Commits-only / staged / uncommitted** — Allowed on `main` (read-only) when the user explicitly scopes that way.
3. **Writes** — Never commit, merge, push, or rewrite `main` as part of this skill. If asked to apply fixes while on `main`, refuse until they switch branch.

## Scope

| Ask | Diff |
| --- | --- |
| Default / “my branch” | `git diff <base>...HEAD` (three-dot); `<base>` = `main` or `origin/main` |
| Last N / range / SHA | `git diff <from>..<to>` (state the command) |
| Uncommitted | `git diff` |
| Staged | `git diff --cached` |
| Staged + unstaged | `git diff HEAD` |

Ambiguous → prefer branch vs `main`, unless that hits [Protection](#protection-nothing-on-main).

## Before you review

1. Apply [Protection](#protection-nothing-on-main).
2. `git status` — warn if merge/rebase in progress.
3. If reviewing vs `main` and local `main` ≠ `origin/main`, note which ref you used.
4. Read root **`AGENTS.md`**, then **every** file under `.cursor/rules/` (do not invent rules).
5. Resolve and read the diff (log + stat + name-only + full diff for the chosen scope).

## Mapping & checks

- Map by path/content to the matching rule(s); cite `rules/<topic>/RULE.md` → section.
- `alwaysApply` rules apply to any change.
- Per finding: rule requirement vs hunk. Cross-cutting: imports, control-flow, styling, testing.
- **Tests:** follow `rules/testing/RULE.md` (no silent test edits expectation — missing coverage → Should fix / Consider when the rule implies it).
- Risky but unruled → **Not covered by rules**, not Must fix.

## Report format

| Level | Meaning |
| --- | --- |
| **Must fix** | Violates a stated rule |
| **Should fix** | Strong misalignment / likely reject |
| **Consider** | Minor / optional |

```markdown
# Rules review: <scope>

## Summary
- Diff command(s), base ref, branch, file count
- Rules read
- Warnings (merge/rebase, stale main) if any

## Must fix
## Should fix
## Consider
## Not covered by rules
## Rules vs tests
## Compliant / no rule hit
## Follow-ups
```

Large diffs: group by theme; keep citations per item.

## Constraints

- Review only unless the user asks to apply fixes (never on `main`).
- Not a substitute for CI, security, or product review.
- Afterward (optional): `skills/pr-create-or-update/SKILL.MD` for the GitHub PR.

## Command

`commands/branch-review.md` invokes this skill.
