## PR‑17 — Routes Forecast Table (UI + API)

### Summary
Build the production implementation of the “Routes with forecast” table shown in `ui/forecast-ui/ux-agent-inputs/routes-forecast-prototype.html`. Dispatchers must be able to:

* Choose a **route** and **date window** (default: next service day).
* See the top sites on that route with **actual volume (past days)**, **forecast fill %**, **overflow risk badge**, and **last service date**.
* Sort / filter by risk so they can reprioritise pickups.

The UX mocks are now populated with **real August 1–7 2024** data (see `routes_before.html`, `routes_after.html`, and `routes_data_notes.md`). This task bridges those mocks into the React app and adds the minimal API contract the UI will consume.

### Context & Inputs
* Backend aggregates + forecast slices already exist via:
  * `scripts/convert_volume_report.py`
  * `scripts/make_site_forecast_from_actuals.py`
  * `scripts/backtest_sites.py`
* Real data bundle (`per_site_accuracy_bundle.zip`) includes raw XLSX → CSV conversions and quarter scoreboards.
* The UI currently renders `Routes` as cards (no risk columns); the new spec calls for a compact table with progress bars and badges.

### Deliverables
1. **UI feature**
   * Update `src/data/metrics.ts` to expose typed `SiteWithForecast`.
   * Implement `Routes` table with the columns defined in the mock:
     - №, site ID, address, volume (m³), schedule, fill %, risk badge, last service.
   * Add **route selector** (dropdown or autocomplete) and **date selector** (defaults to tomorrow). Both propagate to the forecast hook.
   * Highlight rows with `overflow_risk >= 0.8`.
   * Sorting toggle: `По умолчанию` vs `По риску переполнения`.
   * Responsive layout (table scrolls horizontally on narrow screens).
   * Reuse shared components (TanStack Table / existing table styles if available). If standalone, place in `src/components/RoutesTable.tsx` with matching tests.

2. **API support**
   * New read-only endpoint `GET /api/routes/{route_id}/forecast?date=YYYY-MM-DD`.
     - Response shape:
       ```json
       {
         "route_id": "462",
         "effective_date": "2024-08-07",
         "sites": [
           {
             "site_id": "38101499",
             "address": "Олонская, 11",
             "district": "Левый берег",
             "volume_m3": 1154.7,
             "schedule": "Пн, Чт",
             "fill_pct": 0.99,
             "overflow_risk": 0.99,
             "last_service": "2024-08-07",
             "pred_volume_m3": 76109.5
           },
           ...
         ]
       }
       ```
     - Backend can serve this from the precomputed CSVs (fallback) until the live forecast pipeline outputs the exact schema.
   * Update `docs/api/openapi.json` and `docs/System/API_Endpoints.md`.
   * Provide fixture JSON for UI tests (`src/mocks/route_forecast.json`).

3. **Documentation & QA**
   * Update `docs/System/Forecasting_UI.md` with a “Routes Forecast” section.
   * Add a story/workflow note in `ui/forecast-ui/ux-agent-inputs/routes_data_notes.md` referencing the new API.
   * Cypress or Playwright E2E scenario: user opens Routes, selects route/date, verifies at least one high-risk badge is shown and the API call succeeded.

### Implementation Plan (UI)
1. Add the data model + mock data guard in `src/data/metrics.ts`.
2. Create `src/hooks/useRouteForecast.ts` (TanStack Query preferred).
3. Refactor `src/components/Routes.tsx` to:
   * Render the table.
   * Wire selectors to `useRouteForecast`.
   * Handle loading + empty states (skeleton row).
4. Style updates: extend `src/index.css` or component-level Tailwind classes per `ROUTES_IMPLEMENTATION.md`.
5. Unit test coverage (`src/components/__tests__/RoutesTable.forecast.test.tsx`).

### Implementation Plan (API)
1. Add route forecast service combining:
   * Route registry (existing route metadata).
   * Forecasted fill (CSV or in-memory aggregator).
2. Implement FastAPI endpoint + pydantic model.
3. Integrate with OpenAPI export + Behave smoke test:
   ```
   curl -fsS "$API_BASE/api/routes/462/forecast?date=2024-08-07"
   ```
4. Unit test in `tests/api/test_api_routes_forecast.py`.

### Testing Checklist
- [ ] UI snapshot + interactive tests (sorting, highlight, badge classes).
- [ ] API integration test returns 200 with mocked data.
- [ ] Playwright run updates golden screenshot/verification.
- [ ] Smoke command added to `reviews/NOTES/api.md`.

### Acceptance Criteria
* Route selector + date selector fetch forecasts via the new API.
* Table shows columns exactly as the mock (fill bar, risk badge, last service).
* High-risk rows labelled and sorted first by default.
* API documented and available in OpenAPI.
* Regression tests passing (`npm test`, `npm run lint`, `npm run build`).
* Coordinator drop updated with new UI screenshots + API curl outputs.

### References
* `ui/forecast-ui/ux-agent-inputs/routes_after.html` (real August data).
* `ui/forecast-ui/ux-agent-inputs/routes_data_notes.md` (data generation steps).
* `scripts/convert_volume_report.py` / `scripts/make_site_forecast_from_actuals.py`.

