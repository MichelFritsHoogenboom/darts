# Review (branch, commits, or working tree) against team rules

Apply the project skill **branch-review**: read `skills/branch-review/SKILL.MD` and follow it.

**Default:** current branch vs **`main`** / **`origin/main`** — **not** while on **`main`** (use a feature branch), except **commits-only** or **staged/uncommitted** review as the skill allows.

**Other scopes:** **commits** (range / last N / single SHA), **staged** (`git diff --cached`), **uncommitted** (`git diff`), or **both** (`git diff HEAD`). Read root **`AGENTS.md`** first if present, then **all** rule files, then report **Must fix** / **Should fix** / **Consider**, optional **Not covered by rules** and **Rules vs tests**, with **rule file + section** citations.

**Optional next step:** `skills/pr-create-or-update/SKILL.MD` for the PR body on GitHub.
