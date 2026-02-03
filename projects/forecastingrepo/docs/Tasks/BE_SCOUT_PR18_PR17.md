# BE Scout Plan — PR‑18 (Site Forecast API) and PR‑17 (Routes Forecast BE)

Role & guardrails
- Role: BE Scout → Planner handoff for two small, read‑only APIs.
- Demo freeze: no baseline forecast changes, no behavior change to existing endpoints; typed responses; OpenAPI + tests green.

What exists today (anchors)
- `scripts/api_app.py` — FastAPI app with existing read‑only routes: `/api/metrics`, `/api/districts`, `/api/sites`, `/api/site/{site_id}/trajectory`, `/api/routes`.
- `docs/api/openapi.json` — exported spec (no site_forecast or routes/{route_id}/forecast paths yet).
- `tests/api/` — smoke tests for the current endpoints.
- `specs/bdd/features/api_*_smoke.feature` — Behave smokes for metrics/sites/routes.
- Evidence: `reviews/NOTES/api.md` (latest curls), `reviews/DEMO_FREEZE.md` (quick verify block).

Read first (full)
- Repo docs: docs/Tasks/BE_START_HERE.md, docs/Tasks/NEXT_AGENT_BRIEF.md, reviews/DEMO_FREEZE.md, docs/System/Review_Pack.md, docs/adr/DECISIONS_INDEX.md
- Task specs: docs/Tasks/PR-18_site_forecast_be.md, docs/Tasks/PR-17_routes_forecast_be.md
- CE skills (external): ~/pack/wiki_main_additions/wiki/ContextEngineering/Skills/ReviewProcess/{SKILL.md,Templates/General/{CHECKS,MANIFEST,INBOUND_INDEX}.md}; …/ReviewProcess_RTNEO/{SKILL.md,Templates/be/{CHECKS,MANIFEST}.md}

Runtime prerequisites
- Stable BASE (tunnel) available and recorded in: AGENTS.md, reviews/DEMO_FREEZE.md, reviews/README_STATUS.md.
- CORS allowlist includes https://mytko-forecast-ui.vercel.app.
- Deterministic env: PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg.

Scope A — PR‑18 Site Forecast API (read‑only)
- Endpoint: GET `/api/sites/{site_id}/forecast` with either:
  - `window=YYYY-MM-DD:YYYY-MM-DD` OR `days=int` (default 7 from metrics.demo_default_date).
- Response (JSON array): `{ date, pred_volume_m3, fill_pct, overflow_prob, last_service_dt }`.
- Data source (demo): reuse existing site/day forecast CSV for the window (or derive from sites dataset used by /api/sites).

Files to touch
- scripts/api_app.py — add route + pydantic model(s) + CSV/JSON dual format.
- src/sites/schema.py — `SiteForecastPoint` dataclass/model (date, floats, optional last_service_dt).
- scripts/export_openapi.py — include new path in OpenAPI export.
- tests/api/test_site_forecast_v1.py — 200 OK, JSON array; minimal schema checks.
- specs/bdd/features/site_forecast_smoke.feature — @smoke: ≥1 item, keys present.
- reviews/DEMO_FREEZE.md — add curl block; reviews/NOTES/api.md — paste curls.

Acceptance
- cURL: `curl -fsS "$BASE/api/sites/S001/forecast?window=2024-08-01:2024-08-07" | jq '.[0]'` shows required keys.
- CI: `pytest -q`, `behave --tags @smoke`, `python scripts/export_openapi.py --check` green.
- No diffs to existing endpoints’ shapes.

Risks & mitigations
- Window parsing: validate formats; fall back to `days` when `window` absent. Add 400 on invalid.
- Data gaps: if the demo CSV lacks rows for the window, return empty array (200) — document in README.
- Performance: demo slice only (≤ 7 days). Avoid loading full history into memory.

