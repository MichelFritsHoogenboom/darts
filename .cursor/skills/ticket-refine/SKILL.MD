---
name: ticket-refine
description: >-
  Refine a GitHub Issue toward Ready: discover with ≤3 decision questions
  then STOP; after user answers, write a lean Issue brief. Invoke via
  /refine <number>. Use for backlog triage, ticket refine, or sharpening AC.
---

# Ticket refine (ask first, lean brief)

## Goal

Move one Issue from fuzzy backlog toward a **buildable** contract — without long essays before decisions. Parent orchestrates; **product-owner** does Discover then Brief in **separate** short-context invokes.

## Required argument: Issue number

Parse the number from the user text after `/refine` (e.g. `/refine 42`, `/refine #42`).

- **Missing number:** reply with one line — `Welk Issue-nummer?` — and **stop**. Do not guess or open the whole backlog.
- **Invalid / not found:** say so and stop.

Load only that Issue (`gh issue view <n> --json number,title,body,labels,comments` or equivalent). Pass **only** that ticket (+ answers later) into PO prompts.

## Flow

```text
/refine <n>
  → load Issue
  → PO Discover (≤3 questions) → STOP for user
  → (user answers in chat)
  → fresh PO Brief → lean Issue body
  → optional early QA scenarios
  → Ready only with user OK
```

### 1. Discover (mandatory first pass)

Spawn **product-owner** with a **short** prompt, e.g.:

- Issue number, title, body, labels (no unrelated chat dump)
- Mode: **Discover only**
- Explore codebase / `.cursor/product/VISION.md` before asking
- ≤3 decision questions; each with options + recommended answer
- Silent output ban: no full AC, no Issue rewrite, no `status:ready`
- End with STOP — wait for the user

Surface the PO’s questions to the user. **Do not** start Brief, label swaps, or specialist parade in this turn.

### 2. Wait

After Discover, your turn ends when questions are shown (or Escalate/Stop from PO). Do not invent answers.

### 3. Brief (after user answers)

**New** product-owner invoke (fresh context): Issue snapshot + user answers + pointer to `VISION.md`. Mode: **Feature brief**.

PO updates the Issue to the lean contract:

| Section | Max |
| --- | --- |
| Problem | 2–3 sentences |
| Entry points | Real screens/controls |
| MVP AC | Checkable bullets |
| Out of scope | Short |
| Open questions | Empty or remaining only |
| Next agent | One line |

### 4. Optional early QA

Only when AC are stable enough: ask parent to kick **qa** for Given/When/Expect on the Issue — **not** Playwright unless the user asked.

### 5. Ready gate

`status:ready` only after the **user** approves. No open Discover questions left on the Issue. Short Ready comment (1–3 sentences), not a second essay. Follow `.cursor/product/BOARD.md`.

## Steal from grill-me (do not install grill-me)

- Explore first; ask only decisions
- Recommended answer + cheap options per question
- Decision-order (upstream first); ≤3 per round (not one-forever)
- Stop when sharp enough — no relentless grilling

## Escalate

If PO returns Blocked / Need from you / Suggested next agent — show that and stop. Do not loop.

## Do / Don't

- ✅ `/refine <n>` → Discover → stop → Brief after answers
- ✅ Lean Issue body; one next agent
- ❌ Don't refine without an Issue number
- ❌ Don't write the full brief in the Discover turn
- ❌ Don't mark Ready without the user
- ❌ Don't dump VISION/roadmap into every ticket
