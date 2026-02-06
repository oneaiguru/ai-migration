# Task – Forecasting Illustrated Guide (Production ↔ Demo)

## Context
- Source material: `/Users/m/Desktop/l/` — 28 unique PNGs captured from the real Naumen “Прогнозы” module, plus logs (`l.markdown`, `ltraces.markdown`).
- Goal: turn these captures into an illustrated reference that maps production behaviour to our demos (analytics dashboard + forecasting demo) with manual + code citations.
- Output must have two flavours:
  1. **Expanded parity guide** for developers (manual refs, code paths, gaps, follow-up work).
  2. **Agent quick sheet** (same screenshots, concise navigation notes for UAT).

## Collected Assets (current understanding)
| Filename | Production Feature | Manual Reference | Demo Delta / Notes |
| --- | --- | --- | --- |
| `real-naumen_build-forecast_header-queue-tree.png` | Build Forecast header with queue tree & KPIs | CH4 §4.1 | Demo lacks hierarchical tree / search / multi-select. |
| `real-naumen_build-forecast_queue-selection.png` | Queue tree expanded (star + checkbox per skill) | CH4 §4.1 | Demo chips cannot mark favourites or multi-select tiers. |
| `real-naumen_build-forecast_date-range.png` | Date pickers for history/forecast horizons (Day vs Interval) | CH4 §4.1 | Demo has single numeric inputs; no day/interval toggle. |
| `real-naumen_build-forecast_absenteeism-options.png` | Absenteeism value vs profile radio group | CH4 §4.1 | Demo only shows profile chips; no numeric entry. |
| `real-naumen_build-forecast_import-buttons.png` | Import buttons (forecast/fact/absenteeism) | CH4 §4.1 | Demo buttons are stubbed or missing. |
| `real-naumen_build-forecast_multi-horizon.png` | Multi-horizon list with “+” to add intervals | CH4 §4.1 | Demo cannot add multiple historical horizons. |
| `real-naumen_build-forecast_summary-banner.png` | “Build” banner + action buttons summary | CH4 §4.1 | Demo lacks banner/summary context. |
| `real-naumen_exceptions_day-interval-toggle.png` | Exceptions landing (Day/Interval toggle) | CH4 §4.2 | Demo has static cards; no toggle or custom ranges. |
| `real-naumen_exceptions_period-builder.png` | Exceptions date pickers + queue tree | CH4 §4.2 | Demo missing dynamic period builder. |
| `real-naumen_exceptions_templates-grid.png` | Exceptions templates grid with import/export | CH4 §4.2 | Demo holiday cards only; import/export stub. |
| `real-naumen_trends_strategic-charts.png` | Trend Analysis – strategic charts (forecast vs fact, seasonality) | CH4 §4.2 | Demo charts similar but missing bottom period table. |
| `real-naumen_trends_tactical-table.png` | Trend Analysis – tactical table (sum by weeks) | CH4 §4.2 | Not present in demo. |
| `real-naumen_trends_operational-grid.png` | Trend Analysis – operational 15-minute grid | CH4 §4.2 | Demo lacks fine-grained grid editing. |
| `real-naumen_absenteeism_interval-toggle.png` | Absenteeism page (interval toggle + build banner) | CH4 §4.3 | Demo shows static profile cards only. |
| `real-naumen_absenteeism_history-table.png` | Absenteeism forecast table (historical runs) | CH4 §4.3 | Demo missing history table/actions. |
| `real-naumen_adjustments_grid.png` | Manual adjustment grid with badges | CH4 Appendix | Demo adjustments exist but need parity review. |
| `real-naumen_adjustments_summary.png` | Manual adjustment summary (warnings/errors) | CH4 Appendix | Compare with demo summary metrics. |
| `real-naumen_accuracy_detailed-table.png` | Accuracy dashboard table (forecast vs fact vs deviation) | CH4 §4.4 | Demo lacks detailed FTE/SL/AHT table. |
| `real-naumen_accuracy_kpis.png` | Accuracy – KPI cards & export | CH4 §4.4 | Demo cards exist but need RU formatting. |
| `real-naumen_accuracy_error-chart.png` | Accuracy – bar chart (error distribution) | CH4 §4.4 | Demo similar; verify toggles/filters. |
| `real-naumen_reports_catalogue.png` | Reports list (forecast/attendance/licences) | CH6 §§6.1–6.4 | Demo has truncated list; extend to full catalogue. |
| `real-naumen_reports_export-dialog.png` | Reports export dialog (filename hints) | CH6 §§6.1–6.4 | Demo downloads should mimic RU filenames. |
| `real-naumen_shell_header-status.png` | Navigation shell signs & status | CH2 §2.2 | Ensure demo header parity. |
| `real-naumen_trends_sigma-overlay.png` | Graphs with Σ overlays & SL target | CH4 §4.2 | Demo needs overlay/target parity. |
| `real-naumen_build-forecast_selection-summary.png` | Queue filter summary (selected skills list) | CH4 §4.1 | Demo missing summary. |
| `real-naumen_build-forecast_confirmation.png` | Build confirmation toast/log | CH4 §4.1 | Demo uses stub; implement feedback. |
| `real-naumen_absenteeism_template-edit.png` | Absenteeism template edit dialog | CH4 §4.3 | Demo missing CRUD dialog. |
| `real-naumen_accuracy_results-table.png` | Forecast build results table (FTE, SL, AHT) | CH4 §4.4 | Demo table currently forecast/target/delta only. |

## Role Workflow

### Scout (current cycle)
1. Rename screenshots with descriptive filenames (e.g., `real-naumen_build-forecast_queue-tree.png`).
2. Confirm manual references + jot demo deltas for each image (use table above as seed, refine with logs).
3. Identify any missing captures needed for parity (record TODOs).

