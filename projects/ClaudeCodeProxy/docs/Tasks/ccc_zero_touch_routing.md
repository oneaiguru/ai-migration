# Plan: CCC Zero-Touch Routing

## Context
Current workflow still requires per-shell setup (`ccp-env`). We want a “run once” toggle: `ccc-on` starts the shim and any terminal can launch Claude immediately; `ccc-off` reverts to stock.

## Goals
1. Start the Go shim in the background (no dedicated terminal).
2. Export env variables globally via `~/.config/ccc/env` so new shells inherit the correct `ANTHROPIC_BASE_URL` and related vars automatically.
3. Provide explicit toggles (`ccc-on`, `ccc-off`, `ccc-status`, `ccc-logs`, optional `ccc-restart`).
4. Maintain backward compatibility with existing aliases (`ccp-start`, etc.) for manual workflows.
5. Ensure logs respect `CCP_LOGS_DIR` everywhere.

## Implementation Steps
1. **Alias/script updates**
   - Create `ccc-on` (shell function) that:
     - Accepts optional port (default 8082).
     - Starts shim via `scripts/run-go-shim.sh` in background (e.g., `nohup`), stores PID under `~/.config/ccc/shim.pid`.
     - Writes env file `~/.config/ccc/env` with exports:
       ```
       export ANTHROPIC_BASE_URL=http://127.0.0.1:${PORT}
       export CLAUDE_CODE_SUBAGENT_MODEL=haiku
       export CCP_PROFILE=prod
       export CCP_PORT_DEFAULT=${PORT}
       export CCP_LOGS_DIR=...
       ```
     - Sources the env file for the current shell.
   - Create `ccc-off` that stops the shim (reads PID from `~/.config/ccc/shim.pid`), removes it, and writes an env file that unsets the proxy variables.
   - Create `ccc-status` to report whether the shim/listener is active and what env vars are currently exported.
   - Keep `ccp-start` etc., pointing to the new internals (for manual runs).

2. **Installer update**
   - Extend `scripts/install-shell-aliases.sh` to append:
     ```
     [ -f ~/.config/ccc/env ] && . ~/.config/ccc/env
     ```
     to the user's rc file (if not already present).

3. **Env/Log consistency**
   - Verify existing log code (updated already) honors `CCP_LOGS_DIR`.
   - Ensure `ccc-on` sets `CCP_LOGS_DIR` before starting shim.
   - `ccc-logs` tail uses same env.

4. **Documentation**
   - Update `docs/SOP/install-ccc-aliases.md` (add `ccc-on/off/status`).
   - Add new section in `docs/SESSION_HANDOFF.md` referencing the toggle.
   - Ensure `docs/ops/environment-profiles.md` mentions automatic env loading.
   - Link `docs/SOP/proxy-toggle.md` as the user-facing reference.

5. **Testing**
   - Manual: macOS zsh (fresh shell), macOS bash, Ubuntu bash (container). Use `docs/System/quality/ccc-aliases-tests.md` checklist.
   - Ensure `ccc-status` reports correctly before and after toggles.
   - Verify `claude` in a brand-new tab routes through shim without extra commands.

6. **Cleanup**
   - Optionally deprecate now-redundant instructions in SOP once new path is stable.
   - Provide guidance (`ccc-restart`) if we want quick port change.

## Risks / Mitigations
- **Multiple shims**: `ccc-on` should check for existing PID and restart if necessary.
- **Shell portability**: keep scripts POSIX-sh-friendly or provide zsh-specific where needed; document differences.
- **CLI missing**: ensure `ccc-on` prints friendly reminder if `claude` is not installed.

## Acceptance Criteria
- `ccc-on`, `ccc-off`, `ccc-status`, `ccc-logs` available after installer.
- New terminal/tab needs no extra calls; running `claude` hits the shim.
- Logs populate automatically after first request; tail shows `lane:
## Acceptance Criteria
- `ccc-on`, `ccc-off`, `ccc-status`, `ccc-logs` available after running the installer.
- New shell automatically sources `~/.config/ccc/env`; running `claude` hits the shim without manual steps.
- Logs (`usage.jsonl`) populate under the configured `CCP_LOGS_DIR` without touching other directories.
- Backward-compatible aliases (`ccp-start`, etc.) continue to function (documented as manual mode).

## Status
- ✅ 2025-10-22: Zero-touch toggles shipped (`scripts/shell/ccc-aliases.sh`, installer, docs).
- Follow-ups: execute the cross-shell validation matrix (`docs/System/quality/ccc-aliases-tests.md`) and keep manual fallback docs in sync.
