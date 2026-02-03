# Routes Mock Data (Generated 2024-08 Window)

Commands run from repo root to refresh the `routes_before.html` / `routes_after.html` examples with real service + forecast data:

```bash
# 1. Parse all "Отчет по объёмам" XLSX files into canonical CSVs
python scripts/convert_volume_report.py \
  --input \
    ../_incoming/xls_20251105_191506/files/Отчет_по_объемам_с_01_01_2023_по_30_06_2023,_для_всех_участков_4.xlsx \
    ../_incoming/xls_20251105_191506/files/Отчет_по_объемам_с_01_07_2023_по_31_12_2023,_для_всех_участков_2.xlsx \
    ../_incoming/xls_20251105_191506/files/Отчет_по_объемам_с_01_01_2024_по_30_06_2024,_для_всех_участков_1.xlsx \
    ../_incoming/xls_20251105_191506/files/Отчет_по_объёмам_с_01_07_2024_по_31_12_2024,_для_всех_участков.xlsx

# 2. Build the August 1–7 forecast slice used by the mock
python scripts/make_site_forecast_from_actuals.py \
  --services data/sites/sites_service.csv \
  --registry data/sites/sites_registry.csv \
  --train-until 2024-07-31 \
  --start 2024-08-01 --end 2024-08-07 \
  --out reports/site_backtest_Q3_2024/daily_fill_2024-08-01_to_2024-08-07_real.csv

# 3. Run the backtest + accuracy post-processing (produces scoreboards/SUMMARY)
python scripts/backtest_sites.py \
  --train-until 2024-07-31 \
  --daily-window 2024-08-01:2024-08-07 \
  --monthly-window 2024-08:2024-08 \
  --sites-registry data/sites/sites_registry.csv \
  --sites-service data/sites/sites_service.csv \
  --use-existing-sites-csv reports/site_backtest_Q3_2024/daily_fill_2024-08-01_to_2024-08-07_real.csv \
  --outdir reports/site_backtest_Q3_2024

python scripts/site_accuracy_postprocess.py \
  --scoreboard-monthly reports/site_backtest_Q3_2024/scoreboard_site_monthly.csv \
  --registry data/sites/sites_registry.csv \
  --outdir reports/site_backtest_Q3_2024

# 4. Extract the top-5 high-volume sites for 1–7 August (drives the HTML tables)
python - <<'PY'
import pandas as pd
svc = pd.read_csv('data/sites/sites_service.csv', dtype={'site_id': str})
svc['service_dt'] = pd.to_datetime(svc['service_dt'])
window = svc[(svc['service_dt'] >= '2024-08-01') & (svc['service_dt'] <= '2024-08-07')]
agg = window.groupby('site_id').agg(volume_m3=('volume_m3','sum')).reset_index()
registry = pd.read_csv('data/sites/sites_registry.csv', dtype={'site_id': str})
latest = pd.read_csv('reports/site_backtest_Q3_2024/daily_fill_2024-08-01_to_2024-08-07_real.csv', dtype={'site_id': str})
latest['date'] = pd.to_datetime(latest['date'])
latest = latest[latest['date'] == latest['date'].max()][['site_id']]
svc_last = svc[svc['service_dt'] <= '2024-08-07'].groupby('site_id')['service_dt'].max().reset_index()
summary = (agg.merge(registry[['site_id','district','address']], on='site_id', how='left')
             .merge(svc_last, on='site_id', how='left'))
summary['service_dt'] = summary['service_dt'].dt.strftime('%d.%m.%Y')
summary = summary.sort_values('volume_m3', ascending=False).head(5)
summary.to_csv('ui/forecast-ui/ux-agent-inputs/tmp_routes_dataset.csv', index=False)
PY
```

The HTML mocks reference the rows written to `tmp_routes_dataset.csv`.
