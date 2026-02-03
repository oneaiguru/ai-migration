# Jury Demo Runbook (Forecasting)

## Purpose
Demonstrate the forecasting workflow in a way that matches the transcript requirements:
- Site selection by ID + address
- Fact vs Forecast comparison
- Clear “data cutoff” (what the system knows at forecast time)
- Exportable CSV (Excel-compatible)
- Reference to the PDF-style chart

## Quick Start (Mytko Demo UI)
```bash
cd /Users/m/ai/projects/mytko-forecast-demo
npm install
npm run dev -- --port 5174
```

Open: http://localhost:5174

## Demo Checklist
1. **Pick a site** from the gallery (preselected weeks show WAPE + fill range).
2. **Adjust date range** to show a short week or month window.
3. **Set the data cutoff** (Дата среза данных) and explain that forecasts after this date use only historical data up to the cutoff.
4. **Open “История накопления”** by clicking the site_id:
   - Show fact (blue) vs forecast (green) bars.
   - Point to red collection markers.
5. **Export CSV** from the “Детализация прогнозов” table and note that Excel can load it for charts.
6. **Mention the PDF example** (see `projects/rtneo-mock/task/Прогноз объемов на КП.pdf`) as the target visual style.

## Data Flow (Demo)
1. Raw export (Jury CSV/XLSX) → `projects/forecastingrepo/scripts/convert_volume_report.py`
2. Canonical site service data → `data/sites/sites_service.csv`
3. Demo slice → `projects/forecastingrepo/scripts/create_demo_subset.py`
4. UI reads `projects/mytko-forecast-demo/public/demo_data/containers_summary.csv`
5. CSV export from UI → Excel / PDF follow‑ups

## Talking Points (Transcript-Aligned)
- “We can set any cutoff date and re-run the forecast—this shows how the system behaves given only the data it ‘knows’ up to that day.”
- “We show fact vs forecast side-by-side; the export is Excel-ready for quick verification.”
- “Phase 1 is the demo UI + graphs; Phase 2 is broader data ingestion and automation.”

## Data Notes
- Baseline site-level data: 2023–2024 already ingested.
- 2025 export currently available only for Jan–May; June–December still needed for full-year testing.
- Stack alignment: see `projects/rtneo-ui-docs/docs/Tasks/PR-UI-1_mytko_stack_forecast_demo.md` for the exact MyTKO widget/FSD plan.
