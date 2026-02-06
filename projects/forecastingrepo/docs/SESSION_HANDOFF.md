# Session Handoff

## 2026-01-08 – Executor: m3-only unit switch
- Agent: `codex`
- Plan: `plans/2026-01-08_units-m3-switch.plan.md`
- Work summary:
  - Switched service/forecast pipeline to `collect_volume_m3` and `pred_volume_m3`, removing legacy mass fallbacks and aligning rate/fill math to m3.
  - Updated API payloads/CSV headers and scripts (forecast bundles, backtests, reports, ingest helpers) to m3-only fields; removed MyTKO weight output.
  - Regenerated OpenAPI and aligned tests/docs/fixtures to m3/actual_m3 naming.
- Validation:
  - `python -m pytest -q tests/sites/test_data_loader.py tests/sites/test_site_baseline.py tests/sites/test_site_simulator.py tests/sites/test_rolling_forecast.py tests/sites/test_reconcile.py tests/sites/test_reconcile_branches.py`
  - `python -m pytest -q tests/api/test_rolling_forecast_endpoint.py tests/api/test_site_forecast_v1.py tests/api/test_api_routes_forecast.py tests/api/test_api_sites_v1.py tests/api/test_sites_headers_filters_csv.py tests/api/test_sites_empty_csv_header_only.py tests/api/test_sites_paging_large_offset.py tests/api/test_routes_collection_join_and_csv.py tests/api/test_mytko_adapter.py`
  - `python -m pytest -q tests/test_export_validation.py tests/test_bundle_cli.py tests/test_html_report.py tests/test_data_access.py tests/routes/test_recommend.py`
  - `python -m pytest -q tests/unit/test_daily_semantics.py tests/unit/test_monthly_semantics.py tests/viz/test_quicklook_unit.py tests/e2e/test_cli_and_outputs.py`
  - `python scripts/export_openapi.py --write`
  - `python -m pytest -q tests/test_openapi_export.py`
- Next:
  - Commit and push via `scripts/dev/push_with_codex.sh` after verifying `gh auth status -h github.com` is `oneaiguru`.

## 2025-12-31 – Executor: wide-format validation + exports
- Agent: `codex`
- Plan: user-provided wide-format validation/export plan
- Work summary:
  - Added shared wide-report utilities (`src/sites/wide_report.py`) and refactored `scripts/export_forecast_volume_report.py` to use them.
  - Defaulted blind-validation export to wide format, added long option in CLI/tests, and enabled wide auto-detect in `scripts/validate_forecast.py`.
  - Added wide support for data-quality analysis + tests; updated validation docs and data contracts for the wide format.
- Validation:
  - `python -m pytest -q tests/test_validation_script.py`
  - `python -m pytest -q tests/test_export_validation.py`
  - `python -m pytest -q tests/test_data_quality_duckdb.py` (fails locally: `ModuleNotFoundError: duckdb`)
- Next:
  - Install `duckdb` and re-run `python -m pytest -q tests/test_data_quality_duckdb.py`.

## 2025-12-29 – Executor: API refactor for 300 LOC cap
- Agent: `codex`
- Plan: `progress.md` (Refactor: 300 LOC Cap)
- Work summary:
  - Split `scripts/api_app.py` into thin entrypoint + routers: metrics/geo, accuracy, MyTKO forecast/rolling/feedback/rollout; extracted Prometheus metrics to `src/sites/api_prometheus.py`.
  - Added `src/sites/api_context.py` + `src/sites/api_utils.py` for shared path helpers, CSV loaders, and sanitizers.
  - Moved rolling accuracy + cache helpers to `src/sites/rolling_accuracy.py` and `src/sites/forecast_cache.py` to keep `src/sites/rolling_forecast.py` under 300 LOC.
  - Adjusted OpenAPI `format` param to be docs-only pattern (no validation) and regenerated `docs/api/openapi.json` with `python3.11`.
- Validation:
  - `python3.11 -m pytest -q tests/api`
  - `python3.11 -m pytest -q tests/test_metrics_upload.py tests/test_prometheus_metrics.py tests/test_microservice.py tests/test_openapi_export.py`
  - Warnings: `pythonjsonlogger` deprecation; pydantic `parse_obj` deprecation in test roundtrip.
- Next:
  - Commit and push via `scripts/dev/push_with_codex.sh` after `gh auth status -h github.com` confirms `oneaiguru`.
## 2025-12-28 – Executor: rolling-cutoff fixes + test gating
- Agent: `codex`
- Plan: none (ad-hoc follow-up on rolling-cutoff review)
- Work summary:
  - WAPE now uses `sum(abs(pred_delta - actual)) / sum(actual)` in `src/sites/rolling_forecast.py` and district rollups in `scripts/api_app.py`.
  - Metrics ingestion now supports optional per-site CSV upload and persists `metrics_history_per_site.parquet`.
  - Forecast bundle + HTML report totals/ranking now use per-site delta sums.
  - Added slow-test gate (`RUN_SLOW_TESTS`) and delta/WAPE assertions in rolling-forecast tests.
  - Documented test data usage in `docs/System/Testing.md` and `docs/SOP/DATA_SOURCES.md`.