### Planner
1. Asset alignment
   - Update this task file and downstream docs to reference the renamed `real-naumen_*.png` assets (see table above).
   - Decide how to use `real-naumen_build-forecast_selection-summary.png` (embed in Build Forecast narrative or move to an appendix if redundant).
   - Confirm each screenshot is mapped to the correct manual citation and code delta; flag missing captures for planner review.
2. Developer guide revision blueprint
   - Restructure `docs/System/forecasting-analytics_illustrated-guide.md` into sections per module (Shell, Build Forecast, Exceptions, Trends, Absenteeism, Adjustments, Accuracy, Reports) with the sequence **manual excerpt → production screenshot → demo implementation (file:line) → parity gap / follow-up**.
   - Update Build Forecast, Absenteeism, and Reports sections to reflect current forecasting demo capabilities (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/...`) versus the simplified analytics implementation (`${ANALYTICS_REPO}/src/features/forecasting/...`).
   - Record explicit action items for analytics parity (day/interval toggle, multi-horizon support, import/export workflows, results table) and for forecasting polish (history table outputs, confirmation toasts, RU filename patterns).
3. Agent quick sheet deliverable
   - Define the scope and location for the slim UAT handout (proposed: `uat-agent-tasks/forecasting-illustrated-quick-sheet.md`).
   - Outline the required content format: navigation steps, expected behaviours, screenshot aliases, and where to log evidence in existing UAT packs.
   - Ensure alignment with `docs/SOP/illustrated-guide-workflow.md` so future agents can regenerate the desktop bundle without new folders.
4. System docs and pack integration
   - Plan updates to link the illustrated guide from `docs/System/documentation-index.md`, relevant parity plans, and UAT packs (`parity_static`, `chart_visual_spec`).
   - Schedule a review checkpoint to verify that screenshot aliases, AI-doc references, and Code Maps point to the refreshed guide before executor handoff.
5. Dependencies & risks
   - Dependencies: access to `${ANALYTICS_REPO}`, `${FORECASTING_ANALYTICS_REPO}`, desktop capture bundle, and manuals CH2/CH4/CH6.
   - Risks: analytics builder still lacks parity features; absenteeism calculator outputs may diverge once real data sources are wired; report download notifications rely on shared module updates. Mitigation: document gaps clearly and call out required backend/API follow-ups.
6. Additional references for executor
   - `l.markdown` / `ltraces.markdown` (production narration), `docs/SOP/demo-refactor-playbook.md`, `docs/SOP/plan-execution-sop.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/DEMO_PARITY_INDEX.md`, and relevant AI-docs entries on forecasting modules.

### Executor
1. Produce the illustrated guide (expanded version) with embedded, renamed screenshots + code references.
2. Derive the slimmed UAT reminder (one-page flow with screenshot thumbnails + manual refs).
3. Update relevant parity plans / UAT packs (`analytics_parity_static.md`, `chart_visual_spec.md`, forecasting plan) with links to the guide.
4. Stage assets for outbound UAT (flat desktop bundle with annotated images).

## Open Questions
- Do we need additional captures (e.g., export success modals, attachment dialogs) before writing? Scout to note gaps.
- Where should the final guide live (docs/System vs docs/Tasks)? Planner to decide.
- Do we maintain dual-language labels or stick to RU screenshots with EN annotations?


## Scout Notes
- **Screenshot coverage:** `docs/System/images/forecasting/real-naumen_build-forecast_selection-summary.png` isn’t referenced in either the task table or the illustrated guide yet; decide whether to embed it (e.g., alongside the summary banner narrative) or drop it from the bundle.
- **Filename table drift (resolved – keep aligned):** Collected Assets table now references the `real-naumen_*.png` slugs; keep it in sync with `docs/System/images/forecasting/` if more captures are added.
- **Build Forecast parity note:** The guide states the forecasting demo lacks Day/Interval toggles and upload buttons, but `BuildForecastWorkspace` already implements queue tree selection, granularity switches, CSV import/export, and a “last run” summary (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/build/BuildForecastWorkspace.tsx:205-449`). Only the analytics demo remains simplified (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:15-118`).
- **Absenteeism section accuracy:** Both demos now expose editable absenteeism profiles. Analytics provides duplication/edit flows (`${ANALYTICS_REPO}/src/features/forecasting/AbsenteeismWorkspace.tsx:1-200`), and the forecasting demo offers full CRUD plus download options (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:43-444`). Update the guide to reflect current behaviour and clarify remaining gaps (e.g., calculator outputs vs. production history table).
- **Reports catalogue:** Analytics already renders the complete shared report list with per-report format selectors via `listReportDefinitions` (`${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:1-87`, `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/reports/index.ts:1-110`). The guide still claims the dashboard shows only three cards; tighten that language so parity actions focus on filename conventions/notifications instead of catalogue breadth.

## Executor Notes
- 2025-10-31 — Published refreshed guide (`docs/System/forecasting-analytics_illustrated-guide.md`) + UAT quick sheet (`uat-agent-tasks/forecasting-illustrated-quick-sheet.md`); updated parity packs/indexes/screenshot checklist/Code Maps.
- 2025-10-31 — Outbound package stored in `uat-agent-tasks/10-29_18-40_INDEX_employee-portal.txt` now lists `real-naumen_*.png` captures + Playwright artifacts; keep staging folder `/Users/m/Desktop/tmp-forecasting-uat/` synced before sending to agents.
- 2025-11-02 — Analytics parity pass delivered queue tree + horizons, enriched exceptions/trend tables, absenteeism history, adjustment badges, accuracy table, shell notifications; guide + quick sheet updated accordingly.
