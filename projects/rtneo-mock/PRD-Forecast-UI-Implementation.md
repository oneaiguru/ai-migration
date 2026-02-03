# PRD: Container Forecast UI Implementation
## Прогноз объемов на КП (Container Volume Forecasting)

**Version:** 1.0  
**Date:** November 20, 2024  
**Status:** Ready for Implementation  
**Target:** MyTKO Waste Management System

---

## 📋 Executive Summary

Implement the "История и прогноз объемов" (History & Forecast Volumes) dialog component that visualizes historical container accumulation data and forecasts future volumes. This feature is defined in the specification document "Прогноз_объемов_на_КП.pdf" and should match the exact visual design and functionality shown in the PDF mockups.

### Success Criteria
- ✅ Dialog matches PDF mockup exactly (colors, layout, spacing)
- ✅ Shows blue bars (historical), green bars (forecast), red dots (collections)
- ✅ Daily/Weekly/Monthly view toggle works correctly
- ✅ Tooltips show accurate data on hover
- ✅ Integrates with existing site gallery and API endpoints
- ✅ Uses Ant Design components throughout
- ✅ Follows existing codebase patterns (MobX + SCSS modules)

---

## 🎯 Feature Requirements

### 1. Main Dialog Component: `ContainerHistoryDialog`

**Location:** `src/components/ContainerHistoryDialog/`

**Visual Specs (from PDF):**
```
Width: 800px
Height: Auto (min 500px)
Title: "Объем накопления на КП"
Background: White (#ffffff)
Modal type: Ant Design Modal with footer buttons
```

**Component Structure:**
```tsx
<Modal
  title="Объем накопления на КП"
  width={800}
  open={visible}
  onCancel={onClose}
  footer={[
    <Button key="cancel">Отменить</Button>,
    <Button key="save" type="primary">Сохранить</Button>
  ]}
>
  <Toolbar />
  <ChartArea />
  <SummaryStats />
</Modal>
```

---

### 2. Toolbar Component

**Elements:**
1. **View Toggle (Radio.Group)**
   - Options: "За сутки" | "Неделю" | "Месяц"
   - Default: "За сутки"
   - Style: `buttonStyle="solid"`
   - Action: Re-aggregate chart data

2. **Date Range Picker (DatePicker.RangePicker)**
   - Format: "DD.MM.YYYY"
   - Default: Current selection from site gallery
   - Action: Fetch new forecast data on change

**Layout:**
```tsx
<Row gutter={16} style={{ marginBottom: 24 }}>
  <Col>
    <Radio.Group value={view} onChange={handleViewChange}>
      <Radio.Button value="daily">За сутки</Radio.Button>
      <Radio.Button value="weekly">Неделю</Radio.Button>
      <Radio.Button value="monthly">Месяц</Radio.Button>
    </Radio.Group>
  </Col>
  <Col flex={1}>
    <DatePicker.RangePicker 
      value={dateRange}
      onChange={handleDateChange}
      format="DD.MM.YYYY"
    />
  </Col>
</Row>
```

---

### 3. Chart Area Component

**Container Specs:**
```css
background: #fafafa
padding: 24px
border-radius: 8px
min-height: 320px
position: relative
```

**Chart Elements:**

#### A. Historical Bars (Blue)
```
Color: #1890ff
Hover: #40a9ff
Width: 24px (daily), 48px (weekly), 72px (monthly)
Border-radius: 4px 4px 0 0
Height: accumulation_value × 30px (scale factor)
```

#### B. Forecast Bars (Green)
```
Color: #52c41a
Hover: #73d13d
Width: Same as historical
Border-radius: 4px 4px 0 0
Height: Same calculation
```

#### C. Collection Dots (Red Circles)
```
Color: #ff4d4f
Size: 12px × 12px
Border: 2px solid white
Box-shadow: 0 2px 4px rgba(0,0,0,0.2)
Position: Above the bar for collection day
```

#### D. Legend (Top-Right)
```
Position: absolute; top: 16px; right: 16px;
Background: white
Padding: 8px 12px
Border-radius: 4px
Box-shadow: 0 2px 8px rgba(0,0,0,0.1)

Items:
- Blue square + "Факт"
- Green square + "Прогноз"  
- Red circle + "Вывоз"
```

**Tooltip Content:**

1. **Historical Bar Hover:**
   ```
   Format: "ДД.ММ.ГГГГ: Факт X м³"
   Example: "05.11.2024: Факт 2.3 м³"
   ```

2. **Forecast Bar Hover:**
   ```
   Format: "ДД.ММ.ГГГГ: Прогноз X м³"
   Example: "12.11.2024: Прогноз 3.2 м³"
   ```

