# GitHub Project board (Kanban)

Single source of truth for **ticket status**. Priority (`Now` / `Next` / `Later`) is a separate Project field or labels — not a column.

Link the `darts` repo to this Project and enable automation: **Issue opened → add to project → Status = Backlog** (recommended).

Fill in after create:

- Project name / URL: _(paste here)_
- Owner: `MichelFritsHoogenboom` (user project)
- `gh` needs a token that can write **user-owned Projects** — see `.cursor/AGENT-GITHUB-AUTH.md` (classic PAT with `project` scope). Fine-grained PATs cannot move cards on user Projects.

## Status columns (workflow)

| Status | Meaning |
| --- | --- |
| **Backlog** | New / untriaged |
| **Ready** | Triaged with acceptance; may start |
| **Design** | Designer working |
| **Design review** | Waiting for **your** design approval |
| **Ready for development** | Design approved; FE/DB may start |
| **In progress** | FE/DB implementing |
| **QA review** | QA verifying |
| **User review** | Waiting for **your** product approval |
| **Done** | Closed — **only you** |

## Who may set Status

| From → To | Who |
| --- | --- |
| → **Backlog** | Any specialist (new Issue) or PO |
| Backlog → **Ready** | PO **with you** (priority + acceptance) |
| Ready → **Design** | Designer (when starting) |
| Design → **Design review** | Designer (UI ready for you) |
| Design review → **Ready for development** | **You only** (or you ask PO to move after you approve) |
| Design review → **Design** | You / Designer (changes needed) |
| Ready for development → **In progress** | front-end-developer or database-engineer |
| In progress → **QA review** | FE/DB when build ready for QA |
| In progress → **Design** | FE if blocked on design (comment why) |
| QA review → **User review** | QA when verification passed |
| QA review → **In progress** or **Design** | QA when failed (comment why) |
| User review → **Done** | **You only** |
| User review → earlier column | **You** (rework) |

Agents **must not** set **Done** or skip **Design review** / **User review** gates.

## Agent habits

1. Create/find the GitHub Issue; ensure it is on the Project (automation or `gh project item-add`).
2. When starting or finishing a stage, update Status via `gh project item-edit` (or equivalent) and leave a short Issue comment.
3. You (human) kick agents when a column has work — agents do not watch the board 24/7.
4. Product gaps / new ideas → Issue in **Backlog**, label `po-intake` if useful; do not self-prioritize into Ready.
