# Recipe — UAT Bot Runner (Stub)

_Purpose_: automate fixture-based and optional live UAT checks.

## Fixture Mode
- Run nightly or before session start.
- Commands:
  1. `PYTHONPATH=tracker/src pytest`
  2. `PYTHONPATH=tracker/src behave features`
  3. `PYTHONPATH=tracker/src python -m tracker.cli preview --data-dir data/week0/live --window <fixture-window>`
- Collect output into `reports/uat/<date>_fixture.md`.

## Live Mode (optional)
- Wrap automation scripts (`codex_status.sh`, future Claude wrapper) with `--fixture` fallback.
- Verify `source=automation` snapshots and capture lag metrics.

Document failure handling and escalation in `docs/SOP/scheduling_and_alerts.md` when the bot is implemented.
