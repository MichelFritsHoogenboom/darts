# Git Commit and Push Workflow

1. Execute the `/commit` command. If that command **refuses** (e.g. mixed app + tests/scenarios), stop — do not push and do not auto-split.

2. After a successful commit, push with `git push` (use `-u` if the branch has no upstream yet) **only if** the current branch is **not** `main`.

## Important Notes

- **NEVER** push when on `main`.
- Do not force-push unless the user explicitly asks.
- Never update git config or skip hooks unless the user asks.
- Working directory is the project root; no need to `cd`.
