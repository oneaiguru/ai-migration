# Data Sources SOP

**Last Updated:** 2025-12-31

---

## Canonical Data Location (Single Source of Truth)

All processed service history data lives here:

```
/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv
/Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv
```

**Current Status:**
- **sites_service.csv**: 5,641,701 rows (2023-01-01 to 2025-05-31)
- **sites_registry.csv**: 26,217 sites with metadata
- **Last Updated**: 2025-12-30 (rebuilt from 2023-2024 exports + 2025 Jan-May)

### Latest Canonical Build (2025-12-30)

Command:
```bash
python3.11 scripts/convert_volume_report.py \
  --input /Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/csv/*.csv \
  --output-service /Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv \
  --output-registry /Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv
```

Results:
- sites_service.csv: 5,641,701 rows; date range 2023-01-01 to 2025-05-31; 25,583 sites
- sites_registry.csv: 26,217 rows

---

## Source Archive (Original Jury Exports)

Working copies (git-ignored) live in:

```
/Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/xlsx/
/Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/csv/
/Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/derived/
```

`derived/` holds renamed copies used by scripts; ingest from `csv/` to avoid duplicates.

Original Jury exports are archived in:

```
/Users/m/git/clients/rtneo/_incoming/xls_YYYYMMDD_HHMMSS/files/
```

**Contents (current):**
- 2023 H1/H2 (XLSX + CSV copy)
- 2024 H1/H2 (XLSX + CSV copy)
- 2025 Jan-May (XLSX + CSV export)
- Future ingests follow same pattern

---

## Symlinks (Project Integration)

The project directory uses symlinks to the canonical data:

```
/Users/m/ai/projects/forecastingrepo/data/sites/sites_service.csv
  → /Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv

/Users/m/ai/projects/forecastingrepo/data/sites/sites_registry.csv
  → /Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv
```

These ensure the project always uses the canonical data without duplication.

---

## Data Coverage

| Period | Rows | Source | Status |
|--------|------|--------|--------|
| 2023 (Jan-Dec) | 2,146,193 | H1+H2 XLSX | ✅ Complete |
| 2024 (Jan-Dec) | 2,452,859 | H1+H2 XLSX | ✅ Complete |
| 2025 (Jan-May) | 1,042,648 | CSV export | ✅ Complete |
| 2025 (Jun-Dec) | — | Not available | ⏳ Jury to provide |

**Total**: ~5.6M rows spanning 2.5 years

---

## Ingestion Process

When new data arrives from Jury:

1. **Archive Original**
   ```bash
   mkdir -p _incoming/xls_$(date +%Y%m%d_%H%M%S)/files/
   cp <jury_export> _incoming/xls_$(date +%Y%m%d_%H%M%S)/files/
   ```

2. **Copy to Working Raw Folder**
   ```bash
   cp <jury_export>.xlsx /Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/xlsx/
   cp <jury_export>.csv /Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/csv/
   ```

3. **Run Ingestion Script**
   ```bash
   python scripts/convert_volume_report.py \
     --input <path_to_export> \
     --output-service data/sites_service.csv \
     --output-registry data/sites_registry.csv
   ```

3. **Verify**
   ```bash
   python -c "
   import pandas as pd
   df = pd.read_csv('data/sites_service.csv', on_bad_lines='skip')
   print(f'Rows: {len(df):,}')
   print(f'Date range: {df.service_dt.min()} to {df.service_dt.max()}')
   print(f'Sites: {df.site_id.nunique():,}')
   "
   ```

4. **Document**
   - Update this SOP if date range or row count changes significantly
   - Record ingest in session notes

---

## What NOT to Do

❌ **Don't:**
- Create new copies of sites_service.csv elsewhere
- Modify canonical file directly (use ingestion script)
- Keep data in subdirectories like `data/sites/` (only canonical location)
- Edit registry file manually

✅ **Do:**
- Always ingest through the script
- Archive source files
- Use symlinks from project directory
- Document changes

---

## Cleanup Policy

**Keep permanently:**
- `/Users/m/git/clients/rtneo/forecastingrepo/data/` (canonical)
- `/Users/m/git/clients/rtneo/_incoming/` (source archive)
- `/Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/` (working raw copies)
- Symlinks in project directory

**Delete after verification:**
- Redundant copies in demo/report directories
- Old archive folders in `_move_back/`
- Temporary processing directories

---

## Test Data Usage

- Unit tests should use fixtures or temp files, not the canonical datasets.
- Integration runs for rolling forecast require the full datasets and are opt-in:
  - `RUN_SLOW_TESTS=1 python3.11 -m pytest -q tests/api/test_rolling_forecast_endpoint.py`
- For fast local runs, point the loader at small fixtures:
  - `export SITES_SERVICE_PATH=/path/to/fixture_sites_service.csv`
  - `export SITES_REGISTRY_PATH=/path/to/fixture_sites_registry.csv`

---

## Related Files

- **Forecasts**: `/Users/m/ai/projects/forecastingrepo/jury_blind_forecast/`
- **WAPE Results**: `jury_blind_forecast/wape_result.txt` (29.49% for Jan-May 2025)
- **Delivery Package**: `jury_blind_forecast_delivery.zip` (Jury validation)
- **Investigation Report**: `docs/Notes/2025-12-28_data_investigation_report.md`
