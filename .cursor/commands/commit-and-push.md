# Git Commit and Push Workflow

Execute the commit and push workflow following the project's commit message conventions.

## Workflow Steps

1. Execute the `/commit` command. If staged changes mix app code with tests/scenarios, that command must **refuse** (no auto-split) per `.cursor/rules/testing/RULE.md`.

2. Push the created commit using `git push` if the branch is not `main` (only after a successful commit)

## Important Notes

- **NEVER** push the commit when working in the `main` branch
- Generate minimum output; user only needs final commit command
- Do not read/summarize git command output after execution unless asked
- User can modify the commit command in shell before executing
- Example scope names: seeme, doctoronline, layer/base
- Your shell is already at the project root so you do not need `cd` or 'bash', just use `git ...`
