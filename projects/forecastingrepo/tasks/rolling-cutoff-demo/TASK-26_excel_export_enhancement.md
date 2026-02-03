# TASK-26: Excel Export Enhancement

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 25min

## Goal
Export forecast data as formatted .xlsx (not just CSV) with multiple sheets and embedded context.

## Current State
TASK-09 exports download endpoint as CSV. Need enhanced Excel with:
- Multiple sheets (summary, daily, metrics)
- Formatting (headers, number formats)
- No formulas (for security)

## Excel Structure

```
forecast.xlsx
├─ Sheet "Summary"
│  ├─ Cutoff date: 2025-03-15
│  ├─ Horizon: 7 days
│  ├─ Total sites: 22,000
│  ├─ Total forecast: 123,456.78 m³
│  ├─ Coverage: 95.2%
│  └─ [blank rows]
├─ Sheet "Daily Data"
│  ├─ Headers: Date | Site ID | Address | District | Actual | Forecast | Error % | Fill %
│  └─ [rows of data...]
├─ Sheet "Metrics"
│  ├─ District | Site Count | Total (m³) | WAPE | Coverage %
│  └─ [rows per district...]
└─ Sheet "Legend"
   ├─ Column definitions
   └─ Notes about accuracy
```

## Code Changes

### 1. Add Excel export function

```typescript
// src/utils/excelExport.ts

import XLSX from 'xlsx';

export interface ExcelExportRequest {
  cutoffDate: string;
  horizonDays: number;
  siteCount: number;
  totalForecast: number;
  coverage: number;
  wape?: number;
  data: Array<{
    date: string;
    site_id: string;
    address?: string;
    district?: string;
    actual_m3?: number;
    forecast_m3: number;
    error_pct?: number;
    fill_pct: number;
  }>;
  byDistrict?: Array<{
    district: string;
    site_count: number;
    total_forecast: number;
    wape?: number;
  }>;
}

export function exportToExcel(
  request: ExcelExportRequest,
  filename: string,
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['Параметры прогноза'],
    ['Дата среза', request.cutoffDate],
    ['Горизонт (дней)', request.horizonDays],
    ['Всего площадок', request.siteCount],
    ['Прогноз (м³)', request.totalForecast.toFixed(2)],
    ['Охват', request.coverage.toFixed(1) + '%'],
    ['WAPE', request.wape ? (request.wape * 100).toFixed(2) + '%' : 'N/A'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['A1'].s = { bold: true, sz: 14 };
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Sheet 2: Daily Data
  const dailyHeaders = [
    'Дата',
    'ID площадки',
    'Адрес',
    'Район',
    'Факт (м³)',
    'Прогноз (м³)',
    'Ошибка %',
    'Заполн. %',
  ];
  const dailyRows = request.data.map((d) => [
    d.date,
    d.site_id,
    d.address || '',
    d.district || '',
    d.actual_m3 ? d.actual_m3.toFixed(2) : '',
    d.forecast_m3.toFixed(2),
    d.error_pct ? d.error_pct.toFixed(1) : '',
    (d.fill_pct * 100).toFixed(0),
  ]);

  const wsDaily = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows]);
  wsDaily['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 30 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Data');

  // Sheet 3: By District (if available)
  if (request.byDistrict && request.byDistrict.length > 0) {
    const districtHeaders = ['Район', 'Площадок', 'Прогноз (м³)', 'WAPE'];
    const districtRows = request.byDistrict.map((d) => [
      d.district,
      d.site_count,
      d.total_forecast.toFixed(2),
      d.wape ? (d.wape * 100).toFixed(2) + '%' : 'N/A',
    ]);

    const wsDistrict = XLSX.utils.aoa_to_sheet([districtHeaders, ...districtRows]);
    XLSX.utils.book_append_sheet(wb, wsDistrict, 'By District');
  }

  // Sheet 4: Legend
  const legendData = [
    ['Определения колонок'],
    ['Дата', 'Date of forecast period'],
    ['ID площадки', 'Container site identifier'],
    ['Адрес', 'Physical address'],
    ['Район', 'Administrative district'],
    ['Факт', 'Actual collected weight (from historical data up to cutoff)'],
    ['Прогноз', 'Predicted weight for the date'],
    ['Ошибка %', 'Absolute percentage error'],
    ['Заполн.', 'Predicted fill percentage (0-1)'],
    [],
    ['Примечания'],
    ['WAPE', 'Weighted Absolute Percentage Error'],
    ['Охват', 'Percentage of rows with actual data available'],
  ];

  const wsLegend = XLSX.utils.aoa_to_sheet(legendData);
  XLSX.utils.book_append_sheet(wb, wsLegend, 'Legend');

  // Write file
  XLSX.writeFile(wb, filename);
}
```

### 2. Add to API response

```typescript
// In ForecastPage or API client

const handleExportExcel = async () => {
  const summary = store.rollingSummary;
  const coverage =
    summary && 'accuracy_coverage_pct' in summary
      ? (summary.accuracy_coverage_pct ?? 0)
      : 0;
  const wape =
    summary && 'accuracy_wape' in summary
      ? summary.accuracy_wape ?? undefined
      : undefined;

  const excelRequest = {
    cutoffDate: store.cutoffDate || '',
    horizonDays: store.horizonDays,
    siteCount: summary?.site_count || 0,
    totalForecast: summary?.total_forecast_m3 || 0,
    coverage,
    wape,
    data: store.allSitesData.map((d) => ({
      date: d.date,
      site_id: d.site_id,
      address: d.address,
      district: d.district,
      actual_m3: d.actual_m3,
      forecast_m3: d.pred_volume_m3 / 1000,
      error_pct: d.error_pct,
      fill_pct: d.fill_pct,
    })),
    // Optional: byDistrict from TASK-14 aggregation endpoint.
  };

  exportToExcel(excelRequest, 'forecast_export.xlsx');
};
```

## Dependencies

Add to `package.json`:
```json
{
  "xlsx": "^0.18.5"
}
```

## Tests

```typescript
// Manual testing:
// 1. Load all-sites forecast results
// 2. Click "Скачать Excel" button
// 3. Open downloaded .xlsx in Excel/Sheets
// 4. Verify:
//    - Sheet "Summary" has metadata
//    - Sheet "Daily Data" has all rows
//    - Column widths are readable
//    - Numbers are formatted (not scientific notation)
//    - Headers are bold
// 5. Test with filtered results (district, search)
```

## Acceptance Criteria
- [ ] .xlsx file exports successfully
- [ ] Has 4 sheets (Summary, Daily, District, Legend)
- [ ] Summary sheet has metadata
- [ ] Daily Data sheet has all rows and columns
- [ ] Numbers formatted as decimals (not scientific)
- [ ] Column widths readable
- [ ] Filename includes cutoff date: `forecast_2025-03-15.xlsx`
- [ ] Works with and without accuracy data

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-26: Excel export enhancement"