3. **Collection Dot Hover:**
   ```
   Format:
   "Вывоз ВТ 23 АПР. 2024
   Рейсов: 2
   Объем: 163.70 м³
   Вес: 10.04 т"
   ```

---

### 4. Summary Stats Component

**Layout:** Two cards side-by-side

**Card 1: Historical Summary**
```tsx
<Card size="small">
  <div className="label">
    Объем факт с {startDate} до {endDate}
  </div>
  <div className="value">
    {actualVolume} м³
  </div>
</Card>
```

**Card 2: Forecast Summary**
```tsx
<Card size="small">
  <div className="label">
    Объем прогноз с {forecastStart} до {forecastEnd}
  </div>
  <div className="value forecast">
    {forecastVolume} м³
  </div>
</Card>
```

**Styling:**
```scss
.label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.value {
  font-size: 24px;
  font-weight: 600;
  
  &.forecast {
    color: #52c41a;
  }
}
```

---

## 🔌 API Integration

### Endpoint 1: Forecast Data
```
GET /api/mytko/forecast

Query Parameters:
- site_id: string (required) - Container platform ID
- start_date: string (required) - ISO date format YYYY-MM-DD
- end_date: string (required) - ISO date format YYYY-MM-DD

Response:
{
  "site_id": "38127141",
  "historical": [
    {
      "date": "2024-11-01",
      "accumulation": 2.1,
      "collection": null
    },
    {
      "date": "2024-11-05",
      "accumulation": 1.8,
      "collection": 12.5,
      "collection_details": {
        "trips": 2,
        "weight": 10.04,
        "day_of_week": "ВТ"
      }
    }
  ],
  "forecast": [
    {
      "date": "2024-11-08",
      "accumulation": 2.6
    }
  ],
  "summary": {
    "actual_volume": 16.4,
    "forecast_volume": 19.4,
    "wape": 27.8
  }
}
```

### Endpoint 2: Site Accuracy
```
GET /api/mytko/site_accuracy

Query Parameters:
- site_id: string (required)

Response:
{
  "site_id": "38127141",
  "wape": 27.8,
  "last_updated": "2024-11-20T10:00:00Z"
}
```

---

## 📂 File Structure

```
src/
├── components/
│   └── ContainerHistoryDialog/
│       ├── index.tsx                    // Main dialog component
│       ├── ContainerHistoryDialog.tsx   // Container component
│       ├── Toolbar.tsx                  // View toggle + date picker
│       ├── ChartArea.tsx                // Chart container
│       ├── BarChart.tsx                 // Bar rendering logic
│       ├── CollectionDot.tsx            // Collection event dots
│       ├── Legend.tsx                   // Chart legend
│       ├── SummaryStats.tsx             // Bottom summary cards
│       ├── ContainerHistoryDialog.module.scss
│       └── types.ts                     // TypeScript interfaces
│
├── hooks/
│   └── useForecastData.ts               // Data fetching hook
│
├── stores/
│   └── forecastStore.ts                 // MobX store (if needed)
│
└── utils/
    └── chartHelpers.ts                  // Aggregation functions
```

---

## 💻 Implementation Steps

### Phase 1: Component Structure (Day 1)

**Task 1.1:** Create base components
```bash
# Create component directory
mkdir -p src/components/ContainerHistoryDialog

# Create component files
touch src/components/ContainerHistoryDialog/index.tsx
touch src/components/ContainerHistoryDialog/ContainerHistoryDialog.tsx
touch src/components/ContainerHistoryDialog/ContainerHistoryDialog.module.scss
touch src/components/ContainerHistoryDialog/types.ts
```

**Task 1.2:** Define TypeScript interfaces in `types.ts`
```typescript
export interface HistoricalDataPoint {
  date: string;
  accumulation: number;
  collection: number | null;
  collection_details?: {
    trips: number;
    weight: number;
    day_of_week: string;
  };
}

export interface ForecastDataPoint {
  date: string;
  accumulation: number;
}

export interface ChartData {
  siteId: string;
  dateRange: [string, string];
  historical: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
  summary: {
    actual_volume: number;
    forecast_volume: number;
    wape: number;
  };
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';
```

**Task 1.3:** Create main dialog component skeleton
```tsx
import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import styles from './ContainerHistoryDialog.module.scss';
import type { ChartData, ViewMode } from './types';

interface Props {
  visible: boolean;
  siteId: string;
  onClose: () => void;
}

export const ContainerHistoryDialog: React.FC<Props> = ({
  visible,
  siteId,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  
  return (
    <Modal
      title="Объем накопления на КП"
      open={visible}
      onCancel={onClose}
      width={800}
      className={styles.dialog}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Отменить
        </Button>,
        <Button key="save" type="primary">
          Сохранить
        </Button>
      ]}
    >
      {/* Content will go here */}
    </Modal>
  );
};
```

