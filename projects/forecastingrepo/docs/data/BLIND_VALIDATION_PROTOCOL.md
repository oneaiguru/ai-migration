# Blind Validation Protocol

## Purpose

Validate our June-Dec 2025 forecasts against your actual data WITHOUT sharing your actual values.

## How It Works

1. **We send**: `forecast_2025-06-01_2025-12-31.csv`
   - Columns: Код КП + day columns (wide format)
   - By default, values are **cumulative** (накопительные) from the start of the period

2. **You run**: `python scripts/validate_forecast.py forecast_2025-06-01_2025-12-31.csv your_actuals.csv metrics.csv`
   - Uses YOUR actual data (kept on your machine)
   - Computes accuracy metrics
   - Outputs only: WAPE, error distribution, site rankings

3. **You send back**: `metrics.csv`
   - Contains only numbers and site IDs
   - NO actual values disclosed
   - Safe to share publicly or log

## Forecast CSV Format (From Us)

```csv
Код КП;1;2;...;31;1;2;...;31
38105070;123,45;128,92;...
```

### Important: cumulative vs daily values

- **Cumulative forecast (default)**: each day contains the cumulative volume since the period start.
  To get the **daily** volume, take a per-site difference between consecutive days.
  This is exactly what `scripts/validate_forecast.py` does by default (`--forecast-series cumulative`).
- **Daily forecast**: each day contains the daily volume already. In this case run validation with
  `--forecast-series daily` (or `--forecast-series auto`).

If you simply sum all cells of a cumulative forecast table, the total will be inflated.
Use the validation script totals (`total_forecast_m3`, `total_actual_m3`) for correct aggregation.

## Actuals CSV Format (Your Data)

```csv
Код КП;1;2;...;31;1;2;...;31
38105070;125,30;130,15;...
```

- Same structure as our forecasts
- Your actual collected data

## Metrics CSV Output (Safe to Share)

```csv
date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,within_10_pct,within_20_pct,worst_sites
2025-12-28T10:30:45,0.0823,123456.78,125000.00,5400,45.2,72.8,38105070|38105071
```

Fields:
- `overall_wape`: Weighted Absolute Percentage Error (lower is better)
- `total_forecast_m3`: Sum of all predictions
- `total_actual_m3`: Sum of all actuals
- `records_evaluated`: Number of (site, date) pairs matched
- `within_10_pct`: % of forecasts within 10% of actual
- `within_20_pct`: % of forecasts within 20% of actual
- `within_50_pct`: % of forecasts within 50% of actual
- `worst_sites`: Pipe-separated list of 10 worst-performing site IDs
- `best_sites`: Pipe-separated list of 10 best-performing site IDs

## Per-Site Output

The script also creates `metrics_per_site.csv`:

```csv
site_id,site_wape
38105070,0.0523
38105071,0.1245
...
```

This shows per-site WAPE (only IDs and error, no actual values).

## How We Use This Feedback

1. Parse metrics from your CSV
2. Identify worst-performing sites
3. Investigate characteristics (district, size, turnover, etc.)
4. Refine algorithm hypotheses
5. Generate new forecasts with adjustments
6. Iterate (repeat validation)

## Running the Script

```bash
# Basic usage
python scripts/validate_forecast.py forecast.csv actuals.csv metrics.csv --start 2025-06-01 --end 2025-12-31

# Example
python scripts/validate_forecast.py forecast_2025-06-01_2025-12-31.csv my_actuals.csv validation_results.csv --start 2025-06-01 --end 2025-12-31
```

## Important Notes

- **Safe**: We never see your actual June-Dec data
- **Reproducible**: You can re-run validation anytime
- **Shareable**: Metrics CSV contains no sensitive data
- **Not**: We can't cherry-pick results or bias the evaluation
- **Date range**: Day columns run sequentially from the forecast start to end dates (including partial months).
- **Site ID matching**: Keep `site_id` identical across forecast and actuals (treat as text to avoid dropped leading zeros or numeric coercion).
- **Excel template**: When using `forecast_vs_actuals_sample.xlsx`, paste data into the data sheets only and keep formula cells (Match_Check/WAPE) intact.

## Requirements

- Python 3.8+
- pandas library (`pip install pandas`)

## Questions?

Contact the development team for support.
