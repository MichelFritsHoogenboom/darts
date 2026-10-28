# GitHub Project board (Kanban)

Agents change stage with Issue labels (`status:*`). A **GitHub Action** maps those labels to Project **Status** (built-in Project UI has no “on label → status” workflow).

**Product memory (read first):** `.cursor/product/VISION.md` (vision / audience / competitors — not an Issue).  
**Sequencing:** GitHub Project **roadmap** view + Issues on the board. Do not ask the user to re-explain vision/audience/competitors — update `VISION.md` when decisions change.

| Actor | Token |
| --- | --- |
| Cursor agents | Fine-grained → Issues/labels only |
| `.github/workflows/sync-status-label-to-project.yml` | Secret `PROJECT_TOKEN` = classic **`project` only** |

Fill in:

- Project URL: https://github.com/users/MichelFritsHoogenboom/projects/1
- Project number: `1` (repo variable `PROJECT_NUMBER` optional)
- Roadmap view: Project → Roadmap (Start date / Target date fields filled by PO)
- Repo: `MichelFritsHoogenboom/darts`

Recommend Project auto-add: new issues from this repo → project (Status Backlog).

## Status ↔ labels

Exactly **one** `status:*` at a time. Swap: remove other `status:*`, add the new one.

| Status (column name — must match) | Label |
| --- | --- |
| **Backlog** | `status:backlog` |
| **Ready** | `status:ready` |
| **Design** | `status:design` |
| **Design review** | `status:design-review` |
| **Ready for development** | `status:ready-for-development` |
| **In progress** | `status:in-progress` |
| **QA review** | `status:qa-review` |
| **User review** | `status:user-review` |
| **Done** | `status:done` |

Optional prio labels: `prio:now` / `prio:next` / `prio:later`.

## Who may set which label

| To label | Who |
| --- | --- |
| `status:backlog` | Any specialist or PO |
| `status:ready` | PO **with you** |
| `status:design` | Designer |
| `status:design-review` | Designer |
| `status:ready-for-development` | **You only** (after design OK) |
| `status:in-progress` | FE / DB |
| `status:qa-review` | FE / DB |
| `status:user-review` | QA (pass) |
| `status:done` | **You only** |

## One-time setup

1. Labels on the repo (already created if we ran `gh label create`).
2. Classic PAT scope **`project` only** → repo secret **`PROJECT_TOKEN`**.
3. Variable **`PROJECT_NUMBER`** if the project is not `#1`.
4. Merge/enable workflow `sync-status-label-to-project.yml` on the default branch (or test on this branch with `workflow_dispatch` later).
5. Test: `gh issue edit 21 --add-label "status:ready"` → check Actions + board.

## Agent habits

1. New work → Issue + `status:backlog`.
2. Stage change → swap `status:*` + short comment. All agents post as the same GitHub account, so every comment uses this format:

   ```text
   **[qa]** QA review → User review

   ✅ All 6 AC met · `pnpm test:e2e` 1 passed

   ⚠️ **Smoke can pass on the wrong base**
   `webServer` never clears `NUXT_APP_BASE_URL`. With `/darts/` set in the shell, the build bakes
   that base in and Nitro 302-redirects `/` → `/darts/`, so the test goes green against the Pages
   base instead of `/` (AC 2).
   Fix: pin the env in `webServer.env`, or assert the final URL.
   ```

   - Line 1: `**[agent]**` + column move (or what the comment is about).
   - **Outcomes** (✅ done · ❌ failed · ❓ need from user) get **one line each** — result plus evidence, nothing more.
   - **Findings** (⚠️) get a bold one-line title, then 1–3 lines: what happens, why, and the fix. Someone who wasn't there must be able to act on it without re-deriving it. Never a bare `⚠️ passes on wrong base` — a follow-up nobody can act on is noise.
   - Don't restate the AC, the Issue body, or what the label history already shows.
   - More than ~2 findings, or one that needs its own AC → separate Issue, linked from the comment.
3. Do not call Projects GraphQL from the agent.
4. You kick agents per column; they do not watch the board. Kick with `/pick <issue-number>` (skill: `.cursor/skills/ticket-pick/SKILL.MD`).
5. **Refine → Ready:** use `/refine <issue-number>` (skill: `.cursor/skills/ticket-refine/SKILL.MD`). First pass = Discover only (≤3 decision questions, then stop). After answers = lean Issue brief. See Ready bar below.
6. **Ready bar:** PO must clear all of:
   - Sharper problem / entry points / MVP AC / out-of-scope than the intake (concrete screens/controls) — lean body only (no VISION/roadmap dump). Template: Problem · Entry points · MVP AC · Out of scope · Open questions · Next agent — see product-owner + ticket-refine skill.
   - **No open Discover questions** left on the Issue (empty Open questions, or only explicitly deferred items the user accepted).
   - Specialists **when relevant**: **designer** (UX choices), **accessibility-expert** (new/changed interaction), **seo-expert** (public/share pages), **db** / **security** as needed — one next-agent proposal, not a parade.
   - Once AC are usable → kick **qa** for early Given/When/Expect on the Issue.
   - On Ready: short comment (1–3 sentences why Ready + pointer to decisions) — not a second essay.
7. **QA review:** **qa** checks the Issue AC + project rules/docs (incl. basic a11y from `vue-accessibility`). Kick **accessibility-expert** / **seo-expert** only if AC require specialist sign-off or QA hits something beyond the docs — not on every ticket.
8. **Prioritize:** PO keeps milestones + `prio:*` and the Project **roadmap** view aligned with `VISION.md`. Project API: `GH_TOKEN="$PROJECT_TOKEN"` (local classic file — `.cursor/AGENT-GITHUB-AUTH.md`). Issues stay on fine-grained `GH_TOKEN`.
9. **No duplicate product markdown:** when findings/work are already GitHub Issues (or Issue comments), do **not** also write an index/summary under `.cursor/product/`. Issues are enough. Keep `.cursor/product/` for lasting process docs (e.g. this board, `VISION.md`, `FACTORY.md`), not ticket dumps.
