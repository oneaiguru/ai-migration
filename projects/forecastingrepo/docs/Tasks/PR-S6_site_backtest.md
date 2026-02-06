# PR-S6: Site-level Backtests

Read First
- docs/System/Onboarding.md
- docs/System/Testing.md
- docs/System/Spec_Sync.md
- docs/System/CI_CD.md
- docs/System/Golden_Bump.md
- docs/System/documentation-index.md (links to S-series)

Goal
- Evaluate per-site accuracy using current flagged forecast (sites CSV) and service actuals.
- No pipeline behavior changes; sites remain behind flags; golden baseline unchanged.

CLI
```
python scripts/backtest_sites.py \
  --train-until 2024-09-30 \
  --daily-window 2024-10-01:2024-12-31 \
  --monthly-window 2024-10:2024-12 \
  --sites-registry data/sites/sites_registry.csv \
  --sites-service  data/sites/sites_service.csv \
  --use-existing-sites-csv deliveries/.../forecasts/sites/daily_fill_2024-10-01_to_2024-12-31.csv \
  --outdir reports/site_backtest_2024-09-30
```

Actuals
- Service-day pickup mass per site: (site_id, service_dt) -> collect_volume_m3
- Monthly actuals = sum by (site_id, year_month)

Joins & Metrics
- Daily join: (site_id, date)
- Monthly join: (site_id, year_month)
- EPS = 1e-9 for safe denominators; metrics: WAPE (primary), SMAPE, MAE

Determinism
- Set PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 in tests/CI.

Outputs
- reports/site_backtest_<cutoff>/
  - scoreboard_site_daily.csv   (site_id,date,actual,forecast,wape,smape,mae)
  - scoreboard_site_monthly.csv (site_id,year_month,actual,forecast,wape,smape,mae)
  - SUMMARY.md                  (quantiles, counts)

Specs/Tests
- specs/bdd/features/site_backtest.feature (SITE-BT-DAILY-001, SITE-BT-MONTHLY-001)
- tests/sites/test_backtest_sites_unit.py (metric math, joins)
- tests/sites/test_backtest_sites_e2e.py (determinism, schemas)

Acceptance
- Files created and non-empty; schemas exact
- Determinism: identical hashes on repeat
- Default outputs unchanged (sites remain behind flag)

Notes
- This helper accepts an existing sites forecast CSV to avoid invoking the pipeline.
- If needed later, extend to call the forecast CLI with sites enabled via scenario.
