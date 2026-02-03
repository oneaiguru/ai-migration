# PR-UI-1: MyTKO Stack Forecast Demo (Their Exact UI)

## Scope
Create **second UI app** using MyTKO's exact stack:
- Feature-Sliced Design (FSD) architecture
- Ant Design 5 components
- MobX state management
- TypeScript
- React 18

Reuse their actual forecast widget code, connect to our Python API.

**Goal**: Show Jury/Artem code they can **literally copy-paste** into their codebase.

## Why
Our current UI (`forecast-ui/`) uses:
- ❌ Tailwind (they use Ant Design)
- ❌ Flat components/ (they use FSD structure)
- ❌ useState (they use MobX)

New demo will:
- ✅ Match their stack exactly
- ✅ Use their widget code
- ✅ Easy integration (just copy files)
- ✅ Pass their code review

## Architecture

### Directory Structure (FSD)
```
mytko-forecast-demo/
├── package.json           # Ant Design + MobX deps
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── _app/              # App-level (routing, theme)
    ├── _pages/
    │   └── forecast/      # Main forecast page
    │       ├── ui/
    │       │   └── index.tsx
    │       ├── model/
    │       │   └── ForecastStore.ts  # MobX store
    │       └── index.ts
    ├── _widgets/
    │   └── forecast/      # COPY from their code
    │       ├── ui/
    │       │   ├── forecast-table/
    │       │   ├── forecast-bar/
    │       │   └── forecast-tooltip/
    │       ├── model/
    │       │   └── index.ts
    │       ├── types.ts   # ForecastDataFormat
    │       └── index.ts
    ├── _features/
    │   └── forecast/
    │       ├── change-region/
    │       ├── change-date/
    │       └── toggle-view/
    ├── _shared/
    │   ├── api/
    │   │   └── forecast.ts  # API client
    │   ├── config/
    │   │   └── theme.ts     # Ant Design theme
    │   └── lib/
    │       └── mobx.ts
    └── index.tsx          # Entry point
```

### Key Differences from Current UI
| Aspect | Current (forecast-ui/) | New (mytko-demo/) | Port |
|--------|------------------------|-------------------|------|
| Framework | Vite + React | Vite + React | ✅ Same |
| UI Lib | Tailwind | Ant Design 5 | ❌ Different |
| State | useState | MobX | ❌ Different |
| Arch | Flat components/ | FSD (_pages, _widgets) | ❌ Different |
| Port | 5173 | **5174** | Different port |
| Purpose | Backtesting results | Live forecast demo | Different use case |

## Implementation Steps

### Step 1: Copy Their Widget Code
**Source**: `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/`

This is **actual MyTKO production code** from their project.

**Directory Structure** (their actual code):
```
/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/
├── _widgets/
│   └── route/
│       └── forecast/              # ← THEIR FORECAST WIDGET
│           ├── ui/
│           │   └── route-forecast-provider/
│           │       ├── route-forecast-table/
│           │       ├── route-forecast-bar/
│           │       ├── route-forecast-tooltip/
│           │       └── route-forecast-dates-control/
│           ├── model/
│           │   └── index.ts
│           ├── types.ts           # ← ForecastDataFormat type
│           ├── adapters.ts
│           ├── fragments.ts
│           └── index.ts
├── _features/
│   └── route/
│       ├── change-forecast-region/  # ← Region selector
│       ├── change-forecast-shift/   # ← Shift changer
│       └── toggle-forecast-view/    # ← View toggler
├── _pages/
│   └── routes/
│       └── ui/
│           └── routes-content/
│               └── ui/
│                   └── multiple-forecast-view/  # ← How they use it
└── index.tsx                      # ← Theme config
```

**Files to copy**:
```bash
# Create target directory
mkdir -p /Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/_widgets

# Copy their forecast widget (ENTIRE widget, not modified)
cp -r /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast \
      /Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/_widgets/

# Copy their features (region select, shift changer, view toggler)
mkdir -p /Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/_features/route
cp -r /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_features/route/change-forecast-region \
      /Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/_features/route/
cp -r /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_features/route/change-forecast-shift \
      /Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/_features/route/
cp -r /Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_features/route/toggle-forecast-view \
      /Users/m/git/clients/rtneo/ui/mytko-forecast-demo/src/_features/route/

# Copy theme from their index.tsx (for reference)
# We'll extract theme config from this file
```

**Their exact type** (from `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/types.ts`):
```typescript
export enum ForecastViewTypeEnum {
    SINGLE = 'SINGLE',
    MULTIPLE = 'MULTIPLE',
}

export type ForecastDataFormat<D = unknown> = Array<{
    date: D;
    isFact: boolean;           // Historical vs forecast
    isEmpty: boolean;          // No data flag
    tripMeasurements: Nullable<number[] | number>;
    dividedToTrips: boolean;
    vehicleVolume: number;     // Container capacity
    overallVolume: number;     // Total volume
    overallWeight: number;     // Total weight
    overallMileage?: number;
    isMixed?: boolean;
}>;
```