- Validation:
  - `SITES_SERVICE_PATH=/tmp/forecasting-fixtures/sites_service.csv SITES_REGISTRY_PATH=/tmp/forecasting-fixtures/sites_registry.csv python3.11 -m pytest -q tests/test_bundle_cli.py tests/test_html_report.py tests/test_metrics_tracker.py tests/test_metrics_upload.py`
    - Result: pass (warnings: PytestConfigWarning for `asyncio_default_fixture_loop_scope`, pythonjsonlogger deprecation).
  - `RUN_SLOW_TESTS=1 python3.11 -m pytest -q tests/api/test_rolling_forecast_endpoint.py`
    - Result: pass (warnings: PytestConfigWarning, PytestRemovedIn9Warning for skip mark on fixture, pythonjsonlogger deprecation).
- Next:
  - Decide whether to clean up pytest config warning and the skip-mark-on-fixture warning.
  - Commit/push changes once ready.

## 2025-12-28 – Executor: cleanup warnings + ignore backup zip
- Agent: `codex`
- Plan: none (post-push cleanup)
- Work summary:
  - Removed unsupported `asyncio_default_fixture_loop_scope` from `pytest.ini` and clarified the optional pytest-asyncio note in `docs/System/Testing.md`.
  - Replaced the fixture-level skip mark with a runtime Python version skip in `tests/api/test_rolling_forecast_endpoint.py`.
  - Added `*.zip.backup_*` to `.gitignore` to ignore local delivery backups.
- Validation: not run (config-only changes).
- Next: commit/push these cleanup changes.

## 2025-12-30 – Executor: DuckDB data-quality rewrite
- Agent: `codex`
- Plan: user-provided scope (DuckDB data-quality rewrite + tests)
- Work summary:
  - Replaced `scripts/analyze_data_quality.py` with a DuckDB-based implementation using the provided SQL, thresholds, and report template.
  - Added `tests/test_data_quality_duckdb.py` to cover blockers, warnings, and empty CSV creation.
  - Added `duckdb>=1.0.0` to `requirements-dev.txt`.
- Validation:
  - `python3.11 -m pytest -q tests/test_data_quality_duckdb.py` (fails locally: `ModuleNotFoundError: duckdb`).
- Next:
  - Install `duckdb>=1.0.0` and re-run the test.
  - (Deferred by request) Update `docs/DATA_QUALITY_ANALYSIS.md` after tests pass.

## 2025-12-30 – Executor: Data-quality review fixes
- Agent: `codex`
- Plan: review feedback follow-up (DuckDB data-quality fixes)
- Work summary:
  - Added missing-registry CSV output and baseline-year CLI; warnings now trigger on any outliers/baseline deviations/no-history; null forecast values now count as blockers.
  - Baseline totals use per-site max date and percentages use baseline-covered sites; report/output filenames and docs updated to match.
  - Updated `tests/test_data_quality_duckdb.py` with null forecast fixture and missing-registry assertions.
- Validation:
  - `python3.11 -m pytest -q tests/test_data_quality_duckdb.py`
- Next:
  - None.

## 2025-12-31 – Executor: Data-quality E2E run
- Agent: `codex`
- Plan: none (user-requested E2E run)
- Work summary:
  - Ran DuckDB data-quality analysis on the full dataset.
  - Captured verdict + key warning counts in `reports/data_quality_duckdb_e2e_20251230/REPORT.md`.
- Validation:
  - `python3.11 scripts/analyze_data_quality.py --outdir reports/data_quality_duckdb_e2e_20251230`
- Next:
  - Review warning CSVs (`distribution_outliers.csv`, `distribution_baseline.csv`) if follow-up is needed.

## 2026-01-08 – Executor: Jury “day-volume” delta export + DuckDB deep-dive task brief
- Agent: `codex`
- Context:
  - Jury summed the wide forecast table as if it contained daily volumes; the file was cumulative (накопительный), which inflated totals (~248M).
- Work summary:
  - Added explicit series handling to `scripts/export_forecast_volume_report.py` (cumulative↔daily) and `scripts/validate_forecast.py` (`--forecast-series`).
  - Regenerated a **daily (delta) “день‑объём”** wide file: `sent/forecast_jun_dec_2025_jury_format_daily.csv`.
  - Wrote a short follow-up message for Jury: `sent/JURY_FOLLOWUP_DAILY_DELTA_MESSAGE_RU.md`.
  - Added a handoff/task brief for DuckDB exploration: `docs/Tasks/DUCKDB_DEEP_DIVE_FORECAST_DATA.md`.
- Validation:
  - `python3.11 -m pytest -q tests/test_export_forecast_volume_report.py tests/test_validation_script.py tests/test_export_validation.py`
- Next:
  - Run the DuckDB deep dive per `docs/Tasks/DUCKDB_DEEP_DIVE_FORECAST_DATA.md` and summarize outliers/baseline extremes for discussion with the user.
