# PR-DEMO: Dual UI Demo (Complete E2E)

## Mission
Create **two working UIs** showing complete technical solution for Opus review:
1. **Port 5173**: Accuracy dashboard (backtesting validation)
2. **Port 5174**: MyTKO-stack demo (integration proof)

**Critical**: ONE agent executes ALL phases. No handoff between agents.

---

## Context: What You Inherit

### Previous Work (What Exists)
- ✅ Python backend with 7 endpoints (baseline.py, simulator.py, api_app.py)
- ✅ React UI on port 5173 (but shows wrong data, Aug 1-7 hardcoded)
- ✅ 75% test coverage, Q1-Q4 2024 validation done
- ❌ No MyTKO-stack demo yet

### Critical Discoveries
1. **MyTKO has forecast UI** in `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/`
2. **Real volume data** in `/Users/m/ai/projects/forecastingrepo/data/raw/jury_volumes/csv/*.csv` (daily volume per site)
3. **Their stack**: FSD + MobX + Ant Design (not our Tailwind)

### Your Goal
Two UIs running side-by-side:
- **5173**: "Our algorithm achieves 17% WAPE" (validation)
- **5174**: "Here's code Jury can copy-paste" (integration)

---

## Phase 1: Understand Current State (30 min)

### Read These Files (In Order)
1. **Backend algorithm**:
   - `/Users/m/git/clients/rtneo/forecastingrepo/src/sites/baseline.py` (92 lines)
   - `/Users/m/git/clients/rtneo/forecastingrepo/src/sites/simulator.py` (61 lines)

2. **Validation results**:
   - `/Users/m/git/clients/rtneo/forecastingrepo/reviews/NOTES/eval.md`
   - Look for: Q1 2024: 14.45%, Q2: 20.59%, Q3: 17.12%, Q4: 16.19%

3. **WAPE calculation**:
   - `/Users/m/git/clients/rtneo/forecastingrepo/scripts/backtest_sites.py:70-120`
   - Function: `compute_site_aggregate_wapes`

4. **Current UI**:
   - `/Users/m/git/clients/rtneo/ui/forecast-ui/src/components/Overview.tsx`
   - `/Users/m/git/clients/rtneo/ui/forecast-ui/src/components/Districts.tsx`

5. **MyTKO actual code**:
   - `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/types.ts`
   - Type: `ForecastDataFormat` - THIS is what they expect

### Verify Understanding
Run backend:
```bash
cd /Users/m/git/clients/rtneo/forecastingrepo
uvicorn scripts.api_app:app --reload --port 8000
curl http://localhost:8000/api/metrics
```

Should return JSON with WAPE data.

Run current UI:
```bash
cd /Users/m/git/clients/rtneo/ui/forecast-ui
npm install  # if needed
npm run dev
```

Visit http://localhost:5173 - should see 4 tabs, but data is wrong/hardcoded.

**Checkpoint 1**: Confirm both running before proceeding.

---

## Phase 2: Backend - Accuracy Endpoints (2-3 hours)

### Goal
Create `/api/accuracy/*` endpoints matching eval.md results EXACTLY.

### Step 2.1: Read Validation Data
```bash
# See quarterly results
cat /Users/m/git/clients/rtneo/forecastingrepo/reviews/NOTES/eval.md

# Expected output:
# Q1 2024: overall WAPE 0.1445, median per-site 0.1765
# Q2 2024: overall WAPE 0.2059, median per-site 0.1979
# Q3 2024: overall WAPE 0.1712, median per-site 0.1677
# Q4 2024: overall WAPE 0.1619, median per-site 0.1594
```

Check CSV reports exist:
```bash
ls /Users/m/git/clients/rtneo/forecastingrepo/reports/site_backtest_Q*_2024/
# Should see: Q1_2024, Q2_2024, Q3_2024, Q4_2024
```

### Step 2.2: Create Endpoints
**File**: `scripts/api_app.py` or new `scripts/api_accuracy.py`

Add THREE endpoints:

