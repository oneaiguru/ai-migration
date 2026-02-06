# Data Inventory (Local, Not Versioned)

This document lists where large/raw inputs are stored locally and how processed CSVs/reports are produced. Raw data must not be committed to Git.

## Raw Inputs (ignored by Git)
- `data/raw/jury_volumes/xlsx/`
  - `Отчет_по_объемам_с_01_01_2023_по_30_06_2023,_для_всех_участков_4.xlsx`
  - `Отчет_по_объемам_с_01_07_2023_по_31_12_2023,_для_всех_участков_2.xlsx`
  - `Отчет_по_объемам_с_01_01_2024_по_30_06_2024,_для_всех_участков_1.xlsx`
  - `Отчет_по_объемам_с_01_07_2024_по_31_12_2024,_для_всех_участков.xlsx`
  - `Отчет_по_объемам_с_01_01_2025_по_31_05_2025,_для_всех_участков.xlsx`
- `data/raw/jury_volumes/csv/`
  - `Отчет_по_объемам_с_01_01_2023_по_30_06_2023,_для_всех_участков_4.csv`
  - `Отчет_по_объемам_с_01_07_2023_по_31_12_2023,_для_всех_участков_2.csv`
  - `Отчет_по_объемам_с_01_01_2024_по_30_06_2024,_для_всех_участков_1.csv`
  - `Отчет_по_объемам_с_01_07_2024_по_31_12_2024,_для_всех_участков.csv`
  - `Отчет_по_объемам_с_01_01_2025_по_31_05_2025,_для_всех_участков.csv`
- `data/raw/jury_volumes/derived/`
  - `jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv` (renamed copy; full‑year 2025 export reportedly fails)
- `data/raw/weather/`
  - Unzip downloaded `wr352420a1.zip` to `data/raw/weather/wr352420a1/`
    (Original download location: Telegram Desktop)
  - Optional: `meteostat_daily_irkutsk_2022_2024.csv`, `stations_meteostat.csv`, ERA5-Land NetCDF
- `data/raw/provenance/`
  - JSON manifests per source (provider, time range, SHA256)

## Site-Level Local Files (ignored by Git)
- `data/sites/sites_service.csv` (covers 2023–2025‑05 after Jan–May 2025 append)
- `data/sites/sites_registry.csv` (address/district + bin metadata; appended with any new 2025 sites)

## Processed (versioned; consumed by code)
- `data/daily_waste_by_district.csv` (current range: 2024)
- `data/monthly_waste_by_district.csv` (current range: 2024)
- `data/monthly_waste_region.csv` (current range: 2024)
- `reports/backtest_real_YYYY-MM-DD/` (scoreboards + SUMMARY)
- `reports/backtest_consolidated_auto/` (consolidated CSV + SUMMARY + PNGs + index.html)

## Produce Processed CSVs from XLSX
```bash
python scripts/ingest_and_forecast.py ingest \
  data/raw/jury_volumes/xlsx/Отчет_по_объемам_с_01_01_2024_по_30_06_2024,_для_всех_участков_1.xlsx \
  data/raw/jury_volumes/xlsx/Отчет_по_объемам_с_01_07_2024_по_31_12_2024,_для_всех_участков.xlsx
```

## Run Backtests and Consolidate
```bash
python scripts/backtest_eval.py --train-until 2024-09-30 \
  --daily-window 2024-10-01:2024-12-31 --monthly-window 2024-10:2024-12 \
  --scopes region,districts --methods daily=weekday_mean,monthly=last3m_mean \
  --actual-daily data/daily_waste_by_district.csv \
  --actual-monthly data/monthly_waste_by_district.csv \
  --outdir reports/backtest_real_2024-09-30

python scripts/eval/concat_scoreboards.py \
  --inputs reports/backtest_real_2024-03-31 reports/backtest_real_2024-06-30 reports/backtest_real_2024-09-30 \
  --outdir reports/backtest_consolidated_auto
```

## Site-Level (future; behind flag)
- Scenario: `scenarios/site_level.yml`
- Data expectations: `docs/data/SITE_DATA_CONTRACT.md`
