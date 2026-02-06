# Archived Snapshot — NEXT_AGENT_BRIEF.md (2025-11-03)

This is a frozen copy of docs/Tasks/NEXT_AGENT_BRIEF.md at the start of the current agent session. The live working file remains at docs/Tasks/NEXT_AGENT_BRIEF.md to preserve links.

---

# Next Agent Brief — Phase‑2 Start

## Start Here
- docs/Tasks/NEXT_AGENT_BRIEF.md (this file)
- docs/Tasks/NEXT_AGENT_SCOUT.md (file + line map)

## Baseline Rules
- Do not change default forecasts; any baseline change needs a Golden Bump (docs/System/Golden_Bump.md).
- Never commit secrets (`~/.cdsapirc`, `.env`) or raw data (`data/raw/**`, `*.xlsx`).

## Gates (every PR)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py
```

## CI Environment
Set in CI (already configured):
`PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg MPLCONFIGDIR=${{ runner.temp }}`

## PR Queue (in order; small, interfaces first)
1. PR‑13: Unify scenario/plugin contracts (manifest.id, PluginMeta, scenario dataclass). Read specs; interfaces only; no wiring. Extend `tests/specs/test_scenario_plugin_shells.py`; unskip PLG‑UNI‑001.
2. PR‑14: Weather behind flag (default off). Implement flag parsing/path; e2e assert‑no‑change; unskip FLG‑001.
3. PR‑15: Rolling‑origin backtest aggregator. Add small orchestrator; deterministic outputs; unskip BT‑RO‑001.
4. PR‑16: IDW tuning (evaluation‑only). Grid over p/radius/min; produce MD+CSV; no pipeline change.

## Spec‑Sync Stubs (present to guide PRs)
- specs/bdd/features/plugin_contract_unify.feature (PLG‑UNI‑001)
- specs/bdd/features/weather_flag.feature (FLG‑001)
- specs/bdd/features/rolling_origin.feature (BT‑RO‑001)
- tests/specs/test_scenario_plugin_shells.py (skipped stubs to unskip PR‑by‑PR)

## Final Sanity Before You Start
- PR #9: scope is backtest + tests + CI only; CI green (runpy fallback kept). Merge and tag `v0.1.1`.
- PR #10: docs import contains `docs/AgentMode/cdsapirc.example`, `docs/System/Golden_Bump.md`, inbox‑handling SOP, and full research bib/links; docs_check OK. Merge and tag `v0.1.2`.
- PR #12: offline A/B is eval‑only; merge when convenient.
- Update `PROGRESS.md` after each merge/tag.

## Reading List (read fully)
- AGENTS.md
- docs/Tasks/NEXT_AGENT_BRIEF.md, docs/Tasks/NEXT_AGENT_SCOUT.md
- docs/SOP/standard-operating-procedures.md
- docs/System/Golden_Bump.md
- specs/source-plugins/PLUGIN_CONTRACT.md
- specs/scenarios/SCENARIO_SPEC.md
- docs/adr/ADR-003_metrics_wape_smape_mae.md
- docs/research/weather_features.md, docs/research/evaluation_patterns.md
- docs/System/Spec_Sync.md, docs/System/Testing.md, docs/System/CI_CD.md

## Guardrails (repeat)
- Keep weather and other exogenous sources behind flags unless a scenario enables them.
- Default scenario remains baseline; golden test must stay green.

