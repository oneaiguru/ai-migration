# Proxy Alias Playbook (ccgo / ccmitm / ccstock)

This SOP captures the shell alias workflow (now shipped via `scripts/shell/ccc-aliases.sh`) for toggling between the Go shim, MITM proxy, and stock Anthropic endpoints. `ccc-on`/`ccc-off` provide zero-touch routing; the older `ccp-*` aliases remain for manual control.

## Install (one-time)
```bash
cd /Users/m/git/tools/ClaudeCodeProxy
./scripts/install-shell-aliases.sh
```
This appends the loader to your shell RC file and sets `CCC_REPO_ROOT` automatically. Restart the terminal afterwards.

## Prerequisites
- Repo cloned at `/Users/m/git/tools/ClaudeCodeProxy` (adjust paths if different).
- Aliases loaded (e.g., via dotfiles sourcing the `claude-proxy.aliases.sh` script).
- `claude` CLI authorized in the desired profile (dev/prod).

## Alias Reference
| Alias | Description |
|-------|-------------|
| `ccc-on [port]` | Start shim, set `~/.config/ccc/env`, auto-source in all shells (default port `8082`). |
| `ccc-off` | Stop shim, clear proxy env vars, and write an env file that unsets them. |
| `ccc-status` | Inspect current exports, env file contents, and listening sockets. |
| `ccc-logs` | Tail `usage.jsonl` (honours `CCP_LOGS_DIR`). |
| `ccc-restart [port]` | Quiet restart with optional port change. |
| `ccp-start` / `ccp-env` / `ccp-stop` / `ccp-logs` | Manual equivalents that delegate to the new functions. |
| `ccp-haiku` / `ccp-sonnet` | Shortcut for `claude -p --model haiku|sonnet` via the shim. |
| `ccp-license` | `bin/cc license status` convenience wrapper. |
| `ccgo`, `ccgoenv`, `ccgostop` | Legacy aliases that map to the updated functions. |
| `ccmitm`, `ccsub`, `ccmitmstop` | MITM helpers (unchanged). |
| `cclogs`, `ccverify`, `ccbundle`, `ccstock`, `cczai` | Additional helpers retained for convenience. |

## Typical Flows

### A) Zero-touch shim session
1. `ccc-on` (or `ccc-on 8182`) – shim starts in background and env file is written.
2. Open new terminals/tabs as needed; no additional setup required.
3. Run probes/tasks (`ccp-haiku "Say hi"`, `ccp-sonnet …`).
4. `ccc-logs` (optional) to monitor traffic.
5. `ccc-off` when finished.

### B) Manual shim session (fallback)
1. `ccp-start` – explicit shim start (no env file written).
2. `ccp-env` in each shell that should use the shim.
3. `ccp-stop` to clean up.

### C) MITM session (Haiku→Z.AI)
1. `ccmitm 8082` – launch mitmdump with filter chain.
2. `ccsub 8082` – set proxy env + install cert.
3. Run targeted calls (`cch "Say hi"`).
4. `ccmitmstop 8082` – tear down proxy.

### D) Stock Anthropic
1. `ccstock` – clears proxy env and drops into an unproxied `claude` session.
2. Exit CLI → environment remains clean for other tools.

### E) Direct Z.AI (troubleshooting)
1. `export ZAI_API_KEY=...` (one time).
2. `cczai` – sets `ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic` and launches `claude`.

## Verification
- After `ccc-on`, new shells print `ANTHROPIC_BASE_URL=http://127.0.0.1:<port>` without manual sourcing.
- `ccc-status` reports the shim pid and env file path (`~/.config/ccc/env`).
- `ccp-haiku` entries in `ccc-logs` should reflect `lane:"zai"` when routing is active.
- `ccstock` prints `[stock] unproxied` and launches `claude` without proxy variables.

## Rollback
- If aliases misbehave, stop processes (`ccgostop`, `ccmitmstop`) and clear env vars manually (`unset ANTHROPIC_BASE_URL HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_AUTH_TOKEN`).
- If aliases misbehave, stop processes (`ccc-off`, `ccmitmstop`) and clear env vars manually (`unset ANTHROPIC_BASE_URL HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_AUTH_TOKEN`).
- Remove the appended blocks from your shell rc to uninstall the loader.

## Related Docs
- `~/wiki/dotfiles/AliasSystem.md` – alias design principles.
- `docs/ops/environment-profiles.md` – per-profile env setup.
- `docs/Tasks/mitm_strip_thinking.explore.md` – related to Haiku→Sonnet sanitizer plan.