### Phase 2: Data Integration (Day 2)

**Task 2.1:** Create data fetching hook
```typescript
// hooks/useForecastData.ts
import { useState, useEffect } from 'react';
import type { ChartData } from '@/components/ContainerHistoryDialog/types';

export const useForecastData = (
  siteId: string,
  startDate: string,
  endDate: string
) => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/mytko/forecast?site_id=${siteId}&start_date=${startDate}&end_date=${endDate}`
        );
        const json = await response.json();
        setData({
          siteId,
          dateRange: [startDate, endDate],
          ...json
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (siteId && startDate && endDate) {
      fetchData();
    }
  }, [siteId, startDate, endDate]);

  return { data, loading, error };
};
```

**Task 2.2:** Create aggregation utilities
```typescript
// utils/chartHelpers.ts
import type { HistoricalDataPoint, ForecastDataPoint } from '@/components/ContainerHistoryDialog/types';

export const aggregateByWeek = (
  data: (HistoricalDataPoint | ForecastDataPoint)[]
) => {
  // Group by week and sum accumulation
  const weeks = new Map<string, number>();
  
  data.forEach(point => {
    const date = new Date(point.date);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    weeks.set(weekKey, (weeks.get(weekKey) || 0) + point.accumulation);
  });
  
  return Array.from(weeks.entries()).map(([date, accumulation]) => ({
    date,
    accumulation
  }));
};

export const aggregateByMonth = (
  data: (HistoricalDataPoint | ForecastDataPoint)[]
) => {
  // Group by month and sum accumulation
  const months = new Map<string, number>();
  
  data.forEach(point => {
    const date = new Date(point.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    months.set(monthKey, (months.get(monthKey) || 0) + point.accumulation);
  });
  
  return Array.from(months.entries()).map(([date, accumulation]) => ({
    date: `${date}-01`,
    accumulation
  }));
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.setDate(diff));
};
```

### Phase 3: Chart Components (Day 3-4)

**Task 3.1:** Create ChartArea component
```tsx
// components/ContainerHistoryDialog/ChartArea.tsx
import React from 'react';
import { BarChart } from './BarChart';
import { Legend } from './Legend';
import styles from './ContainerHistoryDialog.module.scss';
import type { ChartData, ViewMode } from './types';

interface Props {
  data: ChartData;
  viewMode: ViewMode;
}

export const ChartArea: React.FC<Props> = ({ data, viewMode }) => {
  return (
    <div className={styles.chartContainer}>
      <div className={styles.yAxisLabel}>м³</div>
      <BarChart 
        historical={data.historical}
        forecast={data.forecast}
        viewMode={viewMode}
      />
      <Legend />
    </div>
  );
};
```

**Task 3.2:** Create BarChart component
```tsx
// components/ContainerHistoryDialog/BarChart.tsx
import React from 'react';
import { Tooltip } from 'antd';
import { CollectionDot } from './CollectionDot';
import styles from './ContainerHistoryDialog.module.scss';
import type { HistoricalDataPoint, ForecastDataPoint, ViewMode } from './types';

interface Props {
  historical: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
  viewMode: ViewMode;
}

