# GitHub auth for the Cursor agent

Agents use `gh` with **`GH_TOKEN`** only inside the Cursor sandbox. Your normal terminal can keep a separate keyring login.

No secrets in this file.

## Two tokens (by design)

| Where | Token | Scopes / perms | Purpose |
| --- | --- | --- | --- |
| Cursor `~/.config/cursor-agent/gh-token` | **Fine-grained** | Issues R/W, PRs R/W, Contents read — **only** repo `darts` | Agent: Issues, labels, PRs |
| Repo secret `PROJECT_TOKEN` | **Classic** | **`project` only** (not `repo`) | Action: label → Project Status |

You keep the fine-grained agent token. Classic is only in Actions and only needs Project access (you have one Project — OK for now).

Kanban: agents set `status:*` labels → workflow `.github/workflows/sync-status-label-to-project.yml` moves the card. See `.cursor/product/BOARD.md`.

`git push` stays SSH.

## Cursor agent token (fine-grained)

| Permission | Access |
| --- | --- |
| **Issues** | Read and write |
| **Pull requests** | Read and write |
| **Contents** | Read-only |

**1.** Create fine-grained PAT for `darts` only.  
**2.** Save:

```bash
mkdir -p ~/.config/cursor-agent && chmod 700 ~/.config/cursor-agent
read -rs "TOKEN?Paste token: "; printf '%s' "$TOKEN" > ~/.config/cursor-agent/gh-token; unset TOKEN
chmod 600 ~/.config/cursor-agent/gh-token
```

**3.** Sandbox-only (`~/.zshenv`, once):

```bash
if [[ -n "$CURSOR_SANDBOX" && -r ~/.config/cursor-agent/gh-token ]]; then
  export GH_TOKEN="$(<~/.config/cursor-agent/gh-token)"
fi
```

**4.** `~/.cursor/sandbox.json`: allow `api.github.com` + readonly `~/.config/cursor-agent`.  
**5.** Cmd+Q Cursor.

## Action secret (classic `project` only)

**1.** Classic PAT: note `darts-project-sync`, scope **`project` only**, expire e.g. 90 days.  
**2.** Repo → Settings → Secrets and variables → Actions → **`PROJECT_TOKEN`**.  
**3.** Optional variable **`PROJECT_NUMBER`** (default `1` if omitted) — number in the Project URL (`…/projects/1`).  
**4.** Status column names must match `BOARD.md` exactly.

## Check (agent)

```bash
echo "sandbox=${CURSOR_SANDBOX:-NOT SET}"
echo "token-prefix=${GH_TOKEN:0:11}"
gh api repos/MichelFritsHoogenboom/darts --jq .full_name
gh label list --repo MichelFritsHoogenboom/darts | grep status:
```

Expect prefix `github_pat_`. Then: `gh issue edit <n> --add-label "status:ready"` → Action runs → card moves.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Label changes, card does not | `PROJECT_TOKEN` / `PROJECT_NUMBER` / column name mismatch / Action failed |
| Action: Resource not accessible | Classic token missing `project`, or wrong owner |
| Agent `projectsV2` errors | Ignore — agent must not use Projects API |
| Active `(keyring)` in agent | `GH_TOKEN` not loaded in sandbox |
