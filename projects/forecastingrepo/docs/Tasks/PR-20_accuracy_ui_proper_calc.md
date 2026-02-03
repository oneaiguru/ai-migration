# PR-20: Accuracy UI — Proper Calculation & Any Site/Date

## Scope
Fix current UI (`/Users/m/git/clients/rtneo/ui`) to:
1. Show **district/region accuracy** calculated correctly (same method as eval.md Q1-Q4 results)
2. Add **per-site accuracy** using same WAPE calculation
3. Allow selecting **any site + any date range** (not just Aug 1-7)
4. Display results matching backtesting methodology

## Why
Current UI shows wrong data:
- Aug 1-7 hardcoded (only one week)
- Wrong calculation method (not matching eval.md)
- No per-site accuracy view
- Can't explore different dates/sites

Need: Same calculation as `scripts/backtest_sites.py` but interactive UI

## Acceptance Criteria

### AC1: District/Region Accuracy (Correct Calculation)
**Reference**: `/Users/m/git/clients/rtneo/forecastingrepo/reviews/NOTES/eval.md`

Calculation method from eval.md:
```
Q1 2024 results:
- Overall WAPE: 0.1445 (14.45%)
- Median per-site: 0.1765 (17.65%)
- Sites ≤8%: 27.2%
- Districts ranked by accuracy
```

**UI Requirements**:
- Show district accuracy table (matching eval.md format)
- Show region overall WAPE
- Show percentile distribution (% sites ≤8%, 8-12%, >12%)
- Allow selecting quarter: Q1, Q2, Q3, Q4 2024

**API Endpoint Needed**:
```bash
GET /api/accuracy/districts?quarter=Q1_2024
GET /api/accuracy/region?quarter=Q1_2024
```

**Response Format**:
```json
{
  "quarter": "Q1_2024",
  "region_wape": 0.1445,
  "median_site_wape": 0.1765,
  "districts": [
    {
      "name": "Жигаловский район",
      "accuracy_pct": 90.6,
      "wape": 0.094,
      "sites_count": 142
    },
    ...
  ],
  "distribution": {
    "excellent": 27.2,  // ≤8%
    "good": 10.3,       // 8-12%
    "needs_improvement": 62.5  // >12%
  }
}
```

### AC2: Per-Site Accuracy
**Reference**: `scripts/backtest_sites.py:70` (`compute_site_aggregate_wapes`)

Calculation:
```python
# From backtest_sites.py
site_wape = sum(abs(forecast - actual)) / sum(actual)
# Per site, across all days in window
```

**UI Requirements**:
- Table showing sites with their WAPE
- Filter by district
- Sort by WAPE (best → worst)
- Search by site_id or address
- Show median, min, max WAPE

**API Endpoint**:
```bash
GET /api/accuracy/sites?quarter=Q1_2024&district=Аларский&limit=50&offset=0
```

**Response**:
```json
{
  "quarter": "Q1_2024",
  "total_sites": 20951,
  "sites": [
    {
      "site_id": "38122268",
      "address": "д .Куркат, Молодежная, 2",
      "district": "Аларский район",
      "wape": 0.08,
      "accuracy_pct": 92.0,
      "days_evaluated": 7,
      "total_actual_m3": 17.25,
      "total_forecast_m3": 18.63
    },
    ...
  ]
}
```

### AC3: Date Range Selection
**Current**: Hardcoded to Aug 1-7, 2024
**New**: Allow any date range

**UI Component**:
- Date range picker (Ant Design DatePicker.RangePicker)
- Or: Quarter selector (Q1/Q2/Q3/Q4 2024)
- Default: Latest quarter

**Validation**:
- Must have data for selected range
- Show warning if no backtest exists for that period
- Fall back to nearest available quarter

### AC4: Match Backtesting Methodology
**Reference Files**:
- `reviews/NOTES/eval.md` - Quarterly results
- `scripts/backtest_sites.py` - Calculation logic
- `reports/site_backtest_Q*_2024/SUMMARY.md` - Report format

**Key Points**:
1. Use same WAPE formula: `sum(|actual - forecast|) / sum(actual)`
2. Same window logic: Train until cutoff, test 7-day window
3. Same data source: Real volume from `sites_service.csv`
4. Same aggregation: District = weighted avg of sites in district

## Implementation Guide

### Step 1: Understand Current Calculation
**Read**:
- `scripts/backtest_sites.py:70-120` - WAPE calculation
- `scripts/site_accuracy_postprocess.py` - District aggregation
- `reviews/NOTES/eval.md` - Expected output format

**Verify**:
```bash
cd /Users/m/git/clients/rtneo/forecastingrepo
grep -A 20 "compute_site_aggregate_wapes" scripts/backtest_sites.py
```

