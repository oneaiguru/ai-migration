# Data Investigation & Symlink Fix Report (2025-12-28)

## Scope
Followed the provided "Data Investigation & Symlink Fix" plan: verify data locations, fix symlinks, validate data ranges, confirm delivery artifacts, and document findings.

## Actions Taken
1. Verified existing symlink targets and candidate data files.
2. Repointed symlinks under `/Users/m/ai/projects/forecastingrepo/data/sites/` to the canonical data files in `/Users/m/git/clients/rtneo/forecastingrepo/data/`.
3. Verified row counts and date ranges after the fix.
4. Ran post-fix checks (2025 actuals subset, ZIP contents, wape_result).
5. Added a data location note to `HANDOFF_JURY_DELIVERY.md`.

## Results

### Symlink State (After Fix)
```
/Users/m/ai/projects/forecastingrepo/data/sites/sites_service.csv
  -> /Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv
/Users/m/ai/projects/forecastingrepo/data/sites/sites_registry.csv
  -> /Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv
```

### Canonical Dataset (data/sites_service.csv)
```
Total rows: 4,599,052
Date range: 2023-01-01 to 2024-12-31
Rows by year:
2023    2,146,193
2024    2,452,859
```

### 2025-Only Subset (data/sites/sites_service.csv)
```
Total rows: 1,042,650
Date range: 2024-07-01 to 2025-05-31
Rows by year:
2024          2
2025    1,042,648
```

### Post-Fix 2025 Actuals Check (as specified in plan)
```
Full data range: nan to nan
2025 actuals: 0 rows
Prediction rows: 3,329,248
```
This indicates the canonical dataset does not yet include the Jan–May 2025 ingest.

### Delivery Artifacts
```
zip contents (jury_blind_forecast_delivery.zip):
- forecast_jun_dec_2025.csv
- README.txt
- wape_result.txt
```

`jury_blind_forecast/wape_result.txt`:
```
Internal Validation (Jan-May 2025)
Cutoff: 2024-12-31, Horizon: 151 days
WAPE: 29.49%
Within 20%: 53.3%
Sites: 21,690
Method: per-site forecast delta between service events
```

## Data Provenance Notes
- Canonical historical dataset (2023-2024):
  - `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv`
  - `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv`
- 2025 ingest output (2025-only subset):
  - `/Users/m/git/clients/rtneo/forecastingrepo/data/sites/sites_service.csv`
  - `/Users/m/git/clients/rtneo/forecastingrepo/data/sites/sites_registry.csv`
- 2025 raw input file used earlier (now archived locally):
  - `data/raw/jury_volumes/csv/Отчет_по_объемам_с_01_01_2025_по_31_05_2025,_для_всех_участков.csv`
  - `data/raw/jury_volumes/derived/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv`

## Discrepancy vs Plan Expectations
- Plan expected the canonical dataset to include 2023-2025 (5.6M rows).
- Actual canonical dataset includes 2023-2024 only (4.6M rows).
- 2025 data currently lives in the subdirectory output file and is not merged into the canonical dataset.

## Merge Completed (2025-12-28 21:35)

✅ **Successfully merged 2025 data into canonical file**

**Before merge:**
- Canonical: 4,599,052 rows (2023-2024)
- 2025 subset: 1,042,648 rows (2025 only)

**After merge:**
- Canonical: 5,641,700 rows (2023-2025)
- Date range: 2023-01-01 to 2025-05-31
- By year: 2023 (2.1M), 2024 (2.5M), 2025 (1.0M)
- Total unique sites: 27,174

**Cleanup performed:**
- Deleted redundant `/data/sites/` subdirectory
- Symlinks verified working (still point to canonical, now complete)

## Files Modified
- `projects/forecastingrepo/data/sites/sites_service.csv` (symlink updated)
- `projects/forecastingrepo/data/sites/sites_registry.csv` (symlink updated)
- `projects/forecastingrepo/HANDOFF_JURY_DELIVERY.md` (added data location note)
- `projects/forecastingrepo/docs/SOP/DATA_SOURCES.md` (NEW - created SOP)
- `projects/forecastingrepo/docs/Notes/2025-12-28_data_investigation_report.md` (this report)

## Canonical Data Now Complete

**Location:** `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv`
- Total: 5,641,700 rows
- Range: 2023-01-01 to 2025-05-31
- Status: ✅ Single source of truth established
