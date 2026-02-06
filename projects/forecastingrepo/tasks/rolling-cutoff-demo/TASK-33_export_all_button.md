# TASK-33: Export All Button in UI

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Add "Export Excel" button to all-sites table that exports current filtered data.

## Current State
- ForecastPage.tsx line 695 has single-site CSV export
- All-sites table (lines 629-689) has NO export button

## Code Changes

### 1. File: src/pages/ForecastPage.tsx

Add import at top (around line 3):
```typescript
import { FileExcelOutlined } from '@ant-design/icons';
```

Add import (around line 35):
```typescript
import { exportToExcel } from '@/utils/excelExport';
```

Add handler after handleTableExport (around line 416):
```typescript
const handleExportAllSites = () => {
  if (!store.rollingSummary || store.allSitesData.length === 0) {
    return;
  }

  const summary = store.rollingSummary;
  const coverage =
    summary && 'accuracy_coverage_pct' in summary
      ? (summary.accuracy_coverage_pct ?? 0)
      : 0;
  const wape =
    summary && 'accuracy_wape' in summary
      ? summary.accuracy_wape ?? undefined
      : undefined;

  const request = {
    cutoffDate: store.cutoffDate ?? '',
    horizonDays: store.horizonDays,
    siteCount: summary.site_count,
    totalForecast: summary.total_forecast_m3,
    coverage,
    wape,
    data: store.allSitesData.map(row => ({
      date: row.date,
      site_id: row.site_id,
      forecast_m3: row.pred_volume_m3 / 1000,
      fill_pct: row.fill_pct,
      actual_m3: row.actual_m3,
      error_pct: row.error_pct,
    })),
  };

  const filename = `forecast_all_${store.cutoffDate ?? 'unknown'}_${store.horizonDays}d.xlsx`;
  exportToExcel(request, filename);
};
```

**Note**: `RollingForecastAllResponse` includes `accuracy_coverage_pct` and `accuracy_wape`. Use `in` checks or a type guard before reading them. Use nullish coalescing (`??`) to avoid coercing 0 to defaults.

Modify the all-sites Card extra prop (around line 633-636):
```typescript
extra={
  <Space>
    {allSitesSummary && <Typography.Text type="secondary">{allSitesSummary}</Typography.Text>}
    <Button
      icon={<FileExcelOutlined />}
      onClick={handleExportAllSites}
      disabled={store.allSitesData.length === 0}
    >
      Excel
    </Button>
  </Space>
}
```

## Tests

Manual testing:
1. Open ForecastPage, select "Все площадки"
2. Set cutoff date and horizon
3. Click "Обновить прогноз"
4. Click "Excel" button in table header
5. Verify XLSX downloads with correct data

## Acceptance Criteria
- [ ] Button appears in all-sites table header
- [ ] Button shows Excel icon
- [ ] Button disabled when no data
- [ ] XLSX file downloads with filtered data
- [ ] File has Summary + Daily Data sheets

---

## On Completion

1. Test manually in browser
2. Update `/Users/m/ai/progress.md`: Change TASK-33 from 🔴 TODO to 🟢 DONE
3. Commit: "Implement TASK-33: Export all button in UI"
