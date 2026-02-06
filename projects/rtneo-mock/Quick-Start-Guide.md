# Quick Start Guide: Forecast Dialog Implementation

**Time to MVP:** 2-3 days  
**Complexity:** Medium  
**Stack:** React + TypeScript + Ant Design + SCSS Modules

---

## 🎯 Goal

Create a modal dialog showing blue bars (history), green bars (forecast), and red dots (collections) matching the PDF specification exactly.

---

## Jury Demo Checklist

- Show **fact vs forecast** bars side-by-side.
- Point out **red collection dots** (вывозы).
- Explain **data cutoff**: forecasts are built using data known up to the selected date.
- Export CSV for Excel verification (if demo UI is wired).

---

## 📦 What You're Building

```
┌─────────────────────────────────────────────────────────┐
│ Объем накопления на КП                              × │
├─────────────────────────────────────────────────────────┤
│ [За сутки][Неделю][Месяц]  [01.11.2024 → 25.11.2024]   │
│                                                         │
│              ● = Collection event (red)                 │
│            ┌───┐                                        │
│            │ █ │ = Historical (blue)                   │
│            └───┘                                        │
│                  ┌───┐                                  │
│                  │ █ │ = Forecast (green)              │
│                  └───┘                                  │
│ [Blue bars...]  [Green bars...]                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Объем факт: 16.4 м³  │  Объем прогноз: 19.4 м³         │
├─────────────────────────────────────────────────────────┤
│                           [Отменить] [Сохранить]        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ 30-Second Setup

```bash
# Create component folder
mkdir -p src/components/ContainerHistoryDialog

# Create files
cd src/components/ContainerHistoryDialog
touch index.tsx
touch ContainerHistoryDialog.tsx
touch ContainerHistoryDialog.module.scss
touch types.ts
```

---

## 🎨 Colors (MEMORIZE THESE)

```typescript
const COLORS = {
  historical: '#1890ff',      // Blue bars (past data)
  historicalHover: '#40a9ff', // Lighter blue on hover
  forecast: '#52c41a',        // Green bars (future data)
  forecastHover: '#73d13d',   // Lighter green on hover
  collection: '#ff4d4f',      // Red dots (pickup events)
  background: '#fafafa',      // Chart background
};
```

**CRITICAL:** Do NOT use any other colors. These are exact hex values from PDF.

---

## 📝 Minimal Working Code (30 minutes)

### Step 1: Types (types.ts)
```typescript
export interface HistoricalDataPoint {
  date: string;
  accumulation: number;
  collection: number | null;
}

export interface ForecastDataPoint {
  date: string;
  accumulation: number;
}

export interface ChartData {
  historical: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
}
```

### Step 2: Component (ContainerHistoryDialog.tsx)
```typescript
import React, { useState } from 'react';
import { Modal, Radio, DatePicker, Button, Row, Col, Tooltip } from 'antd';
import styles from './ContainerHistoryDialog.module.scss';

interface Props {
  visible: boolean;
  siteId: string;
  onClose: () => void;
}

export const ContainerHistoryDialog: React.FC<Props> = ({ visible, siteId, onClose }) => {
  const [view, setView] = useState('daily');

  // TODO: Replace with real API data
  const mockData = {
    historical: [
      { date: '2024-11-01', accumulation: 2.1, collection: null },
      { date: '2024-11-02', accumulation: 2.3, collection: 12.5 },
    ],
    forecast: [
      { date: '2024-11-08', accumulation: 2.6 },
      { date: '2024-11-09', accumulation: 2.8 },
    ],
  };

  return (
    <Modal
      title="Объем накопления на КП"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>Отменить</Button>,
        <Button key="save" type="primary">Сохранить</Button>,
      ]}
    >
      {/* Toolbar */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <Radio.Group value={view} onChange={(e) => setView(e.target.value)} buttonStyle="solid">
            <Radio.Button value="daily">За сутки</Radio.Button>
            <Radio.Button value="weekly">Неделю</Radio.Button>
            <Radio.Button value="monthly">Месяц</Radio.Button>
          </Radio.Group>
        </Col>
        <Col flex={1}>
          <DatePicker.RangePicker format="DD.MM.YYYY" />
        </Col>
      </Row>

      {/* Chart */}
      <div className={styles.chartContainer}>
        <div className={styles.barChart}>
          {mockData.historical.map((point, i) => (
            <Tooltip key={i} title={`${point.date}: Факт ${point.accumulation} м³`}>
              <div className={styles.barHistorical} style={{ height: `${point.accumulation * 30}px` }} />
            </Tooltip>
          ))}
          {mockData.forecast.map((point, i) => (
            <Tooltip key={i} title={`${point.date}: Прогноз ${point.accumulation} м³`}>
              <div className={styles.barForecast} style={{ height: `${point.accumulation * 30}px` }} />
            </Tooltip>
          ))}
        </div>
      </div>
    </Modal>
  );
};
```

### Step 3: Styles (ContainerHistoryDialog.module.scss)
```scss
.chartContainer {
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  min-height: 320px;
}

.barChart {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 280px;
  gap: 8px;
}

.barHistorical {
  width: 24px;
  background: #1890ff;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #40a9ff;
  }
}

