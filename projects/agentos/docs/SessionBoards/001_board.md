# Session Board — Brief #1

## UAT Opener
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-21`
- Contracts: verify non-negative deltas and recorded `reset_at` in `data/week0/live/*.jsonl`
- Ledgers: confirm `docs/Ledgers/Token_Churn_Ledger.csv` and `docs/Ledgers/Feature_Log.csv` exist + writable

## Must-Ship
1. Schema + tool version stamping on all records — ✅ added schema/tool metadata via JsonlStore stamp + pytest coverage.
2. Claude automation wrapper — ✅ new `scripts/automation/claude_monitor.sh` with Behave scenario + fixture support.
3. Live ccusage daily/weekly capture + preview integration — ✅ ingested daily JSON output + weekly backfill; preview now shows scope + reset info.
4. Preview audit line — ✅ snapshot list now prints sources + notes for audit trail.

## Ready Next
- [x] Stats/CI in preview — expose efficiency, CI, n, power (gate when n < 3).
- [x] Outcome & quality capture — record `quality_score` + `outcome` at finalize and display in preview.
- [x] UPS v0.1 cross-links — align Contracts, Recipes, and backlog references to the UPS field list.

## Stretch
- Deliverables bundle (manual checklist or helper script).
- Docs/wiki sync for automation + alias usage.
- Draft scheduler standing jobs overview if time remains.

## Validation Matrix
- Unit tests: `PYTHONPATH=tracker/src pytest`
- BDD: `PYTHONPATH=tracker/src behave features`
- Preview: `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-21`
- Aliases: `os/oe/ox`, `as/ae/ax`, `zs/ze/zx`
- Recipes: `docs/Recipes/ccusage_ingest.md`, `docs/Recipes/codex_status_capture.md`, `docs/SOP/deliverables_bundle_checklist.md`
