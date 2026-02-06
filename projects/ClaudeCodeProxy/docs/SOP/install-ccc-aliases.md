# CCC Alias Install & Daily Workflow

## Overview
Install once, then flip the Claude Code Companion (CCC) proxy on/off globally. `ccc-on` starts the Go shim, writes `~/.config/ccc/env`, and every new shell inherits the proxy automatically. `ccc-off` stops the shim and restores stock Anthropic variables. Manual `ccp-*` commands remain for fallback workflows.

```
┌────────────┐      ┌────────────────────┐      ┌────────────────┐
│ ccc-on     │ ───▶ │ shim + env written │ ───▶ │ any shell: claude │
└────────────┘      └────────────────────┘      └────────────────┘
        │                           │
        ▼                           ▼
  ~/.config/ccc/env           auto-sourced in new tabs

┌────────────┐
│ ccc-off    │  ⟵ kills shim + clears env file
└────────────┘
```

## One-time install
```bash
cd /Users/m/git/tools/ClaudeCodeProxy
./scripts/install-shell-aliases.sh
exec $SHELL   # or source ~/.zshrc / ~/.bashrc
```
This appends loaders to your shell rc file: first it sources `scripts/shell/ccc-aliases.sh`, then (once `ccc-on` has run) it auto-sources `~/.config/ccc/env` for every new shell.

## Daily commands
| Command        | Purpose |
|----------------|---------|
| `ccc-on [port]`    | Start the shim in the background (default `8082`) and write `~/.config/ccc/env` for zero-touch routing. |
| `ccc-off`          | Stop the shim, remove pid files, and write an env file that unsets proxy variables. |
| `ccc-status`       | Show current shell exports, env file contents, and shim listeners. |
| `ccc-logs`         | Tail the profile-specific `usage.jsonl`; file is created on demand. |
| `ccc-restart [port]` | Convenience: `ccc-off --quiet` followed by `ccc-on [port]`. |
| `ccp-start/env/stop/logs` | Manual mode aliases (delegate to the new functions). |
| `ccp-haiku` / `ccp-sonnet` | Convenience wrappers around `claude -p --model …`. |
| `ccp-license`      | Show current plan/features (`bin/cc license status`). |

Legacy helpers (`ccgo`, `ccmitm`, `cclogs`, …) remain wired to the updated functions for backward compatibility.

## Quick verification (zero-touch)
1. `ccc-on` → expect `[go-proxy] listening on :<port>` followed by `[ccc] proxy ON …`.
2. Open a **new** shell/tab and run `env | grep ANTHROPIC_BASE_URL` → should point at `http://127.0.0.1:<port>` with no manual sourcing.
3. Run a probe (`ccp-haiku "Say ok"`) and confirm `ccc-logs` shows `"lane":"zai"` with `status:200`.
4. `ccc-status` → verify shim pid, env file path, and exported variables.
5. `ccc-off` → environment is cleared; new shells print `unset` for `ANTHROPIC_BASE_URL`.

## Edge cases & notes
- **Log file empty?** `ccc-logs` waits until the first entry. For pre-creation use `touch $CCP_LOGS_DIR/usage.jsonl`.
- **Custom ports**: `ccc-on 8182` (or `ccc-restart 8182`) writes the new port into `~/.config/ccc/env` so every shell follows suit.
- **No `claude` CLI?** The shim still starts; `ccp-haiku` prints a warning until you install the CLI.
- **Manual fallback**: If the env file becomes corrupted, remove it and rerun `ccc-on`, or drop to the manual flow with `ccp-start` / `ccp-env`.
- **Uninstall**: remove both blocks appended to `~/.zshrc`/`~/.bashrc` (alias loader + env loader) and restart the shell.

## Uninstall
Remove the block appended to `~/.zshrc`/`~/.bashrc` (look for “Claude Code Companion aliases”) and restart the shell.
