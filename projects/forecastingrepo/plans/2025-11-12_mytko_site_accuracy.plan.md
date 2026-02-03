## Metadata
- Task: PR-21 — Site Accuracy Card in MyTKO Demo (`docs/Tasks/PR-21_mytko_site_accuracy.md`)
- Discovery: `scripts/api_app.py:607-763` (accuracy loaders + `/api/mytko/forecast`), `ui/mytko-forecast-demo/src/pages/ForecastPage.tsx:1-220`
- Related docs: PR-20 brief (`docs/Tasks/PR-20_accuracy_ui_proper_calc.md`), desktop mockups (`/Users/m/Downloads/*.png`)

## Desired End State
MyTKO demo (port 5174) displays a fourth statistic card showing site-level WAPE and actual/forecast totals based on the same backtest data that powers `/api/accuracy/sites`. The backend exposes a scoped endpoint delivering those numbers for any demo site/date range, the UI fetches it via a new hook, and tests/builds remain green.

### Key Discoveries
- `scripts/api_app.py:607-695` already loads per-site accuracy from `reports/site_backtest_Q*_2024/site_accuracy.csv`.
- `scripts/api_app.py:698-763` serves `/api/mytko/forecast` without accuracy metadata.
- `ui/mytko-forecast-demo/src/pages/ForecastPage.tsx:1-220` has an obvious slot for another card and already manages date/site state.

## What We're NOT Doing
- No changes to `ui/forecast-ui` (accuracy dashboard).
- No recalculation of WAPE; we reuse the CSVs produced by `scripts/backtest_sites.py`.
- No expansion of the curated demo dataset beyond the current sites unless the accuracy CSV already includes them.

## Implementation Approach
Add a read-only helper endpoint that reuses `load_site_accuracy`, then consume it inside the MyTKO page via a dedicated hook and card. Keep Russian labels and Ant Design styling consistent with the existing cards.

## Phase 1: Backend helper
### Changes Required
1. **File:** `scripts/api_app.py`
   - After the existing `/api/accuracy/sites` definition (~line 649), add helper `def _get_site_accuracy_slice(site_id: str, start: date, end: date)` that loads the appropriate CSV (same as `load_site_accuracy`) and aggregates `actual`, `forecast`, `abs_error`.
   - Expose `@app.get("/api/mytko/site_accuracy")` returning `{site_id, wape, actual_m3, forecast_m3, days}`. Handle missing data gracefully (`wape: None`).
   - Update OpenAPI response models if needed (e.g., add `MyTKOSiteAccuracy` dataclass).
2. **Tests:** extend `tests/api/test_mytko_adapter.py` (or add new file) to hit the endpoint using the sample CSVs under `tests/fixtures/accuracy`.

## Phase 2: Frontend hook
### Changes Required
1. **File:** `ui/mytko-forecast-demo/src/hooks/useSiteAccuracy.ts` (new)
   - `export function useSiteAccuracy(siteId: string, start: string, end: string)` that fetches `/api/mytko/site_accuracy?...`.
   - Return `{data, loading, error}`; memoize payload so the card updates only when inputs change.

## Phase 3: Forecast page UI
### Changes Required
1. **File:** `ui/mytko-forecast-demo/src/pages/ForecastPage.tsx`
   - Import the new hook and call it after `useContainerHistory`.
   - Add a fourth `<Col span={8}>` card in the stats row showing:
     - `Statistic title="Точность (WAPE)" value={data ? `${(data.wape*100).toFixed(1)}%` : '—'}`
     - A small caption `Факт: … м³ / Прогноз: … м³`.
   - Optional: pass accuracy info into `ContainerHistoryDialog` so the modal footer includes WAPE.

## Tests & Validation
- `python scripts/export_openapi.py --write && python scripts/export_openapi.py --check`
- `pytest tests/api/test_mytko_adapter.py` (plus any new backend tests)
- `cd ui/mytko-forecast-demo && npm run build`
- Manual: `bash scripts/dev/start_stack.sh` → `http://127.0.0.1:5174` with `site_id=38117820`, `2024-07-01…2024-07-07`. Verify WAPE card and dialog still function.

## Rollback
- Remove the new endpoint block from `scripts/api_app.py` and rerun `python scripts/export_openapi.py --write`.
- Delete `ui/mytko-forecast-demo/src/hooks/useSiteAccuracy.ts` and revert changes to `ForecastPage.tsx`.
- Clean up any added tests/fixtures.

## Handoff
- Document implementation + validation steps in `docs/SESSION_HANDOFF.md`.
- Mention regenerated demo data if additional sites were added.
