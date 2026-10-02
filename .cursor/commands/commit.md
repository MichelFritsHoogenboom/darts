# Git Commit Workflow

Execute the commit workflow following the project's commit message conventions.

## Workflow Steps

1. **Get staged changes context** with this command:

```bash
git status && echo "=== STAGED CHANGES ===" && git diff --cached
```

2. **Analyze the output** to understand:

- What files are staged vs un-staged
- Change types and scope (additions/deletions)
- Which changes will actually be committed

2b. **Refuse mixed app + tests** (see `.cursor/rules/testing/RULE.md`):

- If staged files mix **production/app code** with **tests/scenarios** (e2e/Playwright, `*.spec.ts` / `*.test.ts`, test fixtures, test-only config), **do not commit**.
- Stop and tell the user what is mixed. Do **not** auto-split, unstage, or create multiple commits unless the user explicitly asks you to split.
- App-only or test/scenario-only staged sets may proceed.

3. **Write accurate commit message** based on staged changes only:

- Format: `<type>(<scope>): <subject> (branch)`
- Only use scope names that match apps/_, packages/_ or packages/layer/\* folder names
- Only add the branch to the commit when the branch starts with "DV-"
- If the branch name contains "DV-XXXXX", include "DV-XXXXX" as the branch identifier in the commit message
- Use imperative present tense, max 120 characters for subject
- Types: feat, fix, docs, refactor, test, chore, style (no perf, revert)
- Include details in list form if helpful for larger commits
- Always use chore when there is only a `.changeset/*` staged file and no other files

4. **Execute git commit command** using run_terminal_cmd for user review

## Important Notes

- Generate minimum output; user only needs final commit command
- Do not read/summarize git command output after execution unless asked
- User can modify the commit command in shell before executing
- Example scope names: seeme, doctoronline, layer/base
- Your shell is already at the project root so you do not need `cd` or 'bash', just use `git ...`
