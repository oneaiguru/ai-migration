# Units M3 Switch Discovery

Date: 2026-01-08
Role: Scout

## Source Search
- rg: "pred_volume_m3|collect_volume_m3|pred_volume_m3|collect_volume_m3|actual_m3" across src/, scripts/, docs/, tests/.
- Service CSV header inspected: data/sites_service.csv.

## Evidence (file:line)
- data/sites_service.csv:1 shows header "site_id,service_dt,collect_volume_m3,volume_m3,source".
- src/sites/data_loader.py:74-158 builds service_df with collect_volume_m3 from the 3rd column and returns collect_volume_m3.
- src/sites/baseline.py:16-90 computes rates using collect_volume_m3 and emits rate_m3_per_day.
- src/sites/simulator.py:20-60 expects rate_m3_per_day and outputs pred_volume_m3.
- src/sites/rolling_forecast.py:58-77 aggregates collect_volume_m3, converts actual_m3 using /1000, and computes _pred_m3 from pred_volume_m3.
- src/sites/rolling_types.py:20-44 and 74-80 still define collect_volume_m3 and pred_volume_m3 in typed interfaces.
- src/sites/schema.py:31-37 and 86-103 use collect_volume_m3 and pred_volume_m3 in models.
- scripts/make_site_forecast_from_actuals.py:9-11 and 206-208 output daily_fill with pred_volume_m3.
- src/sites/export_validation.py:24-63 accepts pred_volume_m3 and divides by 1000 unless pred_units=m3; accepts pred_volume_m3 as fallback.
- scripts/export_validation_forecast.py:60-63 exposes --pred-units for pred_volume_m3 output.
- scripts/api_app.py:75-83 converts pred_volume_m3 to pred_delta_m3; 262-288 models pred_volume_m3; 591-598, 663-664, 757-758, 1143-1152, 1193-1202, 1409-1418 emit pred_volume_m3; 972-999 uses pred_volume_m3 for MyTKO forecast and divides by 1000 for volume.
- src/sites/api_site_forecast.py:79-129 reads pred_volume_m3 (fallback pred_volume_m3) but returns pred_volume_m3 in JSON/CSV.
- src/sites/api_routes_forecast.py:66-87 returns pred_volume_m3 in CSV.
- src/sites/reconcile.py:34-138 uses pred_volume_m3 and scales fill_pct from pred_volume_m3 vs capacity liters.
- src/sites/rolling_backtest.py:50-56 converts pred_volume_m3 to forecast_m3 via /1000.
- scripts/generate_forecast_bundle.py:51-63 and scripts/generate_html_report.py:90-103 divide pred_volume_m3 by 1000 for pred_m3.
- scripts/create_demo_bundle.py:38-40 aggregates collect_volume_m3 for demo selection.
- scripts/create_demo_subset.py:97-106 reads pred_volume_m3 and divides by 1000 for forecast_m3.
- scripts/convert_reports_to_sites_data.py:5-171 writes collect_volume_m3 from volume * 1000.
- src/sites/aliases_ru.py:9-62 and scripts/ingest_sites.py:49-128 map service to collect_volume_m3 and convert ton headers to collect_volume_m3.
- docs/data/SITE_DATA_CONTRACT.md:8-12 declares collect_volume_m3.
- docs/data/QUERY_PATTERNS.md:9-29 and 98-110 describe collect_volume_m3 and pred_volume_m3 columns.
- docs/System/API_Endpoints.md:17-20 defines pred_volume_m3 in /api/sites output.
- tests/sites/test_data_loader.py:50-53 and 112-113 use collect_volume_m3 fixtures.
- tests/sites/test_rolling_forecast.py:75 expects pred_volume_m3 in forecast_df.
- tests/api/test_rolling_forecast_endpoint.py:167-197 expects pred_volume_m3 and CSV headers.
- tests/api/test_site_forecast_v1.py:29 and 91 expect pred_volume_m3 CSV headers.

## Ready vs Missing
- Ready:
  - Service CSV already provides collect_volume_m3 (data/sites_service.csv:1).
  - export_validation can already accept pred_volume_m3 (src/sites/export_validation.py:60-63).
  - api_site_forecast has a pred_volume_m3 fallback (src/sites/api_site_forecast.py:79-82).
- Missing:
  - Core pipeline still uses collect_volume_m3/pred_volume_m3 and /1000 conversions.
  - API schemas and outputs still expose pred_volume_m3.
  - Tests and docs still target pred_volume_m3/collect_volume_m3.

## Risks and Open Questions
- Capacity math: simulator and reconcile compute fill_pct against capacity_liters; m3 requires conversion to liters or capacity_m3.
- Cached forecast parquet files and demo CSVs still contain pred_volume_m3; they will need regeneration or a one-time migration.
- Fallback district data uses waste_tonnes; if service data is missing, decide whether to keep tonnes or convert to m3.
- Backward compatibility: confirm whether to keep reading legacy pred_volume_m3/collect_volume_m3 inputs or enforce m3-only.
