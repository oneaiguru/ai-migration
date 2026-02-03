# PR‑15 — Rolling‑origin backtests (consolidated accuracy)

## Goal
Add a driver to run multiple cutoffs and aggregate WAPE/SMAPE/MAE across windows and levels. Produce one consolidated scoreboard to support contract thresholds T₁/T₂.

## Deliverables
- scripts/backtest_rolling.py
  - Args: --cutoffs 2024-03-31,2024-06-30,2024-09-30
          --monthly-windows 3m   (or explicit list)
          --scopes region,districts
          --methods daily=weekday_mean,monthly=last3m_mean
          --actual-daily PATH --actual-monthly PATH
          --outdir reports/backtest_rolling_<ts>
- Outputs:
  - `reports/backtest_rolling_*/scoreboard_consolidated.csv` with columns:
    [cutoff, level, district_or_region, horizon, year_month|date, actual, forecast, wape, smape, mae]
  - `reports/backtest_rolling_*/SUMMARY.md` with percentile table (p50/p70/p90) for:
    - region monthly WAPE
    - district‑micro monthly WAPE
- DO NOT change forecast code; reuse `backtest_eval.py` under the hood (subprocess or import).

## Tests
- Unskip BT‑RO‑001 in `tests/specs/test_scenario_plugin_shells.py`.
- Add `tests/backtest/test_backtest_rolling.py`:
  - Tiny synthetic CSV fixtures.
  - Run 2–3 cutoffs; assert consolidated CSV exists + schema + nonnegativity; check determinism.

## Acceptance criteria
- pytest/spec_sync/docs_check green; coverage passes.
- One CSV and one MD summary with percentiles are produced.
- No changes to baseline forecasts.

## Notes
- This PR enables locking T₁/T₂ from real distributions (see Accuracy Lock runbook).

