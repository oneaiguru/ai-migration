# Jury Demo Refresh Tasks (UI Docs)

## Source Transcript References
- `docs/splits/01_00-00_06-41_forecasting_demo.txt`
- `docs/splits/02_06-41_20-05_data_strategy.txt`
- `docs/splits/03_20-05_32-04_regional_examples.txt`
- `docs/splits/04_32-04_45-10_technical_architecture.txt`
- `docs/splits/05_45-10_56-46_product_strategy.txt`

## Demo Scope (Doc Expectations)
- Show site selection with ID + address.
- Side-by-side actual vs forecast graphs for a chosen date window.
- Ability to demonstrate a "data cutoff" (what the system knows up to date X).
- Export path for CSV/Excel and reference to the PDF example.
- Positioning notes: Phase 1 graphs, Phase 2 data collection.

## Tasks
- [x] Add a Jury demo runbook in `START_HERE.md` or a new `JURY_DEMO_RUNBOOK.md`.
- [x] Update `VISUAL_GUIDE.md` with a "Forecast vs Actual" comparison panel reference.
- [x] Document the demo data flow: CSV -> charts -> export (Excel/PDF).
- [x] Add a "data cutoff" explanation (what data is known when the forecast is made).
- [x] Note the 2025 export constraint (Jan-May only; Jun-Dec needed for full-year testing).
- [x] Align notes with `docs/Tasks/PR-UI-1_mytko_stack_forecast_demo.md` (exact MyTKO stack + widget copy).

## Inputs / Dependencies
- Demo data source: `projects/mytko-forecast-demo/public/demo_data/containers_summary.csv`.
- Data ingestion scripts: `projects/forecastingrepo/scripts/convert_volume_report.py`.
