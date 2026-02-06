# Backend Agent Session Task List

## Source Instructions
- Coordinator “Backend (BE) — 30–45 min checklist” (README_COORDINATOR_DROP).
- Master/system reviews under `reviews/20251105/` (core pipeline, backtesting evaluation, docs/schema, backend API).
- Scout map `docs/Tasks/NEXT_AGENT_SCOUT.md`.

## Required Context (already reviewed)
- CE MAGIC prompts & context-engineering playbook (`/Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/`, `context-engineering.md`).
- All review bundles relevant to BE scope (core pipeline, backtesting_eval, docs_and_schema, backend_api, UI confirmations).

## Work Items (Scout → Plan → Execute cadence)
1. **Demo configuration freeze**
   - Confirm env: `API_CORS_ORIGIN=https://mytko-forecast-ui.vercel.app`, `DEMO_DEFAULT_DATE=2024-08-03`.
   - Run the four coordinator curl smokes; capture JSON heads in `reviews/NOTES/api.md`.

2. **Routes data sanity**
   - Ensure `reports/sites_demo/routes/recommendations_{strict,showcase}_2024-08-03.csv` exist and populate `/api/routes?...` responses.

3. **Backtest summary update**
   - Implement aggregate site-level WAPE summary in `scripts/backtest_sites.py` per evaluator guide (`postreview/shared/IMPLEMENTATION_GUIDE.md`, `site_wape_fix.py`).
   - Re-generate `SUMMARY.md` showing Overall site WAPE + median per-site WAPE.

4. **Core pipeline follow-ups (no behavioural change by default)**
   - `src/sites/simulator.py`: add flag-gated near-capacity reset (default `reset_on_near_capacity = False`).
   - `src/sites/baseline.py`: ensure fallback `.fillna(0.0)` to prevent NaNs.
   - `src/sites/reconcile.py`: warn/assign default for unmapped sites.

5. **Scenario & docs cleanup**
   - `scenarios/site_level.yml`: remove markdown tail, set `params.simulator.reset_on_near_capacity: false`, keep `tolerance_pct: 0.005  # 0.5%`.
   - `docs/data/DATA_INVENTORY.md`: replace user-specific download path with neutral instruction.

6. **Regression gates**
   - Run `pytest -q`, `python .tools/spec_sync.py`, `python .tools/docs_check.py`; re-run coordinator curls if needed.
   - Confirm golden outputs unchanged (no scenario flag active by default).

7. **Review registry**
   - Add touched files + reviewer/date/status entries so paper trail reflects latest work.

## Notes / Out-of-Scope
- Rate limiter & CSV DictWriter already merged per review; do not modify unless issues surface.
- UI adjustments validated; no BE changes required beyond API env lock & curls.
- Any new findings to be logged in `docs/SESSION_HANDOFF.md` after execution.
