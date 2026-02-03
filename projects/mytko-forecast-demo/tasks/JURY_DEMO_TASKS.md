# Jury Demo Refresh Tasks (Mytko Forecast Demo)

## Source Transcript References
- `docs/splits/01_00-00_06-41_forecasting_demo.txt`
- `docs/splits/02_06-41_20-05_data_strategy.txt`
- `docs/splits/05_45-10_56-46_product_strategy.txt`

## Tasks
- [x] Cross-check against `projects/rtneo-ui-docs/docs/Tasks/PR-UI-1_mytko_stack_forecast_demo.md` (FSD + MyTKO widget copy) and decide whether to migrate this demo to the exact MyTKO stack.
- [x] Refresh `public/demo_data/containers_summary.csv` with the latest demo window and representative sites.
- [x] Add a "data cutoff" note or selector to show what data was known at forecast time.
- [x] Ensure side-by-side actual vs forecast charts are prominent (daily/weekly/monthly toggle).
- [x] Add a CSV export action for the currently selected site/date range.
- [ ] Wire rolling-cutoff controls (as-of <= 2025-05-31) + horizon selector to the new API; show fact vs forecast split and all-KP export once backend is ready.

## Decision
- Current demo already matches AntD + MobX; FSD/widget-copy migration is deferred until we have full 2025 data and UI feedback from the next Jury demo.

## Inputs / Dependencies
- Data pipeline: `projects/forecastingrepo/scripts/create_demo_subset.py`.
- Raw site service data: `projects/forecastingrepo/data/sites/sites_service.csv` (git-ignored).
