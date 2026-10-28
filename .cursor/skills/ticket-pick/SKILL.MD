---
name: ticket-pick
description: >-
  Kick the next agent on one GitHub Issue based on its status:* label and
  "Next agent" line. Invoke via /pick <number>. Use when a ticket sits in a
  board column and should move forward.
---

# Ticket pick (kick the agent for this column)

## Goal

Agents do not watch the board (`.cursor/product/BOARD.md`, habit 4). `/pick <n>` is the kick: read one Issue, decide which agent owns its current column, spawn that agent with a short prompt, report back. One Issue, one agent, one column move per invoke.

## Required argument: Issue number

Parse the number after `/pick` (`/pick 33`, `/pick #33`).

- **Missing number:** reply `Welk Issue-nummer?` and **stop**.
- **Not found / closed:** say so and stop.

Load only that Issue: `gh issue view <n> --json number,title,body,labels,comments`.

## Route by status

Exactly one `status:*` label is expected. Zero or several → report and stop.

| Current label | Action |
| --- | --- |
| `status:backlog` | Not buildable yet. Tell the user to run `/refine <n>`. Stop. |
| `status:ready` + Next agent is **designer** | Spawn **designer** (mode: design). Designer sets `status:design`, ends on `status:design-review`. |
| `status:ready` + any other Next agent | Invoking `/pick` counts as the user's OK to skip design: set `status:ready-for-development` (label only, no comment), then continue as the row below. |
| `status:design` / `status:design-review` | Design review is the user's call. Show the Issue's latest design comment and stop. |
| `status:ready-for-development` | Spawn the **Next agent** (front-end-developer / database-engineer / qa) in mode: implement. |
| `status:in-progress` | Work may be stuck. Show the last comment + `git log --oneline main..HEAD`, ask whether to resume with the same agent. Stop. |
| `status:qa-review` | Spawn **qa** in mode: verify. |
| `status:user-review` / `status:done` | User only. Say what is waiting on them and stop. |

Next agent comes from the Issue's `## Next agent` section. Missing or unknown → ask the user which agent, stop.

## Agent prompt (keep it short)

Pass only:

- Issue number, title, body, labels, last 1–2 comments
- Mode (design / implement / verify) and the label transitions it may make (from the table above and BOARD.md "Who may set which label")
- Current branch + `git log --oneline main..HEAD`
- Instructions:
  - **First check whether the AC are already met** on this branch (commits, files). If so, skip to the end state and say so; do not redo work.
  - Implement: swap to `status:in-progress` at start, `status:qa-review` at end. One comment, at the end.
  - Verify: check each AC + project rules; pass → `status:user-review`; fail → back to `status:ready-for-development`. One comment.
  - Comment format — **paste this block into the prompt**, don't just cite BOARD.md. A referenced file is a file the agent may not open:

    ```text
    One comment, at the end. Open with **[<your agent name>]** + the column move.
    Outcomes (✅ met · ❌ failed · ❓ need from user): one line each, result + evidence.
    Findings (⚠️): bold one-line title, then 1–3 lines — what happens, why, and the fix.
    A reader who wasn't there must be able to act on it without re-deriving it;
    a bare "⚠️ passes on wrong base" is noise. Don't restate the AC or the Issue body,
    and don't repeat what the label history already shows.
    ```
  - Follow `AGENTS.md`, `.cursor/rules/ponytail/RULE.md`, `.cursor/rules/testing/RULE.md`. Tests only when the Issue's AC ask for them.
  - **Do not commit, stage, or push.** The user commits via `/commit`.
  - Blocked or a decision needed → stop and return `Need from you: …`, no guessing.

## Report

When the agent returns, give the user: what was done (or found already done), the label it ended on, and anything under `Need from you`. Then stop. Do not chain the next column in the same invoke; the user runs `/pick <n>` again.

## Do / Don't

- ✅ One Issue, one agent, one column move
- ✅ Detect already-done work before implementing
- ❌ Don't pick without an Issue number or scan the whole backlog
- ❌ Don't set user-only labels (`status:done`, `status:ready-for-development` after design review)
- ❌ Don't let the agent commit or push
- ❌ Don't chain several agents in one invoke