Scope B — PR‑17 Routes Forecast (backend support)
- Endpoint: GET `/api/routes/{route_id}/forecast?date=YYYY-MM-DD[&format=json|csv]`.
- Response: array of `{ site_id, address?, volume_m3?, schedule?, fill_pct, overflow_prob, pred_volume_m3?, last_service_dt? }`.
- Data source (demo): join existing route‑day recommendations + site/day forecast slice for the given date; serve CSV via DictWriter and JSON.

Files to touch
- scripts/api_app.py — route + model `RouteStopForecast`.
- src/sites/schema.py — add model/class for route stop forecast.
- scripts/export_openapi.py — add path + components.
- tests/api/test_api_routes_forecast.py — basic JSON + CSV smoke.
- specs/bdd/features/api_routes_forecast_smoke.feature — @smoke scenario.
- reviews/DEMO_FREEZE.md / reviews/NOTES/api.md — add curls.

Acceptance
- cURL JSON: `curl -fsS "$BASE/api/routes/462/forecast?date=2024-08-03" | jq '.[0]'` shows keys.
- cURL CSV: `curl -fsS "$BASE/api/routes/462/forecast?date=2024-08-03&format=csv" | head -n1` has header `site_id,fill_pct,overflow_prob`.
- OpenAPI includes the new path + components.

Risks & mitigations
- Route coverage: if a route_id has no stops in the demo dataset, return empty array (200).
- CSV parity: ensure `csv.DictWriter` header order matches UI expectations; add test asserting header keys.
- Consistency: keep `policy` semantics aligned with existing `/api/routes` (strict/showcase); for forecast path, start with `strict` only.

Packaging (per SKILL)
- Canonical: `reviews/YYYYMMDD/N_followup/outbound/` one zip per bundle:
  - `backend_api_pack_YYYYMMDD.zip` containing updated code, tests, OpenAPI, Behave log, and a short README with curls.
- Optional flat mirrors (for chat reviewers):
  - `reviews/ATTACH_REVIEWERS/backend_api/` — exact copies of code + evidence.
- Intake index: add rows to `reviews/YYYYMMDD/N_followup/inbound/INBOUND_INDEX.md` when receiving feedback; rename to `N_DONE` on acceptance.

Planner handoff — exact to‑dos
1) Implement PR‑18 endpoint + tests + OpenAPI; run `pytest -q`, `behave --tags @smoke`, `export_openapi.py --check`; paste curls into `reviews/NOTES/api.md`.
2) Package `backend_api_pack_YYYYMMDD.zip` under the round’s `outbound/` and (optionally) mirror flat copies.
3) Implement PR‑17 BE, repeat tests/OpenAPI/curls, package the updated API bundle.
4) Update `docs/SESSION_HANDOFF.md` with what landed and the new curls; update `reviews/README_STATUS.md`.

Definition of done (per endpoint)
- New path present in `docs/api/openapi.json` with typed components.
- Unit and Behave smoke tests pass locally and in CI.
- CURLs in `reviews/DEMO_FREEZE.md` and `reviews/NOTES/api.md` return non‑empty arrays for the demo date/window.

Commands (paste‑ready)
```bash
# OpenAPI + tests
python scripts/export_openapi.py --write
pytest -q
behave --tags @smoke --no-capture --format progress
python scripts/export_openapi.py --check

# Curls (after endpoints land)
BASE="<TRY_CLOUDFLARE_BASE>"
curl -fsS "$BASE/api/sites/S001/forecast?window=2024-08-01:2024-08-07" | jq '.[0]'
curl -fsS "$BASE/api/routes/462/forecast?date=2024-08-03" | jq '.[0]'
curl -fsS "$BASE/api/routes/462/forecast?date=2024-08-03&format=csv" | head -n1
```

Notes
- Keep all behavior read‑only; do not change golden outputs.
- Prefer small Pydantic models that mirror existing shapes; reuse CSV helpers with DictWriter.
- Leave the tunnel BASE and UI env consistent with `reviews/DEMO_FREEZE.md`.
