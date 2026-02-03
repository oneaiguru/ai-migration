# PR — Weather A/B report (offline, evaluation-only)

**Branch:** `agent/weather-ab-local`
**Goal:** Build an **evaluation-only** A/B report for two districts (flat vs mountainous) using **local** weather files (no network). Do **not** change forecasting outputs.

## Inputs (local files)
- Boundaries: `data/boundaries/irkutsk_districts.geojson`
- Station daily (CSV): `data/raw/weather/meteostat_daily_irkutsk_2022_2024.csv` (or similar)
- Station meta (CSV): `data/raw/weather/stations_meteostat.csv` (lat/lon required)
- ERA5-Land (NetCDF): `data/raw/weather/era5land_irkutsk_2022_2024.nc` (optional)
- Waste daily: `data/daily_waste_by_district.csv`

## Command (example)
```

python scripts/weather_join_local.py
--boundaries data/boundaries/irkutsk_districts.geojson
--waste-daily data/daily_waste_by_district.csv
--meteostat-daily data/raw/weather/meteostat_daily_irkutsk_2022_2024.csv
--stations-csv data/raw/weather/stations_meteostat.csv
--era5-nc data/raw/weather/era5land_irkutsk_2022_2024.nc
--flat-district "Иркутск"
--mountainous-district "<название горного района>"
--mapping-all idw thiessen grid
--idw-power 2.0 --idw-radius-km 75 --idw-min-stations 3
--outdir reports/weather_ab/local_run_$(date +%Y%m%d_%H%M)

```

## Outputs
- `mapping_summary.md` — counts, params, station distances, dataset presence
- `corr_tables_flat.csv` and `corr_tables_mountainous.csv` — corr(waste vs HDD/CDD/precip_7d) at lags 0..7

## Rules
- No changes to forecast code/outputs; this is **evaluation-only**.
- Do not commit files under `data/raw/**` or any secrets.
- Use `TZ=UTC`, `LC_ALL=C.UTF-8`, `PYTHONHASHSEED=0` for determinism.

---