# Forecasting UI Surfaces

Where users see forecasts
- Маршруты → График маршрутов: overlay «Прогноз по КП» с fill_pct и overflow_risk
- Прогноз загрузки ТС: агрегаты по маршруту на день D
- Реестр КП: колонки «Прогноз заполнения» и «Риск переполнения»
- Отчеты: «Прогноз vs Факт» для районов и региона, ежемесячные метрики

Files and data
- Backtest consolidated under `reports/backtest_consolidated_auto/`
- Sites demo under `reports/sites_demo/` for UI prototype
- API to be added later under `/api/forecast/*`

Acceptance
- Users can open one page and understand качество прогноза и где действовать
- Links to CSVs and QA are discoverable
