# TASK-16: Frontend - All-Sites Results Table

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Add paginated table showing all-sites forecast results when no specific site is selected.

## Depends On
- TASK-10 (pagination API) must be complete
- TASK-15 (district dropdown) recommended

## Current Behavior
When cutoff is selected without site_id, UI shows only summary text ("12345 сайтов, 6789 м³").

## New Behavior
Show an interactive table with site forecasts, sortable and paginated.

## Files to Modify
- `projects/mytko-forecast-demo/src/api/client.ts`
- `projects/mytko-forecast-demo/src/stores/forecastStore.ts`
- `projects/mytko-forecast-demo/src/pages/ForecastPage.tsx`

## Implementation

### 1. Update API Client

```typescript
// src/api/client.ts

export interface RollingForecastRow {
  site_id: string;
  date: string;
  fill_pct: number;
  pred_volume_m3: number;
  overflow_prob: number;
  actual_m3?: number;
  error_pct?: number;
}

export interface RollingForecastAllResponse {
  cutoff_date: string;
  horizon_days: number;
  site_count: number;
  total_forecast_m3: number;
  total_rows: number;
  limit: number;
  offset: number;
  rows: RollingForecastRow[];
  accuracy_wape?: number;
}

export async function fetchRollingForecastAll(
  request: RollingForecastRequest
): Promise<RollingForecastAllResponse> {
  const params = new URLSearchParams({
    cutoff_date: request.cutoff_date,
    horizon_days: String(request.horizon_days),
    limit: String(request.limit || 50),
    offset: String(request.offset || 0),
  });
  if (request.district) params.set('district', request.district);
  if (request.search) params.set('search', request.search);

  const resp = await fetch(`${apiConfig.baseUrl}/api/mytko/rolling_forecast?${params}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
```

### 2. Update Store

```typescript
// src/stores/forecastStore.ts

class ForecastStore {
  // Existing...

  @observable allSitesData: RollingForecastRow[] = [];
  @observable allSitesTotalRows: number = 0;
  @observable allSitesPage: number = 1;
  @observable allSitesPageSize: number = 50;

  @action async loadRollingAllSites(page: number = 1, pageSize: number = 50) {
    this.loading = true;
    try {
      const offset = (page - 1) * pageSize;
      const resp = await fetchRollingForecastAll({
        cutoff_date: this.cutoffDate!,
        horizon_days: this.horizonDays,
        district: this.districtFilter || undefined,
        limit: pageSize,
        offset,
      });
      runInAction(() => {
        this.allSitesData = resp.rows;
        this.allSitesTotalRows = resp.total_rows;
        this.allSitesPage = page;
        this.allSitesPageSize = pageSize;
        this.rollingSummary = {
          site_count: resp.site_count,
          total_forecast_m3: resp.total_forecast_m3,
        };
      });
    } catch (err) {
      runInAction(() => { this.error = String(err); });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }
}
```

### 3. Add Sites Table Component

```tsx
// src/pages/ForecastPage.tsx (or new component)

import { Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

const sitesColumns: ColumnsType<RollingForecastRow> = [
  { title: 'ID сайта', dataIndex: 'site_id', key: 'site_id', width: 120 },
  { title: 'Дата', dataIndex: 'date', key: 'date', width: 100 },
  {
    title: 'Прогноз, кг',
    dataIndex: 'pred_volume_m3',
    key: 'pred_volume_m3',
    render: (v) => v?.toFixed(1) ?? '-',
    width: 100,
  },
  {
    title: 'Заполн., %',
    dataIndex: 'fill_pct',
    key: 'fill_pct',
    render: (v) => v != null ? `${(v * 100).toFixed(1)}%` : '-',
    width: 90,
  },
  {
    title: 'Факт, м³',
    dataIndex: 'actual_m3',
    key: 'actual_m3',
    render: (v) => v?.toFixed(2) ?? '-',
    width: 90,
  },
  {
    title: 'Ошибка, %',
    dataIndex: 'error_pct',
    key: 'error_pct',
    render: (v) => v != null ? `${v.toFixed(1)}%` : '-',
    width: 90,
  },
];

// In render:
{store.rollingMode && !selectedSite && (
  <Card title="Все сайты" style={{ marginTop: 16 }}>
    <Table
      columns={sitesColumns}
      dataSource={store.allSitesData}
      rowKey={(r) => `${r.site_id}-${r.date}`}
      loading={store.loading}
      pagination={{
        current: store.allSitesPage,
        pageSize: store.allSitesPageSize,
        total: store.allSitesTotalRows,
        showSizeChanger: true,
        pageSizeOptions: ['10', '25', '50', '100'],
        showTotal: (total) => `Всего ${total} записей`,
      }}
      onChange={(pagination: TablePaginationConfig) => {
        store.loadRollingAllSites(
          pagination.current || 1,
          pagination.pageSize || 50
        );
      }}
      onRow={(record) => ({
        onClick: () => {
          // Open chart for this site
          setDialogSite(record.site_id);
        },
        style: { cursor: 'pointer' },
      })}
      size="small"
      scroll={{ x: 600 }}
    />
  </Card>
)}
```

## Tests

```typescript
// Manual testing checklist:
// 1. Select cutoff date + horizon, don't select specific site
// 2. Table appears with paginated results
// 3. Pagination controls work (next/prev, page size)
// 4. Click row opens chart dialog for that site
// 5. District filter updates table results
// 6. Loading state shown during fetch
```

## Acceptance Criteria
- [ ] Table appears when rolling mode active and no site selected
- [ ] Shows site_id, date, pred_volume_m3, fill_pct, actual_m3, error_pct
- [ ] Pagination works (server-side)
- [ ] Page size selector works
- [ ] Row click opens site chart dialog
- [ ] District filter updates results
- [ ] Loading spinner during fetch

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
