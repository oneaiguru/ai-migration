# Read-only API Endpoints (Frozen v0)

Contract: read-only, filesystem-backed. No pipeline side effects. Sites remain behind flags.

OpenAPI: `docs/api/openapi.json` (regenerate via `python scripts/export_openapi.py --write`).

- GET `/api/metrics` [optional `?format=csv` or `Accept: text/csv`]
  - Source: `reports/backtest_consolidated_auto/metrics_summary.json`
  - JSON: `{ "region_wape": {"p50":...,"p75":...,"p90":...}, "district_wape": {...}, "demo_default_date": "YYYY-MM-DD" }`
  - CSV: `level,p50,p75,p90` (2 rows)

- GET `/api/districts` [optional `?format=csv` or `Accept: text/csv`]
  - Source: `reports/backtest_consolidated_auto/scoreboard_consolidated.csv`
  - JSON: `[ {"district":"...","smape":float}, ... ]` (top 50 by SMAPE)
  - CSV: `district,smape`

- GET `/api/sites?date=YYYY-MM-DD[&limit=N][&format=csv]` (or set `Accept: text/csv`)
  - Source: latest `reports/sites_demo/daily_fill_*.csv` (or delivery path)
  - JSON: `[ {"site_id":"...","district":"...","date":"YYYY-MM-DD","fill_pct":float,"overflow_prob":float,"pred_volume_m3":float}, ... ]`
  - CSV: `site_id,district,date,fill_pct,overflow_prob,pred_volume_m3`
  - Headers: `X-Total-Count`, `X-Unmapped-Sites`

- GET `/api/routes?date=YYYY-MM-DD&policy=strict|showcase[&format=csv]` (or set `Accept: text/csv`)
  - Source: `reports/sites_demo/routes/recommendations_<policy>_<date>.csv`
  - JSON: `[ {"site_id":"...","date":"YYYY-MM-DD","policy":"...","visit":0|1,"volume_m3":float|null,"schedule":"...","fill_pct":float|null,"overflow_prob":float|null,"last_service_dt":"YYYY-MM-DD"|null}, ... ]`
  - CSV: `site_id,date,policy,visit,volume_m3,schedule,fill_pct,overflow_prob,last_service_dt`

## CSV Semantics
- Content negotiation: either append `?format=csv` or set header `Accept: text/csv`.
- CSVs are generated with Python `csv.DictWriter` (quoted/escaped; Excel injection-safe).
- Headers:
  - `Content-Type: text/csv; charset=utf-8`
  - `/api/sites` also returns `X-Total-Count` for paging.

Notes
- Determinism: ensure `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8` in dev and CI.
- Security: no secrets; no writes; only reads local artifacts.
- Configuration (future): allow `SITES_DATA_DIR` to override demo path.
