# Forecasting & Analytics Code Map (2025-11-07)

- **Repo**: `/Users/m/git/client/naumen/forecasting-analytics`
- **Deploy**: https://forecasting-analytics-3pemuiun9-granins-projects.vercel.app (prod, 2025-11-07)
- **Plan**: `plans/2025-11-07_forecasting-analytics-illustrated-guide-parity.plan.md`

## Modules

| Area | Key Files | Notes |
| --- | --- | --- |
| Forecast data contracts | `src/types/forecasting.ts`, `src/data/forecastingFixtures.ts` | Dual history/forecast defaults, seeded trend series per queue, calculator presets, deterministic queues for Step 6 parity. |
| Service layer | `src/services/forecastingApi.ts` | Build/options/calculator/export helpers with RU localisation; CSV downloads mocked pending real API (`TODO` inline). |
| Build forecast workspace | `src/components/forecasting/build/BuildForecastWorkspace.tsx`, `src/components/forecasting/shared/QueueSelector.tsx` | Hierarchical queue tree with partial selection, history vs forecast controls, absenteeism presets, CSV import/export, build log. |
| Exceptions workspace | `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx` | Mixed day/interval editor, smoothing sliders, history presets, CSV export + conflict badges mirroring prod flow. |
| Absenteeism workspace | `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx` | Template CRUD + calculator; CSV и расчёт теперь выдают баннеры и уведомления в колокольчике. |
| Trend analytics | `src/components/forecasting/trends/TrendAnalysisDashboard.tsx`, `src/adapters/forecasting/trends.ts` | Queue/period defaults, anomaly tagging, dual axis legend, timezone-aware CSV экспорт с баннером + bell entry. |
| Notification centre | `src/components/forecasting/common/NotificationCenter.tsx`, `src/components/forecasting/common/NotificationBell.tsx` | Reusable колокольчик, push-хуки для build/export/accuracy уведомлений. |
| Accuracy analytics | `src/components/forecasting/AccuracyDashboard.tsx`, `src/adapters/forecasting/accuracy.ts`, `src/utils/accuracyCalculations.ts` | RU-formatted KPIs, detail table, error analysis; CSV export теперь даёт баннер и устойчивый доступ к колокольчику (демо-only до открытия модуля в practice). |
| Manual adjustments | `src/components/forecasting/ManualAdjustmentSystem.tsx`, `src/services/forecastingApi.ts` | Undo/redo, validation statuses, API-ready payloads (currently mocked). |
| Charts infrastructure | `src/components/charts/*`, `src/utils/charts/{format.ts,register.ts}` | Shared wrappers (Line/Bar/ReportTable/Kpi grid) with RU locale formatting, confidence band support. |
| Tests & automation | `tests/forecasting/*.test.ts`, `scripts/smoke-routes.mjs`, `test-results/` | Vitest coverage for fixtures/services/workspaces; smoke routes (local + prod) verify top-level pages. |

## UAT / Evidence
- Step 6 parity packs rerun 2025-10-31 (see `docs/Tasks/uat/2025-10-26_forecasting-uat.md`) — all checkpoints passed on deploy `…7jje4rjcj…`.
- 2025-11-07 deploy published for notification parity; record textual Pass/Fail notes in the same UAT log (no new screenshots required).
- Evidence folder `/Users/m/Desktop/tmp-forecasting-uat/` retains historical images (`playwright-forecasting-*-20251031.png`); new runs rely on written logs.

## Follow-ups
- Replace mocked import/export + manual adjustment endpoints с реальным API после запуска; проверить уведомления.
- Extend e2e coverage for calculator + queue tree parity (Playwright + regression snapshots); повторить Step 6, когда в practice появятся trends/accuracy.