**Endpoint 1**: `/api/accuracy/region?quarter=Q1_2024`
```python
@app.get("/api/accuracy/region")
def get_region_accuracy(quarter: str = "Q3_2024"):
    """Return region-level WAPE for quarter."""
    # Read from reports/site_backtest_{quarter}/SUMMARY.md
    # Or hardcode from eval.md for now

    quarters = {
        "Q1_2024": {"wape": 0.1445, "median_site": 0.1765, "sites_count": 20951},
        "Q2_2024": {"wape": 0.2059, "median_site": 0.1979, "sites_count": 20951},
        "Q3_2024": {"wape": 0.1712, "median_site": 0.1677, "sites_count": 20951},
        "Q4_2024": {"wape": 0.1619, "median_site": 0.1594, "sites_count": 20951},
    }

    if quarter not in quarters:
        raise HTTPException(404, f"Quarter {quarter} not found")

    return {
        "quarter": quarter,
        "region_wape": quarters[quarter]["wape"],
        "median_site_wape": quarters[quarter]["median_site"],
        "sites_evaluated": quarters[quarter]["sites_count"],
        "distribution": {
            "excellent_pct": 27.2 if quarter == "Q1_2024" else 24.0,  # ≤8%
            "good_pct": 10.3 if quarter == "Q1_2024" else 12.0,      # 8-12%
            "needs_improvement_pct": 62.5 if quarter == "Q1_2024" else 64.0  # >12%
        }
    }
```

**Endpoint 2**: `/api/accuracy/districts?quarter=Q1_2024`
```python
@app.get("/api/accuracy/districts")
def get_district_accuracy(quarter: str = "Q3_2024"):
    """Return district-level WAPE rankings."""
    # Read from reports/site_backtest_{quarter}/district_accuracy_summary.csv
    # For now, return top 5 + bottom 5 from eval.md

    if quarter == "Q1_2024":
        return [
            {"name": "Жигаловский район", "accuracy_pct": 90.6, "wape": 0.094},
            {"name": "МО Саянск", "accuracy_pct": 90.2, "wape": 0.098},
            {"name": "Шелеховский район", "accuracy_pct": 88.5, "wape": 0.115},
            # ... add more
            {"name": "Аларский район", "accuracy_pct": 52.5, "wape": 0.475},
            {"name": "Балаганский район", "accuracy_pct": 52.2, "wape": 0.478},
        ]
    # Add Q2, Q3, Q4 data from eval.md
```

**Endpoint 3**: `/api/accuracy/sites?quarter=Q3_2024&limit=50`
```python
@app.get("/api/accuracy/sites")
def get_site_accuracy(quarter: str = "Q3_2024", limit: int = 50, offset: int = 0):
    """Return per-site WAPE."""
    # Read from reports/site_backtest_{quarter}/site_accuracy_summary.csv
    # For demo, return sample sites

    return {
        "quarter": quarter,
        "total_sites": 20951,
        "sites": [
            {
                "site_id": "38122268",
                "address": "д .Куркат, Молодежная, 2",
                "district": "Аларский район",
                "wape": 0.08,
                "actual_m3": 17.25,
                "forecast_m3": 18.63
            },
            # Add more from CSV
        ]
    }
```

### Step 2.3: Test Endpoints
```bash
# Test region accuracy
curl http://localhost:8000/api/accuracy/region?quarter=Q1_2024 | jq

# Should return: {"region_wape": 0.1445, ...}

# Test districts
curl http://localhost:8000/api/accuracy/districts?quarter=Q1_2024 | jq '.[0]'

# Should return: {"name": "Жигаловский район", "accuracy_pct": 90.6, ...}

# Test sites
curl http://localhost:8000/api/accuracy/sites?quarter=Q3_2024&limit=5 | jq
```

**Checkpoint 2**: All 3 endpoints return correct data matching eval.md.

---

## Phase 3: Frontend - Fix Accuracy UI (Port 5173) (2-3 hours)

### Goal
Update existing UI to show correct accuracy data from new endpoints.

### Step 3.1: Update Overview Component
**File**: `/Users/m/git/clients/rtneo/ui/forecast-ui/src/components/Overview.tsx`

Changes:
```typescript
// Add quarter selector
const [selectedQuarter, setSelectedQuarter] = useState('Q3_2024');

// Fetch from new endpoint
useEffect(() => {
  fetch(`http://localhost:8000/api/accuracy/region?quarter=${selectedQuarter}`)
    .then(res => res.json())
    .then(data => {
      setRegionWAPE(data.region_wape);
      setMedianSiteWAPE(data.median_site_wape);
      setDistribution(data.distribution);
    });
}, [selectedQuarter]);

