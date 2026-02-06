# Scout Notes — Follow-up Map

All references are 1-based line numbers. Search the surrounding context if your editor displays different numbers.

## 1. Core Pipeline Fixes (`reviews/20251105/core_pipeline/`)
- **Reviewer feedback:** `2_followup/backend_sites.md`
- **Original packet:** `1_feedback/Core_Pipeline_Code_Review/`
- Touch points:
  - `src/sites/simulator.py` — loop beginning ~46 (add near-capacity reset; keep flag default OFF)
  - `src/sites/baseline.py` — aggregation block ~36-48 (fill fallback with 0.0)
  - `src/sites/reconcile.py` — after merge with registry (~26-40) add unmapped-site warning/default
  - `tests/scripts/test_*` — ensure coverage updates if logic changes

## 2. Site Backtest Aggregate WAPE (`reviews/20251105/backtesting_eval/`)
- **Reviewer feedback:** `2_followup/backend_site_backtest.md`
- **Shared guide:** `postreview/shared/IMPLEMENTATION_GUIDE.md`, `postreview/shared/site_wape_fix.py`
- Modify `scripts/backtest_sites.py`:
  - Add `compute_site_aggregate_wapes()` near helper section (~60-110)
  - Replace `write_summary()` (~160-230) with aggregate version from guide
  - Check `tests/backtest/test_backtest_eval.py` (may need new asserts)
  - Regenerate SUMMARY.md via existing CLI after code change

## 3. Scenario/Data Cleanup (`reviews/20251105/docs_and_schema/`)
- **Reviewer feedback:** `2_followup/docs_scenarios_data.md`
- Tasks:
  - `scenarios/site_level.yml` — remove markdown tail (file should end after `qa:` block) and set `tolerance_pct: 0.005  # 0.5%`
  - `docs/data/DATA_INVENTORY.md` — replace user-specific path with neutral instruction

## 4. API Contracts & OpenAPI (`reviews/20251105/backend_api/`, coordinator memo)
- **Reviewer feedback:** `backend_api/2_followup/backend_api.md` and coordinator 2025-11-05 decisions
- Touch points:
  - `scripts/api_app.py` — add Pydantic models for metrics/districts/sites/routes/trajectory responses
  - `scripts/export_openapi.py` — new helper to export schema (`--write`/`--check`)
  - `docs/api/openapi.json` — generated artifact for reviewers
  - `.github/workflows/ci.yml` — enforce Behave smokes + OpenAPI check
  - `specs/bdd/features/api_metrics_smoke.feature` (and siblings) — tag with `@smoke`

## 5. Context Bundles & SOP Notes
- `tools/concat_context.py` — generate concatenated reviewer context (new script)
- `docs/Tasks/context_manifest.yml` — manifest describing which files to include
- `docs/System/Review_Pack.md`, `reviews/DEMO_FREEZE.md` — update with OpenAPI/context commands
- `docs/SOP/review-process.md` — add registry/context bullet

## 6. UI (references and quick map)
- Confirmation lives in:
  - `reviews/20251105/ui_components/2_followup/ui_components.md`
  - `reviews/20251105/ui_config/2_followup/ui_config_support.md`
- Touch points:
  - `ui/forecast-ui/src/components/Sidebar.tsx` — menu IDs (overview/districts/sites/routes/routes2)
  - `ui/forecast-ui/src/components/Layout.tsx` — render tabs only when `currentSection === 'forecast'`
  - `ui/forecast-ui/src/components/Routes.tsx` — CSV download buttons (`Скачивание…` state, disabled while busy)
  - `ui/forecast-ui/tests/e2e/*.spec.ts` — serial smokes (routes/districts/sites; routes spec cap 45s)
  - `ui/forecast-ui/scripts/make_ui_review_bundle.sh` — bundler (dist + HTML report + TIMINGS)
  - `ui/forecast-ui/docs/SOP/TEST_RUN_SOP.md` — timeouts, background runs, expected durations

## Shared References
- `reviews/20251105/original/MASTER_CODE_REVIEW.md`
- `reviews/20251105/original/NEXT_AGENT_REVIEW_FIXES.md`
- `reviews/20251105/postreview/shared/FINAL_VERIFICATION.md`

## Quick Tests After Changes
- Simulator/baseline/reconcile updates → `pytest tests/scripts/test_ingest_* tests/scripts/test_forecast_unit_path.py`
- Backtest summary → `pytest tests/backtest/` and rerun `scripts/backtest_sites.py` on sample data if feasible
- Scenario/doc edits → `python .tools/spec_sync.py`, `python .tools/docs_check.py`

## Guardrails (repeat)
- Never commit secrets (`~/.cdsapirc`, `.env`); docs/AgentMode/cdsapirc.example shows the safe template.
- Never commit `data/raw/**` or `*.xlsx`; use synthetic fixtures.
- Default outputs must stay unchanged unless a Golden Bump is approved.

