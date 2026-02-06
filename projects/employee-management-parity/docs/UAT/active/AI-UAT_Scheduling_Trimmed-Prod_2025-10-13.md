## AI-UAT – Scheduling – Trimmed Production (2025-10-13)

Target
- URL: https://schedule-grid-system-prod-g8jajn3e9-granins-projects.vercel.app
- Scope: behaviour-only (visuals frozen)

Pre-checks
- Only Scheduling page is visible (no UI/UX route)
- Header has: view tabs (Прогноз+план / Отклонения / Уровень сервиса), День/Период toggle, Σ/123 overlays, and “🚀 500+ сотрудников” (default Off)
- Search field (“Поиск по навыкам”) is absent

Checks (record Pass/Fail/Notes)
1) View tabs
- Switch Прогноз+план → Отклонения → Уровень сервиса and back
- Expected: correct dataset/type per tab; no console errors

2) Day/Period regrouping
- Toggle День ↔ Период on a line view
- Expected: domain switches to weekly aggregation; values aggregate sensibly; visual style unchanged

3) Σ/123 overlays (Forecast + Plan only)
- On Прогноз+план, toggle Σ and 123
- Expected: extra line series appear with shared x‑domain; overlays not shown on other tabs

4) KPI grid
- Expected: Coverage and SL show numeric values; Adherence shows “—”

5) RU formatting + clamps
- Expected: RU tick/labels; SL clamped ~70–100% with dashed target line “Цель 90%”

6) Virtualization
- Toggle “🚀 500+ сотрудников” On/Off
- Expected: Charts remain stable; no console errors

Result Table
| Check | Pass/Fail | Notes | Screenshot |
| --- | --- | --- | --- |
| View tabs |  |  |  |
| Day/Period regrouping |  |  |  |
| Σ/123 overlays |  |  |  |
| KPI grid |  |  |  |
| RU formatting + clamps |  |  |  |
| Virtualization |  |  |  |

If all Pass → ping orchestrator to mark trimmed reference as validated and proceed with parallel demos.

Paste‑ready snippet for `${SCHEDULE_REPO}/docs/CH5_chart_mapping.md`
```
## UAT – Trimmed Production (2025-10-13)
URL: https://schedule-grid-system-prod-g8jajn3e9-granins-projects.vercel.app

| Check | Pass/Fail | Notes |
| --- | --- | --- |
| View tabs |  |  |
| Day/Period regrouping |  |  |
| Σ/123 overlays |  |  |
| KPI grid |  |  |
| RU formatting + clamps |  |  |
| Virtualization |  |  |
```
