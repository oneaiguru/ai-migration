# Weather data contract (Phase‑2 ready)

## Sources we can accept
- **Gridded reanalysis (preferred):** ERA5 / ERA5‑Land (global, hourly; open under CC‑BY; stable for historical backtests).
- **Station aggregates:** Meteostat (global station network; license CC‑BY‑NC — commercial caveats).
- **Local NMHS data:** subject to national policy (WMO Res. 40 / Unified Data Policy).

## Licensing snapshot (not legal advice)
- **Copernicus ERA5/ERA5‑Land:** CC‑BY 4.0; attribution required.
- **Meteostat:** CC‑BY‑NC 4.0; commercial redistribution “as‑is” restricted; confirm terms before client delivery.
- Prefer reanalysis for commercial deliverables to avoid NC limitations.

## Mapping weather to districts
**If using stations (point → polygon aggregation):**
- Supported methods:
  - **Nearest station** (deterministic, simplest).
  - **IDW** inverse‑distance weighting (power \(p\) tunable; smooth; robust with moderate gauge densities).
  - **Thiessen (Voronoi) polygons** (area‑weighted nearest‑neighbor; simplest areal method; tends to underperform in many empirical studies).
- **Topography note:** In mountainous / strong orographic gradients, **IDW with tuned power** or **(co)kriging with elevation** generally outperforms Thiessen. Use Thiessen only as fallback when density is extremely sparse or simplicity is required.

**If using gridded ERA5/ERA5‑Land (raster → polygon):**
- Compute **area‑weighted mean** of grid cells intersecting the district polygon (document grid, resolution, resampling).

### Default method & parameters (Phase‑2 baseline)
- **Method:** IDW
- **Parameters (defaults):**
  - `idw.power = 2`
  - `idw.min_stations = 3` (fallback to nearest if fewer)
  - `idw.max_radius_km = 75` (tune per region; 50–100 km typical)
  - `idw.ties = nearest` (deterministic)
- **Fallbacks:**
  - If `stations_in_radius < idw.min_stations` → use **nearest**.
  - If strong orographic signal documented → consider **elevation‑aware** approach (e.g., regression on elevation + IDW of residuals) in evaluation only.

## Feature set (daily)
- **HDD/CDD:** base 18 °C (65 °F) unless client specifies otherwise:
  \( \mathrm{HDD}=\max(0, T_{\text{base}}-T_{\text{mean}}),\quad \mathrm{CDD}=\max(0, T_{\text{mean}}-T_{\text{base}}) \).
- **Precipitation:** daily sum; 7‑day rolling sum.
- **Snow depth / snowfall** (if available).
- **Calendar:** Russian public holidays & bridge days via `holidays`/`workalendar`.

## QA
- Provenance fields: source (ERA5/Meteostat/NMHS), station IDs or grid meta, **spatial method** (nearest/IDW/Thiessen), **params** (power/radius/base temp).
- Determinism: fix timezone=UTC, locale=C.UTF‑8; hash inputs; log scene config.

## Empirical guidance (why IDW baseline, when to avoid Thiessen)
- Multiple Eastern/central‑European studies report **IDW and kriging outperform Thiessen** for daily/seasonal rainfall, with performance sensitive to **gauge density** and **terrain**.
- **Mountainous catchments:** **IDW parameterization (power, grid resolution)** materially affects hydrological outputs; **co/kriging with elevation** often yields further gains.
- In **flat/low‑relief** areas with adequate density, IDW (p≈2) is a robust baseline; Thiessen may be acceptable as a quick fallback but is typically inferior.

### Selected empirical references
- Poland & neighbors: daily precipitation gridding and method comparisons (IDW/kriging > Thiessen).
- Mountainous catchment evidence on **IDW power & grid size** sensitivity.
- National‑scale and regional studies confirming **gauge density** as a key driver of method ranking.