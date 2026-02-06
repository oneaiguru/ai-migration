# Task — Forecasting & Analytics Parity Gap Remediation (2025-10-29)

Meta
- Source UAT report: `uat-agent-tasks/2025-10-29_forecasting-demo-vs-naumen.md`
- Manual references: `${MANUALS_ROOT}/specs-bdd/CH4_FORECASTS.md` (PDF variant available), key images `image4.png`, `image36.png`, `image3.png`, `image11.png`, `image27.png`, `image28.png`, `image60.png`, `image80.png` (staged at `/Users/m/Desktop/tmp-forecasting-uat/manual-images/`).
- Demo deploy: https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app
- Production portal: https://wfm-practice51.dc.oswfm.ru (login via OIDC macro — see UAT prompt).

## Scope
Investigate and plan remediation for the feature gaps surfaced in the latest Naumen parity pass:
1. **Build Forecast** — missing Day/Interval toggle, multi-horizon controls, absenteeism value/profile inputs, functional import/export.
2. **Set Exceptions** — needs editable periodic / one-time intervals (week/year selectors) instead of static holiday cards.
3. **Trend Analysis** — enable period selection, anomaly/seasonality editing, data export parity (currently read-only charts).
4. **Absenteeism Calculation** — implement template builder (periodic rules, apply/download/edit flows).
5. **Forecast Viewing & Analysis** — expose detailed FTE table + metrics (absolute/relative deviations, absenteeism %, lost calls, AHT, SL) and localise numbers (comma decimals).
6. **Import/Export workflow** — determine interim mock or adapter wiring so buttons deliver real files while backend work is pending.

## Findings
### Build Forecast (CH4 §4.1 — image4.png, image36.png)
- Demo renders a flattened queue list without the hierarchical tree or skill search shown in production; see `src/components/forecasting/build/BuildForecastWorkspace.tsx:40-64` backed by static fixture data in `src/data/forecastingFixtures.ts:17-27`. Manual tree + selection flow lives in `CH4_FORECASTS.md:11-24` (`image4.png`, `image36.png`).
- Historical horizon and period cards are hard-coded (`BuildForecastWorkspace.tsx:67-108`) and never expose the day/interval switch or multi-horizon selectors described in the manual (`CH4_FORECASTS.md:11-54`).
- Action buttons simply render UI with no handlers (`BuildForecastWorkspace.tsx:117-129`), so importing forecasts/actuals or exporting reports is impossible compared to the Excel template workflow in production.

### Set Exceptions (CH4 §4.1 — image3.png, image11.png)
- The workspace maps over two canned templates (`ExceptionsWorkspace.tsx:33-59`; `src/data/forecastingFixtures.ts:66-83`) instead of letting users define date ranges, week/year selectors, or smoothing per the manual (`CH4_FORECASTS.md:50-66`, `image3.png`, `image11.png`).
- Mode toggles only flip text (`ExceptionsWorkspace.tsx:14-31`); there is no form for adding intervals, nor any linkage to the history controls the real system offers.
- “Построить c исключениями” is a visual stub (`ExceptionsWorkspace.tsx:63-68`) with no API calls or validation prompts.

### Trend Analysis (CH4 §4.2 — image27.png, image28.png)
- Tabs switch copy but always reuse the same deterministic series assembled from fixtures (`TrendAnalysisDashboard.tsx:57-79`), so there is no strategic/tactical/operational horizon re-querying like in `CH4_FORECASTS.md:98-109` (`image27.png`, `image28.png`).
- Anomalies are never populated because the component deliberately resets state to `[]` (`TrendAnalysisDashboard.tsx:67-69`), blocking the anomaly-edit flow the manual documents.
- Export is a dead anchor (`TrendAnalysisDashboard.tsx:250-254`) and there is no period selector nor data download parity for the seasonality table.

### Absenteeism Calculation (CH4 §4.3)
- The table simply echoes two fixture profiles (`AbsenteeismWorkspace.tsx:11-39`; `src/data/forecastingFixtures.ts:51-64`) instead of the template builder with periodic rules and Excel downloads described in `CH4_FORECASTS.md:120-149`.
- Action buttons (`AbsenteeismWorkspace.tsx:29-33`) do not call services or surface validation, so applying, editing, or exporting templates is impossible today.

