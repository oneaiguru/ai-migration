# Parity MVP Checklist — Forecasting & Analytics

- ✅ Dual-axis trend renders target + anomaly badges — seeded defaults load charts; UAT evidence 2025-10-31.
- ✅ Error analysis toggles (time/day/magnitude) validated against `chart_visual_spec` UAT pack.
- ✅ Accuracy KPI deck uses RU decimal formatting (Intl `ru-RU`).
- ✅ Build/Exceptions workspaces replicate queue tree, dual horizons, mixed day/interval flows (see `BuildForecastWorkspace.tsx`, `ExceptionsWorkspace.tsx`).
- ✅ Absenteeism calculator live (queue + preset selectors, summary banner, series table in `AbsenteeismWorkspace.tsx`).
- ✅ Manual adjustments call API wrapper for validate/save (mock response until backend live); track integration follow-up with backend team.
- ✅ Shell уведомляет о выгрузках/расчётах (inline + колокольчик) — `NotificationCenterProvider` + `NotificationBell`.
- ✅ Trend CSV экспорт отдаёт баннер и запись в колокольчике с timezone-хедером.
- ✅ Accuracy экспорт показывает баннер, доступ к колокольчику стабилен с клавиатуры.
- ✅ Абсентеизм калькулятор/экспорт пушат уведомления.
- ℹ️ Trends/accuracy/manual adjustments остаются демо-only в practice; фиксируется в parity index и UAT логах.
