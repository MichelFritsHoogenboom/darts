---
name: branch-review
description: >-
  Reviews git changes against team Cursor rules (RULE.md / .cursor/rules) for
  standards compliance: default is current branch vs main; also supports
  commit-range, staged, and working-tree diffs when specified. Use when the user
  asks for a review, branch review, commit review, commits review, rules review,
  diff review, staged or uncommitted changes, pre-merge check, compliance audit,
  or validation of AI-generated work against project rules.
---

# Branch review (rules vs `main`)

## Goal

Compare the chosen **git diff** against **`main`**, a **commit range**, or **working tree / index** (see [Scope](#scope-full-branch-commits-or-working-tree)) and judge every touched area against **the full rules corpus** — the same obligation as root **`AGENTS.md`** (“read all rules before coding”). Surface **concrete violations** with **rule citations**, not generic style opinions.

## Protection: nothing on `main`

Run **`git rev-parse --abbrev-ref HEAD`** before rules/diff work.

1. **Default (branch vs `main`)** — If the current branch is **`main`**, **stop**. Do **not** load rules for that run, do **not** diff branch-vs-main, do **not** produce the report. Tell the user to **check out or create a feature branch** first (same bar as `pr-create-or-update`). Treat **`master`** the same if it is the repo’s primary integration branch when `main` does not exist.
2. **Commits-only review** — If the user **explicitly** scoped to a commit range or SHAs and did **not** ask for “my branch vs main”, you may proceed **read-only** even when checked out on `main`.
3. **Working tree / staged review** — Allowed on **`main`** (read-only): `git diff`, `git diff --cached`, or `git diff HEAD` do not violate the branch-vs-main guard (the user is not claiming a merge-ready branch delta).
4. **Writes** — As part of this skill, **never** add commits on `main`, merge to `main`, push to `main`, rebase `main`, or rewrite `main`. Review-first; if the user later asks to apply fixes and is still on `main`, **refuse** until they switch branch (unless they only want analysis with no repo writes).

## Scope: full branch, commits, or working tree

**Default (branch review):** merge-base with `main` / `origin/main` — the full delta you would merge.

**Commits review** — when the user asks for **recent commits**, **this commit**, or a **range** (e.g. `abc123..def456`, “last 5 commits”):

1. Resolve `<from>` and `<to>` (usually `<to>` = `HEAD`).
2. Examples:
   - **Last N commits:** `git diff HEAD~N..HEAD` (linear tip).
   - **Single commit:** `git show <sha>` or `git diff <sha>^..<sha>`.
   - **Named range:** `git diff <from>..<to>` and `git log <from>..<to> --oneline`.
3. State **which diff command** was used in the report summary.

**Working tree / staged** — when the user asks for **uncommitted**, **staged**, **working tree**, **before I commit**, or **my local changes**:

| Ask | Diff to use |
|-----|-------------|
| Uncommitted only (not staged) | `git diff` |
| Staged only | `git diff --cached` |
| Staged + unstaged | `git diff HEAD` |

State **exactly** which command the report used. [Protection](#protection-nothing-on-main) allows these on `main`; default **branch-vs-main** still does not.

If the request is ambiguous, prefer **branch vs `main`** unless the user clearly narrows to commits or working tree — but if that implies branch-vs-main while on `main`, [Protection](#protection-nothing-on-main) applies first.

## Before you review

1. **Branch check** — Apply [Protection](#protection-nothing-on-main) for the **default branch-vs-main** flow. If you are on `main` **and** the request is branch-vs-main (or ambiguous that way), **stop**. If on `main` **only** for **explicit commits-only** or **working tree/staged** scope, continue with the appropriate diff.
2. **Merge / rebase state** — Run **`git status`**. If a merge or rebase is **in progress** or there are **unmerged paths**, put a short **warning** at the top of the report: the diff may not match what will finally land until conflicts are resolved.
3. **Stale base (optional but recommended for branch scope)** — When `<base>` is `main` or `origin/main`, if **both** `main` and `origin/main` exist and **`git rev-parse main`** ≠ **`git rev-parse origin/main`**, note in the **Summary** that local `main` may be behind (or ahead of) **`origin/main`**, say **which ref you used** for the diff, and suggest **`git fetch origin main`** (or equivalent) if a fresher review against remote matters.
4. **Read root `AGENTS.md`** — If **`AGENTS.md`** exists at the **workspace root**, read it **before** enumerating rules. Use it as the **canonical** pointer to rule locations and any “always do X first” workflow; it may reference `.cursor/rules` or other paths.
5. **Load every rule file** (see [Where rules live](#where-rules-live)) **before** interpreting the diff.
6. **Resolve the diff** — default branch scope:

```bash
git rev-parse --abbrev-ref HEAD
git merge-base main HEAD 2>/dev/null || git merge-base origin/main HEAD
git log <base>..HEAD --oneline
git diff <base>...HEAD --stat
git diff <base>...HEAD --name-only
git diff <base>...HEAD
```

- Prefer **`main`**; if missing locally, use **`origin/main`** as `<base>` and state that in the report.
- Use **`<base>...HEAD`** (three-dot) for the default branch diff.

## Where rules live

1. **Root `AGENTS.md`** — Already covered in [Before you review](#before-you-review); it may direct you to `.cursor/rules` or spell out team workflow.
2. **`.cursor/rules/`** — If it exists (including subfolders), read **all** rule files — typically `*.md`, `*.mdc`, or `RULE.md` per folder.
3. **This repository’s layout** — In the rules repo (or when present), read **`rules/**/RULE.md`** (and sibling rule docs).

If **no** rules directory is found, say so explicitly — do **not** invent “team rules.”

## Mapping changes to rules

- Use **path and content**: e.g. `*.vue` → Vue rules, `**/composables/**` → composables, `*.scss` / `*.css` → styling, `*.ts` / `*.tsx` → TypeScript, `*.spec.*` / tests → unit-tests, control flow → control-flow, imports → structured-imports / ordering-constants.
- **Monorepo / multi-app:** if the diff touches several **`apps/*`** (or multiple packages), apply **per-app** and **shared package** expectations when rules distinguish them; call out cross-app impact briefly in the summary when relevant.
- **alwaysApply** (or similar) frontmatter means: consider for **any** change, not only by extension.
- Prefer **one rule citation per issue**: `rules/<topic>/RULE.md` → **heading or subsection name**.

## What to check

For each changed file (and meaningful hunk):

1. **Requirements** from the relevant `RULE.md` sections.
2. **Cross-cutting** rules: imports order, constants placement, tests, Vue/SCSS/TS patterns as written in rules.
3. **Rules vs tests** — If **`rules/unit-tests/RULE.md`** (or equivalent) implies **new or changed behavior should gain/update tests** (e.g. composables, non-trivial logic) and the diff **adds no** matching `*.spec.*` / test updates, add a **Should fix** or **Consider** item **with that rule cited**, unless the change is clearly non-logic (copy-only, types-only) per the same rules.
4. **Obvious regressions** only when they **directly conflict** with a cited rule — not personal taste.

**Not in rules** — If something looks risky or inconsistent but **no** `RULE.md` covers it, list it under [Report format](#report-format) **Not covered by rules** — do **not** treat it as a team standard.

Skip or lightly note: generated lockfiles, binary assets, unless rules cover them.

## Report format

Severity:

| Level | Meaning |
|--------|---------|
| **Must fix** | Violates a stated rule or breaks a rule invariant |
| **Should fix** | Strong rule misalignment or likely review rejection |
| **Consider** | Minor deviation or optional rule |

Structure:

```markdown
# Rules review: <scope description, e.g. branch vs main / staged / commits A..B>

## Summary
- Diff: <exact git command(s)>, base ref(s) if any
- Branch: <name>; commits in scope: N; files: M (from stat)
- Merge/rebase warning: <if applicable, else omit>
- Stale main note: <if local vs origin differed, else omit>
- Rules read: <files or dirs>

## Must fix
…

## Should fix
…

## Consider
…

## Not covered by rules
- <Optional: risks or smells with no matching RULE.md — not team law>

## Rules vs tests
- <Optional: rule citation if tests likely missing per unit-tests RULE.md>

## Compliant / no rule hit
…

## Follow-ups
- Tests or checks rules imply but diff cannot prove
```

If the diff is **large**, group by **theme** (TypeScript, Vue, Styling, apps) and keep **rule citations** per finding.

## After the review (optional)

If the user will open or update a **GitHub PR**, they can follow **`skills/pr-create-or-update/SKILL.MD`** next — it does **not** replace this rules review.

## Constraints

- Obey [Protection](#protection-nothing-on-main).
- **Do not** edit the repo unless the user asks to apply fixes — and **do not** apply fixes on `main` (see protection).
- **Do not** substitute for CI, security review, or product requirements — only **documented rules** plus the explicit **Not covered by rules** bucket.
- Tone: precise, plain language, scannable lists (match other project skills).

## Optional Cursor command

See `commands/branch-review.md`.
