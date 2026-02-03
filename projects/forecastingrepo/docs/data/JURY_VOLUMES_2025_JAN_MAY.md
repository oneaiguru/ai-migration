# Jury Volume Export (2025‑01‑01 → 2025‑05‑31)

## Context (source message)

> Jury Gerasimov, [03.12.2025 18:05]  
> вполне

> Jury Gerasimov, [04.12.2025 21:45]  
> привет  
> выгрузить объемы за весь 2025 не получается, кидает ошибку. получилось сделать с января по май включительно

English summary:
- "All good."
- "Hi. Exporting volumes for all of 2025 fails with an error. I was able to export January through May (inclusive)."
- We still need the remaining months of 2025 for testing so forecasts can be validated beyond the shared window.

## Files

- Original XLSX (local, git‑ignored): `data/raw/jury_volumes/xlsx/Отчет_по_объемам_с_01_01_2025_по_31_05_2025,_для_всех_участков.xlsx`
- Original CSV (local, git‑ignored): `data/raw/jury_volumes/csv/Отчет_по_объемам_с_01_01_2025_по_31_05_2025,_для_всех_участков.csv`
- Project copy (git‑ignored): `data/raw/jury_volumes/derived/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv`
  - Ignored by: `projects/forecastingrepo/.gitignore` (`data/raw/`)
  - SHA256: `17141fc4f20785a34f891a71cbb52d42e2b858dde8cd1234ac61bd6006bf22b9`

## Format Notes

- Encoding: UTF‑8
- Delimiter: `;` (semicolon)
- Decimal separator: `,` (comma) in numeric cells (convert to `.` when normalizing)
- Structure:
  - Metadata rows (title + “Период: …”) before the header
  - Header row starts with `N п/п;...`
  - Daily columns are day‑of‑month blocks repeated for each month in the period (Jan→May 2025)
  - Totals near the end include `Итого, м3` and `Вес, тонн`

## Integration Plan (site‑level service history)

Use `scripts/convert_volume_report.py` to convert the raw report (CSV or XLSX) into canonical site service CSVs:

```bash
cd projects/forecastingrepo
python3 scripts/convert_volume_report.py \
  --input data/raw/jury_volumes/derived/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv \
  --output-service data/sites/sites_service.csv \
  --output-registry data/sites/sites_registry.csv
```

Notes:
- Outputs are git‑ignored (`data/sites/` and `data/sites_registry.csv` are ignored by `projects/forecastingrepo/.gitignore`).
- The conversion expands into a large site/day table (the parser detects ~23k sites and >1M daily rows for this Jan‑May window), so run it on a machine with sufficient free disk.

## Integration Status (Completed)

- Appended **1,042,648** daily rows covering **2025‑01‑01 → 2025‑05‑31** into:
  - `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv`
- Added **1,987** new site entries into:
  - `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv`
  - New rows keep `bin_count` / `bin_size_liters` blank (defaults apply in scripts).
- Verification summary: max `service_dt` = `2025‑05‑31`; 2025 rows = 1,042,648.

## Follow‑ups

- Ask for either (a) June→December 2025 export, or (b) split exports by month/quarter if the “full year 2025” export keeps failing.
