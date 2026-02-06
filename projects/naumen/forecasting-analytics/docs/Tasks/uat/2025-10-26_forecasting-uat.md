# Step 6 UAT — Forecasting & Analytics (2025-10-30)

- **Prod build**: https://forecasting-analytics-7jje4rjcj-granins-projects.vercel.app
- **Reference**: Naumen WFM `/forecasting` module (OIDC macro per CH2).
- **Packs executed**: `parity_static.md`, `chart_visual_spec.md`.
- **Evidence**: `/Users/m/Desktop/tmp-forecasting-uat/playwright-forecasting-*.png`.

| Check | Pass/Fail | Notes | Screenshot |
| --- | --- | --- | --- |
| FA-1 — Trends: confidence band + legend | Pass | `/trends` now seeds queue/period defaults; “Прогноз vs факт” displays band + dual-axis legend immediately. Verified strategic/tactical/operational tabs render data from `trendSeriesByQueue` (`src/data/forecastingFixtures.ts:64-126`) via the auto-selection logic in `TrendAnalysisDashboard.tsx:33-189`. | `playwright-forecasting-trends-20251031.png` |
| FA-2 — Manual adjustments badges + undo/redo | Pass | Bulk +10 applies “Выбрано” badges; undo/redo restores baseline; status chips transition idle → pending → saved (mock). | `playwright-forecasting-adjustments.png` |
| Accuracy KPI + error analysis | Pass | KPI deck uses RU commas (`5,2 %`); error analysis toggles render hourly/daily/magnitude charts; validation history updates on mock run. | `playwright-forecasting-accuracy.png` |
| Parity static — Build forecast workflow | Pass | Queue tree supports expand/partial select, dual history/forecast controls, absenteeism presets, and CSV actions backed by new fixtures/services (`BuildForecastWorkspace.tsx:33-366`, `forecastingApi.ts:94-287`). | `playwright-forecasting-build-20251031.png` |
| Parity static — Exceptions editor | Pass | Mixed day/interval rows, smoothing sliders, history presets, and CSV export confirmed (`ExceptionsWorkspace.tsx:44-353`, `forecastingApi.ts:289-365`). Conflict badges fire on overlap. | `playwright-forecasting-exceptions-20251031.png` |
| Parity static — Absenteeism calculator | Pass | Template CRUD plus calculator flow with presets, queue picker, and scenario series now live (`AbsenteeismWorkspace.tsx:33-360`, `forecastingApi.ts:367-470`). Calculator returns recommended % and table preview. | `playwright-forecasting-absenteeism-20251031.png` |

## Additional observations
- Trend tabs preload seeded queue data, so confidence band + anomaly tagging work without manual selection.
- CSV exports remain simulated (TODO in `forecastingApi.ts`), awaiting backend endpoints.
- Manual adjustment API still mocked; keep TODO for live endpoint swap once contracts arrive.

## Stage 6 rerun — 2025-11-05 deploy
- **Prod build**: https://forecasting-analytics-g46r7o1tl-granins-projects.vercel.app
- **Outcome**: Demo checks pass; real Naumen instance still missing timezone selector, trend analytics, accuracy dashboards, adjustments (see `docs/Tasks/uat/2025-11-05_forecasting-stage6.md`).
- **Evidence**: `forecasting-timezone-selector.png`, `forecasting-accuracy-detail.png` (demo), plus comparison notes in the new report.

## Stage 6 rerun — 2025-11-07 deploy
- **Prod build**: https://forecasting-analytics-3pemuiun9-granins-projects.vercel.app
- **Outcome**: Demo экспорт/расчёт сценарии показывают баннеры и уведомления (build/trend/accuracy/absenteeism). Реальный портал по-прежнему без трендов/accuracy/adjustments — см. `docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md`.
- **Evidence**: фиксируйте текстовые Pass/Fail заметки и консольные сообщения в соответствующем `uat-agent-tasks/<session>.md` (новые скриншоты не требуются).
