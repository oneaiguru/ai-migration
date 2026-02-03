# TASK-05: MobX Store Updates

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 15min

## Goal
Update `forecastStore.ts` and `client.ts` to support cutoff date and horizon parameters.

## Files to Modify

### 1. `projects/mytko-forecast-demo/src/api/client.ts`

Current:
```typescript
export type ForecastRequest = {
  siteId: string;
  startDate: string;
  endDate: string;
  vehicleVolume: number;
};
```

Change to:
```typescript
export type ForecastRequest = {
  siteId: string;
  startDate: string;
  endDate: string;
  vehicleVolume: number;
  // New fields for rolling cutoff
  cutoffDate?: string;    // YYYY-MM-DD, optional
  horizonDays?: number;   // 1-365, optional
};

export type RollingForecastRequest = {
  cutoffDate: string;     // YYYY-MM-DD, required
  horizonDays: number;    // 1-365, required
  siteId?: string;        // Optional, omit for all-sites
};

export type RollingForecastSummary = {
  cutoff_date: string;
  horizon_days: number;
  site_count: number;
  total_forecast_m3: number;
  generated_at: string;
  download_url: string;
};

export async function fetchRollingForecast(req: RollingForecastRequest): Promise<...> {
  const params = new URLSearchParams({
    cutoff_date: req.cutoffDate,
    horizon_days: String(req.horizonDays),
  });
  if (req.siteId) {
    params.set('site_id', req.siteId);
  }
  const response = await fetch(`${API_BASE}/api/mytko/rolling_forecast?${params}`);
  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }
  return response.json();
}
```

### 2. `projects/mytko-forecast-demo/src/stores/forecastStore.ts`

Add new fields:
```typescript
class ForecastStore {
  // Existing
  siteId = DEFAULT_SITE;
  startDate = DEFAULT_START;
  endDate = DEFAULT_END;
  vehicleVolume = 22;
  loading = false;
  error: string | null = null;
  data: ForecastDataFormat = [];

  // NEW: Rolling cutoff mode
  cutoffDate: string | null = null;  // null = use legacy mode
  horizonDays: number = 7;
  rollingMode: boolean = false;      // true = use rolling forecast API
  rollingSummary: RollingForecastSummary | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // NEW setters
  setCutoffDate(value: string | null) {
    this.cutoffDate = value;
  }

  setHorizonDays(value: number) {
    this.horizonDays = Math.max(1, Math.min(365, value));
  }

  setRollingMode(value: boolean) {
    this.rollingMode = value;
  }

  // Modify load() to check rollingMode
  async load() {
    if (this.rollingMode && this.cutoffDate) {
      return this.loadRolling();
    }
    // ... existing logic
  }

  async loadRolling() {
    if (!this.cutoffDate) {
      this.error = 'Укажите дату среза';
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const result = await fetchRollingForecast({
        cutoffDate: this.cutoffDate,
        horizonDays: this.horizonDays,
        siteId: this.siteId || undefined,
      });
      runInAction(() => {
        if ('points' in result) {
          // Single-site response
          this.data = result.points.map(p => ({
            date: p.date,
            isFact: false,
            isEmpty: p.pred_volume_m3 <= 0,
            vehicleVolume: this.vehicleVolume,
            overallVolume: p.pred_volume_m3 / 1000,
            overallWeight: p.pred_volume_m3,
            // ... map other fields
          }));
        } else {
          // Summary response
          this.rollingSummary = result;
          this.data = [];
        }
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Ошибка загрузки';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
```

## Tests

```typescript
// tests/stores/forecastStore.test.ts

describe('forecastStore rolling mode', () => {
  it('sets cutoff date', () => {
    forecastStore.setCutoffDate('2025-03-15');
    expect(forecastStore.cutoffDate).toBe('2025-03-15');
  });

  it('clamps horizon days to 1-365', () => {
    forecastStore.setHorizonDays(0);
    expect(forecastStore.horizonDays).toBe(1);
    forecastStore.setHorizonDays(999);
    expect(forecastStore.horizonDays).toBe(365);
  });
});
```

## Acceptance Criteria
- [ ] New types added to client.ts
- [ ] fetchRollingForecast function works
- [ ] Store has cutoffDate, horizonDays, rollingMode
- [ ] loadRolling() calls new API
- [ ] Tests pass (if test framework is set up)

---

## On Completion

1. Run all tests for modified files
2. Update `/Users/m/ai/progress.md`: Change task status from 🔴 TODO to 🟢 DONE
3. Commit changes with message: "Implement TASK-XX: <description>"
