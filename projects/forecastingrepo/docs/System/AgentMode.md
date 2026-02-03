# Agent‑Mode (browser + data) — Runbook

**Purpose.** Enable a browser/data agent to (a) log in where needed, (b) download weather & boundaries, (c) export CSV/XLS, and (d) write a short report — without changing model behavior.

## What the agent will deliver
- `data/raw/`:
  - `weather/era5land_irkutsk_2022_2024.nc` (ERA5‑Land)
  - `weather/meteostat_daily_irkutsk_2022_2024.csv` and `stations_meteostat.csv`
  - `weather/ghcnd_daily_irkutsk_2022_2024.csv` (optional)
  - `boundaries/geoBoundaries-RUS-ADM2-all.zip` + extracted `irkutsk_districts.geojson`
  - `calendars/holidays_ru_2022_2025.csv`
- `provenance/`: JSON with dataset versions, query params, hashes.
- `reports/weather_ab/`: tables + `mapping_summary.md` (from A/B brief).

## One‑time setup (Agent machine)
1) Install system deps: `git, curl, wget, aria2, unzip` and Python 3.10+.
2) Create venv & install libs:
   ```bash
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements-dev.txt
   pip install cdsapi meteostat geopandas shapely pyproj rtree xarray netCDF4 pandas requests
````

3. Copy `.env.example` → `.env` and fill `CDSAPI_KEY` (see **CDS login** below).

## Execution order (safe defaults)

1. **CDS/ERA5‑Land**: run `scripts/agentmode/cds_login.sh` then `cds_era5_land_pull.py`.
2. **Meteostat**: run `scripts/agentmode/meteostat_pull.py` (no login).
3. **NOAA GHCN‑Daily** (optional bulk): run `scripts/agentmode/noaa_ghcn_pull.sh`.
4. **geoBoundaries** RU ADM2: run `scripts/agentmode/geoboundaries_pull.sh`.
5. **RU Holidays**: run `scripts/agentmode/holidays_generate.py`.
6. Fill `provenance/*.json` (auto‑written by scripts) and produce `reports/weather_ab/*` per A/B task.

**Important:** Do **not** push raw station data or licensed files to client repos. Keep all artifacts under `data/raw/` and attribute sources.

---

