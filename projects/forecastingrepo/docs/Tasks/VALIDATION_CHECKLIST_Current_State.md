# Current-State Validation Checklist (Run Locally)

This checklist is the single source of truth to confirm the repo matches our shared plan before the next sequence of PRs.

## 1) Branch & PR status
- [ ] PR #9 exists: **feat/backtest driver & scoreboard (no model change)**
- [ ] Files in PR #9 include:
  - scripts/backtest_eval.py
  - tests/backtest/test_backtest_eval.py
  - tests/backtest/test_metrics_unit.py
  - tests/backtest/test_cli_errors.py
  - tests/scripts/test_ingest_helpers.py
  - tests/viz/test_quicklook_unit.py
  - specs/bdd/features/backtest.feature
  - specs/unit-md/unit_metrics.md
  - docs/System/Quicklook.md
  - scripts/bootstrap.sh
  - .github/workflows/ci.yml (exporting: PYTHONHASHSEED=0, TZ=UTC, LC_ALL=C.UTF-8, MPLBACKEND=Agg, MPLCONFIGDIR=${{ runner.temp }})

## 2) Core docs present on main
- [ ] docs/System/Onboarding.md
- [ ] docs/System/Quicklook.md
- [ ] docs/System/Spec_Sync.md
- [ ] docs/System/CI_CD.md
- [ ] docs/System/documentation-index.md
- [ ] docs/SOP/standard-operating-procedures.md
- [ ] docs/SOP/policies.md (if not, add via docs-only PR)
- [ ] docs/architecture/VDD.md
- [ ] specs/scenarios/SCENARIO_SPEC.md
- [ ] specs/source-plugins/PLUGIN_CONTRACT.md

## 3) Research docs complete (no dead links in index)
- [ ] docs/research/findings.md
- [ ] docs/research/msw_sota.md
- [ ] docs/research/hierarchical_reconciliation.md
- [ ] docs/research/metrics_review.md
- [ ] docs/research/weather_features.md
- [ ] docs/research/evaluation_patterns.md
- [ ] docs/research/bibliography.bib
- [ ] docs/research/links.csv

## 4) Tasks & Agent-Mode docs
- [ ] docs/Tasks/PR-0_and_PR-1.md
- [ ] docs/Tasks/PR-Weather-AB-Local.md (offline A/B brief)
- [ ] docs/System/AgentMode.md
- [ ] docs/AgentMode/{AGENT_MODE_PLAYBOOK.md,SITES.md,FILES_TO_PRODUCE.md,ZIP_IMPORT.md,HANDOFF_MANIFEST.md}

## 5) Scenarios (examples)
- [ ] scenarios/weather_idw_tuned.yml

## 6) Gates are runnable and green locally
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py
```

* [ ] tests: green
* [ ] spec_sync: OK
* [ ] docs_check: OK
* [ ] Coverage: **global ≥ 85%** (PR #9 should satisfy)
* [ ] Critical module threshold ≥ 90% (scripts/ingest_and_forecast.py)

## 7) Golden & hygiene

* [ ] tests/golden/golden.yml present (hashes pinned or placeholder per plan)
* [ ] If test_golden_baseline.py exists, it passes on main
* [ ] .gitignore excludes deliveries/, forecasts/, data/raw/**, *.xlsx, spec_registry/spec_index.yml
* [ ] No secrets committed (.env, ~/.cdsapirc, tokens)
