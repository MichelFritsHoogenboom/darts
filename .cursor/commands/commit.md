# Git Commit Workflow

Create a git commit from **already staged** changes only. Follow root agent/user commit safety rules when present.

## Workflow Steps

1. **Get staged changes context**:

```bash
git status && echo "=== STAGED CHANGES ===" && git diff --cached
```

2. **Analyze the output** to understand:

- What files are staged vs un-staged
- Change types and scope (additions/deletions)
- Which changes will actually be committed

If nothing is staged, **stop** and tell the user to stage files themselves. Do not stage anything.

3. **Never stage**

- Do **not** run `git add`, `git add -A`, or otherwise stage/unstage files.
- Do not “helpfully” include unstaged or untracked files. The user stages explicitly.

4. **Refuse mixed app + tests** (see `.cursor/rules/testing/RULE.md`):

- If **staged** files mix **production/app code** with **tests/scenarios** (e2e/Playwright, `*.spec.ts` / `*.test.ts`, test fixtures, test-only config), **do not commit**.
- Stop and tell the user what is mixed. Do **not** auto-split, unstage, or create multiple commits unless the user explicitly asks you to split.
- App-only or test/scenario-only staged sets may proceed.

5. **Write accurate commit message** based on staged changes only:

- Prefer concise imperative subject; optional conventional prefix (`feat:`, `fix:`, `refactor:`, `style:`, `chore:`, `test:`, `docs:`).
- Focus on **why**, not a file list.
- No monorepo scopes, no `DV-…` ticket suffixes, no `.changeset` rules — not used here.
- Body optional when the why needs context.

6. **Create the commit** with a HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
Subject line here.

Optional body.

EOF
)"
```

7. **Verify** with `git status` after the commit.

## Important Notes

- Never update git config, never `--no-verify` / skip hooks unless the user asks.
- Never push unless the user explicitly asks (use `/commit-and-push` for push).
- Never commit a mixed app+test staging set — refuse instead.
- Working directory is the project root; no need to `cd`.