// Add quarter selector UI
<Select value={selectedQuarter} onChange={setSelectedQuarter}>
  <Option value="Q1_2024">Q1 2024</Option>
  <Option value="Q2_2024">Q2 2024</Option>
  <Option value="Q3_2024">Q3 2024</Option>
  <Option value="Q4_2024">Q4 2024</Option>
</Select>
```

### Step 3.2: Update Districts Component
**File**: `/Users/m/git/clients/rtneo/ui/forecast-ui/src/components/Districts.tsx`

Changes:
```typescript
// Fetch districts from new endpoint
useEffect(() => {
  fetch(`http://localhost:8000/api/accuracy/districts?quarter=${selectedQuarter}`)
    .then(res => res.json())
    .then(setDistricts);
}, [selectedQuarter]);

// Table columns
const columns = [
  { title: 'Район', dataIndex: 'name' },
  { title: 'WAPE', dataIndex: 'wape', render: (v) => `${(v * 100).toFixed(1)}%` },
  { title: 'Точность', dataIndex: 'accuracy_pct', render: (v) => `${v.toFixed(1)}%` },
];
```

### Step 3.3: Add Sites Tab
**File**: `/Users/m/git/clients/rtneo/ui/forecast-ui/src/components/Sites.tsx`

Replace current "forecast" view with "accuracy" view:
```typescript
// Fetch site accuracy
useEffect(() => {
  fetch(`http://localhost:8000/api/accuracy/sites?quarter=${selectedQuarter}&limit=100`)
    .then(res => res.json())
    .then(data => setSites(data.sites));
}, [selectedQuarter]);

// Table showing WAPE per site
<Table
  columns={[
    { title: 'ID', dataIndex: 'site_id' },
    { title: 'Адрес', dataIndex: 'address' },
    { title: 'Район', dataIndex: 'district' },
    { title: 'WAPE', dataIndex: 'wape', render: (v) => `${(v * 100).toFixed(1)}%` },
    { title: 'Факт м³', dataIndex: 'actual_m3' },
    { title: 'Прогноз м³', dataIndex: 'forecast_m3' },
  ]}
  dataSource={sites}
/>
```

### Step 3.4: Test UI
```bash
cd /Users/m/git/clients/rtneo/ui/forecast-ui
npm run dev
```

Visit http://localhost:5173 and verify:
- [ ] Quarter selector (Q1/Q2/Q3/Q4 2024)
- [ ] Region WAPE shows 14.45% for Q1, 20.59% for Q2, etc.
- [ ] Districts table shows correct rankings (Жигаловский #1)
- [ ] Sites tab shows per-site accuracy

**Checkpoint 3**: Port 5173 shows correct validation data.

---

## Phase 4: Backend - MyTKO Adapter (1 hour)

### Goal
Create adapter transforming our API response → their `ForecastDataFormat`.

### Step 4.1: Read Their Type
```bash
cat /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/types.ts
```

Expected:
```typescript
export type ForecastDataFormat<D = unknown> = Array<{
    date: D;
    isFact: boolean;
    isEmpty: boolean;
    tripMeasurements: Nullable<number[] | number>;
    dividedToTrips: boolean;
    vehicleVolume: number;
    overallVolume: number;
    overallWeight: number;
    overallMileage?: number;
    isMixed?: boolean;
}>;
```

### Step 4.2: Create Adapter Endpoint
**File**: `scripts/api_app.py`

```python
from typing import List, Optional
from pydantic import BaseModel

class MyTKOForecastPoint(BaseModel):
    """Their exact format."""
    date: str
    isFact: bool = False
    isEmpty: bool = False
    tripMeasurements: Optional[float] = None
    dividedToTrips: bool = False
    vehicleVolume: float
    overallVolume: float
    overallWeight: float
    overallMileage: Optional[float] = None
    isMixed: bool = False

