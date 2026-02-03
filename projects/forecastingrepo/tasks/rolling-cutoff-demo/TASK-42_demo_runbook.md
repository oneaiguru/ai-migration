# TASK-42: Demo Runbook

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 15min

## Goal
Step-by-step demo script for Artem to showcase system to stakeholders.

## Output: docs/DEMO_RUNBOOK.md

Create markdown with demo flow:

1. **Setup (5 min before demo)**
   - Ensure both backend and frontend are running
   - Pre-load one forecast to cache (faster demo)
   - Open browser to http://localhost:5173
   - Have demo_bundle folder ready

2. **Introduction (1 min)**
   - "This is the rolling-cutoff forecast system"
   - "We select a cutoff date (what we 'know') and forecast the next N days"
   - Show calendar UI

3. **Generate Forecast (5 min)**
   - Set cutoff to 2025-03-15
   - Set horizon to 7 days
   - Click "Обновить прогноз"
   - **Show**: Results loading
   - **Explain**: System forecasts for each site separately
   - **Point out**: "Все площадки" table shows all ~24k sites

4. **Explore Results (3 min)**
   - Click district filter → select one district
   - **Show**: Filtered results
   - Scroll table to show columns (date, forecast, fill %)
   - Click "Excel" button → export shows
   - **Explain**: Jury can download and validate locally

5. **Validation Flow (2 min)**
   - **Show**: Blind validation script
   - "Jury runs validate_forecast.py locally"
   - "Jury uploads metrics.csv (no raw data exposed)"
   - Scroll to MetricsUpload component
   - **Explain**: System ingests only aggregated metrics

6. **Iteration Dashboard (2 min)**
   - Upload sample metrics for iteration 1
   - Show WAPE % metric
   - "Jury adjusts algorithm and validates again"
   - **Explain**: We track improvement over iterations

7. **Export Options (2 min)**
   - **Show**: Pre-generated bundle (`output/bundles/`)
   - "Contains CSV, Excel, JSON summary"
   - Open HTML report in browser
   - "Jury can search sites, export filtered data"

8. **Q&A (remaining time)**

---

## Acceptance Criteria
- [ ] File created at docs/DEMO_RUNBOOK.md
- [ ] Timing estimates provided
- [ ] Key talking points identified
- [ ] All features covered

---

## On Completion

1. Review docs/DEMO_RUNBOOK.md
2. Practice demo following script
3. Update `/Users/m/ai/progress.md`: Change TASK-42 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-42: Demo runbook"
