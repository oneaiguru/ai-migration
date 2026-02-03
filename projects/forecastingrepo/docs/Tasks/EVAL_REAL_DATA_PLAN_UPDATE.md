# Evaluation Plan Update — Diff vs Coordinator Brief

## Summary
- We follow the coordinator’s steps (branch, gates, three backtests, consolidate to thresholds, build ZIP).
- We are splitting the provided tmp script blob into three proper files:
  - `scripts/eval/concat_scoreboards.py` (Python)
  - `scripts/make_eval_bundle.sh` (Bash)
  - `scripts/bootstrap_eval.sh` (Bash)
- To avoid adding heavy deps, the Python aggregator implements a stdlib fallback when pandas/numpy are unavailable.

## Differences vs Coordinator Proposal
- Aggregator implementation:
  - Coordinator version uses pandas+numpy only. Our version first tries pandas/numpy; if not present, falls back to CSV + pure-Python math and still writes SUMMARY and PNGs via matplotlib (Agg).
  - Output schema/paths are the same; thresholds computed identically (T₁=ceil(p70+2pp), T₂=ceil(p70+3pp)).
- Packaging script:
  - Matches the brief’s include/exclude sets and writes a MANIFEST with HEAD SHA.
- Data handling:
  - We keep real XLSX and any weather ZIP strictly outside Git (per policy). Docs point to local paths and where to extract (data/raw/**).

## What Will Be Run (after PR is opened)
1) Ingest XLSX → CSV actuals (already verified locally).
2) Run three backtests with real CSVs under `data/`.
3) Run `scripts/eval/concat_scoreboards.py` to write consolidated outputs and `docs/contract/thresholds_provisional.md`.
4) Run `scripts/make_eval_bundle.sh` to produce `~/Downloads/eval_bundle_YYYYMMDD_HHMM.zip`.

## No Behavior Changes
- Forecast pipeline code untouched; GOLD baseline remains unchanged.
- This work is analysis + packaging only.

