# Backend Agent Session Task List (Demo Freeze)

## Source Instructions
- Coordinator “Backend (BE) — 30–45 min checklist” (README_COORDINATOR_DROP + DEMO_FREEZE).
- Master/system reviews under `reviews/20251105/` (core pipeline, backtesting evaluation, docs/schema, backend API).
- OpenAPI/ADR coordination memo (2025-11-05) and the active execution plan `plans/2025-11-05_be_openapi_adr.plan.md`.
- Scout map `docs/Tasks/NEXT_AGENT_SCOUT.md`.

## Required Context (read before editing)
- CE MAGIC prompts & context-engineering playbook (`/Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/`, `context-engineering.md`).
- Review bundles relevant to BE scope (core pipeline, backtesting_eval, docs_and_schema, backend_api, UI confirmations).
- ADR folder (`docs/ADR/DECISIONS_INDEX.md` and linked records).
- Coordinator docs: `docs/System/Review_Pack.md`, `reviews/DEMO_FREEZE.md`.

## Work Items (Scout → Plan → Execute cadence)
1. **Demo configuration freeze (local default)**
   - Local is default: start API with `API_CORS_ORIGIN=http://127.0.0.1:4173`, `DEMO_DEFAULT_DATE=2024-08-03`.
   - Use `scripts/dev/local_demo_up.sh` to bring up local API+UI for demo validation (see `docs/SOP/LOCAL_DEMO_QUICKSTART.md`).
   - Remote BASE (tunnel/Vercel) is optional; if needed, verify `<BASE>/api/metrics` = 200 before updating Vercel `VITE_API_URL`.
   - Capture curl outputs in `reviews/NOTES/api.md` (include `/openapi.json`).

2. **Routes data sanity**
   - Ensure `reports/sites_demo/routes/recommendations_{strict,showcase}_2024-08-03.csv` exist and populate `/api/routes?...` responses.

3. **Backtest summary update**
   - Implement/verify aggregate site-level WAPE summary in `scripts/backtest_sites.py` per evaluator guide (`postreview/shared/IMPLEMENTATION_GUIDE.md`, `site_wape_fix.py`).
   - Re-generate `SUMMARY.md` showing Overall site WAPE + median per-site WAPE.

4. **Core pipeline follow-ups (no behavioural change by default)**
   - `src/sites/simulator.py`: keep flag-gated near-capacity reset (`reset_on_near_capacity = False` by default).
   - `src/sites/baseline.py`: ensure fallback `.fillna(0.0)` to prevent NaNs.
   - `src/sites/reconcile.py`: warn/assign default for unmapped sites.

5. **Scenario & docs cleanup**
   - `scenarios/site_level.yml`: remove markdown tail, set `params.simulator.reset_on_near_capacity: false`, keep `tolerance_pct: 0.005  # 0.5%`.
   - `docs/data/DATA_INVENTORY.md`: replace user-specific download path with neutral instruction.

6. **API contracts & ADR log**
   - Add/maintain FastAPI response models and export script (`scripts/export_openapi.py`).
   - Regenerate `docs/api/openapi.json`; keep CI `--check` passing.
   - Author/update ADR-0001..0006 plus `docs/ADR/DECISIONS_INDEX.md`; update documentation index and review pack references.

7. **Context bundles & SOP touchpoints**
   - Generate concatenated reviewer context via `python tools/concat_context.py` using `docs/Tasks/context_manifest.yml`.
   - Update `docs/System/Review_Pack.md`, `reviews/DEMO_FREEZE.md`, `docs/SOP/review-process.md` with current commands/checklists.

8. **Regression gates**
   - Run `python scripts/export_openapi.py --write`, `pytest -q`, `behave --tags @smoke --no-capture --format progress`, `python .tools/spec_sync.py`, `python .tools/docs_check.py`.
   - Re-run coordinator curls if needed; confirm golden outputs unchanged (no scenario flag active by default).

9. **Review registry & handoff**
   - Update `reviews/REVIEWED_FILES.yml` for touched files (set status, reviewer, date).
   - Append results/next steps to `docs/SESSION_HANDOFF.md`.

## Notes / Out-of-Scope
- Rate limiter & CSV DictWriter already merged per review; do not modify unless issues surface.
- UI adjustments validated; no BE changes required beyond API env lock & curls.
- Repo ownership & monorepo migration remain post-demo backlog (tracked via ADR-0006).
- Any new findings must be logged before handoff; do not leave partial bundles.
