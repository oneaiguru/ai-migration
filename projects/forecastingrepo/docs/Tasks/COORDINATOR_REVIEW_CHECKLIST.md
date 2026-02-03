# Coordinator Review Checklist (Eval Bundle)

1) Gates (should pass quickly):
 - `pytest -q --cov=scripts --cov-report=term-missing`
 - `python .tools/spec_sync.py`
 - `python .tools/docs_check.py`

2) Accuracy sanity:
 - Open each `reports/backtest_*/SUMMARY.md` and the consolidated `SUMMARY.md`.
 - **Region monthly WAPE** around one band; no absurd spikes.
 - **District micro**: reasonable tails; worst districts listed.

3) Plots:
 - `hist_region.png` — one tight hump; no massive skew.
 - `hist_district_micro.png` — heavier tail OK, but within expectations.

4) Provisional thresholds:
 - `docs/contract/thresholds_provisional.md` shows:
   - p50/p70/p90 for region and district‑micro,
   - Suggested **T₁** = ceil(p70_region + 2pp),
   - Suggested **T₂** = ceil(p70_district_micro + 3pp),
   - Commit SHA + scoreboard file hashes.

5) Red flags (ask for rerun if any):
 - Region WAPE > 30% on many months,
 - District micro with overly heavy tail (>45–50% too often),
 - QA inconsistencies (NaN/inf, mismatched row counts).

---
