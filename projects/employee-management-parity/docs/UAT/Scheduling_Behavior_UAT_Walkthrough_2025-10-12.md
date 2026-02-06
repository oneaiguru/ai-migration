Scheduling Behavior UAT Walkthrough — 2025‑10‑12

Scope
- Behavior-only checks (visuals frozen). Verify regrouping, overlays, KPIs, and basic interactions.
- App: Schedule Grid System Mock
- URL: https://schedule-grid-system-mock-7hx5y0g9x-granins-projects.vercel.app

Prerequisites
- Desktop Chrome/Edge/Firefox. Window width ≥ 1280px.
- RU locale not required; charts enforce RU via built-in registrar.

Navigation
- Top nav in the header (under “Контакт-центр 1010”). Click:
  - График (default) to open the main scheduling screen.
  - UI/UX to open the advanced UI (exception form) used in one check below.

Chart Header Controls (График)
- View buttons (left):
  - “Прогноз + план”
  - “Отклонения”
  - “Уровень сервиса (SL)”
- Time grouping (right):
  - “День” | “Период” (tablist)
- Overlays (right):
  - “Σ” (headcount)
  - “123” (FTE часы)

Checks
1) Forecast + Plan view
- Click “Прогноз + план”.
- Expected: Two line series with people as units; labels show days (ДД.ММ). No console errors.

2) Deviations view
- Click “Отклонения”.
- Expected: One bar series with positive/negative bars; people as units; RU tooltips when hovering bars (if tooltips appear).

3) Service (SL) view
- Click “Уровень сервиса (SL)”.
- Expected: One line series in percent with target line “Цель 90%”. Clamp 70–100.

4) Day/Period regrouping
- In any line view (e.g., “Прогноз + план”), click “Период”, then back to “День”.
- Expected: X‑axis switches to week aggregation (labels like 2025‑W27). Values change accordingly; no style changes elsewhere.

5) Σ/123 overlays
- In “Прогноз + план” only, toggle overlays:
  - Enable “Σ”: expected extra line “Численность (Σ)” (people).
  - Enable “123”: expected extra line “FTE часы” (hours).
- Switch “День/Период”: overlays regroup with the main series. No extra axes, no legend style change.

6) KPI tiles under the chart
- Scroll or look below the mini chart block; a grid of KPI tiles appears:
  - “Покрытие” shows the percentage from the footer stats (green or amber variant).
  - “Уровень сервиса” shows a plausible percent value (neutral variant).
  - “Придерживание” shows “—”.
  - “Σ/123 включены” shows which overlays are currently enabled (e.g., “Σ + 123” or “—”).

7) Virtualization switch
- In the filter bar, click “🚀 500+ сотрудников”.
- Expected: Grid switches to virtualized mode; chart remains stable; no console errors.

8) Search field (informational)
- “Поиск по навыкам” is present but currently inert. Do not fail on lack of filtering.

9) Drag‑and‑drop sanity (optional)
- Drag a colored shift block from one employee/day to another compatible slot.
- Expected: Moves without error; footer counts update. If a slot is taken, an error message appears and no crash.

10) Accessibility quick pass
- Ensure each chart region is a figure with aria‐label/description (inspect in DevTools if needed).
- Buttons/tabs/checkboxes in the header are keyboard reachable (Tab/Space/Enter).

Footer Stats (График)
- Bottom footer shows totals: employees, selected cells count, total shifts, and a refresh button. Values change as you interact (e.g., add/move shifts).

Known Non‑Blocking Quirks
- “Поиск по навыкам” is inert.
- Chart legends non‑interactive; tooltips may be absent on deploy depending on browser.
- Visual styling is intentionally frozen.

Defect Capture Template
- Title: [Feature] — [Control] — [Observed]
- URL: https://schedule-grid-system-mock-7hx5y0g9x-granins-projects.vercel.app
- Tab: График | UI/UX (choose one)
- Steps to Reproduce: 1..n
- Expected vs Actual: …
- Console Errors: copy the first stack line(s), if any
- Screenshot: attach if possible

Appendix — Code Anchors (for triage)
- Time grouping + overlays: src/components/ChartOverlay.tsx:1
- Forecast chart pass‑through: src/components/ForecastChart.tsx:1
- Overlays from schedules + KPIs: src/components/ScheduleGridContainer.tsx:1
- Adapters: src/utils/charts/adapters.ts:1
- KPI UI: src/components/charts/KpiCardGrid.tsx:1
