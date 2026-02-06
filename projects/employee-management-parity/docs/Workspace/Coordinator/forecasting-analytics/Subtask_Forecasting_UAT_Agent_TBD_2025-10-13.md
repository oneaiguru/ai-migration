## Subtask — Forecasting UAT (Executor)

Agent Header
- Agent: forecasting-analytics-exec-2025-10-13-tbd
- Role: Executor
- Demo: Forecasting & Analytics (UAT Step 6)
- Repo: ${FORECASTING_ANALYTICS_REPO}
- Outcome: Live UAT (parity_static + chart_visual_spec) → Pass; docs updated

Pre‑flight (doc cross‑check)
- Verify `setupRU()` is called by the host before charts register
- Confirm mount path is correct (no internal BrowserRouter interfering)
- Ensure trend adapter emits confidence band + secondary axis metadata
- Ensure adjustments adapter emits inline status badges and preserves state through undo/redo

Run UAT
- Target: https://forecasting-analytics-cv3t45r52-granins-projects.vercel.app
- Packs: parity_static.md + chart_visual_spec.md
- Checks to record:
  - FA‑1 trends: confidence band shaded; legend/labels align to primary/secondary axes
  - FA‑2 adjustments: badges + undo/redo work; no console errors
  - Accuracy dashboard: KPI and error analysis toggles render; RU OK

Deliver
- Update results in `uat-agent-tasks/2025-10-26_forecasting-uat.md` (Pass/Fail + notes + aliases)
- Update System docs: `docs/System/{WRAPPER_ADOPTION_MATRIX.md, PARITY_MVP_CHECKLISTS.md, learning-log.md}`
- Update tracker row and add a short entry to `docs/SESSION_HANDOFF.md` and `PROGRESS.md`
