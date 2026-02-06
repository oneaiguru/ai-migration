# PR-21 — Site Accuracy Card in MyTKO Demo

## Summary
Add per-site WAPE context to the Ant Design demo at `ui/mytko-forecast-demo` so Jury sees both the container forecast trajectory and the accuracy (same metric as the accuracy dashboard on port 4173). This reuses the existing quarterly backtest CSVs and API loaders introduced in PR‑20.

## Current State
- Backend accuracy endpoints live in `scripts/api_app.py:607-695`. They already read `reports/site_backtest_Q*_2024/site_accuracy.csv` via `load_site_accuracy(...)`, but `/api/mytko/forecast` (lines 698‑763) returns only forward-looking points.
- The MyTKO UI (`ui/mytko-forecast-demo/src/pages/ForecastPage.tsx:1-220`) renders three statistic cards (volume, weight, busy days) plus the forecast table/dialog, all powered by `/api/mytko/forecast` and the static `public/demo_data/containers_summary.csv`. There is no hook for accuracy data.
- Screenshot reference `/Users/m/Downloads/3833da88-a1ba-435e-a543-31ea4d8941a4.png` shows the desired fourth card slot where WAPE should appear.

## Requirements
1. **Backend helper endpoint**
   - Create a lightweight adapter (e.g., `/api/mytko/site_accuracy`) that accepts `site_id`, `start_date`, `end_date`.
   - Reuse `load_site_accuracy` or the CSV loaders from PR‑20 to fetch rows for the requested site/date window. Aggregate actual/forecast totals and compute WAPE (`abs_error_sum / actual_sum`).
   - Return JSON `{site_id, wape, actual_m3, forecast_m3, days}`. If no data, return `wape: null` with zeros.
2. **Frontend hook**
   - New file `ui/mytko-forecast-demo/src/hooks/useSiteAccuracy.ts` that calls the endpoint when `store.siteId`, `store.startDate`, or `store.endDate` change.
   - Expose `{data, loading, error}` to consumers.
3. **UI updates**
   - In `ForecastPage.tsx`, import the hook and render a fourth Ant Design `<Card>` alongside the existing stats (lines 216‑220). Display WAPE as a percentage and the totals (`Факт / Прогноз`), following the Russian labels + color cues (green for <15%, yellow otherwise).
   - Optional: show WAPE inside `ContainerHistoryDialog` footer for continuity.
4. **Validation**
   - `python scripts/export_openapi.py --write && python scripts/export_openapi.py --check`
   - `pytest tests/api/test_mytko_adapter.py` (extend if necessary) + targeted frontend build `cd ui/mytko-forecast-demo && npm run build`.
   - Manual smoke: `bash scripts/dev/start_stack.sh` → verify site `38117820` (2024‑07‑01→2024‑07‑07, vehicle 22 m³) now shows WAPE card with realistic %; dialog still loads.

## Constraints
- Keep scope limited to the curated demo sites/date windows; accuracy endpoint can read the same CSVs without touching the full 4.6 M-row history.
- Maintain Russian labels and color scheme from the MyTKO mockups.
- Do not modify `ui/forecast-ui`; this task is demo-only.

## References
- Backend accuracy loader: `scripts/api_app.py:607-695`.
- MyTKO forecast API: `scripts/api_app.py:698-763`.
- Forecast page layout: `ui/mytko-forecast-demo/src/pages/ForecastPage.tsx:1-220`.
- Container history dialog: `ui/mytko-forecast-demo/src/components/ContainerHistoryDialog.tsx` (for optional WAPE footer).
