# GitHub auth for the Cursor agent

The agent creates PRs with `gh` using a **limited fine-grained PAT** (this repo only). Your normal terminal keeps using your usual `gh` login (keyring).

No secrets in this file. The token lives outside the repo.

## Pieces

| What | Role |
| --- | --- |
| Fine-grained PAT | PR read/write + Contents read, `darts` only |
| `~/.config/cursor-agent/gh-token` | Token file (`chmod 600`) |
| `~/.zshenv` | Sets `GH_TOKEN` **only** when `CURSOR_SANDBOX` is set |
| `~/.cursor/sandbox.json` | Allows `api.github.com` + read access to the token folder |

`git push` stays SSH — it does not use this token.

## Cursor settings

*Settings → Cursor Settings → Agents*

- **Run Mode:** Allowlist (with Sandbox)
- **Network:** sandbox.json + Defaults

Do not run `gh` unsandboxed: it may fall back to your full keyring token.

## First-time setup (your terminal)

**1.** Create a fine-grained PAT on GitHub: repo `darts` only, Pull requests read/write, Contents read.

**2.** Save it:

```bash
mkdir -p ~/.config/cursor-agent && chmod 700 ~/.config/cursor-agent
read -rs "TOKEN?Paste token: "; printf '%s' "$TOKEN" > ~/.config/cursor-agent/gh-token; unset TOKEN
chmod 600 ~/.config/cursor-agent/gh-token
wc -c ~/.config/cursor-agent/gh-token   # ~90, not 0
```

**3.** Load it only in the sandbox:

```bash
cat >> ~/.zshenv <<'EOF'
if [[ -n "$CURSOR_SANDBOX" && -r ~/.config/cursor-agent/gh-token ]]; then
  export GH_TOKEN="$(<~/.config/cursor-agent/gh-token)"
fi
EOF
```

**4.** Sandbox config (merge if the file already exists; use your username):

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
echo "token-prefix=${GH_TOKEN:0:11}"
gh auth status 2>&1 | grep -E "Logged in|Active account"
gh api repos/MichelFritsHoogenboom/darts --jq .full_name
```

Expect: `sandbox=seatbelt`, `token-prefix=github_pat_`, active `(GH_TOKEN)`, API → `MichelFritsHoogenboom/darts`.

## Replace the token

New PAT with the same permissions → overwrite `gh-token` → Cmd+Q → run the check above → revoke the old token on GitHub.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Forbidden` / “keyring invalid” | Often blocked network → fix `sandbox.json` + restart |
| `sandbox=NOT SET` | Ran outside sandbox → Allowlist (with Sandbox) |
| Empty `token-prefix` | Check `~/.zshenv` + path in `sandbox.json` |
| Active `(keyring)` | `GH_TOKEN` not loaded — do not continue |
| `401` | Token expired → replace it |
| `403` on PR | Wrong repo or missing PR write permission |
