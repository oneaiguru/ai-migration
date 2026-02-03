# Code Modification Examples

Quick reference for common customization tasks.

## 1. Adding a New Tab

### Step 1: Create Component
```typescript
// src/components/NewFeature.tsx
import React from 'react';

export const NewFeature: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">New Feature</h3>
        <p>Your content here...</p>
      </div>
    </div>
  );
};
```

### Step 2: Register in Layout
```typescript
// src/components/Layout.tsx (around line 19)
const tabs = [
  { id: 'overview', label: 'Обзор' },
  { id: 'districts', label: 'Районы' },
  { id: 'sites', label: 'Площадки' },
  { id: 'routes', label: 'Маршруты' },
  { id: 'newfeature', label: 'Новая функция' }, // ADD THIS
];
```

### Step 3: Add to App Router
```typescript
// src/App.tsx (around line 14)
import { NewFeature } from './components/NewFeature';

const renderContent = () => {
  switch (activeTab) {
    case 'overview':
      return <Overview />;
    case 'districts':
      return <Districts />;
    case 'sites':
      return <Sites />;
    case 'routes':
      return <Routes />;
    case 'newfeature':  // ADD THIS
      return <NewFeature />;
    default:
      return <Overview />;
  }
};
```

---

## 2. Connecting to Real API

### Replace Mock Data with API Call

#### Before (mock):
```typescript
// src/data/metrics.ts
export const metricsData: MetricsSummary = { ... };
```

#### After (API):
```typescript
// src/hooks/useForecastMetrics.ts
import { useState, useEffect } from 'react';
import { MetricsSummary } from '../data/metrics';

export function useForecastMetrics() {
  const [data, setData] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('https://api.mytko.ru/forecast/metrics')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

#### Use in Component:
```typescript
// src/components/Overview.tsx
import { useForecastMetrics } from '../hooks/useForecastMetrics';

export const Overview: React.FC = () => {
  const { data, loading, error } = useForecastMetrics();
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;
  if (!data) return null;

  // Use data.monthly.region.wape_median etc.
};
```

---

## 3. Adding Date Picker

### Install Dependency:
```bash
npm install react-datepicker
npm install --save-dev @types/react-datepicker
```

### Add to Component:
```typescript
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const Sites: React.FC = () => {
  const [forecastDate, setForecastDate] = useState(new Date());

  return (
    <div className="card mb-6">
      <label className="text-sm font-medium mr-2">Дата прогноза:</label>
      <DatePicker
        selected={forecastDate}
        onChange={(date) => date && setForecastDate(date)}
        dateFormat="dd.MM.yyyy"
        className="border border-gray-300 rounded px-3 py-1.5"
      />
    </div>
  );
};
```

---

## 4. Adding Map View

### Install Dependency:
```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

### Import Leaflet CSS:
```typescript
// src/main.tsx
import 'leaflet/dist/leaflet.css';
```

### Create Map Component:
```typescript
// src/components/SitesMap.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SiteForecast } from '../data/metrics';

interface Props {
  sites: SiteForecast[];
}

export const SitesMap: React.FC<Props> = ({ sites }) => {
  return (
    <MapContainer
      center={[52.2869, 104.3050]} // Irkutsk coordinates
      zoom={11}
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {sites.map(site => (
        <Marker
          key={site.site_id}
          position={[/* site.lat, site.lon */]}
        >
          <Popup>
            <strong>{site.address}</strong><br/>
            Риск: {(site.overflow_risk * 100).toFixed(0)}%
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

---

## 5. Exporting Table to CSV

### Add Export Function:
```typescript
// src/utils/export.ts
export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => `"${row[h]}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}
```

### Use in Component:
```typescript
import { exportToCSV } from '../utils/export';

export const Sites: React.FC = () => {
  const handleExport = () => {
    exportToCSV(mockSites, 'sites-forecast');
  };

  return (
    <>
      <button onClick={handleExport} className="btn-primary">
        Экспорт в CSV
      </button>
      {/* ... rest of component */}
    </>
  );
};
```

