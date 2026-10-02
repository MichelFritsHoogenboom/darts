# Create or update PR on GitHub

Apply the project skill **pr-create-or-update**: read `skills/pr-create-or-update/SKILL.MD` and follow it for the **current branch**, including the **GitHub CLI (`gh`)** section.

- If `.github/pull_request_template.md` exists → follow the skill’s **Source of truth** rules (headings character-for-character, no invented sections).
- If not → follow **When there is no pull_request_template.md** (English body with **only** `## Summary` and `## Test plan`).

Use `gh pr create` or `gh pr edit` as appropriate; return the PR URL.
