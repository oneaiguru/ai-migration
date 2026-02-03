# Session Handoff: 2025-12-28

## Summary
Completed data investigation, WAPE calculation, and symlink fixes. Forecast regeneration produced identical output (expected - see explanation below).

---

## What Was Accomplished

### ✅ Data Tasks
- Ingested Jan-May 2025 actuals (1,042,648 rows)
- Merged into canonical: 5,641,700 rows total (2023-2025)
- Fixed symlinks to point to canonical file
- Created SOP: `docs/SOP/DATA_SOURCES.md`

### ✅ WAPE Calculation
- **WAPE: 29.49%** (Jan-May 2025, delta method)
- Within 20%: 53.3%
- Sites validated: 21,690

### ✅ Jury Delivery Package
- `jury_blind_forecast_delivery.zip` (51MB) contains:
  - `forecast_jun_dec_2025.csv` (5M rows, Jun 1 - Dec 31, 2025)
  - `README.txt`
  - `wape_result.txt`

### ⚠️ Forecast Regeneration Result
Regeneration produced **identical output** - this is EXPECTED because:
- Model uses 56-day trailing window (April-May 2025)
- Both old and new data sources had this window
- Adding 2023-2024 doesn't affect the trailing window for cutoff=2025-05-31

**The original forecast is VALID** - no action needed.

---

## Files Created/Modified

| File | Status |
|------|--------|
| `docs/SOP/DATA_SOURCES.md` | Created - data locations |
| `docs/Notes/2025-12-28_data_investigation_report.md` | Updated |
| `docs/Notes/2025-12-28_cached-swinging-waterfall_report.md` | Created |
| `HANDOFF_JURY_DELIVERY.md` | Updated with canonical verification |
| `jury_blind_forecast/wape_result.txt` | Updated (29.49%) |
| `jury_blind_forecast_delivery.zip` | Ready for Jury |

---

## Verification Checklist for Next Agent

### Data Verification
```bash
cd /Users/m/ai/projects/forecastingrepo
python -c "
import pandas as pd
df = pd.read_csv('data/sites/sites_service.csv', on_bad_lines='skip')
print(f'Rows: {len(df):,}')
print(f'Date range: {df.service_dt.min()} to {df.service_dt.max()}')
"
```
**Expected:** 5,641,700 rows, 2023-01-01 to 2025-05-31

### ZIP Verification
```bash
unzip -l jury_blind_forecast_delivery.zip
cat jury_blind_forecast/wape_result.txt
```
**Expected:** 3 files, WAPE 29.49%

### Symlinks Verification
```bash
ls -la data/sites/
```
**Expected:** Symlinks to `/Users/m/git/clients/rtneo/forecastingrepo/data/`

---

## What's Ready for Jury

1. **Send:** `jury_blind_forecast_delivery.zip` (51MB)
2. **Message template in:** `HANDOFF_JURY_DELIVERY.md`
3. **Internal validation:** WAPE 29.49% (Jan-May 2025)

---

## Canonical Data Location (Single Source of Truth)

```
/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv
  - 5,641,700 rows
  - 2023-01-01 to 2025-05-31
  - By year: 2023 (2.1M), 2024 (2.5M), 2025 (1.0M)
```

Symlinks in project point here. See `docs/SOP/DATA_SOURCES.md` for details.

---

## Pending (Optional)

1. **Commit changes** - Files are modified but not committed
2. **Send to Jury** - ZIP is ready
3. **Await Jury's Jun-Dec WAPE** - Our target: <20%

---

## Notes on Model Behavior

The forecast model uses a **56-day trailing window** for rate estimation. This means:
- For cutoff 2025-05-31, only April-May 2025 data affects predictions
- Historical 2023-2024 data is NOT used for this cutoff
- Regenerating with "more data" produces identical output
- This is deterministic and expected behavior

If longer historical windows are desired, the model algorithm would need modification (out of scope).
