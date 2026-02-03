# PR Ladder (Sequential Roadmap for the Coding Agent)

**Goal.** Ship in small, reviewable PRs. Each PR lists: scope, what to read, what to change, tests/docs, CI gates, acceptance.  
**Key guardrails.** Weather stays **behind a flag**; baseline **golden** must remain stable (no default behavior changes) until explicitly approved.

```mermaid
flowchart LR
PR10[PR-10 Docs Import] --> PR11[PR-11 Review Bundle SOP]
PR11 --> PR12[PR-12 Offline Weather A/B]
PR12 --> PR13[PR-13 Scenario/Plugin Contract Unify]
PR13 --> PR14[PR-14 Weather Flag Integration]
PR14 --> PR15[PR-15 Backtest Rolling-Origin]
PR15 --> PR16[PR-16 IDW Tuning]
PR16 --> PR17[PR-17 Reconciliation Eval (MinT-OLS)]
PR17 --> PR18[PR-18 Delivery Workflow]
PR18 --> PR19[PR-19 XLSX Autodetect]
PR19 --> PR20[PR-20 Header Aliasing/Fuzzy]
```

## PR‑10 — Docs: import research set + complete index (no behavior changes)

**Branch:** `docs/import-research-set`
**Title:** `docs: import research set + complete index (no behavior changes)`

**Read first**

