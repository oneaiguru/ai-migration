# Task — Forecasting & Analytics Behaviour Parity (Scout)

Meta
- Agent: forecasting-analytics-scout-2025-10-27-codex
- Date: 2025-10-27
- Repo: ${FORECASTING_ANALYTICS_REPO}
- Local preview: http://127.0.0.1:4155/ (see `docs/System/ports-registry.md`)
- Inputs reviewed: `PROGRESS.md`, `docs/Workspace/Coordinator/forecasting-analytics/Progress_Forecasting-Analytics_2025-10-14.md`, `uat-agent-tasks/2025-10-26_forecasting-uat.md`, `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`, `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md`, `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md`, app source under `src/App.tsx`, `src/components/forecasting/*`, `src/services/forecastingApi.ts`.
- Required reading for next role:
  1. `PROGRESS.md`
  2. `docs/System/context-engineering.md`
  3. `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`
  4. `${CE_MAGIC_PROMPTS_DIR}/PLAN-USING-MAGIC-PROMPT.md`
  5. `docs/SOP/code-change-plan-sop.md` (planning section)
  6. `docs/SOP/plan-execution-sop.md`
  7. `docs/SOP/ui-walkthrough-checklist.md`
  8. This discovery task: `docs/Tasks/forecasting-analytics_parity-scout-2025-10-27-codex.task.md`
 9. `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`
 10. `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md`
 11. `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md` §§4.1–4.4
 12. `docs/Workspace/Coordinator/forecasting-analytics/Progress_Forecasting-Analytics_2025-10-14.md`

## Summary
The forecasting demo now routes correctly but still represents only three slices (accuracy, trends, manual adjustments). The production Naumen module described in Chapter 4 exposes four major workspaces—Build Forecast, Set Exceptions, Trend Analysis, and Absenteeism Calculation—with deep data management (queue tree, templates, exports). Key parity gaps are structural: missing Build/Exceptions/Absenteeism views, no skill tree or period controls, simulated metrics instead of persisted results, and no import/export hooks. Planner must scope how to surface these manual-driven workflows (or provide stubs) while keeping current charts intact.

## AI-Docs References
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md:20-66` – header tabs, “Рабочая структура” drawer, profile expectations.
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:5-145` – Build Forecast, data imports, exception settings, absenteeism templates.
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:151-198` – Forecast viewing/export controls, queue tree, metric definitions.
- `docs/Workspace/Coordinator/forecasting-analytics/Progress_Forecasting-Analytics_2025-10-14.md:1-120` – field observations from real system, gap inventory.

## Findings & Evidence
1. **Build Forecast / Exceptions / Absenteeism tabs absent** – Manual enumerates four tabs in Forecasts (`CH4_Forecasts.md:5-24`). Demo router only exposes `/accuracy`, `/trends`, `/adjustments` (`src/App.tsx:20-41,165-170`). There is no route or component for “Построить прогноз”, “Задать исключения”, or “Расчёт абсентеизма”, so agents cannot reproduce sections 4.1 or 4.3.
2. **No organisational skill tree or period controls** – Real module requires selecting skills/queues and build horizon before generating data (`CH4_Forecasts.md:11-19,153-170`). Demo hardcodes `DEFAULT_QUEUE_IDS` and a static 7‑day range (`src/App.tsx:44-88`, `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:20-47`) with a single dropdown; there’s no hierarchy, no “Рабочая структура”, and no period form.
3. **Data pipelines fully simulated** – Accuracy and trends rely on randomised mock datasets (`src/components/forecasting/AccuracyDashboard.tsx:70-138`, `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:52-105`) and the API layer simply returns fabricated validation responses (`src/services/forecastingApi.ts:26-111`). Manual §4.4 expects persisted metrics, history imports, and Excel exports; planner must define how to source or stub real data.
4. **Exception/absenteeism workflows missing** – Manual §4.3 details absenteeism profile templates, periodic exclusions, and apply/download actions (`CH4_Forecasts.md:120-147`). Demo has no UI for templates; adjustments page only covers RU validation badges (simulated) and doesn’t integrate absenteeism logic.
5. **Export/smoothing controls not surfaced** – Manual §4.1 “Manual Data Loading” and §4.4 (icons 1–8) call out import/export buttons, smoothing, and “Сохранить изменения”. Current components show none of these controls. Example: accuracy export handler just logs to console (`src/components/forecasting/AccuracyDashboard.tsx:189-199`). Trend dashboard lacks the buttons described in manual figure references.
6. **UAT documentation lacks manual linkage for missing areas** – Crosswalk now exists, but UAT pack still lists only behaviour checks. Planner should decide if Build Forecast/Exceptions need placeholder pages or documentation call-outs before next execution.

## Risks / Open Questions
- How much of Build Forecast/Exceptions should be implemented vs. documented as out-of-scope? (Manual assumes full data flow.)
- What data source (API, fixtures) can replace current RNG so KPI/trend metrics align with manual expectations?
- Do we introduce a skill tree component or integrate with unified shell’s “Рабочая структура”? Requires coordination with shell owners.
- Absenteeism templates require CRUD + storage; need decision on backend contract before executor invests.

## Suggested Next Steps for Planner
1. Scope UI shell changes: add Build Forecast / Exceptions / Absenteeism routes, determine minimal viable content (stubs vs functional) referencing `CH4_Forecasts.md`.
2. Outline data strategy: replace random samples with deterministic fixtures or API adapters; document contracts for accuracy/trend/adjustment views.
3. Define organisational selection (tree or queue picker) aligned with manual §4.1/4.4 and existing unified shell conventions.
4. Plan absenteeism workflow (templates, periodic exceptions, apply/save) or note staged delivery if backend unavailable.
5. Expand documentation updates (UAT packs, CodeMap) to cover new routes and manual linkage.

## Handoff
- Discovery recorded here; no code changes besides port registry claim.
- Planner can proceed with `forecasting-analytics-plan-2025-10-27-<handle>` referencing this file.
- Update `docs/SESSION_HANDOFF.md` with scout summary + link to this task.
