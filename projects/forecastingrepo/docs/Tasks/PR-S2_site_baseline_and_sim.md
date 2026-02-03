# PR‑S2 — Site baseline + inventory simulation (flagged) — add new outputs; default remains unchanged

## Goal
For each site, estimate daily deposit rate (weekday means over last 56 days before cutoff); simulate fill trajectory with emptying events and output:
- `forecasts/sites/daily_fill_YYYY-MM-DD_to_…csv`
  - site_id,date,fill_pct,pred_volume_m3,overflow_prob

## Method
- Baseline: weekday_mean over last 56d; require ≥N obs per weekday (e.g., 4); fallback overall_mean_56d
- Simulation:
  - `fill_t = max(0, fill_{t-1} + deposit_rate_t*bin_volume - pickup_t)`
  - When service occurs (historical backtest) or planned (what‑if), set `pickup_t = min(fill_t, capacity)`
  - Overflow if `fill_t/capacity > threshold` (e.g., 0.8)
- Risk (overflow_prob): if we keep point forecast only at first, set as 0/1; later add uncertainty by weekday stddev window

## Wiring
- Extend CLI: `--scopes sites` and `--scenario-path scenarios/site_level.yml` (default OFF; no golden change)
- Modules:
  - `src/sites/baseline.py` (deposit estimator)
  - `src/sites/simulator.py` (inventory/reset math)
- Tests:
  - `tests/sites/test_site_baseline.py` — weekday means window, fallback
  - `tests/sites/test_simulator.py` — capacity reset, threshold crossings, negative‑safe
- Spec: `specs/bdd/features/site_baseline.feature` (SITE-BSL-001) and `specs/bdd/features/site_simulator.feature` (SITE-SIM-001)

## Outputs
- `forecasts/sites/...` (new subfolder)
- `qa/sites_checks.json` — coverage (% of sites with predictions), dupes=0, nonnegative, reconciliation placeholder

---