**IMPORTANT**: Use this EXACT type definition. Don't modify it — we want their code to work as-is.

### Step 2: Create Adapter (Our API → Their Format)
**File**: `src/_shared/api/forecast.ts`

```typescript
import { ForecastDataFormat } from '@/_widgets/forecast/types';

// Our API response
interface OurForecastResponse {
  site_id: string;
  date: string;
  fill_pct: number;
  pred_mass_kg: number;
  overflow_prob: number;
}

// Transform to their format
export function transformToMyTKOFormat(
  ourData: OurForecastResponse[],
  capacity: number = 1100
): ForecastDataFormat {
  return ourData.map(item => ({
    date: item.date,
    isFact: false,                    // All forecasts
    isEmpty: item.fill_pct === 0,
    tripMeasurements: null,            // Not used yet
    dividedToTrips: false,
    vehicleVolume: capacity,
    overallVolume: item.fill_pct * capacity,  // m³
    overallWeight: item.pred_mass_kg,         // kg
    overallMileage: null,
    isMixed: false
  }));
}

// Fetch from our Python API
export async function fetchForecast(
  siteId: string,
  startDate: string,
  endDate: string
): Promise<ForecastDataFormat> {
  const response = await fetch(
    `http://localhost:8000/api/sites/${siteId}/forecast?start=${startDate}&end=${endDate}`
  );
  const data = await response.json();
  return transformToMyTKOFormat(data);
}
```

### Step 3: Create MobX Store
**File**: `src/_pages/forecast/model/ForecastStore.ts`

```typescript
import { makeAutoObservable } from 'mobx';
import { ForecastDataFormat } from '@/_widgets/forecast/types';
import { fetchForecast } from '@/_shared/api/forecast';

export class ForecastStore {
  forecastData: ForecastDataFormat = [];
  loading = false;
  error: string | null = null;
  selectedSiteId: string | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor() {
    makeAutoObservable(this);
  }

