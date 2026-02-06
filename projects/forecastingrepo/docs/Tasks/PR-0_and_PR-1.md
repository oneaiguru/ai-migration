# PR‑0 and PR‑1 Task Brief

## PR‑0: Scenario + Plugin Scaffolding (No Behavior Change)

Goal: introduce scenario configs and plugin discovery without changing any forecasts by default. Keep baseline outputs identical.

Scope
- Docs:
  - docs/architecture/VDD.md
  - specs/source-plugins/PLUGIN_CONTRACT.md
  - specs/scenarios/SCENARIO_SPEC.md
  - scenarios/baseline.yml, scenarios/weather_only.yml
- Scaffold modules:
  - src/scenarios/manager.py (load_scenario, apply_overrides, is_enabled)
  - src/plugins/loader.py (discover(), get())
  - src/plugins/weather/{manifest.yml,adapter.py,features.py,join.py,qa.py} (stubs)
- CLI (scripts/ingest_and_forecast.py)
  - Parse new flags only: --scenario-path, --flag key=value, --param key=value
  - No pipeline changes yet
- Golden regression scaffold
  - tests/golden/golden.yml (placeholder)
  - tests/specs/test_scenario_plugin_shells.py covers:
    - SCN-001: scenario parsing/overrides
    - SCN-002: disabled sources leave outputs unchanged (flag false)
    - PLG-001: plugin discovery finds weather
    - GOLD-001: golden scaffold present (skips until populated)

Gates (must pass)
- pytest green; coverage ≥85%
- spec_sync OK (SCN-001..002, PLG-001, GOLD-001)
- docs_check OK (new docs linked from Onboarding)
- No behavior change (baseline runs unaffected)

How to run locally
```
pytest -q --cov=scripts --cov-report=xml
python .tools/spec_sync.py
python .tools/docs_check.py
```

Next (after merge)
- PR-1: Weather plugin actual features (behind flag)
- PR-2: Backtest driver + scoreboards

## PR‑1: Weather plugin (skeleton)
- Implement feature plumbing behind a disabled flag.
- Keep baseline outputs unchanged by default; enable only via scenario flag.