export const BarChart: React.FC<Props> = ({ historical, forecast, viewMode }) => {
  const getBarWidth = () => {
    switch (viewMode) {
      case 'daily': return 24;
      case 'weekly': return 48;
      case 'monthly': return 72;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  const barWidth = getBarWidth();

  return (
    <div className={styles.barChart}>
      {/* Historical bars */}
      {historical.map((point, idx) => (
        <div key={`hist-${idx}`} className={styles.barContainer}>
          {point.collection && (
            <CollectionDot data={point.collection_details} />
          )}
          
          <Tooltip title={`${point.date}: Факт ${point.accumulation} м³`}>
            <div
              className={`${styles.bar} ${styles.historical}`}
              style={{
                width: barWidth,
                height: `${point.accumulation * 30}px`
              }}
            />
          </Tooltip>
          
          <div className={styles.dateLabel}>
            {formatDate(point.date)}
          </div>
        </div>
      ))}

      {/* Forecast bars */}
      {forecast.map((point, idx) => (
        <div key={`fore-${idx}`} className={styles.barContainer}>
          <Tooltip title={`${point.date}: Прогноз ${point.accumulation} м³`}>
            <div
              className={`${styles.bar} ${styles.forecast}`}
              style={{
                width: barWidth,
                height: `${point.accumulation * 30}px`
              }}
            />
          </Tooltip>
          
          <div className={`${styles.dateLabel} ${styles.forecast}`}>
            {formatDate(point.date)}
          </div>
        </div>
      ))}
    </div>
  );
};
```

**Task 3.3:** Create CollectionDot component
```tsx
// components/ContainerHistoryDialog/CollectionDot.tsx
import React from 'react';
import { Tooltip } from 'antd';
import styles from './ContainerHistoryDialog.module.scss';

interface CollectionDetails {
  trips: number;
  weight: number;
  day_of_week: string;
}

interface Props {
  data?: CollectionDetails;
}

export const CollectionDot: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const tooltipContent = (
    <div>
      <div>Вывоз {data.day_of_week}</div>
      <div>Рейсов: {data.trips}</div>
      <div>Вес: {data.weight} т</div>
    </div>
  );

  return (
    <Tooltip title={tooltipContent}>
      <div className={styles.collectionDot} />
    </Tooltip>
  );
};
```

### Phase 4: Styling (Day 5)

**Task 4.1:** Create complete SCSS module

See the SCSS example provided in the specification document above.

### Phase 5: Integration (Day 6)

**Task 5.1:** Add to site gallery
```tsx
// In your site gallery component
import { ContainerHistoryDialog } from '@/components/ContainerHistoryDialog';

const [historyDialogVisible, setHistoryDialogVisible] = useState(false);
const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

// Add button to open dialog
<Button onClick={() => {
  setSelectedSiteId(site.id);
  setHistoryDialogVisible(true);
}}>
  История и прогноз
</Button>

// Render dialog
<ContainerHistoryDialog
  visible={historyDialogVisible}
  siteId={selectedSiteId || ''}
  onClose={() => setHistoryDialogVisible(false)}
/>
```

**Task 5.2:** Add to KP registry menu
```tsx
// In KP registry context menu
{
  label: 'История и прогноз объемов',
  onClick: () => openHistoryDialog(kpId)
}
```

---

## ✅ Testing Checklist

### Visual Tests
- [ ] Dialog matches PDF mockup exactly
- [ ] Colors match specification (#1890ff, #52c41a, #ff4d4f)
- [ ] Bar widths correct for each view mode
- [ ] Spacing and padding matches design
- [ ] Legend positioned correctly
- [ ] Summary stats display properly

### Functional Tests
- [ ] View toggle switches between daily/weekly/monthly
- [ ] Date range picker updates chart data
- [ ] Tooltips show correct information
- [ ] Collection dots appear on correct dates
- [ ] Summary calculations are accurate
- [ ] Loading states work properly
- [ ] Error handling displays messages

### Integration Tests
- [ ] Opens from site gallery
- [ ] Opens from KP registry menu
- [ ] Syncs with selected site
- [ ] API calls use correct parameters
- [ ] Data caching works (if implemented)

### Data Tests
- [ ] Test with site 38111698 (fill 1-83%, WAPE 5.5%)
- [ ] Test with site 38116709 (fill 3-100%, WAPE 3.5%)
- [ ] Test with site 38127141 (fill 2-100%, WAPE 28%)
- [ ] Verify weekly aggregation
- [ ] Verify monthly aggregation

---

## 🚀 Deployment

1. Merge feature branch to development
2. Test on staging environment
3. Verify API endpoints are working
4. Deploy to production
5. Monitor error logs for first 24 hours
6. Gather user feedback

---

## 📝 Notes for Coding Agent

### Key Principles
1. **Match the PDF exactly** - colors, spacing, layout must be pixel-perfect
2. **Use Ant Design consistently** - leverage existing components
3. **Follow existing patterns** - look at other dialogs in the codebase
4. **MobX for state** - if complex state management needed
5. **SCSS modules** - maintain the existing styling approach
6. **TypeScript strict** - no `any` types

### Code Quality
- Write tests for utility functions
- Document complex logic with comments
- Use meaningful variable names
- Extract reusable logic into hooks
- Keep components small and focused

### Performance
- Memoize expensive calculations
- Use React.memo for chart components
- Debounce date range changes
- Cache API responses

---

## 📚 References

- PDF Specification: "Прогноз_объемов_на_КП.pdf"
- Ant Design Docs: https://ant.design/components/overview
- Current UI Screenshots: See uploaded images
- API Documentation: See API contract section above

---

**Document Owner:** Product Team  
**Technical Lead:** Development Team  
**Questions:** Contact via project channel
