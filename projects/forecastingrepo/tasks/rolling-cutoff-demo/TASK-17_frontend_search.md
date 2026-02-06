# TASK-17: Frontend - Site Search Input

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Add search input to filter sites by ID or address in the all-sites table.

## Depends On
- TASK-12 (backend search) must be complete
- TASK-16 (all-sites table) must be complete

## Files to Modify
- `projects/mytko-forecast-demo/src/api/client.ts`
- `projects/mytko-forecast-demo/src/stores/forecastStore.ts`
- `projects/mytko-forecast-demo/src/pages/ForecastPage.tsx`

## Implementation

### 1. Update API Client

```typescript
// src/api/client.ts - already has search in RollingForecastRequest from TASK-12
export interface RollingForecastRequest {
  cutoff_date: string;
  horizon_days: number;
  site_id?: string;
  district?: string;
  search?: string;  // Already added
  limit?: number;
  offset?: number;
}
```

### 2. Update Store

```typescript
// src/stores/forecastStore.ts

class ForecastStore {
  // Existing...

  @observable searchTerm: string = '';

  @action setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  @action async loadRollingAllSites(page: number = 1, pageSize: number = 50) {
    // ... existing code ...
    const resp = await fetchRollingForecastAll({
      cutoff_date: this.cutoffDate!,
      horizon_days: this.horizonDays,
      district: this.districtFilter || undefined,
      search: this.searchTerm || undefined,  // ADD THIS
      limit: pageSize,
      offset,
    });
    // ...
  }
}
```

### 3. Add Search Input to UI

```tsx
// src/pages/ForecastPage.tsx

import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDebouncedCallback } from 'use-debounce';

// Add state and debounce
const [searchInput, setSearchInput] = useState('');

const debouncedSearch = useDebouncedCallback((value: string) => {
  store.setSearchTerm(value);
  store.loadRollingAllSites(1, store.allSitesPageSize);
}, 300);

// Add search input before/above the table
{store.rollingMode && !selectedSite && (
  <Card title="Все сайты" style={{ marginTop: 16 }}>
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder="Поиск по ID или адресу"
        prefix={<SearchOutlined />}
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          debouncedSearch(e.target.value);
        }}
        allowClear
        style={{ width: 250 }}
      />
      <Typography.Text type="secondary">
        {store.allSitesTotalRows} записей
      </Typography.Text>
    </Space>

    <Table
      // ... existing table config ...
    />
  </Card>
)}
```

### 4. Install Dependency (if not present)

```bash
npm install use-debounce
# or
yarn add use-debounce
```

## Alternative Without External Dependency

```tsx
// Using useEffect for debounce
const [searchInput, setSearchInput] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    store.setSearchTerm(searchInput);
    if (store.rollingMode && !selectedSite) {
      store.loadRollingAllSites(1, store.allSitesPageSize);
    }
  }, 300);
  return () => clearTimeout(timer);
}, [searchInput]);
```

## Tests

```typescript
// Manual testing checklist:
// 1. Type in search box
// 2. Wait 300ms (debounce)
// 3. Table updates with filtered results
// 4. Clear search restores full results
// 5. Search combines with district filter
// 6. Empty search term = no filter
```

## Acceptance Criteria
- [ ] Search input appears above all-sites table
- [ ] Typing triggers search after 300ms debounce
- [ ] Results filter by site_id or address
- [ ] Clear button works
- [ ] Combines with district filter
- [ ] Page resets to 1 on new search

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
