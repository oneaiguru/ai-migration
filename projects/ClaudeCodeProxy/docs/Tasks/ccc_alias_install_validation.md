# Task: Validate CCC Alias Installer

## Objective
Manually verify `./scripts/install-shell-aliases.sh` on clean environments so that `ccp-start`, `ccp-env`, `ccp-logs`, and `ccp-stop` work without manual sourcing.

## Environments
- macOS (zsh) – new shell, fresh user account recommended.
- macOS (bash) – optional but useful for compatibility.
- Ubuntu 24.x (container or VM) – bash.

## Steps
1. Clone repo or copy to target machine.
2. Run installer (`./scripts/install-shell-aliases.sh`).
3. Restart shell; ensure aliases and the `~/.config/ccc/env` loader are present.
4. `ccc-on` → open a fresh shell to confirm env auto-loads → `ccc-status`.
5. `ccc-logs` (tail), optional prompt (`ccp-haiku "Say ok"`), then `ccc-off`.
6. Confirm manual fallbacks still work (`ccp-start`, `ccp-env`, `ccp-stop`).
## Verification
- `ccc-on` prints shim PID/port and writes `~/.config/ccc/env`.
- New shell shows `ANTHROPIC_BASE_URL` pointing at the shim without manual sourcing.
- First proxied call (e.g., `ccp-haiku "Say ok"`) creates log entries visible in `ccc-logs`.
- `ccc-off` removes the shim listener, clears env vars, and writes an env file with `unset` directives.
- Manual fallback (`ccp-start` / `ccp-env` / `ccp-stop`) continues to function.

## Reporting
Record shell/platform, commands, and any deviations in `docs/SESSION_HANDOFF.md`. Attach log snippets if issues arise.
