# PR: Weather mapping A/B study (Irkutsk — flat vs mountainous)
**Goal:** Evaluate *mapping* choices (IDW vs Thiessen vs ERA5‑Land area-average) for Irkutsk‑region districts — no model change. Keep forecasts unchanged; compute correlations and backtest deltas only in evaluation.

## Scope (no behavior change)
- Implement *read-only* weather join path under `src/plugins/weather/`:
  - `adapter.py`: loaders for Meteostat (stations CSV/API) and ERA5‑Land (NetCDF).
  - `join.py`: district mapping:
    - A: **IDW(p=2, radius=75km, min_stations=3)** (baseline)
    - B: **Thiessen** (fallback/contrast)
    - C: **ERA5‑Land** area‑weighted polygon mean
  - `qa.py`: rowcount preservation, NaN checks, provenance log (source, params).
- Add scenario `scenarios/weather_idw_tuned.yml` (provided) and honor `flags.use_weather` in the join step only (forecasts stay baseline).

## Datasets
- **Stations (Meteostat):** Irkutsk & nearby WMO/ICAO (e.g., 30710 Irkutsk, others within 100 km). *License CC‑BY‑NC — do not redistribute “as-is”.*
- **Reanalysis:** ERA5‑Land daily/hourly for t2m, tp, sd; polygon means for districts.
- **Boundaries:** geoBoundaries RU (district‑level), CC‑BY 4.0.

## Design of the A/B
- Pick **two districts**:
  - **FLAT**: low relief, urban/steppe (e.g., Irkutsk urban okrug).
  - **MOUNTAINOUS**: strong relief (e.g., East Sayan foothills). Coordinate with coordinator to choose names/IDs present in client aggregates.
- For **2024‑10..12** backtest windows:
  1) Run `scripts/backtest_eval.py` (baseline; no weather in model).
  2) Produce **feature joins** for A/B/C, then compute **correlations**:
     - `corr(waste, HDD)`, `corr(waste, CDD)`, `corr(waste, precip_7d)` per district & lag ∈ {0..7}.
     - Report stability across A/B/C and FLAT vs MOUNTAINOUS.
- Output: `reports/weather_ab/` with:
  - `mapping_summary.md` (method params, station counts, distance histograms),
  - `corr_tables_*.csv` per district,
  - optional small headless plots (guarded by MPLBACKEND=Agg).

## Gates
- Tests/spec‑sync/docs‑check stay green.
- No change to client forecast CSVs or QA gates.
- Provenance JSON recorded (sources, params, hashes).

## Next (follow‑up PR, if justified)
- If correlations are meaningful/stable, propose a *flagged* feature injection PR (still off by default) + backtest with MASE/RMSSE deltas.