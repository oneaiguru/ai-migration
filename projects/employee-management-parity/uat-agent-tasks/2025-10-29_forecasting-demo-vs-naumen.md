# UAT Report — Forecasting Demo vs Naumen (2025-10-29)

Agent reference: desktop `forecst/` screenshots (see `/Users/m/Desktop/forecst`). Input sources: `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`, `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_FORECASTS.pdf`, live production portal (`https://wfm-practice51.dc.oswfm.ru`), and demo deploy (`https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app`).

## Focus Check Results
| Check | Status | Notes |
| --- | --- | --- |
| FA‑1 — Trends confidence band + legend | Pass | `/trends` shows shaded confidence band, legend labels “Отклонение % – secondary axis,” matches CH4 §4.2 strategic/tactical views (see `image27.png`, `image28.png`). |
| FA‑2 — Manual adjustments badges + undo/redo | Pass | `/adjustments` quick actions (+10) update “Корректировка” column; undo/redo restores values. Workflow aligns with CH4 §4.4 tables. |
| Accuracy KPI deck + error analysis | **Fail** | KPI cards use English decimal separators (5.2 %, 6.12) instead of RU commas. Error-analysis toggles function, but localisation mismatch remains (CH4 §4.4). |

## Production vs Demo Gaps (from Naumen walkthrough)
1. **Build Forecast (`image4.png`, `image36.png`) — CH4 §4.1**  
   - Production: hierarchical queue tree, Day/Interval toggle, multi-horizon inputs, absenteeism value/profile radio buttons, functional import/export buttons.  
   - Demo `/build`: chips instead of tree, no Day/Interval or multi-horizon controls, absenteeism chips only, import/export buttons stubbed.

2. **Set Exceptions (`image3.png`, `image11.png`) — CH4 §4.1**  
   - Production: custom Day vs Interval editor with week/year selectors; user defines multiple ranges.  
   - Demo `/exceptions`: static holiday cards; no custom range creation or granular controls.

3. **Trend Analysis (`image27.png`, `image28.png`) — CH4 §4.2**  
   - Production: Strategic/Tactical/Operational tabs allow period selection, anomaly editing, data export.  
   - Demo `/trends`: charts are read-only; no period selection or anomaly editing despite confidence band presence.

4. **Absenteeism Calculation (CH4 §4.3)**  
   - Production: create/apply templates, define periodic rules, download/upload Excel forms.  
   - Demo `/absenteeism`: static template cards (Apply/Download/Edit/Delete) with no backend or rule editor.

5. **Forecast Viewing & Analysis (`image60.png`, `image80.png`) — CH4 §4.4**  
   - Production: FTE chart + table with forecast, actual, absolute/relative deviations, absenteeism %, lost calls, AHT, SL, export options.  
   - Demo `/accuracy`: high-level KPI cards + error-analysis chart only; missing detailed per-interval table and RU localisation (decimal commas).

6. **Import/Export parity**  
   - Production uses Excel templates for forecasts, actuals, absenteeism, exceptions, absenteeism profiles.  
   - Demo shows actions but they are non-functional.

## Recommended Follow-up
- Replace stubs with functional forms matching CH4 blocks (Day/Interval toggles, horizon selectors, editable exceptions, absenteeism template builder, interactive trend tools).  
- Localise numeric outputs (percentage/decimal formatting) on `/accuracy`.  
- Restore import/export flows (even with mock data) to mirror production behaviour.  
- Surface the detailed forecast analysis table (absolute/relative deviations, lost calls, SL, AHT) to align with production reporting.

Use these gaps as input for the new parity remediation task.
