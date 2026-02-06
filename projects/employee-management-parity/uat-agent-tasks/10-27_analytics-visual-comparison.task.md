# UAT Task — Analytics Forecasting Visual Comparison (2025-10-27)

## Goal
Run a side-by-side visual walkthrough of the **real Naumen forecasting module** and the updated **Analytics & Forecasting demo** (`analytics-dashboard-demo-3lsuzfi0w`). Confirm behaviour and RU language parity, and document gaps/extras for each workflow. This pass is browse-only: no code or API access required.

## Targets
- **Real system:** open the latest production URL (OIDC) → `Прогнозы` module (`/forecast`) for the account “Контакт-центр 1010.ru / Отдел поддержки`.
- **Demo:** https://analytics-dashboard-demo-d60586nei-granins-projects.vercel.app (analytics shell with organisation selector).

## Prep Checklist
1. Read `docs/SOP/ai-uat-browser-agent.md` (reminder: deployed builds only, no local assets).
2. Skim Chapter references before starting: `CH2_Login_System.md §§2.1–2.3`, `CH4_FORECASTS.pdf`/`CH4_Forecasts.md`, `CH6_Reports.md`.
3. Pin these guides for reference: `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`, `docs/Tasks/uat-packs/parity_static.md` (analytics section), `docs/Tasks/uat-packs/chart_visual_spec.md` (analytics section).

## How to Run the Comparison

### Step 1 – Launch tabs & align organisation
1. Open two browser tabs side-by-side: real system on the left, demo on the right.
2. Log into the real system via OIDC → click **Прогнозы** in the top navigation. Confirm breadcrumbs show `Контакт-центр 1010.ru / Отдел поддержки`.
3. In the demo, ensure the organisation selector (top right) is set to “Контакт-центр 1010.ru”. Leave module pill on **Аналитика** for now.
4. Note any immediate language mismatches (top nav, breadcrumbs, module names).

### Step 2 – Build Forecast tab vs Demo Forecast Builder
1. Real system: open **Построить прогноз**. Capture the available inputs (queue tree, period pickers, horizon selectors) and the empty/data states of the FTE chart + deviations table.
2. Demo: switch to **Прогнозы** pill. Run the default build (8/8 weeks) and watch the loading state (“Строим…”), resulting chart, confidence band and data table.
3. Compare:
   - Presence/absence of queue selection.
   - RU labels for period, horizon, buttons.
   - Output fields (forecast, target, delta) vs real deviation metrics.
   - Export/Σ overlays (real) vs CSV absence (demo).
4. Record whether demo behaviour covers CH4 §4.1 and what’s missing.

### Step 3 – Set Exceptions vs Demo (missing)
1. Real system: open **Задать исключения**, toggle between “День” / “Интервал”, inspect “Загрузить прогноз/факт/абсентеизм” buttons, and note the “Построить” action.
2. Demo: confirm there is no equivalent UI. Note this as a parity gap (CH4 §4.1 “Нетипичные дни”).

### Step 4 – Trend Analysis vs Advanced Analytics Trend
1. Real system: open **Анализ трендов** → cycle **Стратегический**, **Тактический**, **Оперативный** tabs; observe empty/default states and queue search field.
2. Demo: on **Аналитика** tab scroll to “Тренд аналитика”. Exercise toolbar controls: toggle smoothing, adjust SL/CSAT targets ±, reset targets. Hover chart legend to confirm primary/secondary axis labelling.
3. Compare:
   - Availability of queue selector and seasonality/anomaly widgets.
   - Additional features (confidence band, smoothing) present only in demo.
   - RU terminology matches manual (target labels, tooltips).

### Step 5 – Absenteeism Calculation vs Demo Absenteeism Analytics
1. Real system: open **Расчёт абсентеизма** → document wizard steps (interval selection, horizon inputs, periodic/one-off settings, results table).
2. Demo: in **Аналитика** tab locate “Аналитика абсентеизма” chart + reasons table.
3. Compare calculation workflow vs analytic visualisation; note missing controls (template imports, build buttons).

### Step 6 – Reports & Exports
1. Real system: click **Отчёты** tab (top nav) → list all report categories (Work schedule, Daily schedule, Employee schedule, Punctuality, T‑13, Deviations, Schedule build log, Licences). Trigger at least two Excel exports to confirm RU filenames.
2. Demo: open **Отчёты** pill → check available cards (T‑13, Пунктуальность, Отклонения). Trigger **Скачать CSV** on enabled cards and capture filenames.
3. Compare report inventory, export format, RU copy, disabled states (“Скоро”).

### Step 7 – Analytics-only Extras
1. Document demo-only sections: KPI grid, department table, live status, heatmap, radar, forecast builder confidence band.
2. Confirm all RU copy/labels align with manual wording where applicable; flag English remnants if any.

## Reporting Template
Record findings in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` (append a 2025-10-27 row if not present) using the format:

| Demo | Check ID | Pack(s) | Pass/Fail | Notes | Screenshot |

Suggested Check IDs:
- AD‑Build – Forecast builder parity (CH4 §4.1).
- AD‑Exceptions – Missing “Задать исключения” flow.
- AD‑Trend – Toolbar/legend behaviour vs real trend tabs.
- AD‑Absenteeism – Analytics vs calculation workflow.
- AD‑Reports – Report catalogue and export format.

Attach screenshots named per `docs/SCREENSHOT_INDEX.md` (e.g. add new aliases for build forecast, exceptions, reports). Mention manual section numbers in Notes.

## Completion Criteria
- Table updated with Pass/Fail + notes referencing manuals.
- Screenshots captured for each key comparison (real vs demo).
- Any RU language issues or console errors called out explicitly.
- Hand off summary added to `docs/SESSION_HANDOFF.md` once review completes.