### Step 2: Create Backend Endpoints
**File**: `scripts/api_app.py` or new `scripts/api_accuracy.py`

Add endpoints:
1. `/api/accuracy/region?quarter=Q1_2024`
2. `/api/accuracy/districts?quarter=Q1_2024`
3. `/api/accuracy/sites?quarter=Q1_2024&district=...&limit=50`

**Data Source**: Read from existing reports:
- `reports/site_backtest_Q1_2024/SUMMARY.md`
- `reports/site_backtest_Q1_2024/district_accuracy_summary.csv`
- `reports/site_backtest_Q1_2024/site_accuracy_summary.csv`

**Alternative**: Re-run calculation on-demand (slower but more flexible)

### Step 3: Update Frontend
**Location**: `/Users/m/git/clients/rtneo/ui/forecast-ui/src/components/`

**Changes**:
1. Add quarter selector (Q1/Q2/Q3/Q4 2024)
2. Fetch accuracy data from new endpoints
3. Display district table with correct WAPE
4. Add new "Sites" tab with per-site accuracy
5. Update calculations to match backtest_sites.py

**Files to Edit**:
- `Districts.tsx` - Fix calculation, add quarter selector
- `Sites.tsx` - Show per-site accuracy, not forecasts
- `Overview.tsx` - Show region WAPE from API
- `api/client.ts` - Add new endpoint calls

### Step 4: Validation
**Compare**:
```bash
# Backend API response
curl http://localhost:8000/api/accuracy/region?quarter=Q1_2024 | jq .region_wape

# Should match eval.md:
# Q1 2024: overall WAPE 0.1445
```

**Test Cases**:
- [ ] Region WAPE matches eval.md (14.45% for Q1)
- [ ] District ranking matches eval.md (Жигаловский #1)
- [ ] Site count matches (20,951 sites)
- [ ] Distribution matches (27.2% ≤8% for Q1)
- [ ] Can switch between Q1/Q2/Q3/Q4
- [ ] Per-site table shows correct data

## Example Output

### Region Overview
```
Q1 2024 Accuracy Report

Overall WAPE: 14.45%
Median Site WAPE: 17.65%
Sites Evaluated: 20,951

Distribution:
  Excellent (≤8%):        27.2% (5,719 sites)
  Good (8-12%):          10.3% (2,158 sites)
  Needs Improvement:     62.5% (13,074 sites)
```

### District Table
```
District                WAPE    Accuracy   Sites
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Жигаловский район       9.4%    90.6%      142
МО Саянск              9.8%    90.2%      89
Шелеховский район      11.5%   88.5%      356
...
Балаганский район      47.8%   52.2%      78
```

### Site Detail (New)
```
Site Details - Аларский район

Site ID     Address                  WAPE    Actual   Forecast
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
38122268   д .Куркат, Молодежная, 2  8.0%   17.25 m³  18.63 m³
38122296   д Алзобей, Центральная, 6 12.3%  15.00 m³  16.85 m³
...
```

## Commands

**Backend**:
```bash
cd /Users/m/git/clients/rtneo/forecastingrepo

# Add new endpoints to api_app.py
# Test locally
uvicorn scripts.api_app:app --reload --port 8000

# Verify
curl http://localhost:8000/api/accuracy/region?quarter=Q1_2024
```

**Frontend**:
```bash
cd /Users/m/git/clients/rtneo/ui/forecast-ui

# Update components
npm run dev

# Test at http://localhost:5173
```

**Validation**:
```bash
# Compare with known results
cat /Users/m/git/clients/rtneo/forecastingrepo/reviews/NOTES/eval.md

# Should see:
# Q1 2024: overall WAPE 0.1445
# Q2 2024: overall WAPE 0.2059
# Q3 2024: overall WAPE 0.1712
# Q4 2024: overall WAPE 0.1619
```

## Success Criteria
- [ ] Region WAPE matches eval.md exactly
- [ ] District table matches eval.md rankings
- [ ] Can select any quarter (Q1-Q4 2024)
- [ ] Per-site accuracy table shows correct WAPE
- [ ] Calculations use same method as backtest_sites.py
- [ ] UI responsive and user-friendly
- [ ] No hardcoded Aug 1-7 dates

## Next Agent Notes
- Read `backtest_sites.py:70-120` carefully (WAPE calculation)
- Use existing CSV reports from `reports/site_backtest_Q*_2024/`
- Match eval.md numbers exactly (regression test)
- Add tests comparing API output to eval.md

---

**Priority**: High
**Complexity**: Medium (calculation logic exists, need to expose via API + UI)
**Timeline**: 2-3 days (1 day backend, 1-2 days frontend)
