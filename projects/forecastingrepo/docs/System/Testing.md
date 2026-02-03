# Testing
## BDD-ish approach with Spec-IDs
- Behavior specs live in `.feature` files (Gherkin), but tests are standard pytest marked with `@pytest.mark.spec_id("ID")`.
- `spec_sync.py` enforces mapping: every Spec-ID must appear in both docs and tests.

## Coverage Targets
- Global ≥ 85%; critical modules (scripts/ingest_and_forecast.py) ≥ 90%.
- "No regression" gate: PR coverage must not drop vs main by >0.5%.

## Determinism
- CI sets `PYTHONHASHSEED=0`. Tests avoid wall-clock and random sources.

## Test Data Sources
- Prefer fixture CSVs or temp files for unit tests; do not rely on the full site-level datasets by default.
- Rolling forecast integration tests require the full site-level CSVs and are opt-in:
  - Set `RUN_SLOW_TESTS=1` to run `tests/api/test_rolling_forecast_endpoint.py`.
- When running locally with small fixtures, override data paths:
  - `export SITES_SERVICE_PATH=/path/to/fixture_sites_service.csv`
  - `export SITES_REGISTRY_PATH=/path/to/fixture_sites_registry.csv`
- The full site-level CSVs are not committed to git; see `docs/SOP/DATA_SOURCES.md`.

## CLI Testing Patterns
- Prefer in-process invocations for CLIs when feasible (e.g., `runpy.run_path` or module `main()`), otherwise use `subprocess.run` with a clean environment.
- Always run under a temporary working directory: `monkeypatch.chdir(tmp_path)` so tests never write to repo paths.
- For visualization tests, enforce headless mode (`matplotlib.use("Agg")`) and set `MPLBACKEND=Agg`; optionally set `MPLCONFIGDIR` to a temp directory in CI.

## Async Fixtures (pytest-asyncio)
- If `pytest-asyncio` is installed, you may set in `pytest.ini`:
  - `asyncio_default_fixture_loop_scope = function`
- Omit the setting when the plugin is not installed to avoid `PytestConfigWarning`.
- Keep async tests deterministic; avoid time-based sleeps where possible.
