# Quicklook Visualization

Generate non-interactive PNG charts and a REPORT.md to eyeball 2024 actuals vs 2025 forecast windows.

## How to run

1) Generate a forecast (see Onboarding) so forecast CSVs exist under deliveries/.../forecasts/
2) Run:

```
python scripts/quicklook_report.py \
  --actual-daily data/daily_waste_by_district.csv \
  --actual-monthly data/monthly_waste_by_district.csv \
  --forecast-daily deliveries/*/forecasts/daily_2025-01-01_to_2025-03-31.csv \
  --forecast-monthly deliveries/*/forecasts/monthly_2025-01_to_2025-12.csv \
  --outdir reports/quicklook_demo
```

## Outputs
- region_monthly_2024_vs_2025_forecast.png
- top5_districts_totals_2024_vs_2025_forecast.png
- region_daily_forecast_<window>.png (one per provided daily window)
- REPORT.md: links to images and quick stats

## Notes
- Headless: uses matplotlib Agg backend; no new runtime deps for forecast CLI.
- Region series uses canonical region (sum of districts) from client CSVs.

## Backtest mode
Run a backtest over specified windows using the baseline methods, producing scoreboards and a summary. This calls the existing forecast CLI and does not change model behavior.

Example:

```
python scripts/backtest_eval.py \
  --train-until 2024-09-30 \
  --daily-window 2024-10-01:2024-12-31 \
  --monthly-window 2024-10:2024-12 \
  --scopes region,districts \
  --methods daily=weekday_mean,monthly=last3m_mean \
  --actual-daily data/daily_waste_by_district.csv \
  --actual-monthly data/monthly_waste_by_district.csv \
  --outdir reports/backtest_2024-09-30
```

Outputs in the outdir:
- scoreboard_monthly.csv (level,district,year_month,actual,forecast,wape,smape,mae)
- scoreboard_daily.csv (level,district,date,actual,forecast,wape,smape,mae)
- SUMMARY.md (region headline, top/bottom districts, worst month)
