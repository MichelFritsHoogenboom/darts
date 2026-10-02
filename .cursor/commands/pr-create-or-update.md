# Create or update PR on GitHub

Apply the project skill **pr-create-or-update**: read `skills/pr-create-or-update/SKILL.MD` and follow it for the **current branch**, including the **GitHub CLI (`gh`)** section.

If `.github/pull_request_template.md` exists, the PR body must match its structure and headings. If it does **not** exist, follow the skill’s **Geen pull_request_template.md** rules: **only** `## Wijzigingen` and `## Stappen om te testen` in the body (Dutch, English for code-facing terms, real links only — no invented Testomgeving, Crowdin, changeset blocks, or checklist).

Follow the skill’s `gh` flow: resolve PR number and re-edit after create **only** when the template has deploy/preview URLs with `ID`. Use `gh pr edit` or `gh pr create` as appropriate.
