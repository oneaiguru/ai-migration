# DuckDB Deep Dive — Forecast Data (Jury)

## Context

We now have working DuckDB-based tooling for large CSV analysis:
- `scripts/analyze_data_quality.py` (DuckDB, outputs `REPORT.md` + CSVs)
- Docs: `docs/DATA_QUALITY_ANALYSIS.md`
- Latest E2E outputs: `reports/data_quality_duckdb_e2e_20251230/`

Separately, we hit a *human* mismatch: an exported wide “Jury format” forecast was **cumulative** (накопительный), so summing all cells produced inflated totals. A corrected **daily (delta) “день‑объём”** file was generated:
- Daily wide file: `sent/forecast_jun_dec_2025_jury_format_daily.csv`
- Old cumulative wide file: `sent/forecast_jun_dec_2025_jury_format.csv`

Goal now: use DuckDB tooling to go deeper into the data and explain/validate any anomalies (esp. outliers + baseline deviations) with reproducible queries.

## Relevant commits / code to review first

- `0c53ba7` — implements `scripts/analyze_data_quality.py`
- `c89d516` — adds `docs/DATA_QUALITY_ANALYSIS.md`
- `17a4ccb` — wide report utilities (`src/sites/wide_report.py`) + validation docs
- `34c81bc` — delivery/sent artifacts + data docs

## What to produce (deliverables)

1. A new report folder: `reports/duckdb_deep_dive_<YYYYMMDD>/`
   - `SUMMARY.md` (human readable, short)
   - `queries.sql` (DuckDB SQL used, runnable)
   - Optional CSV exports for top findings (site_id lists + aggregates only)
2. Answer the concrete questions from Misha/Jury:
   - Confirm which file is cumulative vs daily.
   - Provide *correct* totals for a given window (e.g., Jun–Oct 2025) using daily deltas.
   - Explain where “248M” comes from (sum of cumulative cells).

## Guardrails

- Analysis-only: **no model/pipeline behavior changes** in this task.
- Keep outputs safe: aggregates + `site_id` only unless the user explicitly asks for addresses.
- Store artifacts under `reports/duckdb_deep_dive_<YYYYMMDD>/`.

## Data inputs (paths in repo)

- Forecast (long, cumulative): `jury_blind_forecast/forecast_jun_dec_2025.csv` (or `blind_forecast_delivery/forecast_jun_dec_2025.csv`)
- Wide (cumulative): `sent/forecast_jun_dec_2025_jury_format.csv`
- Wide (daily delta): `sent/forecast_jun_dec_2025_jury_format_daily.csv`
- Service history: `data/sites_service.csv`
- Registry: `data/sites_registry.csv`

## Environment / setup

```bash
cd /Users/m/ai/projects/forecastingrepo
python3.11 -m pip install -r requirements-dev.txt
python3.11 -c "import duckdb; print(duckdb.__version__)"
```

Note: in some sandboxed environments, `pyarrow` may print `sysctlbyname ... Operation not permitted` warnings while still working. These are typically safe to ignore.

## Step 1 — Re-run the quality gate (baseline sanity)

```bash
python3.11 scripts/analyze_data_quality.py \
  --forecast-path jury_blind_forecast/forecast_jun_dec_2025.csv \
  --forecast-format long \
  --forecast-start 2025-06-01 \
  --forecast-end 2025-12-31 \
  --baseline-year 2024 \
  --outdir reports/duckdb_deep_dive_<YYYYMMDD>/quality_2024
```

Read:
- `reports/duckdb_deep_dive_<YYYYMMDD>/quality_2024/REPORT.md`
- `distribution_outliers.csv`
- `distribution_baseline.csv`

## Step 2 — Deep dive with DuckDB (outliers + baseline extremes)

Create a `reports/duckdb_deep_dive_<YYYYMMDD>/queries.sql` with queries like:

1) **Outliers by site (count + max delta)**
- Join outlier sites to `data/sites_registry.csv` to see district/address context.

2) **Baseline extreme by district**
- From `distribution_baseline.csv`, join to registry and group by district.

3) **Total daily volume over time**
- Compute daily deltas from cumulative long forecast and aggregate `SUM(delta_m3)` by date.
- Export to CSV for quick plotting if needed.

4) **Verify “248M vs 3.2M” explanation**
- For the *wide cumulative* file, confirm that `SUM(all cells)` is large.
- For the *wide daily* file, confirm that `SUM(all cells)` matches the correct total.

Notes:
- Keep exports safe: aggregates + `site_id` only; don’t dump raw registry addresses unless explicitly requested.
- Store any outputs under `reports/duckdb_deep_dive_<YYYYMMDD>/`.

## Acceptance criteria

- `SUMMARY.md` includes:
  - One paragraph explaining cumulative vs daily and the mistake.
  - Correct totals for a chosen window (Jun–Oct 2025 and/or Jun–Dec 2025) from the daily series.
  - A short “what’s next” list (e.g., investigate top baseline-extreme districts/sites).
- Queries are reproducible (document exact paths + params).