@app.get("/api/mytko/forecast", response_model=List[MyTKOForecastPoint])
def get_mytko_forecast(
    site_id: str = "S1",
    start_date: str = "2024-08-01",
    end_date: str = "2024-08-07"
):
    """Transform our forecast to MyTKO format."""
    # Get our forecast data
    our_forecast = get_site_forecast(site_id, start_date, end_date)  # existing endpoint

    # Transform to their format
    result = []
    for point in our_forecast:
        result.append(MyTKOForecastPoint(
            date=point.date,
            isFact=False,
            isEmpty=(point.fill_pct == 0),
            tripMeasurements=None,
            dividedToTrips=False,
            vehicleVolume=1100.0,  # from registry
            overallVolume=point.fill_pct * 1100,  # Convert fill% to m³
            overallWeight=point.pred_volume_m3,
            overallMileage=None,
            isMixed=False
        ))

    return result
```

### Step 4.3: Test Adapter
```bash
curl "http://localhost:8000/api/mytko/forecast?site_id=S1&start_date=2024-08-01&end_date=2024-08-07" | jq '.[0]'

# Should return:
# {
#   "date": "2024-08-01",
#   "isFact": false,
#   "isEmpty": false,
#   "vehicleVolume": 1100,
#   "overallVolume": 850,
#   "overallWeight": 650,
#   ...
# }
```

**Checkpoint 4**: Adapter endpoint returns their exact format.

---

## Phase 5: Frontend - MyTKO Stack Demo (Port 5174) (3-4 hours)

### Goal
Create NEW React app using their exact stack + widgets.

### Step 5.1: Setup Project
```bash
cd /Users/m/git/clients/rtneo/ui
npx create-vite mytko-forecast-demo --template react-ts
cd mytko-forecast-demo
npm install antd mobx mobx-react dayjs @ant-design/cssinjs
```

### Step 5.2: Copy Their Widgets
```bash
# Create FSD structure
mkdir -p src/_widgets src/_features src/_pages src/_shared

# Copy their forecast widget
cp -r /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast \
      src/_widgets/

# Copy features
mkdir -p src/_features/route
cp -r /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_features/route/change-forecast-region \
      src/_features/route/
cp -r /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_features/route/toggle-forecast-view \
      src/_features/route/
```

### Step 5.3: Create MobX Store
**File**: `src/_pages/forecast/model/ForecastStore.ts`

```typescript
import { makeAutoObservable } from 'mobx';

export class ForecastStore {
  forecastData = [];
  loading = false;
  selectedSiteId = 'S1';

  constructor() {
    makeAutoObservable(this);
  }

  async loadForecast(siteId: string, startDate: string, endDate: string) {
    this.loading = true;
    try {
      const response = await fetch(
        `http://localhost:8000/api/mytko/forecast?site_id=${siteId}&start_date=${startDate}&end_date=${endDate}`
      );
      this.forecastData = await response.json();
    } finally {
      this.loading = false;
    }
  }
}

export const forecastStore = new ForecastStore();
```

### Step 5.4: Create Page
**File**: `src/_pages/forecast/ui/index.tsx`

```typescript
import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Select, DatePicker, Row, Col } from 'antd';
import { forecastStore } from '../model/ForecastStore';
import { MultipleRoutesForecast } from '@/_widgets/forecast';

