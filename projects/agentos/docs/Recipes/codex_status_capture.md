# Recipe — Codex Status Capture

## Why
Automate `/status` capture to avoid manual copy/paste and enforce ADR-004 lag buffer.

## Steps
1. Seed session if needed (script does this automatically, but you can run `codex exec "hi"` to be safe).
2. Capture pane + ingest:
   ```bash
   scripts/automation/codex_status.sh \\
     --phase before \\
     --window W0-TEST \\
     --pipe-alias os \\
     --data-dir data/week0/live \\
     --buffer-seconds 0
   ```
   - For an AFTER snapshot, omit `--buffer-seconds 0` so the default 300s lag applies.
   - During tests use `--fixture tests/fixtures/automation/codex_status_after.txt` to avoid live Codex calls.
3. Validate the ingest: `python -m tracker.cli preview --data-dir data/week0/live --window W0-TEST`
   - When calling the wrapper outside the tracker venv, export `PYTHONPATH=tracker/src` (the script does this automatically).

## Edge Cases
- Reset minute: script sleeps `--buffer-seconds` (default 300) before capturing AFTER / CROSS panes.
- Multiline panes: script keeps the most recent `/status` block; if Codex returns multiple panes it emits them sequentially to STDOUT.
- Optional: add a simple lock file (e.g., `/tmp/tracker-codex.lock`) before automation to avoid `launchd` colliding with manual runs; exit with a friendly message if the lock exists.

## Related
- Backlog: `docs/Backlog/codex_event_sink.md`, `docs/Backlog/reset_edge_guardrails.md`
- Feature: `features/tracker_automation.feature`
- See also: `docs/System/schemas/universal_provider_schema.md`, `docs/System/stats/ci_acceptance.md`, `docs/System/experiments/templates.md`
