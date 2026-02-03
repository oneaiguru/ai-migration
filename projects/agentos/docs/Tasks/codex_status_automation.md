# Task: Automate Codex /status Capture via Shell (2025-10-19)

## Objective
Collect Codex `/status` panes without manual interaction by scripting the Codex CLI. Output should be suitable for alias ingestion (`os`, `occ`) and archival logging.

## Current Manual Flow
1. Create a workspace-specific temp directory (e.g., `~/Stuff/Tools/codex-status/<project>`).
2. Run `codex exec "hi"` inside the directory to bootstrap a session (Codex CLI requires a prompt before `/status` is available).
3. Resume the most recent session (`codex resume --last`), wait ~5 seconds for the welcome pane, send `/status`, then `/quit` to exit while keeping the pane visible.

## Implementation (2025-10-20)
- Script lives at `scripts/automation/codex_status.sh`.
- Options: `--phase`, `--window`, `--pipe-alias`, optional `--fixture`, `--data-dir`, `--state-dir`, `--buffer-seconds`, and `--notes`.
- Captures `/status` (or replays a fixture), prints the pane to STDOUT, then pipes it into `python -m tracker.cli alias …` with `--source automation` so snapshots are tagged correctly.
- Automatically seeds Codex sessions via `codex exec "hi"` and honours ADR-004 by waiting `buffer-seconds` (defaults to 300; fixtures override with `--buffer-seconds 0`).
- Sets `PYTHONPATH` to include `tracker/src` so the CLI entry point is resolved without a virtualenv activate step.

### Usage Example
```
scripts/automation/codex_status.sh \
  --phase before \
  --window W0-TEST \
  --pipe-alias os \
  --data-dir data/week0/live \
  --buffer-seconds 0
```

## Open Questions
- Validate behaviour when multiple Codex sessions are active (does `codex resume --last` always select the intended pane?).
- Decide on long-term log destination for captured panes (`data/week0/live/automation/` vs workstation-specific tmp dirs).
- Determine scheduling approach (manual trigger vs `launchd` wrapper) once we harden retries.

## Next Actions
- [x] Prototype the automation script and validate capture fidelity against manual `/status` panes.
- [x] Pipe captured output through tracker alias (`os/oe`) and tag snapshots with `source=automation` (Behave coverage in `features/tracker_automation.feature`).
- [ ] Document and script the launchd/Keyboard Maestro trigger sequence once scheduling requirements are finalised.
