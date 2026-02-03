# Recipe — Session Hooks (start_window / close_window)

_Stub: fill once automation wrappers are implemented._

## start_window.sh
- Capture BEFORE snapshots (`os`, `as`, `zs`) and seed state/locks.
- Log command output to `data/automation/logs/start_window.log`.

## close_window.sh
- Enforce ADR-004 lag before AFTER capture (`oe`, `ae`, `ze`).
- Finalize window (`tracker complete`), run preview, update ledgers.

Update this recipe when the scripts land; reference in scheduling SOP and UAT opener.
