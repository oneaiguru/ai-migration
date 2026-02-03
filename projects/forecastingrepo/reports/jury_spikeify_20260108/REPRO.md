# Repro

Run from `projects/forecastingrepo/`.

## 1) Holdout metrics + regressions

```bash
python3.11 scripts/jury_spikeify_service_day_postprocess_report.py \
  --run-date 20260108 \
  --schedule-alignment-threshold 0.60
```

## 2) Generate Jun–Dec spikeified wide forecast

```bash
python3.11 scripts/jury_spikeify_daily_forecast.py \
  --forecast-wide sent/forecast_jun_dec_2025_jury_format_daily.csv \
  --start 2025-06-01 \
  --out /Users/m/git/clients/rtneo/_incoming/jury_spikeify_20260108/forecast_jun_dec_2025_jury_format_daily_spikeified.csv \
  --stats-out reports/jury_spikeify_20260108/forecast_stats.json \
  --schedule-alignment-threshold 0.60 \
  --daily-mode noop
```

## 3) Tests

```bash
python3.11 -m pytest -q tests/sites/test_service_day_adjust.py
```
