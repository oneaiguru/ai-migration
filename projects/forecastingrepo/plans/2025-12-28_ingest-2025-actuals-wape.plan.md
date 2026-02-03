## Metadata
- Task: Ingest Jan-May 2025 actuals + recompute WAPE for Jan-May 2025
- Source: Claude plan in chat (2025-12-28)
- Repo: projects/forecastingrepo
- Owner: Codex
- Created: 2025-12-28

## Desired End State
- 2025 actuals ingested into `data/sites/sites_service.csv` and `data/sites/sites_registry.csv`
- Jan-May 2025 WAPE computed (delta method) and recorded in `jury_blind_forecast/wape_result.txt`
- `HANDOFF_JURY_DELIVERY.md` and `jury_blind_forecast/README.txt` updated to reflect self-validation
- `jury_blind_forecast_delivery.zip` repackaged with updated contents
- Verification report completed

## Inputs / Outputs
- Input actuals report: set `SOURCE_FILE` to the CSV under `/Users/m/Downloads/data` matching `*2025*`
- Predictions: `jury_blind_forecast/validation_jan_may_2025.csv`
- Jury forecast: `jury_blind_forecast/forecast_jun_dec_2025.csv`
- Outputs: `data/sites/sites_service.csv`, `data/sites/sites_registry.csv`, `jury_blind_forecast/wape_result.txt`,
  `jury_blind_forecast/README.txt`, `HANDOFF_JURY_DELIVERY.md`, `jury_blind_forecast_delivery.zip`

## Task Tracker
- [x] 1) Pre-flight: confirm source file, scripts, and prediction files exist
- [x] 2) Ingest 2025 actuals into `data/sites/sites_service.csv` + `data/sites/sites_registry.csv`
- [x] 3) Verify ingestion (row counts, date range, 2025 breakdown)
- [x] 4) Compute Jan-May 2025 WAPE (delta method) + capture metrics
- [x] 5) Update deliverables: `jury_blind_forecast/wape_result.txt`, `HANDOFF_JURY_DELIVERY.md`,
      `jury_blind_forecast/README.txt`
- [x] 6) Repackage `jury_blind_forecast_delivery.zip` (decide contents)
- [x] 7) Run final verification checks and fill report

## Commands (Reference)
- Locate source file:
  - `SOURCE_FILE="$(rg --files -g '*2025*' /Users/m/Downloads/data | head -1)"`
  - `ls -la "$SOURCE_FILE"`
- Ingest actuals:
  - `python scripts/convert_volume_report.py --input "$SOURCE_FILE" --output-service data/sites/sites_service.csv --output-registry data/sites/sites_registry.csv`
- Ingestion verification:
  - `python - <<'PY'`
  - `import pandas as pd`
  - `df = pd.read_csv('data/sites/sites_service.csv', on_bad_lines='skip')`
  - `print(f'Total rows: {len(df):,}')`
  - `print(f'Date range: {df.service_dt.min()} to {df.service_dt.max()}')`
  - `df_2025 = df[df.service_dt >= '2025-01-01']`
  - `print(f'2025 rows: {len(df_2025):,}')`
  - `PY`
- WAPE calculation (delta method): use the scripted one-off in the session notes and capture output.
- ZIP extraction check (non-destructive):
  - `tmpdir="$(mktemp -d)"`
  - `unzip -q jury_blind_forecast_delivery.zip -d "$tmpdir"`
  - `ls -la "$tmpdir"`

## Verification Report (Fill In)
============================================
VERIFICATION REPORT: Jan-May 2025 Ingestion
============================================

1. DATA INGESTION
   - Source file: [x] Found and readable
   - Rows ingested: 1,042,648
   - Date range after: 2024-07-01 to 2025-05-31
   - 2025 rows: 1,042,648

2. SITE MATCHING
   - Prediction sites: 22,048
   - 2025 actual sites: 23,805
   - Overlap: 21,690 (98.4%)

3. WAPE CALCULATION
   - Method: Delta (forecast diff between service events)
   - Merged rows: 1,032,283
   - WAPE: 29.49%
   - Within 20%: 53.3%

4. DELIVERABLES
   - wape_result.txt: Updated
   - README.txt: Updated
   - ZIP file: Created (51 MB)

5. ISSUES FOUND
   - None

6. RECOMMENDATION
   - Ready to send (Jury validates Jun-Dec only)
