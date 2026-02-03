# Local data request (Irkutsk) — what to ask researchers for

## Targets (Phase‑2 enablement)
1) **District boundaries** (authoritative): latest polygons with IDs matching client aggregates.
2) **Station metadata**: full list within 150 km — WMO/ICAO codes, lat/lon, elevation, variable coverage (Tmin/Tmax/Tavg, precip, snow depth), data completeness (2022–2024).
3) **Orography**: DEM tiles (30–90 m) and a note on orographic precipitation patterns (expert memo).
4) **Operations**: collection schedule calendars; snow‑removal cycles; special events; strike/closure logs.
5) **Heating policy**: official HDD **base temperature** used by municipal utilities (often 18 °C, confirm locally) and dates when heating season starts/ends.
6) **Anomalies log**: power outages, road closures, extreme weather incidents by date/district.
7) **Legal**: written permission/terms for using any NMHS or municipal datasets in internal modeling.

## Format & cadence
- Deliver as CSV/GeoJSON/GeoPackage; one CSV per domain; include **provenance** (owner, contact, date).
- Monthly refresh optional; one‑off dump acceptable for POC.

## If unavailable on the web
- Request curated station daily CSVs (2022–2024) for: Tavg, Tmin, Tmax, Precip, Snow depth.
- Ask for **station‑district mapping** if they have an internal catalog; else we compute.

```

**Notes on sources & fit for Irkutsk**

* Era & licensing: ERA5‑Land is the safest baseline (reanalysis, daily stats product; CC‑BY family), with scientific paper CC‑BY as well; we’ll attribute properly. ([cds.climate.copernicus.eu][3])
* Stations: Meteostat lists Irkutsk (30710) and nearby gauges with a CC‑BY‑NC license (fine for modeling, don’t ship raw); NOAA’s ISD/GHCN provide alternative station feeds with open access. ([meteostat.net][6])
* Boundaries & holidays: geoBoundaries (CC‑BY 4.0) for district polygons; `holidays`/`workalendar` cover Russian calendars for feature flags. ([geoboundaries.org][4])
* Regional context: Analog climates (Ulaanbaatar, Heilongjiang, Pavlodar, Yakutsk) ensure our mapping/feature defaults are calibrated to **super‑continental** regimes. ([Wikipedia][2])

If you want, I can add a tiny **`scenarios/weather_idw_tuned.yml` → CI link check** in docs_check so this file is referenced from the docs index.

[1]: https://en.wikipedia.org/wiki/Irkutsk?utm_source=chatgpt.com "Irkutsk"
[2]: https://en.wikipedia.org/wiki/Ulaanbaatar?utm_source=chatgpt.com "Ulaanbaatar"
[3]: https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land?utm_source=chatgpt.com "ERA5-Land hourly data from 1950 to present"
[4]: https://www.geoboundaries.org/?utm_source=chatgpt.com "geoBoundaries"
[5]: https://pmc.ncbi.nlm.nih.gov/articles/PMC8511798/?utm_source=chatgpt.com "Bias-corrected monthly precipitation data over South ..."
[6]: https://meteostat.net/en/station/30710?utm_source=chatgpt.com "Irkutsk | Weather History & Climate"