# GitHub auth for the Cursor agent

Agents use `gh` with **`GH_TOKEN`** only inside the Cursor sandbox. Your normal terminal can keep a separate keyring login.

No secrets in this file. The token lives outside the repo.

## Required token: classic PAT

This repo uses a **user-owned GitHub Project** (Kanban). Fine-grained PATs **cannot** access user Projects (no Projects permission; GraphQL `projectsV2` fails). Agents must move Status columns → use a **classic** PAT.

| Scope | Why |
| --- | --- |
| **`repo`** | Issues, PRs, private repo API |
| **`project`** | Read/write Project board Status (Kanban moves) |

Do not add unrelated classic scopes. Trade-off: `repo` is broader than a fine-grained “one repo + PR/Issues” token — still store it **only** in `~/.config/cursor-agent/` and load it **only** when `CURSOR_SANDBOX` is set.

| What | Role |
| --- | --- |
| Classic PAT (`ghp_…`) | PRs, Issues, Project Status |
| `~/.config/cursor-agent/gh-token` | Token file (`chmod 600`) |
| `~/.zshenv` | `export GH_TOKEN=…` only if `CURSOR_SANDBOX` is set |
| `~/.cursor/sandbox.json` | Allow `api.github.com` + readonly token dir |

`git push` stays SSH — not this token.

Board rules: `.cursor/product/BOARD.md`.

## Cursor settings

*Settings → Cursor Settings → Agents*

- **Run Mode:** Allowlist (with Sandbox)
- **Network:** sandbox.json + Defaults

Do not run `gh` unsandboxed (may use your full keyring token).

## Setup (your terminal)

**1.** GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Generate:

- Note: `cursor-agent-darts`
- Scopes: **`repo`**, **`project`**
- Expiration: e.g. 90 days

**2.** Save (overwrites any old fine-grained file):

```bash
mkdir -p ~/.config/cursor-agent && chmod 700 ~/.config/cursor-agent
read -rs "TOKEN?Paste token: "; printf '%s' "$TOKEN" > ~/.config/cursor-agent/gh-token; unset TOKEN
chmod 600 ~/.config/cursor-agent/gh-token
wc -c ~/.config/cursor-agent/gh-token
```

**3.** Sandbox-only load (once):

```bash
cat >> ~/.zshenv <<'EOF'
if [[ -n "$CURSOR_SANDBOX" && -r ~/.config/cursor-agent/gh-token ]]; then
  export GH_TOKEN="$(<~/.config/cursor-agent/gh-token)"
fi
EOF
```

**4.** Sandbox config (merge if needed; your username):

```bash
cat > ~/.cursor/sandbox.json <<'EOF'
{
  "networkPolicy": {
    "default": "deny",
    "allow": ["api.github.com"]
  },
  "additionalReadonlyPaths": ["/Users/USERNAME/.config/cursor-agent"]
}
EOF
```

**5.** Quit Cursor fully (Cmd+Q) and reopen.

## Check (via the agent)

```bash
echo "sandbox=${CURSOR_SANDBOX:-NOT SET}"
echo "token-prefix=${GH_TOKEN:0:4}"
gh auth status 2>&1 | grep -E "Logged in|Active account|Token scopes"
gh api repos/MichelFritsHoogenboom/darts --jq .full_name
gh project list --owner MichelFritsHoogenboom
```

Expect:

- `sandbox=seatbelt`
- prefix `ghp_` (classic), not `github_pat_`
- scopes include `project` (and repo)
- `gh project list` works (not “Resource not accessible”)

## Replace the token

Overwrite `gh-token` → Cmd+Q → check above → revoke the old token on GitHub.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| prefix `github_pat_` | Still fine-grained — replace with classic `ghp_` |
| `Resource not accessible` on `projectsV2` | Classic + `project` scope required for user Projects |
| `Forbidden` / “keyring invalid” | Often blocked network → `sandbox.json` + restart |
| `sandbox=NOT SET` | Ran outside sandbox |
| Empty `token-prefix` | `~/.zshenv` / token path / `sandbox.json` readonly path |
| Active `(keyring)` | `GH_TOKEN` not loaded |
| `401` | Expired — replace token |
| `403` on Issues/PRs | Missing `repo` on classic token |
