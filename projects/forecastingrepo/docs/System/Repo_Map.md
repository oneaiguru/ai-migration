# Repository Map & Review Bundle Coverage

This map summarizes key code areas and which review bundle contains them.

## Core Pipeline (Core_Pipeline_Review)
- src/sites/
  - baseline.py — weekday rates (S2)
  - simulator.py — fill trajectory (S2)
  - reconcile.py — reconcile sites→district (S3)
  - schema.py — dataclasses + validators
- scripts/ingest_and_forecast.py — Phase‑0 CLI, QA, region=sum(districts)

## API Layer (API_Layer_Review)
- scripts/api_app.py — read‑only endpoints (JSON+CSV); CORS; ENV
- tests/api/*.py — smokes for endpoints, filters, pagination, trajectory 404

## Backtesting & Metrics (Backtesting_and_Metrics_Review)
- scripts/backtest_eval.py — district/region joins, WAPE/SMAPE/MAE
- scripts/backtest_sites.py — site‑level scoreboards, summary
- tests/backtest/*.py — unit metrics, CLI errors, determinism

## Config & Schema (Config_and_Schema_Review)
- scenarios/*.yml — flags + params (sites behind flag)
- specs/overview/*.md — architecture/overview
- docs/data/*.md — data contracts

## Remaining Code (Rest_Code_Bundle)
- scripts/routes_recommend.py — D‑day policy helper (S4; flagged)
- scripts/quicklook_report.py — quick visualization
- scripts/weather_join_local.py — local weather join (dev)
- scripts/eval/*.py — consolidation utilities
- scripts/bootstrap*.sh, scripts/make_eval_bundle.sh — setup/build helpers
- scripts/dev/*, scripts/health/* — dev/tunnel/health scripts
- src/plugins/** — future plugin stubs
- src/__init__.py
- tests/routes/*, tests/scripts/*, tests/sites/*, tests/viz/*, tests/unit/* — additional tests not in focused bundles
- requirements*.txt — dev dependencies

## Notable Artifacts (not code)
- reports/backtest_consolidated_auto/ — gallery, histograms, consolidated CSV
- reports/sites_demo/ — demo sites & routes CSVs + QA

## Notes
- Sites path remains behind a flag; default forecasts unchanged.
- API is read‑only; CSV downloads preferred; JSON-to-CSV fallback exists in UI.
- Determinism: set PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8.