---

## Appendix — File & Line Anchors (2025‑11‑05)

All references are 1‑based line numbers; open the files in your editor and go to the anchor lines.

### A. Core Pipeline Fix Set
- `src/sites/simulator.py:8`
  - `def simulate_fill(...)` — add flag‑gated near‑capacity reset (default OFF). Place the reset check right after the row append in the date loop (~55).
- `src/sites/baseline.py:9`
  - `def estimate_weekday_rates(...)` — ensure weekday aggregates/fallbacks don’t produce NaNs; add `.fillna(0.0)` and per‑weekday fallback to overall mean when `min_obs` not met.
- `src/sites/reconcile.py:50`
  - After merge with registry, warn on unmapped sites (district NaN). Tolerance logic at lines 68–96 divides `tolerance_pct` by 100. Keep YAML at `0.5` (i.e., 0.5%).

### B. Site Backtest Aggregate WAPE (eval‑only)
- `scripts/backtest_sites.py:53`
  - WAPE helpers live here; add `compute_site_aggregate_wapes()` near helper section (~60–110).
- `scripts/backtest_sites.py:164`
  - `write_summary()` currently writes simple quantiles; replace with aggregate WAPE version from guide (include Overall + Median per‑site).
- `scripts/backtest_sites.py:220`
  - Ensure the call to `write_summary(...)` remains (new implementation will be invoked here).
- Reviewer guidance
  - `reviews/20251105/backtesting_eval/2_followup/backend_site_backtest.md:1`
  - `reviews/20251105/postreview/shared/IMPLEMENTATION_GUIDE.md:1`
  - `reviews/20251105/postreview/shared/site_wape_fix.py:1`

### C. Scenario / Docs Cleanup
- `scenarios/site_level.yml:1`
  - Keep YAML through the `qa:` block (lines 1–23). Remove markdown tail starting at line 25.
  - Set `params.reconciliation.tolerance_pct: 0.5  # 0.5%` (matches reconcile division by 100).
  - Add `reset_on_near_capacity: false` under `params.simulator`.
- `docs/data/DATA_INVENTORY.md:10`
  - Replace the user‑specific path (`/Users/...`) with a neutral instruction (e.g., “place archive under `data/raw/weather/`”).

### D. API App (verify, no change unless broken)
- `scripts/api_app.py:97` — CORS lock via env (must be prod alias).
- `scripts/api_app.py:123` — Security headers middleware (nosniff, frame‑deny, no‑referrer).
- `scripts/api_app.py:153` — `/api/metrics` injects `demo_default_date` (UI reads it).
- `scripts/api_app.py:243` — `/api/sites` handler shape stable (CSV + JSON).
- `scripts/api_app.py:283` — `/api/routes` handler; ensure demo date populated (server CSVs).

### E. UI (reference only; addressed)
- `ui/forecast-ui/src/components/Sidebar.tsx:10` — menu IDs: overview/districts/sites/routes/routes2.
- `ui/forecast-ui/src/components/Layout.tsx:51` — render tabs only when `currentSection === 'forecast'`.
- `ui/forecast-ui/src/components/Routes.tsx:22` — CSV buttons show “Скачивание…” and disable while busy.
- `ui/forecast-ui/tests/e2e/routes_table.spec.ts:5` — routes smoke; optional download in PR; allowed nightly.
- `ui/forecast-ui/scripts/make_ui_review_bundle.sh:1` — bundler (dist + HTML report + TIMINGS).
- `ui/forecast-ui/docs/SOP/TEST_RUN_SOP.md:1` — timeouts/background runs/expected durations.

### F. Review Archive (UI timelines)
- UI Components: `reviews/20251105/ui_components/{0_submission,1_feedback,2_followup}`
- UI Config & Demo: `reviews/20251105/ui_config/{0_submission,1_feedback,2_followup}`
- UI Supporting: `reviews/20251105/original/ui_supporting_bundle/*`

### G. Acceptance & Smoke Commands
- Curls (prod tunnel): see `reviews/DEMO_FREEZE.md:1` (metrics/districts/sites/routes).
- UI E2E (prod alias): PR smokes 30s (routes cap 45s); nightly 60s, downloads on.

### H. Concrete Order of Work
1) Core pipeline fixes — simulator reset (flag OFF), baseline fillna, reconcile warn/default.
2) Backtest aggregate WAPE — implement and update SUMMARY (eval‑only).
3) Scenario/docs cleanup — YAML tail removal; tolerance_pct; inventory path.
4) Validate — pytest/spec_sync/docs_check; API curls; UI E2E smokes; regenerate and drop UI bundle.