### Forecast Viewing & Analysis (CH4 §4.4 — image80.png, image60.png)
- The accuracy dashboard focuses on KPI cards (`src/components/forecasting/AccuracyDashboard.tsx:186-220`) but omits the per-interval FTE table, lost calls, service level, and absenteeism adjustments outlined in `CH4_FORECASTS.md:153-189` (`image80.png`, `image60.png`).
- Metric formatting uses `Number.toFixed` with English decimal separators (`src/utils/accuracyCalculations.ts:123-132`), which produced the RU localisation failure noted in UAT.
- Export, validation, and alert flows remain simulated (`AccuracyDashboard.tsx:197-216`, `src/components/forecasting/accuracy/AccuracyExport.tsx:301-321`), so none of the manual’s downloadable reports are present.

### Import/Export workflow (cross-cutting)
- Build actions are UI-only (`BuildForecastWorkspace.tsx:117-129`) and `src/services/forecastingApi.ts:18-87` provides only adjustment validation mocks—there are no endpoints for forecast/history uploads or exports.
- Absenteeism download/apply buttons are inert (`AbsenteeismWorkspace.tsx:29-33`), and trend/export hooks are placeholders (`TrendAnalysisDashboard.tsx:250-254`).
- Accuracy export waits 3 s then logs to console (`AccuracyDashboard.tsx:197-215`), so even the mock reports never materialise.

## Backend & Data Requirements
- Replace fixture-driven data (`src/data/forecastingFixtures.ts:17-136`) with API responses for queue hierarchy, forecast horizons, anomaly metadata, absenteeism templates, and historical accuracy series via `VITE_FORECASTING_API_URL`.
- Expose REST endpoints for forecast, actual, exception, and absenteeism import/export plus report generation; current services (`src/services/forecastingApi.ts:18-136`) only simulate adjustment validation.
- Introduce RU-aware number/date formatters (e.g., centralised `Intl.NumberFormat('ru-RU')`) so KPI cards and tables avoid `toFixed` decimals (`src/utils/accuracyCalculations.ts:123-132`).

## Open Questions
- Should we target real Naumen APIs for import/export or deliver deterministic mock files until integration is approved? Clarify expected payload schema and authentication.
- How much of the manual’s exception builder (day vs interval, history smoothing) needs to be interactive before backend wiring is ready? Define minimum viable UX for MVP.
- Can we reuse the forecasting adapters (`src/adapters/forecasting/*.ts`) to surface the detailed FTE table, or do we need a new report-table component aligned with `image60.png`?

## Required Reading (Scout → Planner → Executor)
1. `PROGRESS.md`
2. `docs/System/context-engineering.md`
3. CE prompts: `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`
   - Scout: `${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
   - Planner: `${CE_MAGIC_PROMPTS_DIR}/PLAN-USING-MAGIC-PROMPT.md`
   - Executor: `${CE_MAGIC_PROMPTS_DIR}/EXECUTE-WITH-MAGIC-PROMPT.md`
4. SOPs: `docs/SOP/code-change-plan-sop.md`, `docs/SOP/plan-execution-sop.md`, `docs/SOP/uat-outbound-package.md`
5. UAT artefacts: `uat-agent-tasks/2025-10-29_forecasting-demo-vs-naumen.md`, `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`
6. Manual Chapter 4 (Forecasts) + CH2 header/login notes

## Deliverables by Role
- **Scout**: Deep dive the production portal vs demo per scope above; capture file:line references in demo code; identify backend/data requirements; update this task with “Findings” section; append entry to `docs/SESSION_HANDOFF.md`.
- **Planner**: Produce `plans/YYYY-MM-DD_forecasting-analytics-parity-remediation.plan.md` covering phased delivery (forms, adapters, localisation, import/export). Reference scout findings and manual evidence.
- **Executor**: Implement plan, run validations (`npm ci`, tests, build, smoke), redeploy, rerun Step 6 UAT, update documentation (CodeMap, parity packs, tracker, PROGRESS, SESSION_HANDOFF).

## Notes
- Reference screenshots live at `/Users/m/Desktop/tmp-forecasting-uat/` (manual + demo captures) for parity comparison.
- Backend integration for import/export may require coordination—document assumptions and stubs clearly.
- Someone must open a follow-up for KPI localisation if not addressed during execution.
