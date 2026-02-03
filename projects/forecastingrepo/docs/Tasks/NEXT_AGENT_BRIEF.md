# Next Agent Brief — Review Follow-up Sprint

This round is about clearing reviewer feedback captured under `reviews/20251105/`. Each bundle has
`0_submission/` (what we sent), `1_feedback/` (their packet), and `2_followup/` (open items).

## Start Here
- docs/Tasks/NEXT_AGENT_SCOUT.md (line map to hot files)
- docs/Tasks/BE_START_HERE.md (single-page BE handoff)
- docs/Tasks/BE_SCOUT_PR18_PR17.md (scout brief for PR‑18/PR‑17 BE endpoints)
- reviews/20251105/postreview/SUMMARY.md (bundle-level recap)
- reviews/20251105/postreview/shared/ (shared guides, e.g., site_wape_fix.py)

## Baseline Rules
- Default forecasts must not change. Any baseline change requires a Golden Bump (docs/System/Golden_Bump.md).
- Never commit secrets (`~/.cdsapirc`, `.env`) or raw data (`data/raw/**`, `*.xlsx`).

## Gates (run before handing off)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py
```

CI already exports `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg MPLCONFIGDIR=${{ runner.temp }}`.

## Tasks to Close (ordered by reviewer severity)
1. **Core pipeline patch set** — Apply simulator reset heuristic (flag default OFF), baseline `fillna(0.0)` fallback, and reconcile unmapped-site warning/default. See `reviews/20251105/core_pipeline/2_followup/backend_sites.md` and the original package in `core_pipeline/1_feedback/`.
2. **Site backtest aggregate WAPE** — Implement aggregate site-level WAPE summary using the provided guide (`reviews/20251105/backtesting_eval/2_followup/backend_site_backtest.md` + `postreview/shared/IMPLEMENTATION_GUIDE.md`, `postreview/shared/site_wape_fix.py`).
3. **Docs/scenario cleanup** — Remove markdown tail from `scenarios/site_level.yml`, set `tolerance_pct: 0.005  # 0.5%`, and fix the user-specific path in `docs/data/DATA_INVENTORY.md` (see `reviews/20251105/docs_and_schema/2_followup/docs_scenarios_data.md`).
4. **API contracts & ADR log** — Add FastAPI response models, export OpenAPI via `scripts/export_openapi.py`, regenerate `docs/api/openapi.json`, and publish ADR-0001..0006 + decisions index (source: coordinator 2025-11-05 memo).
   - Scout→Plan references: `plans/PR-18_site_forecast_be.plan.md`, `plans/PR-17_routes_forecast_be.plan.md`.
5. **Behave smoke enforcement & context bundles** — Tag smoke features (`specs/bdd/features/api_*_smoke.feature`), run Behave (no dry-run) in CI, and ship concatenated context via `tools/concat_context.py` (see plan `plans/2025-11-05_be_openapi_adr.plan.md`).
6. **UI (already addressed)** — Sidebar IDs and CSV UX landed; keep Playwright smokes/bundle current (see `reviews/20251105/ui_components/2_followup/ui_components.md` for confirmation). Only follow-up if new feedback arrives.
7. **Post-demo follow-ups (tracked, no action now)** — Router split, deeper core extraction, review registry enforcement expansion, additional Behave features beyond smoke scope.

Open tasks mirror `docs/Tasks/TASKS_OPEN.md` (T-SITES-003, T-BACKTEST-004, T-SCENARIO-005, T-UI-001/T-UI-002 optional).

## UI — Immediate Checklist (10 minutes)
- Verify prod alias and date
  - UI: https://mytko-forecast-ui.vercel.app
  - Demo date: 2024-08-03 (seeded from `/api/metrics`)
- Refresh the UI bundle with HTML report + timings
  - `cd ui/forecast-ui && npm run bundle:review`
  - Result: `~/Downloads/ui_review_bundle_<timestamp>.zip`
  - Drop ZIP into reviewer folders: `/Users/m/Downloads/review_flat_20251105_134628/UI_*`
- Keep smokes green (serial, timeouts)
  - PR: 30s tests (routes spec cap 45s); Nightly: 60s + downloads
- Guardrails
  - No behavior changes; keep fallback when `/api/routes` empty by deriving from `/api/sites`.

## Reading Checklist
- reviews/20251105/original/MASTER_CODE_REVIEW.md (baseline review)
- reviews/20251105/core_pipeline/1_feedback/**
- reviews/20251105/backtesting_eval/1_feedback/**
- reviews/20251105/ui_components/1_feedback/** (for context, already satisfied)
- reviews/20251105/ui_config/1_feedback/** + `ui_supporting_bundle/`
- docs/SOP/standard-operating-procedures.md
- docs/adr/ADR-003_metrics_wape_smape_mae.md
- docs/System/Spec_Sync.md, docs/System/Testing.md, docs/System/CI_CD.md

## Guardrails (repeat)
- Keep weather/exogenous features behind scenario flags unless explicitly enabled.
- Golden baseline (`tests/golden/`) must stay green; rerun Golden Bump only when instructed.
- Preserve deterministic settings in scripts and CI.
