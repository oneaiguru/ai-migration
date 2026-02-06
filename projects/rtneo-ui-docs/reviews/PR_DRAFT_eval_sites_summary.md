Title: feat(eval-sites): site-level WAPE summary; simulator reset (flagged); NaN guards

Summary
- Add Overall site WAPE (Σ|err|/Σ|actual|) and Median per-site WAPE to the evaluation summary for S6 clarity.
- Gate a simple 98% near-capacity reset heuristic in the simulator behind a scenario flag (default OFF).
- Add NaN guards in baseline weekday-rate fallback to avoid NaN propagation in sparse cases.
- Evaluation-only changes: no model/pipeline defaults are altered.

Files
- scripts/backtest_sites.py: Aggregate + median per-site additions
- src/sites/simulator.py: near-capacity reset flag (default OFF)
- src/sites/baseline.py: NaN guards in fallback
- scenarios/site_level.yml: `reset_on_near_capacity: false` default
- docs/System: updated runbook and API endpoints notes

Acceptance
- SUMMARY.md includes Overall site WAPE and Median per-site WAPE.
- Simulator does not reset by default; when the flag is enabled, it resets after ~98% fill.
- No changes to default forecast outputs; all existing specs remain green.

Checks
- pytest tests/sites -q
- smoke backtest via scripts/backtest_sites.py and scripts/ingest_and_forecast.py