export const ForecastPage = observer(() => {
  useEffect(() => {
    forecastStore.loadForecast('S1', '2024-08-01', '2024-08-07');
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Прогноз загрузки КП (ML)</h1>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Select
            value={forecastStore.selectedSiteId}
            onChange={(id) => forecastStore.loadForecast(id, '2024-08-01', '2024-08-07')}
            style={{ width: '100%' }}
          >
            <Select.Option value="S1">КП #1</Select.Option>
            <Select.Option value="S2">КП #2</Select.Option>
          </Select>
        </Col>
      </Row>

      <MultipleRoutesForecast model={forecastStore} />
    </div>
  );
});
```

### Step 5.5: Configure Vite for Port 5174
**File**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  }
})
```

### Step 5.6: Add Theme
**File**: `src/App.tsx`

```typescript
import { ConfigProvider } from 'antd';
import ru from 'antd/locale/ru_RU';
import { ForecastPage } from './_pages/forecast/ui';

export default function App() {
  return (
    <ConfigProvider
      locale={ru}
      theme={{
        token: {
          colorPrimary: '#0288d1',
          fontFamily: 'Segoe UI, Segoe, Tahoma, Geneva, Verdana, sans-serif',
        }
      }}
    >
      <ForecastPage />
    </ConfigProvider>
  );
}
```

### Step 5.7: Test MyTKO Demo
```bash
npm run dev
```

Visit http://localhost:5174 and verify:
- [ ] Uses Ant Design (blue #0288d1 theme)
- [ ] Shows their forecast widget
- [ ] Connects to backend adapter
- [ ] Russian locale
- [ ] FSD structure visible in devtools

**Checkpoint 5**: Port 5174 shows MyTKO-compatible demo.

---

## Phase 6: Verification & Screenshots (1 hour)

### Goal
Verify both UIs work, create evidence for Opus.

### Step 6.1: Run All Three Services
```bash
# Terminal 1: Backend
cd /Users/m/git/clients/rtneo/forecastingrepo
uvicorn scripts.api_app:app --reload --port 8000

# Terminal 2: Accuracy UI
cd /Users/m/git/clients/rtneo/ui/forecast-ui
npm run dev
# → http://localhost:5173

# Terminal 3: MyTKO Demo
cd /Users/m/git/clients/rtneo/ui/mytko-forecast-demo
npm run dev
# → http://localhost:5174
```

### Step 6.2: Test Accuracy UI (5173)
Visit http://localhost:5173

Verify:
- [ ] Quarter selector shows Q1/Q2/Q3/Q4 2024
- [ ] Q1 shows: Region WAPE 14.45%, Median 17.65%
- [ ] Q2 shows: Region WAPE 20.59%, Median 19.79%
- [ ] Q3 shows: Region WAPE 17.12%, Median 16.77%
- [ ] Q4 shows: Region WAPE 16.19%, Median 15.94%
- [ ] Districts table: Жигаловский #1 (90.6%)
- [ ] Sites tab shows per-site data

Take screenshots:
```bash
# Save to ~/downloads/mytko-forecast-essential/screenshots/
# - accuracy_q1.png
# - accuracy_q3.png
# - districts_ranking.png
# - sites_table.png
```

### Step 6.3: Test MyTKO Demo (5174)
Visit http://localhost:5174

Verify:
- [ ] Ant Design theme (#0288d1 blue)
- [ ] Forecast widget displays
- [ ] Site selector works
- [ ] Data loads from backend
- [ ] Russian locale

Take screenshots:
```bash
# - mytko_demo_overview.png
# - mytko_demo_widget.png
```

### Step 6.4: Test API Endpoints
```bash
# Test all endpoints work
curl http://localhost:8000/api/accuracy/region?quarter=Q1_2024 | jq
curl http://localhost:8000/api/accuracy/districts?quarter=Q1_2024 | jq '.[0]'
curl http://localhost:8000/api/accuracy/sites?quarter=Q3_2024&limit=5 | jq
curl "http://localhost:8000/api/mytko/forecast?site_id=S1&start_date=2024-08-01&end_date=2024-08-07" | jq '.[0]'
```

**Checkpoint 6**: All tests pass, screenshots captured.

---

## Phase 7: Package for Opus (30 min)

### Goal
Create handoff with evidence of working system.

### Step 7.1: Create Results Document
**File**: `~/downloads/mytko-forecast-essential/DEMO_RESULTS.md`

```markdown
# Demo Results — Working System

**Date**: [current date]
**Executer**: [your name/agent]

## Services Running

- ✅ Backend: http://localhost:8000 (Python FastAPI)
- ✅ Accuracy UI: http://localhost:5173 (validation dashboard)
- ✅ MyTKO Demo: http://localhost:5174 (integration proof)

## Accuracy UI (Port 5173)

### Quarterly Validation
- Q1 2024: 14.45% WAPE (matches eval.md ✅)
- Q2 2024: 20.59% WAPE (matches eval.md ✅)
- Q3 2024: 17.12% WAPE (matches eval.md ✅)
- Q4 2024: 16.19% WAPE (matches eval.md ✅)

### District Rankings
Top 3:
1. Жигаловский район: 90.6% accuracy
2. МО Саянск: 90.2% accuracy
3. Шелеховский район: 88.5% accuracy

Bottom 3:
1. Балаганский район: 52.2% accuracy
2. Аларский район: 52.5% accuracy
3. Ольхонский район: 56.3% accuracy

### Sites Evaluated
- Total: 20,951 sites
- Excellent (≤8% WAPE): 27.2%
- Good (8-12% WAPE): 10.3%
- Needs improvement (>12%): 62.5%

**Screenshots**: See screenshots/accuracy_*.png

## MyTKO Demo (Port 5174)

### Stack Verification
- ✅ FSD architecture (_pages, _widgets, _features)
- ✅ MobX state management
- ✅ Ant Design 5 components
- ✅ Theme: #0288d1 (MyTKO blue)
- ✅ Russian locale
- ✅ Their exact forecast widget (copied unmodified)

### Integration
- ✅ Connects to Python backend
- ✅ Uses adapter: /api/mytko/forecast
- ✅ Transforms to ForecastDataFormat
- ✅ Works with their widget code

**Screenshots**: See screenshots/mytko_demo_*.png

## API Endpoints Created

1. GET /api/accuracy/region?quarter=Q1_2024
2. GET /api/accuracy/districts?quarter=Q1_2024
3. GET /api/accuracy/sites?quarter=Q1_2024&limit=50
4. GET /api/mytko/forecast?site_id=S1&start_date=...&end_date=...

All endpoints tested ✅

## Code Locations

### Backend
- Accuracy endpoints: /Users/m/git/clients/rtneo/forecastingrepo/scripts/api_app.py
- Adapter logic: [line numbers]

### Frontend (Accuracy UI)
- Updated components: /Users/m/git/clients/rtneo/ui/forecast-ui/src/components/
- Overview.tsx: [changes made]
- Districts.tsx: [changes made]
- Sites.tsx: [changes made]

### Frontend (MyTKO Demo)
- Project: /Users/m/git/clients/rtneo/ui/mytko-forecast-demo/
- Structure: FSD (_pages, _widgets, _features)
- Copied widgets: src/_widgets/forecast/ (from MyTKO source)

## Next Steps for Opus

1. Review both UIs running
2. Verify code matches MyTKO stack
3. Answer 15 technical questions
4. Approve technical approach
5. Move to Topic 2 (business strategy)
```

### Step 7.2: Update Package README
**File**: `~/downloads/mytko-forecast-essential/README.md`

Add section:
```markdown
## ✅ DEMOS WORKING (Updated [date])

Two UIs now running:

**Port 5173**: Accuracy Dashboard
- Shows Q1-Q4 2024 validation
- District rankings
- Per-site accuracy
- Correct WAPE calculations

**Port 5174**: MyTKO Stack Demo
- Their exact widgets
- FSD architecture
- MobX + Ant Design
- Ready to copy-paste

See DEMO_RESULTS.md for details.
```

**Checkpoint 7**: Package updated with working demo evidence.

---

## Success Criteria

### Must Have
- [ ] Port 5173 shows correct Q1-Q4 WAPE matching eval.md
- [ ] Port 5173 district rankings match eval.md
- [ ] Port 5174 uses MyTKO stack (FSD + MobX + Ant Design)
- [ ] Port 5174 uses their exact forecast widget
- [ ] All 4 API endpoints work
- [ ] Screenshots captured
- [ ] DEMO_RESULTS.md created

### Nice to Have
- [ ] Code comments explaining adapter logic
- [ ] README in mytko-forecast-demo explaining integration
- [ ] Error handling in both UIs

---

## Common Issues & Solutions

### Issue: npm install fails
**Solution**: Delete node_modules, package-lock.json, retry

### Issue: Port already in use
**Solution**: Kill process or use different port

### Issue: CORS errors
**Solution**: Check api_app.py has CORS middleware enabled

### Issue: Copied widgets have import errors
**Solution**: May need to stub some MyTKO-specific imports

### Issue: MobX not reactive
**Solution**: Ensure `observer()` wrapper and `makeAutoObservable()`

---

## Timeline

- Phase 1: Understanding (30 min)
- Phase 2: Backend accuracy (2-3 hours)
- Phase 3: Frontend accuracy (2-3 hours)
- Phase 4: Backend adapter (1 hour)
- Phase 5: MyTKO demo (3-4 hours)
- Phase 6: Verification (1 hour)
- Phase 7: Documentation (30 min)

**Total**: 10-13 hours (can span 2 days)

---

## Handoff to Opus

When complete, tell user:

"✅ Both demos running:
- Port 5173: Validation dashboard (17% WAPE across Q1-Q4)
- Port 5174: MyTKO integration demo (their exact stack)

All screenshots in ~/downloads/mytko-forecast-essential/screenshots/
Results documented in DEMO_RESULTS.md

Ready for Opus review."
