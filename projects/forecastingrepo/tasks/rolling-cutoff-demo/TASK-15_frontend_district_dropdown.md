# TASK-15: Frontend - District Filter Dropdown

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
Add district filter dropdown to ForecastPage that filters results when rolling cutoff is active.

## Depends On
- TASK-11 (backend district filter) must be complete

## Files to Modify
- `projects/mytko-forecast-demo/src/api/client.ts`
- `projects/mytko-forecast-demo/src/stores/forecastStore.ts`
- `projects/mytko-forecast-demo/src/pages/ForecastPage.tsx`

## Implementation

### 1. Update API Client

```typescript
// src/api/client.ts

// Add district list fetch
export async function fetchDistricts(): Promise<string[]> {
  const resp = await fetch(`${apiConfig.baseUrl}/api/mytko/districts`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return data.districts;
}

// Update rolling forecast request
export interface RollingForecastRequest {
  cutoff_date: string;
  horizon_days: number;
  site_id?: string;
  district?: string;  // NEW
  limit?: number;
  offset?: number;
}
```

### 2. Update Store

```typescript
// src/stores/forecastStore.ts

class ForecastStore {
  // Existing fields...

  @observable districtFilter: string | null = null;  // NEW
  @observable availableDistricts: string[] = [];     // NEW

  @action setDistrictFilter(district: string | null) {
    this.districtFilter = district;
  }

  @action async loadDistricts() {
    try {
      const districts = await fetchDistricts();
      runInAction(() => {
        this.availableDistricts = districts;
      });
    } catch (err) {
      console.error('Failed to load districts', err);
    }
  }

  // Modify loadRolling to include district filter
  @action async loadRolling() {
    // ... existing code ...
    const request: RollingForecastRequest = {
      cutoff_date: this.cutoffDate,
      horizon_days: this.horizonDays,
      district: this.districtFilter || undefined,  // NEW
    };
    // ...
  }
}
```

### 3. Update ForecastPage UI

```tsx
// src/pages/ForecastPage.tsx

// Add imports
import { Select } from 'antd';

// Add state for district selection
const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

// Load districts on mount
useEffect(() => {
  store.loadDistricts();
}, []);

// Add district dropdown in the form row (after horizon selector)
<Col span={6}>
  <Form.Item label="Район">
    <Select
      allowClear
      placeholder="Все районы"
      value={selectedDistrict}
      onChange={(val) => {
        setSelectedDistrict(val);
        store.setDistrictFilter(val);
      }}
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={store.availableDistricts.map((d) => ({
        value: d,
        label: d,
      }))}
      style={{ width: '100%' }}
    />
  </Form.Item>
</Col>
```

### 4. Add Districts Endpoint (Backend)

```python
# Add to scripts/api_app.py

@app.get("/api/mytko/districts")
def list_districts():
    """Return all unique district names."""
    from src.sites.data_loader import load_registry
    registry = load_registry()
    districts = sorted(registry['district'].dropna().unique().tolist())
    return {"districts": districts, "count": len(districts)}
```

## Tests

```python
# tests/api/test_rolling_forecast_endpoint.py

def test_list_districts(client):
    """Districts endpoint returns list."""
    resp = client.get("/api/mytko/districts")
    assert resp.status_code == 200
    data = resp.json()
    assert "districts" in data
    assert len(data["districts"]) > 0
    assert isinstance(data["districts"][0], str)
```

## Acceptance Criteria
- [ ] `/api/mytko/districts` endpoint returns district list
- [ ] Select dropdown appears in ForecastPage
- [ ] Dropdown is searchable
- [ ] Selecting district filters forecast results
- [ ] "All districts" (clear) option works
- [ ] Store tracks district filter
- [ ] Tests pass

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
