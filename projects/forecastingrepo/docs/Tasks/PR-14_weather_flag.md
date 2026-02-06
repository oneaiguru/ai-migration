# PR‑14 — Weather behind a flag (default OFF; no baseline change)

## Goal
Wire the already-parsed scenario flags into the forecast pipeline so that:
- With `flags.use_weather: false` (default) → outputs are **bit-for-bit identical** to golden baseline.
- With `flags.use_weather: true` → weather features may be computed (joined/QA’d), but **NOT** used to change forecasts (until a Golden Bump PR). Produce only QA logs/reports.

## Scope (interfaces already exist from PR‑13; do not change behavior)
- Use `src/scenarios/manager.py::load_scenario/apply_overrides/is_enabled`.
- Thread `ScenarioConfig` through `scripts/ingest_and_forecast.py` execution path (no algorithm changes).
- Call weather plugin *optionally* to generate features/QA artifacts into `reports/weather_flag_qa/` when the flag is ON.
- **Do not** modify forecast calculations or CSV outputs.

## Files to touch
- scripts/ingest_and_forecast.py (read scenario, pass cfg; do not alter math)
- src/scenarios/manager.py (minor helpers if needed; keep dataclass)
- src/plugins/loader.py (no change to API; use `PluginMeta`)
- src/plugins/weather/{adapter.py,features.py,join.py,qa.py} (keep stubs; only used when flag ON and for QA artifacts)

## Tests (gate: no-change)
- Unskip FLG‑001 in `tests/specs/test_scenario_plugin_shells.py`.
- Add `tests/e2e/test_weather_flag_no_change.py`:
  - Build tiny fixtures (daily+monthly) under `tmp_path`.
  - Run CLI twice:
    1) baseline (no `--scenario-path`)
    2) with `--scenario-path scenarios/weather_only.yml` (has `flags.use_weather: false`)
  - Assert that produced forecast CSVs (daily/monthly) are identical (checksum match).
- Add `tests/weather/test_weather_flag_qa.py` (flag ON path):
  - With `flags.use_weather: true`, assert that QA artifacts are created under `reports/weather_flag_qa/` (e.g., mapping/coverage CSV), but **no** change in forecast CSVs.

## Acceptance criteria
- pytest/spec_sync/docs_check green; coverage gates unchanged.
- With flag OFF → outputs equal golden (byte-level).
- With flag ON → QA artifacts appear; forecast CSVs unchanged.

## Non-goals
- No feature importance, no model changes, no Golden Bump.

## Commands
pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py

