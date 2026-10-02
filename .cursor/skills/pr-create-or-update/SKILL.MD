---
name: pr-create-or-update
description: >-
  Creates or updates a GitHub PR for the current branch via gh, from the diff
  against main. Fills .github/pull_request_template.md when present; otherwise
  English Summary + Test plan. Writing is for human reviewers: clear, precise,
  plain language. Use for PR descriptions, gh pr create, or gh pr edit.
---

# Create or update pull request from branch

## Goal

1. Build the PR title and body from the branch diff vs `main` / `origin/main`.
2. Publish with `gh pr create` or `gh pr edit`.

## Branch

- Must be a **non-`main`** branch. If on `main`, stop and ask the user to switch or create a feature branch.
- Do not merge, rewrite, or push to `main` as part of this skill.

## Source of truth: `pull_request_template.md`

**Try to read `.github/pull_request_template.md` first** (again if it may have changed).

- **If the file exists:** the filled PR body must:
  1. **Reuse every heading** from that file **in the same order** — character-for-character (`##` / `###`, including any emoji if present).
  2. **Reuse list/checklist wording** from the template where it is meant to stay fixed (e.g. checkbox label text). Do **not** invent alternate section titles or skip a section because it looks empty in the template.
  3. **Only substitute content** under each heading (and replace placeholders such as `ID` in URLs **only if** this repo’s template actually contains them). If GitHub adds a **new** heading later, fill it concisely from the heading name and the diff; keep the same heading text as in the file.
  4. Remove HTML `<!-- … -->` hint comments from the filled body (authoring hints, not for reviewers).

  The per-heading rules below ([How to fill Summary](#how-to-fill-summary) / [How to fill Test plan](#how-to-fill-test-plan)) explain **how to fill** those sections when present; they do **not** replace reading the template.

- **If the file is missing:** follow [When there is no pull_request_template.md](#when-there-is-no-pull_request_templatemd) and still use the git diff + `gh` flow.

## When there is no `pull_request_template.md`

When `.github/pull_request_template.md` **does not exist** in the repo (or this run targets a repo without that file):

1. **Language:** write the **PR title** and **full body** in **English**, with [code names as in the repo](#language). A missing template is **not** a reason to invent a different structure or language.

2. **Only these two body sections — no extra headings:** the markdown body consists **exclusively** of these two `##` headings, in this order, with no extra sections before/between/after:
   - `## Summary` — `-` bullets, **one short sentence per bullet**, per [How to fill Summary](#how-to-fill-summary).
   - `## Test plan` — checklist or numbered steps a reviewer can follow, per [How to fill Test plan](#how-to-fill-test-plan).

   **Forbidden unless the user explicitly asks in this conversation:** inventing `## Wijzigingen`, `## Stappen om te testen`, `## Testomgeving`, deploy/preview URL blocks, **Crowdin** key lists, **changeset** text, **ERT**, **Type wijziging**, or other headings known from **other** repo templates. Do **not** add those to look “complete” — they belong only if a **real** `pull_request_template.md` in **this** repo defines them, or the user asks now.

3. **No invented or copied URLs:** put **no** Netlify/deploy-preview URLs, **no** `ID`/PR-number placeholders, and **no** links copied from another codebase’s template. Only use URLs the **user gives in the same request** or that appear **literally** in **this** repo’s docs (and are correct). Otherwise: test steps **without** a deploy URL (e.g. run locally, open a route, import a fixture, describe the scenario).

4. **`gh`:** you do **not** need to resolve the PR number solely for fictional preview URLs.

## Before writing

```bash
git rev-parse --abbrev-ref HEAD
git log <base>..HEAD --oneline
git diff <base>...HEAD --stat
git diff <base>...HEAD --name-only
git diff <base>...HEAD
```

Prefer `main`; if missing locally, use `origin/main` and say so. Use the **same `<base>`** for all commands.

## Audience and tone

Reviewers read this on GitHub **without** the diff open. Every section must be **human-readable**, **precise**, and **easy to scan**.

- **Plain language:** short sentences; avoid filler (“in order to”, “leverages”, “robust solution”). Prefer concrete verbs (*added*, *removed*, *fixed*, *extracted*).
- **Precise:** say *what* changed and *where* (component, route, user-visible effect). Avoid vague claims (“improved UX”) without *what* a tester should see.
- **Scannable:** bullets and checklists; one main idea per line; consistent names for the same component/section.
- **Test steps:** each step should work **standalone** — **where** to go, **what** to do, **what “good” looks like**.
- **No machine-only output:** no raw dump of commit hashes, no unexplained codenames, no “it/the above” without a noun.

### Language

- Default for this repo: **English** for title and body prose.
- Keep **code and product names** as in the repo (components, routes, `pnpm`, Dexie, Playwright, file paths). Do not translate those.

### Links in the PR body

- Use markdown `[label](https://…)` or a bare `https://…` so GitHub makes them clickable.
- Do **not** wrap whole URLs in backticks (not clickable).
- Backticks are fine for paths, symbols, and short code fragments.

## How to fill Summary

- **One idea per bullet:** each `-` is **one short sentence** — no multi-sentence bullets.
- Prefer **~1 line** in the GitHub preview; skip store→action→component chains unless the reviewer would miss the point without one compact hint.
- **Bundle** same-kind changes (e.g. only Cursor rules, only copy) into **one** bullet. Pure cosmetic/formatter with no behaviour: one line like *“Cleanup: … (no functional change).”*
- **Count:** about **1–3** bullets for a typical PR (match the template hint); expand only for clearly separate review themes — not one bullet per file.
- Name components/routes **as in code**; no exhaustive filepath lists.
- Focus on **why it matters for review**, not a file changelog.

## How to fill Test plan

- Checklist items (`- [ ]`) or numbered steps — both OK; prefer the template’s checklist style when the template uses checkboxes.
- Each item: **where** (route/screen), **what** (action), **expect** (visible result). For this app, local flow is fine: start dev server, open page, optionally import a fixture from `assets/db/`.
- Cover the **behaviour the diff actually touches**; skip unrelated smoke unless risk is high.
- Responsive / a11y / reduced-motion steps **only** if the diff touches those.
- Aim for a **short** plan a colleague can run in a few minutes for a small PR; longer only when the change is risky or wide.

## Title

Short imperative summary of the branch (what the PR delivers), not a file list.

## GitHub CLI (`gh`)

Always finish with **`gh pr create`** or **`gh pr edit`** and the filled body (after [Branch](#branch) checks).

1. **Existing PR:** `gh pr view --json number,state,title,url`. On failure → treat as no PR.
2. Write the **final** body to a temp file (e.g. `mktemp /tmp/pr-body.XXXXXX.md`).
3. Open PR → `gh pr edit <n> --title "…" --body-file <tmp>`.
4. No PR → push with `-u` if needed, then `gh pr create --title "…" --body-file <tmp> --base main`.
5. **Failures** (`gh` missing, auth, unpushed branch): short actionable hints.
6. Return the **PR URL** when done.

## Output rules

- **Never** overwrite `.github/pull_request_template.md` unless the user explicitly asks.
- **PR body:** if a template exists, match it per [Source of truth](#source-of-truth-pull_request_templatemd). If **no** template, the body is **only** `## Summary` + `## Test plan` per [When there is no pull_request_template.md](#when-there-is-no-pull_request_templatemd) — **no** extra agent-added headings.
- Quality bar: readable for a **human code review** — clear, exact, no unnecessary jargon ([Audience and tone](#audience-and-tone)).

## Do not

- Auto-split commits or stage files (see `/commit` and `rules/testing`).
- Force-push unless the user asks.
- Invent preview/deploy URLs or copy them from another project’s template.

## Optional Cursor command

`commands/pr-create-or-update.md` invokes this skill.