---

## 6. Adding Loading Spinner

### Create Spinner Component:
```typescript
// src/components/Spinner.tsx
export const Spinner: React.FC = () => (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mytko-green"></div>
  </div>
);
```

### Use in Components:
```typescript
if (loading) return <Spinner />;
```

---

## 7. Adding Error Boundary

### Create Error Boundary:
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="card bg-red-50 border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Произошла ошибка
          </h3>
          <p className="text-red-700 mb-4">
            {this.state.error?.message || 'Неизвестная ошибка'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Wrap App:
```typescript
// src/main.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
```

---

## 8. Adding Authentication

### Install Dependency:
```bash
npm install @auth0/auth0-react
# or
npm install @supabase/supabase-js
```

### Auth0 Example:
```typescript
// src/main.tsx
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Auth0Provider
    domain="your-domain.auth0.com"
    clientId="your-client-id"
    redirectUri={window.location.origin}
  >
    <App />
  </Auth0Provider>
);
```

### Protected Route:
```typescript
import { useAuth0 } from '@auth0/auth0-react';

export const App = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button onClick={() => loginWithRedirect()} className="btn-primary">
          Войти
        </button>
      </div>
    );
  }

  return <Layout>...</Layout>;
};
```

---

## 9. Changing Theme Colors

### Update Tailwind Config:
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'mytko-green': '#10b981',  // Change this
        'mytko-dark': '#111827',   // Or this
        'mytko-gray': '#6b7280',
        'mytko-light': '#f9fafb',
      },
    },
  },
};
```

### Or Add Dark Mode:
```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      // ...
    },
  },
};
```

```typescript
// Use in component
<div className="bg-white dark:bg-gray-800">
```

---

## 10. Adding Environment Variables

### Create .env File:
```bash
# .env
VITE_API_URL=https://api.mytko.ru
VITE_API_KEY=your_secret_key
```

### Use in Code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

fetch(`${apiUrl}/forecast/metrics`, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
});
```

### Vercel Environment Variables:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://api.mytko.ru`
3. Redeploy

---

## 11. Adding React Router (Multi-page)

### Install:
```bash
npm install react-router-dom
```

### Setup Routes:
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/districts" element={<Districts />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/routes" element={<Routes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
```

---

## 12. Adding Toast Notifications

### Install:
```bash
npm install react-hot-toast
```

### Setup:
```typescript
// src/main.tsx
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
);
```

### Use:
```typescript
import toast from 'react-hot-toast';

const handleExport = () => {
  exportToCSV(data, 'forecast');
  toast.success('Данные экспортированы!');
};
```

---

## Testing Examples

### Unit Test (Vitest):
```typescript
// src/components/__tests__/Overview.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Overview } from '../Overview';

describe('Overview', () => {
  it('renders metrics cards', () => {
    render(<Overview />);
    expect(screen.getByText(/Точность прогноза по региону/i)).toBeInTheDocument();
  });
});
```

### E2E Test (Playwright):
```typescript
// tests/forecast.spec.ts
import { test, expect } from '@playwright/test';

test('can navigate between tabs', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Check default tab
  await expect(page.getByText('Точность прогноза по региону')).toBeVisible();
  
  // Click Districts tab
  await page.click('text=Районы');
  await expect(page.getByText('Правый берег')).toBeVisible();
});
```

---

## Performance Optimization

### Code Splitting:
```typescript
import { lazy, Suspense } from 'react';

const Districts = lazy(() => import('./components/Districts'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Districts />
    </Suspense>
  );
}
```

### Memoization:
```typescript
import { useMemo } from 'react';

const filteredSites = useMemo(
  () => mockSites.filter(s => s.overflow_risk >= filterRisk),
  [filterRisk]
);
```

---

These examples cover 90% of common customization needs. For anything not covered here, consult:
- React docs: https://react.dev
- Tailwind docs: https://tailwindcss.com
- Recharts docs: https://recharts.org
