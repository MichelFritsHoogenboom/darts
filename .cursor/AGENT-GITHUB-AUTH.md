# GitHub auth for the Cursor agent

Agents use tokens only inside the Cursor sandbox (`CURSOR_SANDBOX`). Your normal terminal can keep a separate keyring login.

No secrets in this file.

## Three places, two token types

| Where | Token | Scopes / perms | Purpose |
| --- | --- | --- | --- |
| `~/.config/cursor-agent/gh-token` | **Fine-grained** | Issues R/W, PRs R/W, Contents read — **only** repo `darts` | Default agent `GH_TOKEN`: Issues, labels, PRs, milestones |
| `~/.config/cursor-agent/gh-token-project` | **Classic** | **`project` only** (not `repo`) | Agent `PROJECT_TOKEN`: Project board / roadmap GraphQL |
| Repo secret `PROJECT_TOKEN` | **Same classic** (or identical twin) | **`project` only** | Action: label → Project Status |

Kanban status columns: agents set `status:*` → workflow moves the card (Actions secret).  
PO / agents filling **roadmap** or Project fields: use `PROJECT_TOKEN` from the local project file (see below).

`git push` stays SSH.

## Cursor agent — fine-grained (default)

| Permission | Access |
| --- | --- |
| **Issues** | Read and write |
| **Pull requests** | Read and write |
| **Contents** | Read-only |

```bash
mkdir -p ~/.config/cursor-agent && chmod 700 ~/.config/cursor-agent
read -rs "TOKEN?Paste fine-grained token: "; printf '%s' "$TOKEN" > ~/.config/cursor-agent/gh-token; unset TOKEN
chmod 600 ~/.config/cursor-agent/gh-token
```

## Cursor agent — classic project (roadmap / Project API)

Same classic PAT you put in the Actions secret (scope **`project` only**).

```bash
read -rs "TOKEN?Paste classic project token: "; printf '%s' "$TOKEN" > ~/.config/cursor-agent/gh-token-project; unset TOKEN
chmod 600 ~/.config/cursor-agent/gh-token-project
```

## Sandbox load (`~/.zshenv`, once)

```bash
if [[ -n "$CURSOR_SANDBOX" ]]; then
  if [[ -r ~/.config/cursor-agent/gh-token ]]; then
    export GH_TOKEN="$(<~/.config/cursor-agent/gh-token)"
  fi
  if [[ -r ~/.config/cursor-agent/gh-token-project ]]; then
    export PROJECT_TOKEN="$(<~/.config/cursor-agent/gh-token-project)"
  fi
fi
```

`~/.cursor/sandbox.json`: allow `api.github.com` + readonly `~/.config/cursor-agent`.  
Then Cmd+Q Cursor.

## How agents call Project APIs

Default `gh` uses `GH_TOKEN` (fine-grained) → Issues OK, **Projects fail**.

For Project / roadmap:

```bash
GH_TOKEN="$PROJECT_TOKEN" gh project list --owner MichelFritsHoogenboom
# or any gh api graphql / gh project item-edit …
```

Never put the classic token into the default `gh-token` file (that would replace fine-grained for all agent `gh`).

## Action secret (same classic)

**1.** Classic PAT: note e.g. `darts-project-sync`, scope **`project` only**.  
**2.** Repo → Settings → Secrets → Actions → **`PROJECT_TOKEN`**.  
**3.** Optional variable **`PROJECT_NUMBER`** (default `1`).  
**4.** Status column names must match `BOARD.md`.  
**5.** Copy the same PAT into `~/.config/cursor-agent/gh-token-project` for the agent.

## Check (agent)

```bash
echo "sandbox=${CURSOR_SANDBOX:-NOT SET}"
echo "issues-token=${GH_TOKEN:0:11}"          # expect github_pat_
echo "project-token=${PROJECT_TOKEN:0:4}"     # expect ghp_
gh api repos/MichelFritsHoogenboom/darts --jq .full_name
GH_TOKEN="$PROJECT_TOKEN" gh project list --owner MichelFritsHoogenboom
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Label changes, card does not | Actions `PROJECT_TOKEN` / `PROJECT_NUMBER` / column names / Action failed |
| Action: Resource not accessible | Classic missing `project`, or wrong owner |
| Agent `projectsV2` / `gh project` fails with fine-grained | Use `GH_TOKEN="$PROJECT_TOKEN" …`; ensure `gh-token-project` + zshenv + restart |
| Empty `project-token=` | File missing or sandbox readonly path |
| Active `(keyring)` in agent | `GH_TOKEN` not loaded in sandbox |
