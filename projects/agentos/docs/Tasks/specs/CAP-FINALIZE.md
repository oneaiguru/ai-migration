Title: CAP-FINALIZE — Finalize windows with quality/outcome

What to change
- Ensure `tracker complete` persists `quality_score`, `outcome`, and provider deltas; preview reflects the outcome.

Acceptance
1) Ingest before/after for codex.
2) Run `tracker complete --window W0-FIN --codex-features 2 --quality 1.0 --outcome pass`.
3) `windows.jsonl` shows `quality_score` and `outcome`; `preview --window` prints the line.

Commands
```
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> ingest codex --window W0-FIN --phase before --stdin < tests/fixtures/codex/alt_reset_64_0.txt
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> ingest codex --window W0-FIN --phase after  --stdin < tests/fixtures/codex/wide_status_82_1.txt
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> complete --window W0-FIN --codex-features 2 --quality 1.0 --outcome pass
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> preview --window W0-FIN
```

Links
- Capability map: `docs/System/capability_map/agentos/capabilities.csv`
