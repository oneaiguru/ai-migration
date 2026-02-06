# CCC Alias Installer – Test Checklist

## Shell coverage
| Shell | Platform | Steps |
|-------|----------|-------|
| zsh   | macOS (primary) | 1. Fresh shell (`exec $SHELL`).<br>2. `./scripts/install-shell-aliases.sh`.<br>3. Confirm blocks appended to `~/.zshrc` (alias loader + env loader).<br>4. Restart shell and run `ccc-on`, open a new tab to confirm env auto-loads, run `ccc-status`, `ccc-logs`, `ccc-off`. |
| bash  | macOS (optional) | Same as above but with `SHELL=/bin/bash`. Ensure installer appends to `~/.bashrc`. |
| bash  | Ubuntu (Docker) | Use container (`docker run -it --rm ubuntu:24.04`).<br>Install dependencies (`apt-get update && apt-get install -y curl git make python3`).<br>Clone repo, run installer, verify alias block in `~/.bashrc` and commands succeed (shim build may require extra packages). |

## Acceptance
- `ccc-on` exits 0 and prints the shim port/pid.
- New shell prints `ANTHROPIC_BASE_URL=http://127.0.0.1:<port>` without manual sourcing.
- `ccc-logs` tails the profile-specific log path.
- `ccc-off` removes the pid file and clears env vars; new shells show `unset` for `ANTHROPIC_BASE_URL`.
- `ccc-status` reflects shim running/not running in both states.

## Negative tests
- Remove `CLAUDE_CODE_SUBAGENT_MODEL` after `ccc-on` to ensure the env file re-exports it.
- Run `ccp-haiku` before `ccc-on` → expect failure (documented behavior).
- Temporarily move `claude` CLI out of PATH and confirm `ccp-start` still runs; `ccp-haiku` emits a friendly CLI-not-found error.

## Automation backlog
- `make test-aliases` runs `scripts/tests/ccc-aliases-smoke.sh` (local shim start/stop) — keep expanding to cover Linux/macOS runners.
- Future enhancement: detect missing `claude` CLI and print guidance.
