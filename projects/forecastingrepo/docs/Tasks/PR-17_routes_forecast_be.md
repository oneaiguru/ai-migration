# PR-17 — Routes Forecast Endpoint (Scout → Planner → Executor)

Role & Scope
- Role: BE agent (start as Scout, then Planner; execute after plan is accepted).
- Scope: Backend-only; add a new read-only endpoint to expose per-route forecasts for a selected date/policy. Keep current contracts intact elsewhere. Include OpenAPI and tests.

Objective
- Add GET `/api/routes/{route_id}/forecast` with `date` (required) and `policy` (strict|showcase, default=strict). Return json/csv with per-stop forecasts: `site_id, address?, eta?, fill_pct, overflow_prob, pred_volume_m3?, last_service_dt?`.

Required Reading (read in full)
- Coordinator & SOP
  - reviews/COORDINATOR_DROP/README.md:1 — cURLs, acceptance bullets
  - reviews/DEMO_FREEZE.md:1 — quick verify block + openapi check
- API code & tests
  - scripts/api_app.py:1 — existing FastAPI app, response models, routes
  - scripts/export_openapi.py:1 — spec export & `--check`
  - tests/api/test_api_app.py:1 — api smoke tests
  - specs/bdd/features/api_*_smoke.feature:1 — Behave smokes (@smoke)
- Review packs
  - reviews/20251105/backend_api/{0_submission,1_feedback,2_followup}
  - reviews/NOTES/api.md:1 — past API notes

Deliverables (BE)
- Endpoint
  - Path: `/api/routes/{route_id}/forecast`
  - Query: `date=YYYY-MM-DD` (required), `policy=strict|showcase` (default=strict), `format=json|csv` (optional)
  - JSON payload: array of `RouteStopForecast` with fields:
    - `site_id: str`, `address?: str`, `eta?: str (HH:MM)`
    - `fill_pct: float`, `overflow_prob: float`, `pred_volume_m3?: float`, `last_service_dt?: str`
  - CSV server-first; ensure DictWriter used
- OpenAPI
  - Add component schema `RouteStopForecast`
  - Add path item with parameters and two `text/csv` and `application/json` responses
- Tests
  - tests/api/test_api_routes_forecast.py — pytest: 200 OK, JSON array, row has required keys; CSV non-empty
  - specs/bdd/features/api_routes_forecast_smoke.feature — Behave @smoke: 200 OK and ≥1 row; CSV header present
- Export
  - Update docs/api/openapi.json via `python scripts/export_openapi.py --write`; `--check` in CI remains green

Acceptance
- `GET /api/routes/R001/forecast?date=2024-08-03` returns ≥1 row with `site_id, fill_pct, overflow_prob`
- `...&format=csv` returns non-empty CSV; header includes `site_id,fill_pct,overflow_prob`
- OpenAPI includes `/api/routes/{route_id}/forecast` and `RouteStopForecast`
- Behave @smoke for forecast passes locally

Validation
- Export spec: `python scripts/export_openapi.py --write && python scripts/export_openapi.py --check`
- Unit: `pytest -q`
- Behave: `behave --tags @smoke --no-capture --format progress`

Plan (Planner → Executor)
1) Scout
- Read Required Reading; confirm current response models and CSV helpers
2) Planner
- Decide on data source (reuse existing routes CSV/JSON + site join); prototype row mapping; define ETA handling (optional, safe to omit)
- Define Pydantic model `RouteStopForecast`
3) Executor
- Implement endpoint in scripts/api_app.py
- Add pytest + Behave smokes
- Export OpenAPI; re-run DEMO_FREEZE cURLs

Notes
- Follow existing CSV DictWriter + per-IP rate-limit patterns
- Keep `policy` semantics aligned with `/api/routes`