.barForecast {
  width: 24px;
  background: #52c41a;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #73d13d;
  }
}
```

### Step 4: Export (index.tsx)
```typescript
export { ContainerHistoryDialog } from './ContainerHistoryDialog';
```

---

## 🔌 Connect to Existing UI

In your site gallery component:

```typescript
import { ContainerHistoryDialog } from '@/components/ContainerHistoryDialog';

// Add state
const [dialogVisible, setDialogVisible] = useState(false);
const [selectedSite, setSelectedSite] = useState('');

// Add button to each site card
<Button onClick={() => {
  setSelectedSite(site.id);
  setDialogVisible(true);
}}>
  История и прогноз
</Button>

// Render dialog
<ContainerHistoryDialog
  visible={dialogVisible}
  siteId={selectedSite}
  onClose={() => setDialogVisible(false)}
/>
```

---

## 🚀 Next Steps After MVP

### Day 2: Real Data
```typescript
// Create hook: hooks/useForecastData.ts
export const useForecastData = (siteId: string, startDate: string, endDate: string) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(`/api/mytko/forecast?site_id=${siteId}&start_date=${startDate}&end_date=${endDate}`)
      .then(r => r.json())
      .then(setData);
  }, [siteId, startDate, endDate]);
  
  return data;
};

// Use in component
const data = useForecastData(siteId, '2024-11-01', '2024-11-30');
```

### Day 3: Collection Dots
```typescript
// Add above each bar where collection occurred
{point.collection && (
  <div className={styles.collectionDot} />
)}
```

```scss
.collectionDot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff4d4f;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 4px;
}
```

### Day 4: Legend & Stats
```typescript
// Add legend component
const Legend = () => (
  <div className={styles.legend}>
    <div><span className={styles.legendBlue} /> Факт</div>
    <div><span className={styles.legendGreen} /> Прогноз</div>
    <div><span className={styles.legendRed} /> Вывоз</div>
  </div>
);

// Add summary cards at bottom
<Row gutter={16} style={{ marginTop: 16 }}>
  <Col span={12}>
    <Card size="small">
      <div>Объем факт с {start} до {end}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{actualVolume} м³</div>
    </Card>
  </Col>
  <Col span={12}>
    <Card size="small">
      <div>Объем прогноз с {start} до {end}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{forecastVolume} м³</div>
    </Card>
  </Col>
</Row>
```

---

## ✅ MVP Checklist (Ready to Demo)

- [ ] Modal opens at 800px width
- [ ] Title is "Объем накопления на КП"
- [ ] View toggle shows (За сутки/Неделю/Месяц)
- [ ] Date range picker shows
- [ ] Blue bars render for historical data
- [ ] Green bars render for forecast data
- [ ] Bars are 24px wide with 8px gaps
- [ ] Chart background is #fafafa
- [ ] Tooltips show on bar hover
- [ ] Footer has Отменить + Сохранить buttons
- [ ] Opens from site gallery button

**Time to complete MVP:** 2-3 hours if focused

---

## 🎯 Visual Verification

Take a screenshot and check:

1. **Colors:** Blue (#1890ff), Green (#52c41a) - NOT Material UI colors
2. **Layout:** Chart centered, bars aligned at bottom
3. **Spacing:** 8px gap between bars, 24px padding around chart
4. **Typography:** Ant Design default fonts
5. **Interactions:** Hover changes color, tooltip appears

Compare against PDF page 2 screenshot.

---

## 🐛 Common Issues

### Issue: Bars too thin/thick
```typescript
// Fix: Check bar width
width: 24px // daily (correct)
width: 48px // weekly
width: 72px // monthly
```

### Issue: Wrong colors
```typescript
// Fix: Use exact hex codes
#1890ff // historical (NOT #1976d2)
#52c41a // forecast (NOT #4caf50)
```

### Issue: Bars not aligned at bottom
```scss
// Fix: Use flexbox alignment
.barChart {
  display: flex;
  align-items: flex-end; // ← This is critical
}
```

### Issue: Tooltip not showing
```typescript
// Fix: Wrap bar in Tooltip component
<Tooltip title="...">
  <div className={styles.bar} />
</Tooltip>
```

---

## 📚 Resources

- **PDF Spec:** Reference document with exact design
- **Ant Design:** https://ant.design/components/modal
- **PRD Document:** Full implementation details
- **Comparison Guide:** Before/after screenshots

---

## 🎓 Pro Tips

1. **Start simple:** Get bars rendering first, add features incrementally
2. **Use mock data:** Don't wait for API, use hardcoded data initially
3. **Check colors:** Compare hex codes in browser DevTools
4. **Test tooltips:** Hover should be smooth, no flicker
5. **Watch spacing:** 8px gaps make a huge visual difference

---

## 💬 Quick Q&A

**Q: Can I use a charting library?**  
A: No. Hand-code the bars using flexbox. More control over exact layout.

**Q: Should I add animations?**  
A: Phase 2. Get static layout perfect first.

**Q: What about mobile?**  
A: Phase 3. Desktop first, 800px modal is desktop-focused.

**Q: Can I change the colors slightly?**  
A: Absolutely not. PDF colors are final.

---

## 🚦 You're Ready When...

You can:
1. ✅ Open the dialog from site gallery
2. ✅ See blue and green bars
3. ✅ Hover and see tooltips
4. ✅ Toggle view mode (even if data doesn't change yet)
5. ✅ Close the dialog

**Then take a screenshot and send for review!**

---

**Good luck! You've got this. 💪**

Start with the 30-minute minimal code above, get it rendering, then iterate from there.
