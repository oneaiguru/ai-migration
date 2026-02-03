# TASK-24: Full Site Report PDF

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 40min

## Goal
Generate multi-page PDF reports for individual sites with complete forecast validation data (not just chart image).

## Context from Transcript (05:31)
> "What's important is that you once gave me this beautiful PDF. That's what we're talking about."

## Current State
TASK-18 exports only the chart image (PNG/PDF). Need expanded PDF with:
- Site metadata header
- Fact vs forecast chart
- Accuracy metrics table
- Daily breakdown table
- Summary statistics

## New PDF Structure

```
Page 1: Header + Chart
├─ Site ID, Address, District
├─ Cutoff date, Horizon, Data range
├─ Fact vs Forecast chart (centered)

Page 2+: Data & Metrics
├─ Accuracy Summary Table
│  ├─ WAPE: X.XX%
│  ├─ Coverage: X.X%
│  ├─ Within 10%: X.X%
│  ├─ Within 20%: X.X%
│  └─ Avg error: X.XX%
├─ Daily Breakdown (tabular)
│  ├─ Date | Actual (m³) | Forecast (m³) | Error (%) | Fill %
│  └─ [rows...]
├─ Summary Stats
│  ├─ Total actual: X.XX m³
│  ├─ Total forecast: X.XX m³
│  ├─ Best day (error): Date
│  └─ Worst day (error): Date
```

## Code Changes

### 1. Update chartExport.ts

```typescript
// src/utils/chartExport.ts

export interface PDFReportData {
  siteId: string;
  address: string;
  district: string;
  cutoffDate: string;
  horizonDays: number;
  startDate: string;
  endDate: string;
  dailyData: {
    date: string;
    actual_m3?: number;
    forecast_m3: number;
    error_pct?: number;
    fill_pct: number;
  }[];
  accuracy?: {
    wape: number;
    coverage_pct: number;
    total_actual_m3?: number;
    total_forecast_m3: number;
  };
}

export async function exportFullSiteReportPdf(
  chartRef: HTMLDivElement,
  reportData: PDFReportData,
  filename: string,
): Promise<void> {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // PAGE 1: Header + Chart
  pdf.setFontSize(16);
  pdf.text(`История накопления — КП ${reportData.siteId}`, 20, 20);

  pdf.setFontSize(10);
  pdf.text(`Адрес: ${reportData.address}`, 20, 28);
  pdf.text(`Район: ${reportData.district}`, 20, 34);
  pdf.text(
    `Дата среза: ${reportData.cutoffDate} | Горизонт: ${reportData.horizonDays} дней`,
    20,
    40,
  );

  // Chart image
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 170;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 20, 48, imgWidth, Math.min(imgHeight, 120));

  // PAGE 2: Metrics & Data
  pdf.addPage();
  let yPos = 20;

  // Accuracy summary table
  if (reportData.accuracy) {
    pdf.setFontSize(12);
    pdf.text('Метрики точности', 20, yPos);
    yPos += 10;

    pdf.setFontSize(9);
    const accuracy = reportData.accuracy;
    const metricsRows = [
      ['WAPE', `${(accuracy.wape * 100).toFixed(2)}%`],
      ['Охват', `${accuracy.coverage_pct.toFixed(1)}%`],
      ['Итого факт', `${accuracy.total_actual_m3?.toFixed(2) || 'N/A'} м³`],
      ['Итого прогноз', `${accuracy.total_forecast_m3.toFixed(2)} м³`],
    ];

    metricsRows.forEach(([label, value]) => {
      pdf.text(label, 25, yPos);
      pdf.text(value, 100, yPos);
      yPos += 6;
    });

    yPos += 4;
  }

  // Daily breakdown table
  pdf.setFontSize(12);
  pdf.text('Дневной прогноз', 20, yPos);
  yPos += 8;

  pdf.setFontSize(8);
  const tableData = reportData.dailyData.slice(0, 20).map((d) => [
    d.date,
    d.actual_m3?.toFixed(2) || '—',
    d.forecast_m3.toFixed(2),
    d.error_pct?.toFixed(1) + '%' || '—',
    (d.fill_pct * 100).toFixed(0) + '%',
  ]);

  pdf.autoTable({
    startY: yPos,
    head: [['Дата', 'Факт (м³)', 'Прогноз (м³)', 'Ошибка', 'Заполн.']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [100, 100, 100] },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  pdf.save(filename);
}
```

### 2. Update ContainerHistoryDialog.tsx

```typescript
// src/components/ContainerHistoryDialog.tsx

const handleExportFullReport = async () => {
  if (!chartRef.current) {
    return;
  }
  const reportData: PDFReportData = {
    siteId,
    address: address || 'N/A',
    district: district || 'N/A',
    cutoffDate: cutoffDate?.format('YYYY-MM-DD') || '',
    horizonDays: horizonDays || 0,
    startDate: range[0].format('YYYY-MM-DD'),
    endDate: range[1].format('YYYY-MM-DD'),
    dailyData: history.rows.map((row) => ({
      date: row.date.format('YYYY-MM-DD'),
      actual_m3: row.actualM3,
      forecast_m3: row.forecastM3 || 0,
      error_pct: row.actualM3 > 0 && row.forecastM3
        ? Math.abs((row.forecastM3 - row.actualM3) / row.actualM3) * 100
        : undefined,
      fill_pct: row.fillPct || 0,
    })),
    accuracy: totals.actual > 0 && totals.forecast > 0
      ? {
          wape: Math.abs(totals.forecast - totals.actual) / totals.actual,
          coverage_pct: 100,
          total_actual_m3: totals.actual,
          total_forecast_m3: totals.forecast,
        }
      : undefined,
  };

  await exportFullSiteReportPdf(
    chartRef.current,
    reportData,
    `site_${siteId}_full_report.pdf`,
  );
};

// Add button in footer
<Button icon={<FileTextOutlined />} onClick={handleExportFullReport}>
  Полный отчет
</Button>
```

## Tests

```typescript
// Manual testing:
// 1. Open chart dialog for any site with accuracy data
// 2. Click "Полный отчет PDF" button
// 3. Verify PDF opens with:
//    - Site ID, address, district on page 1
//    - Chart image on page 1
//    - Accuracy metrics table on page 2
//    - Daily breakdown table (first 20 rows)
//    - All numbers correctly formatted
// 4. Test with site that has no accuracy data (should show N/A)
```

## Acceptance Criteria
- [ ] PDF has 2+ pages
- [ ] Page 1: header + chart
- [ ] Page 2: metrics table
- [ ] Page 2: daily breakdown table (max 20 rows)
- [ ] All metrics correctly formatted
- [ ] Filename includes site_id
- [ ] Works with and without accuracy data

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-24: Full site report PDF"
