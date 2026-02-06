# Methodology Log

**Generated:** 2025-12-30T22:55:56.019608
**Git Commit:** c89d5168

## Parameters
- Forecast window: 2025-06-01 to 2025-12-31
- Expected days: 214
- Baseline window: 2024-06-01 to 2024-12-31

## Data Sources
- Forecast: `jury_blind_forecast/forecast_jun_dec_2025.csv` (sha256: d49b42a0ceb24efe)
- Service history: `data/sites_service.csv` (sha256: 5a764533b56578f4)
- Registry: `data/sites_registry.csv` (sha256: b732b039d9fa6991)

## Command to Reproduce
```bash
python scripts/analyze_data_quality.py \
  --forecast-path jury_blind_forecast/forecast_jun_dec_2025.csv \
  --service-path data/sites_service.csv \
  --registry-path data/sites_registry.csv \
  --forecast-start 2025-06-01 \
  --forecast-end 2025-12-31 \
  --outdir reports/data_quality_duckdb_e2e_20250101
```

## Analysis Methodology
- Coverage: registry overlap, any-history coverage, and date completeness over the fixed window.
- Distribution: cumulative-to-delta conversion, summary stats, 3-sigma outliers, and baseline comparison.
- Structural: duplicate (site_id, date), nulls, negative values, malformed IDs.
