---
description: Kick the agent that owns an Issue's current board column — requires issue number.
---

# Pick ticket

Apply the project skill **ticket-pick**: read `.cursor/skills/ticket-pick/SKILL.MD` and follow it.

**Required:** Issue number after the command — `/pick 33` or `/pick #33`. Without a number, ask `Welk Issue-nummer?` and stop.

Route by the Issue's `status:*` label and its **Next agent** line, spawn that one agent with a short prompt, report the result and the label it ended on. One column move per invoke. Agents never commit or push.
