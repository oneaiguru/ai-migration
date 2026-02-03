# TASK-06: UI Horizon Selector and Cutoff Wiring

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
Add horizon selector UI and wire the existing cutoff date picker to the API.

## File to Modify
`projects/mytko-forecast-demo/src/pages/ForecastPage.tsx`

## Current State
- Line 49: `dataCutoff` state exists but is display-only
- Line 311: `cutoffDisplay` computed but not sent to API
- Line 394: DatePicker for cutoff exists

## Changes Needed

### 1. Add horizon selector (Segmented or Select)

```tsx
// Add import
import { Segmented } from 'antd';

// Add state (around line 50)
const [horizonDays, setHorizonDays] = useState<number>(7);
const [customHorizon, setCustomHorizon] = useState<number>(30);

// Add horizon options constant
const HORIZON_OPTIONS = [
  { label: '7 дней', value: 7 },
  { label: '30 дней', value: 30 },
  { label: '90 дней', value: 90 },
  { label: 'Другой', value: -1 },  // -1 = custom
];
```

### 2. Render horizon selector (after cutoff picker, ~line 396)

```tsx
<Col span={6}>
  <Form.Item label="Горизонт прогноза">
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Segmented
        options={HORIZON_OPTIONS}
        value={horizonDays === -1 || ![7, 30, 90].includes(horizonDays) ? -1 : horizonDays}
        onChange={(val) => {
          const v = val as number;
          if (v === -1) {
            setHorizonDays(customHorizon);
          } else {
            setHorizonDays(v);
          }
        }}
      />
      {(horizonDays === -1 || ![7, 30, 90].includes(horizonDays)) && (
        <InputNumber
          min={1}
          max={365}
          value={horizonDays > 0 ? horizonDays : customHorizon}
          onChange={(val) => {
            const v = val || 7;
            setCustomHorizon(v);
            setHorizonDays(v);
          }}
          addonAfter="дней"
          style={{ width: '100%' }}
        />
      )}
    </Space>
  </Form.Item>
</Col>
```

### 3. Wire cutoff to store and API call

```tsx
// Modify handleSubmit or create new handler
const handleSubmit = () => {
  // Update store with cutoff and horizon
  if (dataCutoff) {
    store.setCutoffDate(dataCutoff.format('YYYY-MM-DD'));
    store.setHorizonDays(horizonDays);
    store.setRollingMode(true);
  } else {
    store.setRollingMode(false);
  }

  store.setDateRange(
    dateRange[0].format('YYYY-MM-DD'),
    dateRange[1].format('YYYY-MM-DD')
  );
  store.load();
};
```

### 4. Add max date constraint to cutoff picker

```tsx
<DatePicker
  value={dataCutoff ?? historyMeta.overallLastServiceDate}
  onChange={(value) => setDataCutoff(value ?? null)}
  disabledDate={(current) => current && current.isAfter(dayjs('2025-05-31'))}
  placeholder="До 31.05.2025"
/>
```

### 5. Show hint about rolling mode

```tsx
{dataCutoff && (
  <Alert
    type="info"
    message={`Прогноз будет построен на ${horizonDays} дней от ${dataCutoff.format('DD.MM.YYYY')}`}
    style={{ marginTop: 8 }}
  />
)}
```

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Ручной выбор site_id                                           │
├─────────────────────────────────────────────────────────────────┤
│  site_id: [Select ▼]     Диапазон: [2025-03-01] — [2025-03-31]  │
│  Объём ТС: [22] м³       [Обновить прогноз]                     │
├─────────────────────────────────────────────────────────────────┤
│  Срез данных: [2025-03-15]    Горизонт: [7д] [30д] [90д] [___]  │
│  ℹ️ Прогноз будет построен на 7 дней от 15.03.2025              │
└─────────────────────────────────────────────────────────────────┘
```

## Acceptance Criteria
- [ ] Horizon selector renders with 7/30/90/custom options
- [ ] Custom horizon allows 1-365 input
- [ ] Cutoff picker has max date 2025-05-31
- [ ] Submit sends cutoff + horizon to store
- [ ] Info message shows when cutoff is set

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
