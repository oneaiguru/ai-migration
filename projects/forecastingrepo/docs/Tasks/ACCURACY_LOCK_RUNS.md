# Accuracy Lock — how we set T₁/T₂

## Purpose
Define a repeatable procedure to compute region and district‑micro monthly WAPE distributions and choose T₁/T₂ for the contract addendum.

## Steps (now, before PR‑15)
1) Run three cutoffs with existing tool (already merged):
   - 2024‑03‑31 → windows 2024‑04..06
   - 2024‑06‑30 → windows 2024‑07..09
   - 2024‑09‑30 → windows 2024‑10..12
2) Concatenate the three `scoreboard_monthly.csv`.
3) Compute distributions:
   - Region monthly WAPE (all points) → candidate T₁ = ceil(p70 + 2 pp).
   - District‑micro monthly WAPE → candidate T₂ = ceil(p70 + 3 pp).
4) Record provisional thresholds in `docs/contract/thresholds_provisional.md` with data hashes and commit SHA.

## Steps (after PR‑15)
1) Run `scripts/backtest_rolling.py` for the same (or extended) set of cutoffs.
2) Use consolidated CSV to recompute percentiles; confirm or adjust T₁/T₂.
3) Freeze final thresholds in `docs/contract/thresholds_final.md` and reference them in the **Accuracy Addendum**.

## Notes
- Keep zero‑denominator handling (EPS) consistent with `backtest_eval.py`.
- Exclude months with extremely low actual tonnage if agreed (e.g., < 5t).
- Never change baseline forecasts in these PRs; thresholds are for the **addendum**, not for golden updates.

