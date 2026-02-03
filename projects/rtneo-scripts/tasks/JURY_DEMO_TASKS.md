# Jury Demo Refresh Tasks (Data Scripts)

## Source Transcript References
- `docs/splits/01_00-00_06-41_forecasting_demo.txt` (Excel/CSV handling, demo graphs)
- `docs/splits/02_06-41_20-05_data_strategy.txt` (2025 data needs, rolling forecasts)

## Tasks
- [x] Confirm baseline datasets: `sites_service.csv` and `containers_long.csv` already cover 2023–2024; only append 2025 data.
- [x] Ingest Jury 2025 Jan-May export into canonical site service CSVs (see `projects/forecastingrepo/scripts/convert_volume_report.py`).
- [x] Document a repeatable pipeline from raw exports -> `data/sites/sites_service.csv` -> demo-ready CSV.
- [x] Add a small wrapper or README note pointing to `convert_volume_report.py` for CSV inputs (since `ingest_jury_volume_excel.py` is XLSX-only).
- [x] Define naming/placement for raw exports (keep under `data/raw/exports/`, git-ignored).
- [x] Add a quick verification step: row count, unique sites, date range coverage.

## Inputs / Dependencies
- Raw export: `data/raw/exports/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv` (git-ignored).
- Disk space required for expanded site/day tables (large).