* docs/System/Onboarding.md
* docs/System/documentation-index.md
* docs/SOP/standard-operating-procedures.md
* docs/SOP/policies.md (if missing, add in this PR)
* docs/research/* (the provided files)

**Change**

* Add/confirm:

  * `docs/research/{findings.md,msw_sota.md,hierarchical_reconciliation.md,metrics_review.md,weather_features.md,evaluation_patterns.md,bibliography.bib,links.csv}`
* Ensure `docs/System/documentation-index.md` links to all Research docs.
* Do not touch Python code.

**Tests/Docs/Gates**

* docs_check: **OK**
* spec_sync: **unchanged**
* coverage: **N/A**

**Acceptance**

* All index links resolve; no code changes.

---

## PR‑11 — Docs: review bundle SOP

**Branch:** `docs/review-bundle-sop`
**Title:** `docs: add review bundle SOP (portable ZIP)`

**Read first**

* docs/SOP/standard-operating-procedures.md
* docs/System/CI_CD.md
* docs/Tasks/VALIDATION_CHECKLIST_Current_State.md
* docs/SOP/review-bundle.md (this PR)

**Change**

* Add `docs/SOP/review-bundle.md` (exact SOP in repo).
* Optionally link from docs/System/documentation-index.md under *Tasks & SOPs*.

**Gates**

* docs_check: **OK**

**Acceptance**

* SOP renders correctly; no code changes.

---

## PR‑12 — Feat: Weather A/B (offline, evaluation‑only; no forecast changes)

**Branch:** `feat/weather-ab-offline`
**Title:** `feat: weather A/B (offline evaluation only; no forecast changes)`

**Read first**

* docs/Tasks/PR-Weather-AB-Local.md
* docs/research/weather_features.md
* docs/research/evaluation_patterns.md
* docs/System/AgentMode.md
* docs/AgentMode/ZIP_IMPORT.md

**Change**

* Add **one small CLI** (if not already present):

  * `scripts/weather_join_local.py` (offline: local CSV/NetCDF/GeoJSON → features → correlations)
* Optionally add minimal helpers under `src/plugins/weather/` **only** if needed by the CLI (adapter/features/join/qa); keep changes small.
* Do **not** touch ingest/forecast pipeline defaults.

**Tests**

* Tiny toy test that runs the CLI on micro fixtures and asserts the report files exist with expected columns.
* Keep deterministic env.

**Docs**

* Ensure `docs/Tasks/PR-Weather-AB-Local.md` shows the exact command.
* Add `docs/AgentMode/ZIP_IMPORT.md` if missing.

**Gates**

* tests/spec_sync/docs_check green; coverage ≥ 85% (the small test helps).

**Acceptance**

* `reports/weather_ab/*` generated locally; **no forecast outputs changed**.

---

## PR‑13 — Chore: unify Scenario/Plugin contracts (id vs name; return types)

**Branch:** `chore/scenario-plugin-contract-unify`
**Title:** `chore: unify scenario/plugin contracts (manifest id, loader meta)`

**Read first**

* specs/source-plugins/PLUGIN_CONTRACT.md
* specs/scenarios/SCENARIO_SPEC.md
* src/plugins/loader.py, src/scenarios/manager.py

**Change**

* Manifest: standardize on `id` (not `name`).
* Loader: return a `PluginMeta` object (not dict) per contract.
* Scenario manager: converge to dataclass shape per SCENARIO_SPEC.
* **Do not wire weather into pipeline defaults**.

**Tests**

* Extend `tests/specs/test_scenario_plugin_shells.py` to match the unified interfaces.

**Gates**

* tests/spec_sync/docs_check green; coverage unchanged or higher.

**Acceptance**

* Interfaces match the specs; baseline forecasts unchanged.

---

## PR‑14 — Feat: weather flag integration (scenario‑driven; default off)

**Branch:** `feat/weather-flag-integration`
**Title:** `feat: scenario‑driven weather integration (default off; golden stable)`

**Read first**

* scenarios/weather_idw_tuned.yml
* specs/scenarios/SCENARIO_SPEC.md
* docs/research/weather_features.md
* docs/research/metrics_review.md

**Change**

* Implement weather feature computation path **behind a scenario flag**.
* Default scenario = baseline; **no change** to outputs unless scenario explicitly enables weather.
* Add **assert‑no‑change** tests: when flag is off, outputs **exactly** match golden.

**Tests**

* Unit tests for flag parsing & switch; e2e test confirming “flag off → identical outputs”.

**Gates**

* Golden unchanged; tests green.

**Acceptance**

* Weather ready but dormant; golden baseline remains stable.

---

## PR‑15 — Feat: backtest rolling‑origin + scoreboard aggregator

**Branch:** `feat/backtest-rolling-origin`
**Title:** `feat: rolling-origin backtests and scoreboard aggregator`

**Read first**

* docs/research/evaluation_patterns.md
* docs/eval/EVALUATION_PLAN.md
* scripts/backtest_eval.py

**Change**

* Add rolling split generator (e.g., 3–5 cutoffs).
* Aggregate per‑window metrics (WAPE/SMAPE/MAE) into a single CSV/JSON.
* Optional: simple MD summary.

**Tests**

* Tiny fixtures; assert the aggregator schema and deterministic content.

**Gates**

* tests/spec_sync/docs_check green.

**Acceptance**

* Reproducible multi‑cutoff reports; no pipeline behavior change.

---

## PR‑16 — Feat: IDW tuning (eval‑only)

**Branch:** `feat/idw-tuning-eval-only`
**Title:** `feat: IDW parameter tuning (p, radius, min_stations) — eval only`

**Read first**

* docs/research/weather_features.md
* A/B outputs from PR‑12
* scenarios/weather_idw_tuned.yml

**Change**

* Add tuning routine (grid over p ∈ {1.5, 2.0, 2.5}, radius ∈ {50,75,100} km, min ∈ {2,3,4}) on training folds only.
* Emit tuning report; **no default changes**.

**Tests**

* Unit test on a miniature geometry/station pair.

**Gates**

* tests/spec_sync/docs_check green.

**Acceptance**

* Tuning report written; not wired by default.

---

## PR‑17 — Feat: reconciliation eval (MinT‑OLS), evaluation‑time only

**Branch:** `feat/reconciliation-eval-mint-ols`
**Title:** `feat: reconciliation (MinT-OLS) at evaluation time — no training change`

**Read first**

* docs/research/hierarchical_reconciliation.md
* docs/adr/ADR-008_hierarchical_reconciliation_eval_only.md
* docs/research/metrics_review.md

**Change**

* Add an **evaluation‑time** reconciliation script producing alt coherent series for comparison; keep **deliverables** = bottom‑up (district sum).
* Compare WAPE/SMAPE vs. baseline.

**Tests**

* Toy hierarchy; assert coherence and metric calculations.

**Gates**

* tests/spec_sync/docs_check green.

**Acceptance**

* Reconciled alternatives evaluated; deliverables unchanged.

---

## PR‑18 — CI: delivery workflow to sanitized repo

**Branch:** `ci/deliver-workflow`
**Title:** `ci: add deliver.yml (sanitized export to delivery repo)`

**Read first**

* docs/SOP/review-bundle.md
* docs/System/CI_CD.md

**Change**

* Add GitHub Actions `deliver.yml`:

  * Trigger: tags `deliver-*`
  * Steps: run tests/spec_sync/docs_check; build sanitized tree (allowlist); scan for secrets; push to **private delivery repo**
* RU docs skeleton (if required by client) — optional placeholder.

**Tests**

* Dry-run action in a fork or on a non‑prod branch (documentation-only here).

**Gates**

* docs_check updated to link deliver docs if added.

**Acceptance**

* One‑way export works; no secrets or raw data included.

---

## PR‑19 — Feat: XLSX worksheet autodetect (backlog)

**Branch:** `feat/xlsx-autodetect`
**Title:** `feat: XLSX worksheet autodetect + sheet/header detection`

**Read first**

* BACKLOG items (Phase‑0 defers)
* docs/data/DATA_QUALITY_CHECKS.md
* tests/data/fixtures/ (create tiny XLSX fixtures)

**Change**

* Replace hard‑coded `sheet2.xml` with autodetect of header row + sheet.
* Heuristics for Russian labels (Район, Вес, тонн, …).
* Configurable aliases; fuzzy/regex matching.

**Tests**

* Unit tests with tiny XLSX fixtures (several permutations).

**Gates**

* coverage ≥ 85%; tests/spec_sync/docs_check green.

**Acceptance**

* Robust ingest for XLSX variations; current CSV pipeline remains supported.

---

## PR‑20 — Feat: header aliasing/fuzzy mapping (backlog)

**Branch:** `feat/header-alias-fuzzy`
**Title:** `feat: header aliasing and fuzzy label mapping (RU)`

**Read first**

* docs/data/DATA_CONTRACTS.md
* docs/data/DATA_QUALITY_CHECKS.md

**Change**

* Alias table + regex/fuzzy matching for RU headers; config file checked into repo.
* Logging on ambiguous matches; fail‑fast with helpful messages.

**Tests**

* Unit tests with synthetic CSV/XLSX headers.

**Gates**

* coverage ≥ 85%; tests/spec_sync/docs_check green.

**Acceptance**

* Ingest resilient to minor label drift; clear diagnostics.

---

## Common CI Gates (for every PR)

* `pytest -q --cov=scripts --cov-report=term-missing`
* `python .tools/spec_sync.py`
* `python .tools/docs_check.py`
* Coverage: **global ≥ 85%**; critical module (ingest_and_forecast.py) **≥ 90%**
* Determinism env in CI test step:

  * `PYTHONHASHSEED=0`, `TZ=UTC`, `LC_ALL=C.UTF-8`, `MPLBACKEND=Agg`, `MPLCONFIGDIR=${{ runner.temp }}`

---

**How to use this now**

1) Ask the coding agent to run `docs/Tasks/VALIDATION_CHECKLIST_Current_State.md` locally.  
2) If everything is green (or once PR #9 coverage is green), proceed with **PR‑10** and follow the ladder in order.  
3) Keep each PR *small, docs/tests first*, and **never change default forecast outputs** unless we explicitly approve a golden update.
