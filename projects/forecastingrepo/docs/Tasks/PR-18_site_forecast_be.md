# PR-18 — Site Forecast API

## Scope
- Add `GET /api/sites/{site_id}/forecast` returning daily forecast points for a given site and window.
- Keep contracts consistent with existing API; typed responses; OpenAPI export/CI check.

## API design
- **Path:** `/api/sites/{site_id}/forecast`
- **Query params:**
  - `window` (string, `YYYY-MM-DD:YYYY-MM-DD`) **or** `days` (int; default 7; counts backward from `metrics.demo_default_date`).
- **200 OK body:** array of objects
  ```json
  {
    "date": "2024-08-03",
    "pred_volume_m3": 123.4,
    "fill_pct": 0.82,
    "overflow_prob": 0.67,
    "last_service_dt": "2024-07-31"
  }
  ```

## Implementation anchors
- `scripts/api_app.py`: add route + pydantic models.
- `src/sites/schema.py`: add model `SiteForecastPoint`.
- `src/sites/baseline.py` or pipeline util: compute or read demo forecasts per site/day.
- `scripts/export_openapi.py`: include new path.

## Tests
- **Unit:** `tests/api/test_site_forecast_v1.py`.
- **Behave smoke:** `specs/bdd/features/site_forecast_smoke.feature`
  - Steps: reuse `specs/bdd/steps/api_smoke_steps.py`.
  - Check JSON is array; items contain keys `date`, `pred_volume_m3` **or** `fill_pct`.

## Docs & reviews
- Update `reviews/DEMO_FREEZE.md` (add curl block).
- Add note in `reviews/NOTES/api.md`.
- Flat bundle attachments after landing:
  - `reviews/ATTACH_REVIEWERS/BE_BACKEND_API/00_README_BE_BACKEND_API.md` (append section).
  - `reviews/ATTACH_REVIEWERS/BE_BACKEND_API/openapi.json` (exported).

## Acceptance
- cURL:
  ```bash
  BASE=...
  curl -fsS "$BASE/api/sites/S001/forecast?window=2024-08-01:2024-08-07" | jq '.[0:3]'
  ```
- CI green: `pytest -q`, `behave --tags @smoke`, `python scripts/export_openapi.py --check`.

## Commands
```bash
python scripts/export_openapi.py --write
pytest -q
behave --tags @smoke --no-capture --format progress
python scripts/export_openapi.py --check
```

## Data note
- If real per-site daily forecasts are not persisted yet, derive demo responses from the site/day outputs used by `/api/sites` for the chosen window; otherwise serve a small fixture for the demo window while wiring the real pipeline post-demo.
