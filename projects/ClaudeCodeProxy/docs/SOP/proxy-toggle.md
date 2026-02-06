# CCC Proxy Toggle (🦀 → ⚡)

This SOP documents the zero-touch workflow for running Claude Code Companion (CCC). Start the shim once via `ccc-on`, and **all** terminals/tabs can launch `claude` (or your existing aliases) without any extra setup. Use `ccc-off` to revert to stock Anthropic endpoints.

```
ccc-on ──────▶ shim up + env file ──┐
                                    │
新 tab / 新 shell ───▶ auto-source env ─▶ claude
                                    │
ccc-off ─────▶ stop shim + clear env ─┘
```

## Commands
| Command      | Description |
|--------------|-------------|
| `ccc-on [port]`  | Start the Go shim in the background (default `8082`). Writes `~/.config/ccc/env` with the correct exports and sources it immediately. |
| `ccc-off`       | Stop the shim, clear proxy env vars (both current shell and future shells). |
| `ccc-status`    | Report whether the shim is listening, which port, and whether the current shell is pointed at it. |
| `ccc-logs`      | Follow the active usage log (honors `CCP_LOGS_DIR`). |
| `ccc-restart` (optional) | Convenience wrapper: `ccc-off && ccc-on`. |

*All existing aliases (`ccp-start`, `ccp-env`, `ccp-haiku`, etc.) remain available for manual use or backward compatibility.*

## One-time setup (unchanged)
```bash
cd /Users/m/git/tools/ClaudeCodeProxy
./scripts/install-shell-aliases.sh
exec $SHELL   # or source ~/.zshrc / ~/.bashrc
```
The installer appends the auto-loader for `~/.config/ccc/env` so every new terminal inherits the current shim settings.

## Daily usage
```bash
ccc-on              # start shim, set env for all shells
# ... open new tabs, run claude anywhere ...
claude -p --model haiku "Say ok"
ccc-status          # inspect
ccc-logs            # optional tail
ccc-off             # stop shim when finished
```

## Safety checks
1. `ccc-status` – ensures the shim is running and `ANTHROPIC_BASE_URL` points to it.
2. `ccc-logs` – confirm Haiku traffic lands on ⚡ Z.AI (`"upstream":"zai"`).
3. `ccp-license` – verify license plan features before heavy runs.
4. `cc doctor` / `cc verify` – existing hygiene checks continue to work.

## Edge cases / notes
- **No `claude` CLI installed**: `ccc-on` still succeeds; calling `claude` will error out with guidance to install the CLI.
- **Custom ports**: `ccc-on 8182` writes the env with that port. `ccc-status` and subsequent shells will reflect the change.
- **Manual override**: You can still run `ccstock` or `0c` to bypass the shim temporarily.
- **Environment file location**: `~/.config/ccc/env` becomes the single source of truth (shell loader will respect it).

## Implementation notes
See `docs/Tasks/ccc_zero_touch_routing.md` for historical context and acceptance criteria fulfilled in 2025-10-22 session.
