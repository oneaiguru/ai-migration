# PR: API Sites v1 (Read‑only per‑site endpoints)

Goal
- Deliver a production‑like, read‑only API powering the UI demo without changing pipeline behavior.
- Serve per‑site data from existing CSV artifacts (sites behind flags), with filtering, pagination, and CORS.

Scope (files)
- scripts/api_app.py (extend endpoints; add CORS, ENV config, pagination)
- tests/api/test_api_app.py (smokes + filters + 404 + pagination)
- docs/System/API_Endpoints.md (keep frozen shapes + params)
- Make target: `make run-api` (or document uvicorn command)

Endpoints (extend current frozen v0)
- GET `/api/sites?date=YYYY-MM-DD&district=<id>&limit=200&offset=0[&format=csv]`
  - Returns: `site_id, district, date, fill_pct, overflow_prob, pred_volume_m3, last_service_dt?`
- GET `/api/site/{site_id}/trajectory?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - Returns daily points with same fields; 404 on unknown site
- GET `/api/routes?date=YYYY-MM-DD&policy=strict|showcase[&format=csv]`
  - Enrich with `volume_m3` and `schedule` columns (UI parity)
- Existing:
  - GET `/api/metrics[?format=csv]`, `/api/districts[?format=csv]`

Infra & Config
- CORS: allow Vercel origin (env `API_CORS_ORIGIN`), default `*` in dev
- ENV:
  - `REPORTS_DIR` (default `reports/backtest_consolidated_auto`)
  - `SITES_DATA_DIR` (default `reports/sites_demo` or latest delivery)
  - `DELIVERIES_DIR` (optional, fallback search for latest run)

Pagination
- Implement `limit` + `offset` for `/api/sites`
- Add `X-Total-Count` header

Tests
- Smoke: 200 + minimal JSON schema for each endpoint
- Filters: `/api/sites?date=..&district=..` reduce set
- Pagination: total header + page sizes
- 404 site on trajectory

Acceptance
- pytest PASS; spec_sync/docs_check OK; coverage unchanged or up
- curl works:
  - `curl "$API/api/metrics"`
  - `curl "$API/api/districts"`
  - `curl "$API/api/sites?date=2024-08-03&district=D1&limit=50"`
  - `curl "$API/api/site/S123/trajectory?start=2024-08-01&end=2024-08-07"`
  - `curl "$API/api/routes?date=2024-08-03&policy=strict"`

Constraints
- No pipeline writes; reads only from existing CSVs
- Sites remain behind flag; default district/region outputs and golden remain unchanged

Estimate
- Effort: ~0.5–0.8× S6 (smaller than S6; mostly wiring + tests)
- Risks: CORS config correctness, file path variability (mitigated by ENV + fallbacks)

Notes
- Keep CSV download parity using `?format=csv`
- Document env in README/Runbook; bootstrap can start API (`START_API=1`)
