# UAT Pack — Parity Static (Forecasting & Analytics)

## Targets
- Real system (Naumen WFM): `/forecasting` module (CH4 §4.1–4.4).
- Demo under test: https://forecasting-analytics-7jje4rjcj-granins-projects.vercel.app

## Checklist
1. Header navigation matches tab order: Построить прогноз → Задать исключения → Анализ трендов → Расчёт абсентеизма → Аналитика моделей → Ручные корректировки.
2. Build Forecast workspace — queue tree, history slider, absenteeism chips, build/import/export buttons.
3. Exceptions workspace — calendar grid, preset holiday cards, conflict badges, CSV download.
4. Trend analysis — strategic/tactical/operational tabs, confidence band shading, anomaly list.
5. Absenteeism gallery — coverage/value columns, apply/download actions, template detail drawer.
6. Accuracy dashboard — KPI deck with RU formatting, error analysis toggles, validation history.
7. Manual adjustments — selection badges, bulk actions, undo/redo, validation statuses.

## 2025-10-31 Run Notes
- Build/Exceptions/Absenteeism parity achieved — queue tree with partial selection, dual history/forecast controls, mixed day+interval editor, and calculator flow confirmed (`src/components/forecasting/{build,exceptions,absenteeism}/*.tsx`).
- Trend analysis loads seeded data automatically; confidence band + anomaly tagging verified across tabs.
- Screenshots captured to `/Users/m/Desktop/tmp-forecasting-uat/` using forecasting aliases (`playwright-forecasting-{build,exceptions,absenteeism,trends,accuracy,adjustments}-20251031.png`).
