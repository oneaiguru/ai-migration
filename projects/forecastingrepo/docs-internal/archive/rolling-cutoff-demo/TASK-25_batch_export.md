# TASK-25: Batch Export (ZIP of PDFs)

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Enable exporting PDFs for all-sites results as a single ZIP file (or combined multi-site PDF).

## Use Case
User selects 10-50 sites (filtered by district), generates forecasts, downloads all reports at once.

## Two Options

### Option A: ZIP of Individual PDFs
```
export.zip
├── site_38105070_report.pdf
├── site_38105071_report.pdf
├── site_38105072_report.pdf
└── ...
```

### Option B: Combined Multi-Site PDF
```
combined_report.pdf
├── Page 1-3: Site 38105070
├── Page 4-6: Site 38105071
└── ...
```

**Recommend**: Option A (easier to process individually, smaller file sizes)

## Code Changes

### 1. Add ZIP export utilities

```typescript
// src/utils/chartExport.ts

import JSZip from 'jszip';

export async function generateSiteReportPdfBlob(
  chartRef: HTMLDivElement,
  reportData: PDFReportData,
): Promise<Blob> { /* ... */ }

export interface BatchExportSite {
  siteId: string;
  pdfBlob: Blob;
}

export async function exportSitesAsZip(
  sites: BatchExportSite[],
  filename: string,
): Promise<void> { /* ... */ }
```

### 2. UI integration (future)

```typescript
// src/pages/ForecastPage.tsx

const [selectedSites, setSelectedSites] = useState<string[]>([]);

// In table config:
const sitesColumns = [
  {
    title: '',
    width: 50,
    render: (_, record) => (
      <Checkbox
        checked={selectedSites.includes(record.site_id)}
        onChange={(e) => {
          setSelectedSites(
            e.target.checked
              ? [...selectedSites, record.site_id]
              : selectedSites.filter((id) => id !== record.site_id),
          );
        }}
      />
    ),
  },
  // ... existing columns
];

// Button above table:
<Button
  icon={<DownloadOutlined />}
  disabled={selectedSites.length === 0}
  onClick={async () => {
    // Prepare BatchExportSite[] with per-site PDF blobs, then:
    // await exportSitesAsZip(batchSites, 'forecast_reports.zip');
  }}
>
  Скачать {selectedSites.length} отчетов
</Button>
```

## Dependencies

Add to `package.json`:
```json
{
  "jszip": "^3.10.1"
}
```

## Tests

```typescript
// Manual testing:
// 1. Select 3-5 sites in all-sites table
// 2. Click "Скачать отчетов" button
// 3. Verify ZIP file downloads
// 4. Extract ZIP and verify:
//    - Contains PDF for each selected site
//    - Each PDF is valid and readable
//    - Filenames follow pattern site_XXXXX_report.pdf
```

## Acceptance Criteria
- [ ] ZIP export works for 1+ selected sites
- [ ] Button disabled when no sites selected
- [ ] ZIP contains correct number of PDFs
- [ ] Each PDF is valid and readable
- [ ] Filename includes count: `forecast_reports_5sites.zip`
- [ ] Works for filtered results (district + search)

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-25: Batch export ZIP"
