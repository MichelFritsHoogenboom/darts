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
2. Stage change → swap `status:*` + short comment.
3. Do not call Projects GraphQL from the agent.
4. You kick agents per column; they do not watch the board.
5. **Ready bar:** PO must sharpen AC beyond the intake (concrete screens/controls). Involve specialists **when relevant**: **designer** (UX choices), **accessibility-expert** (new/changed interaction), **seo-expert** (public/share pages), **db** / **security** as needed. Once AC are usable → kick **qa** for early Given/When/Expect on the Issue.
6. **QA review:** **qa** checks the Issue AC + project rules/docs (incl. basic a11y from `vue-accessibility`). Kick **accessibility-expert** / **seo-expert** only if AC require specialist sign-off or QA hits something beyond the docs — not on every ticket.
7. **Prioritize:** PO keeps milestones + `prio:*` and the Project **roadmap** view aligned with `VISION.md`. Project API: `GH_TOKEN="$PROJECT_TOKEN"` (local classic file — `.cursor/AGENT-GITHUB-AUTH.md`). Issues stay on fine-grained `GH_TOKEN`.
8. **No duplicate product markdown:** when findings/work are already GitHub Issues (or Issue comments), do **not** also write an index/summary under `.cursor/product/`. Issues are enough. Keep `.cursor/product/` for lasting process docs (e.g. this board, `VISION.md`), not ticket dumps.
