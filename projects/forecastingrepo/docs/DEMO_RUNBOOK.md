# Rolling-Cutoff Forecast System: Demo Runbook

**Presenter**: Artem
**Audience**: Stakeholders
**Duration**: ~20 minutes
**Date**: [Fill with actual demo date]

---

## Pre-Demo Setup (5 minutes before)

### 1. Environment Preparation
- [ ] Backend running: `python src/api/main.py` (or `npm run start-backend`)
- [ ] Frontend running: `npm run dev` (typically on http://localhost:5173)
- [ ] Both services respond without errors

### 2. Pre-Load Cache (Optional but recommended)
```bash
# Pre-load a forecast to ensure demo speed
curl "http://localhost:8000/forecast?cutoff=2025-03-15&horizon=7"
```
This prevents the demo from waiting for first forecast generation.

### 3. Browser Setup
- Open fresh browser tab to **http://localhost:5173**
- Verify calendar, input fields, and buttons are visible
- Have demo data folder ready: `output/demo_bundle/` (for export demo step)

### 4. Have These Open
- Terminal with forecasting repo loaded (for script reference if needed)
- One more browser tab with metrics CSV sample ready (for validation upload)

---

## Demo Flow (20 minutes total)

### Step 1: Introduction (1 minute)

**What to say:**
> "Today I'm showing you our rolling-cutoff forecast system. The core idea is simple: select a cutoff date—what we 'know' up to that point—and the system predicts service demand for the next N days. This lets us iterate quickly on algorithms by testing against real historical data."

**What to show:**
- Point to the calendar picker (date input)
- Point to the horizon input field (number of days)
- Point to "Обновить прогноз" (Update Forecast) button

---

### Step 2: Generate Forecast (5 minutes)

**Steps:**
1. **Set Cutoff Date**: Click date picker, select **March 15, 2025** (or current demo cutoff)
   - Say: "This is 'today' in our demo. Everything before this, we know."

2. **Set Horizon**: Change horizon to **7 days**
   - Say: "We're forecasting one week ahead."

3. **Click "Обновить прогноз"** button
   - Watch for loading spinner
   - **Say while waiting**: "The system is now generating forecasts for each of our ~24,000 service locations independently. Each gets its own prediction based on its historical patterns."

4. **Results appear**: Table loads with "Все площадки" (All Sites)
   - **Point out columns**: Date | Site Name | Demand Forecast | Fill % | ...
   - Say: "Each row is a prediction for one location on one date. Multiply by ~24k sites × 7 days... that's 168,000 predictions generated in seconds."

**Key Talking Points:**
- ✅ Speed: Full forecast in seconds (not minutes)
- ✅ Scale: ~24k sites × horizon = 168k predictions
- ✅ Accuracy: Algorithm shown later in iteration demo

---

### Step 3: Explore & Filter Results (3 minutes)

**Steps:**
1. **Use District Filter**: Look for dropdown/filter labeled "Район" (District)
   - Click dropdown, select a single district (e.g., "Центральный" if available)
   - Table updates to show only that district
   - **Say**: "Jury can drill down into regions to spot-check results."

2. **Scroll Table**: Demonstrate the columns
   - Date | Site Name | Forecast | Actual Fill % | Capacity
   - Point to numeric values
   - Say: "All this data is live from the system. No cached, stale predictions."

3. **Click Export**: Locate "Excel" or "CSV" button in controls
   - **Say**: "Jury downloads this for local analysis. Full transparency—they can validate independently."
   - *(Button click shows download, don't need to complete)*

**Key Talking Points:**
- ✅ Filtering: Drill-down by district, site, date range
- ✅ Transparency: Full data export available
- ✅ Local Validation: Jury doesn't need to trust us—they can verify

---

### Step 4: Validation Workflow (2 minutes)

**What to explain (no clicking needed):**

> "Here's how Jury validates. They take the exported forecast, plus actual demand data they already have, and run our validation script locally."

**Script Reference:**
- Location: `src/validation/validate_forecast.py`
- Say: "This script compares predictions to actual demand, calculates error metrics, and outputs a metrics.csv file—all without exposing raw service data."

**Metrics uploaded:**
- Only aggregated metrics: WAPE%, MAPE%, bias
- No raw demand data
- Fully privacy-preserving

**Say:**
> "Jury keeps control. They validate locally. We only see the summary metrics. This way, we improve the algorithm without ever touching their raw data."

---

### Step 5: Iteration Dashboard (2 minutes)

**What to show:**
1. **Navigation**: Point to "Итерации" (Iterations) tab or metrics upload section
   - Say: "This is where Jury uploads validation results."

2. **Upload Sample**:
   - Locate MetricsUpload component
   - **Say**: "Each upload represents one iteration. Jury validates with improved algorithm, uploads metrics."

3. **Show Metrics Table** (if pre-populated with sample data):
   - Columns: Iteration # | Algorithm | WAPE % | MAPE % | Bias | Timestamp
   - Point to numbers
   - **Say**: "We track improvement across iterations. As WAPE % drops, we know the algorithm is getting better."

4. **Explain Iteration Cycle**:
   > "Jury runs validation with version 1 of algorithm → metrics upload → we see results → we tweak algorithm → next iteration. Fast feedback loop."

**Key Talking Points:**
- ✅ Data Privacy: Only metrics, never raw data
- ✅ Iteration Speed: New algorithm → validation → results in hours
- ✅ Transparency: Metrics visible to all stakeholders

---

### Step 6: Export Options & Reports (2 minutes)

**What to show:**
1. **Pre-generated Bundle**: Open folder `output/demo_bundle/` (or `output/bundles/` in production)
   - **Say**: "These are pre-generated exports. Jury can download a complete bundle: all forecasts, metrics, summary report."
   - Point to files:
     - `forecast_summary_2025-03-15_7d.csv` → All predictions in CSV
     - `forecast_summary_2025-03-15_7d.xlsx` → Same data, Excel format (easier pivot tables)
     - `forecast_report_2025-03-15_7d.json` → Machine-readable format
     - `report.html` → Interactive report

2. **Open HTML Report** in new browser tab
   - **Say**: "This is the interactive HTML report. Jury can search sites, filter by metrics, export whatever subset they need."
   - Navigate through report, show:
     - Search box
     - Summary statistics (total demand, forecast range)
     - Download button for filtered data

3. **Summary**:
   > "Everything Jury needs to review, validate, and iterate—all in one export bundle."

**Key Talking Points:**
- ✅ Multiple Formats: CSV, Excel, JSON, HTML
- ✅ Self-Service: Jury doesn't ask us for custom reports
- ✅ Audit Trail: All exports timestamped and reproducible

---

### Step 7: Q&A (Remaining time)

**Common Questions to Prepare For:**

| Question | Answer |
|----------|--------|
| How accurate is the forecast? | TASK-29 shows our latest WAPE%. Jury can validate this anytime. |
| What if the algorithm needs tweaking? | Jury adjusts locally, validates, uploads metrics. We iterate in hours. |
| How much data is exposed to Jury? | Only aggregated metrics. Zero raw service data leaves our system. |
| Can we track algorithm versions? | Yes. Each iteration is timestamped with algorithm hash. |
| What's the forecast compute time? | ~30-60 sec for full 24k sites × 7 days. Scales linearly with horizon. |
| Do you support longer horizons? | Yes, 1-365 days. Longer = slower, less accurate. Typically 7-30 day range best. |
| Can Jury automate the validation? | Yes. validate_forecast.py can run as scheduled job. Metrics auto-upload via API. |

---

## Backup Plan (If Issues Occur)

### Scenario: Backend Not Running
**Fix:**
```bash
cd /Users/m/ai/projects/forecastingrepo
python src/api/main.py
# Or if using npm:
npm run start-backend
```
**Demo Fallback**: Show pre-generated bundle and HTML report instead. Narrate what would happen if backend was running.

### Scenario: Frontend Not Loading
**Fix:**
```bash
npm run dev
```
**Demo Fallback**: Share screen showing metrics data directly. Show the exported CSV/Excel instead.

### Scenario: First Forecast Taking Too Long
**Reason**: Large dataset, cold cache.
**Fix**: Pre-load cache before demo (see Setup section).
**Fallback**: Use pre-generated forecast output from `output/demo_bundle/` while explaining "the system is loading in the background."

### Scenario: MetricsUpload Not Working
**Fallback**: Show the validation script output directly in terminal. Narrate the upload process.

---

## Timing Reference

| Step | Duration | Notes |
|------|----------|-------|
| Setup | 5 min | Before audience arrives |
| Intro | 1 min | "What is rolling-cutoff?" |
| Forecast Gen | 5 min | Core feature, main wait time |
| Explore Results | 3 min | Filtering, export |
| Validation | 2 min | Explain script & privacy |
| Iteration | 2 min | Show metrics table |
| Exports | 2 min | Bundle & HTML report |
| Q&A | +5 min | Time permitting |
| **Total** | **20 min** | Plus buffer for questions |

---

## Demo Data Reference

### Test Cutoff Date: 2025-03-15
- Has good forecast history before date
- 7-day forecast horizon shows clear demand patterns
- Use for all forecasts in demo (consistency)

### Sample Districts (for filtering demo)
- Центральный (Central)
- Западный (Western)
- Восточный (Eastern)
- [Add actual districts from your data]

### Pre-Load Command
```bash
# Load forecast into cache before demo starts
curl -s "http://localhost:8000/forecast?cutoff=2025-03-15&horizon=7" > /dev/null
```

---

## Checklist: Before Presenting

- [ ] Backend running, responding to requests
- [ ] Frontend loads on http://localhost:5173
- [ ] Pre-loaded forecast in cache (optional but recommended)
- [ ] Browser zoom at 100% (readable on projector)
- [ ] Network stable (no intermittent timeouts)
- [ ] Sample metrics file ready for upload demo
- [ ] Pre-generated bundle folder accessible
- [ ] HTML report opens without errors
- [ ] Read through Q&A section above
- [ ] Practice 2x at full speed to time it

---

## After Demo

1. **Collect Feedback**: Note stakeholder questions and reactions
2. **Export Session Data**: Save metrics table screenshot for notes
3. **Update Algorithm**: If feedback points to improvements, create new ticket
4. **Log Demo**: Timestamp + attendees + key feedback points

---

**Good luck with the demo! Remember: the goal is to show Jury confidence in the system's speed, transparency, and validation workflow. You're not selling accuracy—you're selling the *process* for improving accuracy.**