  async loadForecast(siteId: string, startDate: string, endDate: string) {
    this.loading = true;
    this.error = null;
    try {
      this.forecastData = await fetchForecast(siteId, startDate, endDate);
      this.selectedSiteId = siteId;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  setSelectedDate(date: string) {
    this.selectedDate = date;
  }
}
```

### Step 4: Build Page Component (Based on Their Usage)
**Reference**: `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_pages/routes/ui/routes-content/ui/multiple-forecast-view/ui/index.tsx`

This is how THEY use the widget in production. We simplify but keep same pattern.

**File**: `src/_pages/forecast/ui/index.tsx`

```typescript
import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Col, DatePicker, Empty, Row, Select, Spin } from 'antd';
import { ForecastStore } from '../model/ForecastStore';
import { MultipleRoutesForecast } from '@/_widgets/forecast';
import { ForecastRegionSelect } from '@/_features/route/change-forecast-region';
import { ForecastViewToggler } from '@/_features/route/toggle-forecast-view';

const forecastStore = new ForecastStore();

export const ForecastPage = observer(() => {
  useEffect(() => {
    // Load default forecast on mount
    forecastStore.loadForecast('S1', '2024-08-01', '2024-08-07');
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Прогноз загрузки КП (ML)</h1>

      {/* Controls row - matching their layout */}
      <Row align="middle" gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          {/* Site selector */}
          <Select
            style={{ width: '100%' }}
            placeholder="Выберите КП"
            onChange={(siteId) => {
              forecastStore.loadForecast(siteId, '2024-08-01', '2024-08-07');
            }}
            defaultValue="S1"
          >
            <Select.Option value="S1">КП #1 (д .Куркат, Молодежная, 2)</Select.Option>
            <Select.Option value="S2">КП #2 (д Алзобей, Центральная, 6)</Select.Option>
            <Select.Option value="S3">КП #3 (д. Алзобей, Центральная, 28)</Select.Option>
          </Select>
        </Col>

        <Col span={8}>
          {/* Date picker */}
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            onChange={(dates) => {
              if (dates && forecastStore.selectedSiteId) {
                forecastStore.loadForecast(
                  forecastStore.selectedSiteId,
                  dates[0]!.format('YYYY-MM-DD'),
                  dates[1]!.format('YYYY-MM-DD')
                );
              }
            }}
          />
        </Col>

        <Col span={4} style={{ textAlign: 'end' }}>
          {/* View toggler (their component) */}
          <ForecastViewToggler
            toggled={forecastStore.viewEnabled}
            onToggle={() => forecastStore.toggleView()}
          />
        </Col>
      </Row>

      {/* Forecast display - using THEIR widget */}
      {forecastStore.loading ? (
        <Spin size="large" style={{ marginTop: 50 }} />
      ) : forecastStore.error ? (
        <div style={{ color: 'red' }}>Ошибка: {forecastStore.error}</div>
      ) : forecastStore.forecastData.length > 0 ? (
        <Row align="stretch" wrap={false}>
          <Col style={{ width: '600px' }}>
            {/* This is THEIR widget, unmodified */}
            <MultipleRoutesForecast model={forecastStore} />
          </Col>
        </Row>
      ) : (
        <Empty description="Данные отсутствуют" />
      )}
    </div>
  );
});
```

**Key Points**:
1. Uses `observer()` from `mobx-react` (their pattern)
2. Ant Design Grid (Row/Col) for layout (their pattern)
3. Their widget components imported as-is
4. Russian strings (they use Russian UI)
5. Same structure as their `multiple-forecast-view`

### Step 5: Package.json
```json
{
  "name": "mytko-forecast-demo",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc && vite build",
    "preview": "vite preview --port 5174"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.12.0",
    "mobx": "^6.12.0",
    "mobx-react": "^9.1.0",
    "dayjs": "^1.11.10",
    "@ant-design/cssinjs": "^1.18.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

### Step 6: Theme Config
**Source**: `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/index.tsx:52-76`

**File**: `src/_shared/config/theme.ts`

```typescript
import { ThemeConfig } from 'antd';

// EXACT theme from their index.tsx (lines 52-76)
export const myTKOTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0288d1',      // Their exact blue
    colorLink: '#0288d1',
    fontFamily: 'Segoe UI, Segoe, Tahoma, Geneva, Verdana, sans-serif',
  },
  components: {
    Descriptions: {
      padding: 0,
    },
    Tabs: {
      padding: 5,
      paddingSM: 4,
    },
    Radio: {
      borderRadius: 4,
    },
    Form: {
      marginLG: 15,
    },
    Select: {
      multipleSelectorBgDisabled: 'rgba(0, 0, 0, 0)',
    },
  },
};
```

## Acceptance Criteria

### AC1: Exact Stack Match
- [ ] Ant Design 5 (not Tailwind)
- [ ] MobX stores (not useState)
- [ ] FSD structure (_pages, _widgets, _features, _shared)
- [ ] TypeScript strict mode
- [ ] Day.js for dates (Russian locale)
- [ ] Theme matches MyTKO (#0288d1 blue)

### AC2: Widget Reuse
- [ ] Copy their forecast widget code
- [ ] Use their `ForecastDataFormat` type
- [ ] Visual match (same bars, table, tooltip)
- [ ] Russian locale strings

### AC3: API Integration
- [ ] Fetch from `http://localhost:8000/api/sites/{id}/forecast`
- [ ] Transform response to `ForecastDataFormat`
- [ ] Handle loading/error states
- [ ] Real-time updates

### AC4: Easy Copy-Paste
- [ ] Code organized in FSD layers
- [ ] Clear separation: _widgets (reusable), _pages (specific)
- [ ] TypeScript types exported
- [ ] README with integration instructions

## Demo Flow

### Run Both UIs Side-by-Side
```bash
# Terminal 1: Backend
cd /Users/m/git/clients/rtneo/forecastingrepo
uvicorn scripts.api_app:app --reload --port 8000

# Terminal 2: Current UI (backtesting results)
cd /Users/m/git/clients/rtneo/ui/forecast-ui
npm run dev
# → http://localhost:5173

# Terminal 3: New UI (MyTKO stack demo)
cd /Users/m/git/clients/rtneo/ui/mytko-forecast-demo
npm run dev
# → http://localhost:5174
```

### Show Opus
1. **Port 5173** (current UI): "Here's backtesting accuracy results"
2. **Port 5174** (new UI): "Here's what integrates into MyTKO (their exact stack)"
3. **Code comparison**: Show FSD structure vs flat structure

## Files for Next Agent

**Read First**:
1. `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/_widgets/route/forecast/types.ts`
2. `/Users/m/git/clients/rtneo/_incoming/telegram_20251105_184724/extracted/src/index.tsx` (theme setup)
3. `~/downloads/mytko-forecast-essential/STACK_ALIGNMENT.md` (their stack details)

**Copy**:
1. Their forecast widget → `mytko-forecast-demo/src/_widgets/forecast/`
2. Their theme config → `mytko-forecast-demo/src/_shared/config/theme.ts`

**Create**:
1. MobX store for forecast data
2. API client with transformer
3. FSD page structure
4. Vite config for port 5174

## Success Metrics
- [ ] Runs on port 5174 (parallel to 5173)
- [ ] Shows real forecast data from Python API
- [ ] Visually matches MyTKO forecast UI
- [ ] Code structure matches their FSD
- [ ] Jury/Artem can copy `_widgets/forecast/` to their codebase
- [ ] All TypeScript types match

## Timeline
- **Day 1**: Setup FSD structure, copy widget code, package.json
- **Day 2**: MobX store, API client, transformer
- **Day 3**: Test, refine, document integration steps

**Total**: 3 days

---

**Priority**: High (for Opus review)
**Complexity**: Medium (mostly copying + adapter layer)
**Deliverable**: Working demo on port 5174 matching MyTKO stack exactly
