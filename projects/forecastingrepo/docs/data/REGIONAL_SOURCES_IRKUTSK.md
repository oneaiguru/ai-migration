# Irkutsk‑region weather data: sources, first download, licenses

## Station data (preferred when density OK)
- **Meteostat stations**: Irkutsk (WMO 30710) and neighbors (e.g., Kazachinsk). Daily/hourly via API/CSV.
  *License:* **CC‑BY‑NC 4.0** (no commercial redistribution “as‑is”). Use for modeling; do not ship raw.
  Links: station page + API docs.
- **NOAA ISD (UIII)**: Hourly global station archive (CSV/WAF). Good for reproducible hourly T/precip/wind.
- **GHCN‑Daily**: global daily summaries (temps, precip, snow). Fast to prototype; use NCEI or AWS Open Data.

## Reanalysis (robust fallback / coverage)
- **ERA5‑Land**: hourly & post‑processed daily/ monthly; t2m, tp, snow.
  *License:* moving to **CC‑BY 4.0**; ERA5‑Land paper is CC‑BY. Cite & attribute.

## Boundaries & calendars
- **District boundaries:** **geoBoundaries** (RU sub‑national), CC‑BY 4.0.
- **Holidays:** `holidays` (RU) or `workalendar` (Russia) for public holidays & bridge days.

## First fetch (minimal)
- ERA5‑Land: t2m, tp daily for **2022‑01‑01..2024‑12‑31** over Irkutsk oblast bbox; save NetCDF.
- Meteostat: daily for station 30710 + neighbors within 100 km; export CSV with station meta.
- Boundaries: geojson of districts covering the client’s dataset.
- Keep a `provenance.json` with source, variable list, bbox, and hashes.

## Notes
- Prefer reanalysis for deliverables (clean licensing); keep station raw internal.
- For mountainous districts, IDW over stations often beats Thiessen; ERA5‑Land polygon means provide a stable fallback.
- Keep all joins **deterministic**: UTC, locale C.UTF‑8, sorted keys, fixed IDW params.