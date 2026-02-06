# TASK-07: Chart Visual Split at Cutoff

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 20min

## Goal
Draw vertical line at cutoff date in chart; color bars blue (fact) vs green (forecast).

## File
`projects/mytko-forecast-demo/src/components/ContainerHistoryDialog.tsx`

## Changes

1. Add `cutoffDate` prop to component
2. Draw vertical ReferenceLine at cutoff
3. Color bars based on date vs cutoff

```tsx
// Add prop
interface ContainerHistoryDialogProps {
  // ... existing
  cutoffDate?: Dayjs;  // NEW
}

// In chart, add ReferenceLine
import { ReferenceLine } from 'recharts';

// Inside ComposedChart:
{cutoffDate && (
  <ReferenceLine
    x={cutoffDate.format('YYYY-MM-DD')}
    stroke="#ff4d4f"
    strokeDasharray="5 5"
    label={{ value: 'Срез', position: 'top' }}
  />
)}

// Color bars conditionally
<Bar
  dataKey="actual"
  fill="#1890ff"
  name="Факт"
/>
<Bar
  dataKey="forecast"
  fill="#52c41a"
  name="Прогноз"
/>
```

## Acceptance Criteria
- [ ] Vertical dashed line at cutoff date
- [ ] Fact bars blue, forecast bars green
- [ ] Label "Срез" on the line

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
