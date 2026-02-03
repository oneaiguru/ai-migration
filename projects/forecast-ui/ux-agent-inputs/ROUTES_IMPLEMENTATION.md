# React Implementation Guide: Routes with Forecast

## Overview
Integrate forecast data into the Routes component by adding 3 new columns to the existing routes table.

## File Changes Required

### 1. Update Data Types
**File:** `src/data/metrics.ts`

Add new interface:
```typescript
export interface SiteWithForecast {
  site_id: string;
  address: string;
  volume: string;
  schedule: string;
  fill_pct: number;
  overflow_risk: number;
  last_service: string;
  pred_mass_kg: number;
}
```

Update mock data to include forecast fields:
```typescript
export const mockRouteSites: SiteWithForecast[] = [
  { 
    site_id: "38116432", 
    address: "Декабристов, 45", 
    volume: "4 | 0.75", 
    schedule: "Ежедневно",
    fill_pct: 0.91, 
    overflow_risk: 0.95, 
    last_service: "2024-12-29",
    pred_mass_kg: 480
  },
  // ... rest of mock data
];
```

### 2. Update Routes Component
**File:** `src/components/Routes.tsx`

**Step 1:** Import new data type and sort by risk:
```typescript
import { mockRouteSites } from '../data/metrics';

// Inside component:
const [sortBy, setSortBy] = useState<'risk' | 'default'>('risk');

const sortedSites = [...mockRouteSites].sort((a, b) => {
  if (sortBy === 'risk') {
    return b.overflow_risk - a.overflow_risk;
  }
  return 0; // default order
});
```

**Step 2:** Replace card-based layout with table:
```typescript
<div className="card">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">462 НОВЫЙ</h3>
    <div className="text-sm text-gray-600">
      <strong className="text-red-600">
        {sortedSites.filter(s => s.overflow_risk >= 0.8).length} площадок с высоким риском
      </strong>
    </div>
  </div>

  {/* Sorting toggle */}
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-700 mr-2">Сортировка:</label>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as 'risk' | 'default')}
      className="border border-gray-300 rounded px-3 py-1.5 text-sm"
    >
      <option value="risk">По риску переполнения</option>
      <option value="default">По умолчанию</option>
    </select>
  </div>

  <div className="table-container">
    <table className="w-full compact-table">
      <thead>
        <tr className="table-header border-b">
          <th className="px-3 py-2 text-left">№</th>
          <th className="px-3 py-2 text-left">Код КП</th>
          <th className="px-3 py-2 text-left">Адрес КП</th>
          <th className="px-3 py-2 text-left">Объем</th>
          <th className="px-3 py-2 text-left">График вывоза</th>
          <th className="px-3 py-2 text-left bg-green-50">Заполнение</th>
          <th className="px-3 py-2 text-center bg-green-50">Риск переполнения</th>
          <th className="px-3 py-2 text-center bg-green-50">Посл. вывоз</th>
        </tr>
      </thead>
      <tbody>
        {sortedSites.map((site, idx) => (
          <tr 
            key={site.site_id} 
            className={`border-b hover:bg-gray-50 ${
              site.overflow_risk >= 0.8 ? 'bg-yellow-50' : ''
            }`}
          >
            <td className="px-3 py-2 text-sm">{idx + 1}</td>
            <td className="px-3 py-2 text-sm font-mono text-blue-600">{site.site_id}</td>
            <td className="px-3 py-2 text-sm">{site.address}</td>
            <td className="px-3 py-2 text-sm font-mono">{site.volume}</td>
            <td className="px-3 py-2 text-sm">{site.schedule}</td>
            
            {/* Fill percentage with progress bar */}
            <td className="px-3 py-2 bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      site.fill_pct >= 0.8 ? 'bg-red-500' : 
                      site.fill_pct >= 0.6 ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${site.fill_pct * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono min-w-[35px]">
                  {(site.fill_pct * 100).toFixed(0)}%
                </span>
              </div>
            </td>
            
            {/* Risk badge */}
            <td className="px-3 py-2 text-center bg-green-50">
              <span className={`risk-badge ${
                site.overflow_risk >= 0.8 ? 'bg-red-100 text-red-800 border-red-300' :
                site.overflow_risk >= 0.5 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                'bg-green-100 text-green-800 border-green-300'
              }`}>
                {site.overflow_risk >= 0.8 ? 'Высокий' :
                 site.overflow_risk >= 0.5 ? 'Средний' : 'Низкий'} {(site.overflow_risk * 100).toFixed(0)}%
              </span>
            </td>
            
            {/* Last service date */}
            <td className="px-3 py-2 text-center text-sm text-gray-600 bg-green-50">
              {site.last_service}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### 3. Update CSS
**File:** `src/index.css`

Add to `@layer components`:
```css
.risk-badge {
  @apply inline-block px-2 py-0.5 rounded text-xs font-medium border;
}

.compact-table td,
.compact-table th {
  @apply px-3 py-2;
}
```

## API Integration (Future)

When connecting to real API:

```typescript
// src/hooks/useRouteForecast.ts
export function useRouteForecast(routeId: string, date: string) {
  const [data, setData] = useState<SiteWithForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forecast/routes/${routeId}?date=${date}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [routeId, date]);

  return { data, loading };
}
```

Usage in Routes component:
```typescript
const { data: sitesWithForecast, loading } = useRouteForecast('462', '2025-01-06');

if (loading) return <Spinner />;
```

## Testing Checklist

After implementation:
- [ ] Table shows 3 new columns with green background
- [ ] Sites sorted by risk (highest first)
- [ ] Progress bars render correctly
- [ ] Risk badges have proper colors
- [ ] Rows with high risk (≥80%) have yellow background
- [ ] Sorting toggle works
- [ ] Hover states work
- [ ] Table is scrollable horizontally if needed

## Deployment

```bash
npm run build
git commit -m "feat: integrate forecast into routes table"
git push
# Vercel auto-deploys
```

## Expected Result

User sees routes table with integrated forecast data showing:
1. Fill percentage with visual progress bar
2. Risk level with color-coded badge
3. Last service date
4. High-risk sites highlighted with yellow background
5. Sites sorted by risk by default

Time to implement: ~30 minutes
