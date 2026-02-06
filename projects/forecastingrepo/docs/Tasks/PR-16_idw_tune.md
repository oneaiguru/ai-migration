# PR‑16 — IDW tuning (evaluation‑only)

## Goal
Evaluate IDW parameters (p, radius_km, min_stations) for joining station weather to districts; report correlations/fit vs. actuals. No baseline change.

## Deliverables
- scripts/idw_tune.py
  - Args: --stations CSV --boundaries GEOJSON --weather CSV/NetCDF --grid "p=1.5,2.0,2.5;radius=50,75,100;min_stations=2,3,4" --outdir reports/idw_tune_<ts>
- Outputs:
  - `reports/idw_tune_*/grid_results.csv` (params → metrics)
  - `reports/idw_tune_*/best_params.json`
  - `reports/idw_tune_*/README.md` (how to read)

## Tests
- `tests/weather/test_idw_tune_grid.py`: synthetic points/polygons; assert grid iteration and file schemas.

## Acceptance criteria
- No pipeline changes; docs/tests green.

