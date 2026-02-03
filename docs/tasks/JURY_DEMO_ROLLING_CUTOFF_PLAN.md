# Jury Demo Plan: Rolling Cutoff + Forward Forecast (2025 Jan-May)

## Goal
Deliver a demo where Jury can select any "as-of" date up to 2025-05-31 (the last actual),
then generate forecasts into the future (1 week, 1 month, 6-8 months) and see outputs
for all KP sites, with the UI showing fact vs forecast for a selected KP.

## Why this replaces the full-year 2025 export
- We will not have June-Dec actuals for the next demo.
- The demo must show how the system behaves given only data known up to a chosen cutoff.
- Forecasts beyond the cutoff are still useful for validation once actuals arrive later.

## Required Demo Behavior
1. User selects "Data cutoff" (as-of date) up to 2025-05-31.
2. User selects forecast horizon (7 days / 1 month / 6-8 months).
3. System generates forecasts using ONLY data <= cutoff.
4. UI shows:
   - Fact vs Forecast chart for a selected KP.
   - Exportable CSV (site-level).
   - All-KP summary output (not necessarily rendered as 23k rows, but computed and downloadable).

## Constraints / Assumptions
- Actual data exists only through 2025-05-31.
- Large files are git-ignored (no raw data committed).
- Disk space is tight; avoid large full-year re-merges unless necessary.
- Demo can be read-only and filesystem-backed (same pattern as current API).

## Architecture Plan (High Level)

### 1) Data Layer
- Source: `data/sites/sites_service.csv` (contains 2023-01-01 -> 2025-05-31).
- Registry: `data/sites/sites_registry.csv` for district/address/bin metadata.
- Actuals for chart: derive daily actual volumes from service events for the selected site.

### 2) Forecast Generation (Rolling Cutoff)
- Use `src/sites/baseline.py: estimate_weekday_rates` with `cutoff` and a rolling window (e.g., 56 days).
- Use `src/sites/simulator.py: simulate_fill` to generate `fill_pct` and `pred_mass_kg` for the horizon.
- Convert `pred_mass_kg` to `forecast_m3` (mass/1000) or via vehicle volume if needed.
- Implement caching per cutoff+horizon (e.g., `data/cache/forecast_{cutoff}_{start}_{end}.parquet`, git-ignored).

### 3) API Layer (Read-Only Demo)
- Add an endpoint that accepts:
  - `cutoff_date`, `start_date`, `end_date` (or `horizon_days`)
  - Optional `site_id` (single site) and `format=csv|json`
- If `site_id` is omitted, return summary + download path (or stream CSV) for all sites.
- Ensure the endpoint enforces `cutoff_date <= 2025-05-31`.

### 4) UI Layer
- Extend the UI to send `cutoff_date` + horizon to the API.
- For single KP:
  - Show facts up to cutoff, forecasts after cutoff.
  - Keep fact vs forecast chart and CSV export.
- For all KP:
  - Show summary counts (site count, total forecast volume).
  - Provide CSV download for full site list.

## Detailed Tasks (Implementation Order)

### A) Data + Forecast Engine
1. Add a loader for `data/sites/sites_service.csv` into a DataFrame with `site_id, service_dt, collect_mass_kg, volume_m3`.
2. Implement a helper that returns daily actuals for a given `site_id` and date range.
3. Implement rolling-cutoff forecast for all sites using `baseline.py` + `simulator.py`.
4. Add caching (per cutoff/horizon) under a git-ignored cache directory.
5. Validate:
   - Cutoff <= 2025-05-31
   - Horizon bounds (7, 30, 180, 240 days)
   - Deterministic output for the same cutoff.

### B) API Changes
1. Add a new endpoint (or extend `/api/mytko/forecast`) to accept `cutoff_date`.
2. Return:
   - JSON for single-site forecasts (as today).
   - CSV for all-site forecasts (or a summary + a download URL).
3. Update OpenAPI export in `docs/api/openapi.json` after changes.

### C) Demo UI Changes
1. Add UI controls:
   - "Data cutoff" date picker (limit to 2025-05-31).
   - Horizon selector (1w, 1m, 6m, 8m).
2. Connect to new endpoint parameters.
3. For a selected KP:
   - Split fact vs forecast at cutoff date.
4. For all KPs:
   - Show summary + export button (CSV).

### D) Docs + Runbook
1. Update demo runbook with the rolling-cutoff story and steps.
2. Document the cache + data flow in `docs/System/Demo_Data.md`.
3. Add a short "How to reset caches" note for new agents.

## Acceptance Criteria
- Cutoff date controls the forecast (changing the cutoff changes the outputs).
- Forecast horizon works for at least 7/30/180 days.
- Single-site chart shows fact before cutoff and forecast after cutoff.
- All-site forecasts are produced and exportable.
- No new raw data is committed to git.

## Files New Agent Must Read First
- `HAIKU_FINAL_EXECUTION_TASKS.md`
- `progress.md`
- `docs/splits/01_00-00_06-41_forecasting_demo.txt`
- `docs/splits/02_06-41_20-05_data_strategy.txt`
- `docs/splits/03_20-05_32-04_regional_examples.txt`
- `docs/splits/04_32-04_45-10_technical_architecture.txt`
- `docs/splits/05_45-10_56-46_product_strategy.txt`

## Key Code / Data Files to Review
- `projects/forecastingrepo/scripts/api_app.py`
- `projects/forecastingrepo/src/sites/api_site_forecast.py`
- `projects/forecastingrepo/src/sites/baseline.py`
- `projects/forecastingrepo/src/sites/simulator.py`
- `projects/forecastingrepo/src/sites/schema.py`
- `projects/forecastingrepo/scripts/make_site_forecast_from_actuals.py`
- `projects/forecastingrepo/scripts/create_demo_subset.py`
- `projects/forecastingrepo/docs/System/Demo_Data.md`
- `projects/forecastingrepo/docs/data/JURY_VOLUMES_2025_JAN_MAY.md`
- `projects/mytko-forecast-demo/src/pages/ForecastPage.tsx`
- `projects/mytko-forecast-demo/src/components/ContainerHistoryDialog.tsx`
- `projects/mytko-forecast-demo/src/hooks/useContainerHistory.ts`
- `projects/mytko-forecast-demo/src/api/client.ts`
- `projects/rtneo-ui-docs/JURY_DEMO_RUNBOOK.md`
