# Task: Forecasting & Analytics Parity Discovery (2025-11-06)

## Summary
Scout notes capturing deltas between the Stage 6 demo deploy (`https://forecasting-analytics-g46r7o1tl-granins-projects.vercel.app`) and the real Naumen portal (practice51) after reviewing the latest observation log. These findings feed the next planner/executor pass.

## Inputs reviewed
- `docs/Tasks/uat/2025-11-06_forecasting-real-vs-demo.md`
- `plans/2025-11-04_forecasting-analytics-parity-remediation-v3.plan.md`
- `docs/Tasks/forecasting-analytics_parity-followup-2025-10-30.task.md`
- `docs/System/forecasting-analytics_illustrated-guide.md`

## Findings
1. **Build forecast feedback gaps** — The scout run reported no success banner or toast after clicking “Построить прогноз” and no feedback when exporting CSV. We do set `statusMessage` inside `handleBuild` and template export (`src/components/forecasting/build/BuildForecastWorkspace.tsx:259` and `:317`), but verify the banner actually renders in the UI (could be obscured by layout or reset on state change). Also confirm `runForecastBuild` returns a non-empty `message` (`src/services/forecastingApi.ts:200`).
2. **Notification bell parity** — Forecasting shell still lacks the download queue integration seen in analytics. There is no hook pushing export events into the bell (`src/components/forecasting/ForecastingLayout.tsx`, `src/services/forecastingApi.ts:274-332`). Planner should define how to reuse the shared notification service.
3. **Accuracy export inert** — The accuracy dashboard export didn’t trigger a download. Our handler creates a blob and clicks an anchor (`src/components/forecasting/AccuracyDashboard.tsx:239-266`), so investigate whether `createAccuracyExport` returns payload content or if the anchor click is blocked. Consider adding explicit toast + bell entry.
4. **Absenteeism history vs calculator** — Demo shows calculator success, but real portal still lacks run history/queue picker. Keep both flows in demo but document them as demo-only enhancements until the real module exposes equivalents.
5. **Trend & accuracy availability** — Real practice instance still prevents accessing `/forecast/trends` charts and `/forecast/accuracy`. Avoid trimming the demo until production confirms permanent absence; leave gates flagged in docs.

## Open questions / Next steps
- Validate whether build/export banners are rendered but scrolled out of view or genuinely missing; capture screenshots to confirm.
- Decide if we need interim toasts/notifications for accuracy and template exports before API integration.
- Coordinate with backend owners on exposing trend/accuracy modules in the practice environment; otherwise, call out demo-only status in parity docs.
- Planner to translate these findings into updated remediation steps and doc changes.
