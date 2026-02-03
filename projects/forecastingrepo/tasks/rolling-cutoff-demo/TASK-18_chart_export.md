# TASK-18: Frontend - Chart Export (PNG/PDF)

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Add buttons to export chart as PNG image or PDF document from ContainerHistoryDialog.

## Depends On
- TASK-07 (chart split) must be complete

## Files to Modify
- `projects/mytko-forecast-demo/src/components/ContainerHistoryDialog.tsx`
- `projects/mytko-forecast-demo/package.json` (add dependencies)

## Dependencies to Add

```bash
npm install html2canvas jspdf
# Types (if using TypeScript strict mode)
npm install -D @types/html2canvas
```

## Implementation

### 1. Add Export Utilities

```typescript
// src/utils/chartExport.ts

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportChartToPng(
  chartRef: HTMLDivElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportChartToPdf(
  chartRef: HTMLDivElement,
  filename: string,
  metadata: {
    siteId: string;
    dateRange: string;
    cutoffDate?: string;
  }
): Promise<void> {
  const canvas = await html2canvas(chartRef, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  pdf.setFontSize(16);
  pdf.text(`История накопления — КП ${metadata.siteId}`, 20, 20);

  // Add metadata
  pdf.setFontSize(10);
  pdf.text(`Период: ${metadata.dateRange}`, 20, 30);
  if (metadata.cutoffDate) {
    pdf.text(`Дата среза: ${metadata.cutoffDate}`, 20, 36);
  }

  // Add chart image
  const imgWidth = 257; // A4 landscape width - margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, Math.min(imgHeight, 140));

  pdf.save(filename);
}
```

### 2. Update ContainerHistoryDialog

```tsx
// src/components/ContainerHistoryDialog.tsx

import { useRef } from 'react';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { exportChartToPng, exportChartToPdf } from '@/utils/chartExport';

export function ContainerHistoryDialog({
  siteId,
  open,
  onClose,
  initialRange,
  vehicleVolume,
  cutoffDate,
}: ContainerHistoryDialogProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // ... existing code ...

  const handleExportPng = async () => {
    if (chartRef.current) {
      await exportChartToPng(
        chartRef.current,
        `site_${siteId}_chart.png`
      );
    }
  };

  const handleExportPdf = async () => {
    if (chartRef.current) {
      await exportChartToPdf(
        chartRef.current,
        `site_${siteId}_report.pdf`,
        {
          siteId,
          dateRange: `${range[0].format('DD.MM.YYYY')} — ${range[1].format('DD.MM.YYYY')}`,
          cutoffDate: cutoffDate?.format('DD.MM.YYYY'),
        }
      );
    }
  };

  // Wrap chart in ref container
  const renderBody = () => {
    // ... existing loading/error handling ...
    return (
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={360}>
          {/* ... existing chart ... */}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Modal
      // ... existing props ...
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text>
            Факт: <strong>{totals.actual.toFixed(1)} м³</strong> · Прогноз:{' '}
            <strong>{totals.forecast.toFixed(1)} м³</strong>
          </Typography.Text>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExportPng}>
              PNG
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>
              PDF
            </Button>
            <Button onClick={handleExport}>CSV</Button>
            <Button type="primary" onClick={onClose}>
              Закрыть
            </Button>
          </Space>
        </Space>
      }
    >
      {/* ... existing content ... */}
    </Modal>
  );
}
```

## Tests

```typescript
// Manual testing checklist:
// 1. Open chart dialog for any site
// 2. Click "PNG" button
// 3. Verify PNG file downloads with chart image
// 4. Click "PDF" button
// 5. Verify PDF downloads with:
//    - Title with site ID
//    - Date range
//    - Cutoff date (if set)
//    - Chart image
// 6. PNG/PDF have correct filename pattern
// 7. Export works with and without cutoff date
```

## Acceptance Criteria
- [ ] PNG button exports chart as image
- [ ] PDF button exports report with chart + metadata
- [ ] Filename includes site_id
- [ ] PDF includes title, date range, cutoff date
- [ ] Export works with cutoff line visible
- [ ] No UI freeze during export

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
