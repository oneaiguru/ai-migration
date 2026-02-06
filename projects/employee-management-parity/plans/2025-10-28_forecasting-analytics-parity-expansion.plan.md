# Plan — Forecasting & Analytics Parity Expansion (Build/Exceptions/Absenteeism)

## Metadata
- **Discovery Source:** `docs/Tasks/forecasting-analytics_parity-scout-2025-10-27-codex.task.md`
- **Supporting Notes:** `docs/Tasks/forecasting-analytics-routing-discovery.md`, `docs/Workspace/Coordinator/forecasting-analytics/Progress_Forecasting-Analytics_2025-10-14.md`
- **Target Repository:** `${FORECASTING_ANALYTICS_REPO}`
- **Primary Files:**
  - Routing shell: `src/App.tsx`, `src/main.tsx`
  - New workspaces: `src/components/forecasting/{build,exceptions,absenteeism}/`
  - Shared fixtures/services: `src/data/forecastingFixtures.ts`, `src/services/forecastingApi.ts`, `src/components/forecasting/{AccuracyDashboard.tsx,trends/TrendAnalysisDashboard.tsx}`
  - Smoke/UAT/docs: `scripts/smoke-routes.mjs`, `uat-agent-tasks/2025-10-26_forecasting-uat.md`, `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`, `docs/Tasks/uat-packs/parity_static.md`, `docs/System/{WRAPPER_ADOPTION_MATRIX.md,PARITY_MVP_CHECKLISTS.md,learning-log.md}`, `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`, `docs/SESSION_HANDOFF.md`, `docs/Tasks/post-phase9-demo-execution.md`, `PROGRESS.md`
- **Required Reading:** CE prompts (`SIMPLE-INSTRUCTIONS.md`, `PLAN-USING-MAGIC-PROMPT.md`), SOP (`docs/SOP/code-change-plan-sop.md`), UI walkthrough (`docs/SOP/ui-walkthrough-checklist.md`), manuals `CH2_Login_System.md` & `CH4_Forecasts.md` §§4.1–4.4, crosswalk, discovery doc.

## Desired End State
Prod deploy exposes six deep-linkable routes (`/build`, `/exceptions`, `/trends`, `/absenteeism`, `/accuracy`, `/adjustments`) that mirror manual Chapter 4 workspaces. Each view renders deterministic fixtures (no random data) and removes marketing-only copy like “Интеграция Chart.js…”. Smoke tests cover all routes. Step 6 UAT (parity_static + chart_visual_spec) passes with recorded evidence and documentation updates (UAT tables, crosswalk, CodeMap, system checklists, tracker, handoff, PROGRESS).

### Key Discoveries
- Missing Build/Exceptions/Absenteeism views documented in `docs/Tasks/forecasting-analytics_parity-scout-2025-10-27-codex.task.md` referencing `CH4_Forecasts.md:5-145` and the current router stub `src/App.tsx:20-41`.
- Trend dashboard previously crashed without defaults (`docs/Tasks/forecasting-analytics-routing-discovery.md`, `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:20-47`), motivating fixture-driven safeguards.
- RNG-based metrics (`src/components/forecasting/AccuracyDashboard.tsx:70-199`, `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:73-138`, `src/services/forecastingApi.ts:26-111`) conflict with manual expectation of persisted data (`CH4_Forecasts.md:151-198`).
- Crosswalk (`uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`) currently maps only accuracy/trends/adjustments; needs coverage for §4.1–4.3.

## What We're NOT Doing
- No live API or backend integration; fixtures emulate persisted datasets.
- No overhaul of chart wrappers beyond deterministic inputs.
- No new automated E2E beyond expanding existing smoke script.
- No redesign of ManualAdjustmentSystem (remains client-side with fixture validation).

## Implementation Approach
Expand the route configuration to include manual-aligned tabs and swap RNG with deterministic fixtures exported from a new data module. Build dedicated components for Build Forecast, Exceptions, and Absenteeism using the fixtures and manual copy. Update services to reuse fixtures, extend smoke checks, and refresh documentation/UAT artifacts after redeploy/UAT pass.

## Phase 1: Routing Shell & Header Copy

### Overview
Introduce the full route map, connect new components, and remove marketing text from the hero bar.

### Changes Required

#### 1. Extend route definitions & imports
**File:** `src/App.tsx`

```tsx
@@
-import AccuracyDashboard from './components/forecasting/AccuracyDashboard';
-import TrendAnalysisDashboard from './components/forecasting/trends/TrendAnalysisDashboard';
-import ManualAdjustmentSystem from './components/forecasting/ManualAdjustmentSystem';
+import AccuracyDashboard from './components/forecasting/AccuracyDashboard';
+import TrendAnalysisDashboard from './components/forecasting/trends/TrendAnalysisDashboard';
+import ManualAdjustmentSystem from './components/forecasting/ManualAdjustmentSystem';
+import BuildForecastWorkspace from './components/forecasting/build/BuildForecastWorkspace';
+import ExceptionsWorkspace from './components/forecasting/exceptions/ExceptionsWorkspace';
+import AbsenteeismWorkspace from './components/forecasting/absenteeism/AbsenteeismWorkspace';
@@
-type RouteId = 'accuracy' | 'trends' | 'adjustments';
+type RouteId = 'build' | 'exceptions' | 'trends' | 'absenteeism' | 'accuracy' | 'adjustments';
@@
-const ROUTES: RouteConfig[] = [
-  {
-    id: 'accuracy',
-    path: '/accuracy',
-    label: 'Аналитика моделей',
-    icon: '🎯',
-    description: 'Сравнение алгоритмов и точность прогнозов',
-  },
-  {
-    id: 'trends',
-    path: '/trends',
-    label: 'Анализ трендов (3 графика)',
-    icon: '📈',
-    description: 'Наложение нескольких моделей на один график',
-  },
-  {
-    id: 'adjustments',
-    path: '/adjustments',
-    label: 'Ручные корректировки',
-    icon: '🔧',
-    description: 'Настройка прогноза и контроль отклонений',
-  },
-];
+const ROUTES: RouteConfig[] = [
+  {
+    id: 'build',
+    path: '/build',
+    label: 'Построить прогноз',
+    icon: '🛠️',
+    description: 'Выбор очередей, горизонтов и запуск расчёта',
+  },
+  {
+    id: 'exceptions',
+    path: '/exceptions',
+    label: 'Задать исключения',
+    icon: '🗓️',
+    description: 'Нетипичные периоды и шаблоны праздников',
+  },
+  {
+    id: 'trends',
+    path: '/trends',
+    label: 'Анализ трендов',
+    icon: '📈',
+    description: 'Стратегический, тактический и оперативный срезы',
+  },
+  {
+    id: 'absenteeism',
+    path: '/absenteeism',
+    label: 'Расчёт абсентеизма',
+    icon: '⏱️',
+    description: 'Профили отсутствий и применение шаблонов',
+  },
+  {
+    id: 'accuracy',
+    path: '/accuracy',
+    label: 'Аналитика моделей',
+    icon: '🎯',
+    description: 'Сравнение алгоритмов и точность прогноза',
+  },
+  {
+    id: 'adjustments',
+    path: '/adjustments',
+    label: 'Ручные корректировки',
+    icon: '🔧',
+    description: 'Управление отклонениями и статусами',
+  },
+];
@@
-const ROUTE_COMPONENTS: Record<RouteId, React.FC> = {
-  accuracy: AccuracyRoute,
-  trends: TrendsRoute,
-  adjustments: AdjustmentsRoute,
-};
+const ROUTE_COMPONENTS: Record<RouteId, React.FC> = {
+  build: BuildForecastWorkspace,
+  exceptions: ExceptionsWorkspace,
+  trends: TrendsRoute,
+  absenteeism: AbsenteeismWorkspace,
+  accuracy: AccuracyRoute,
+  adjustments: AdjustmentsRoute,
+};
```

#### 2. Update breadcrumb redirect & hero copy
**File:** `src/App.tsx`

```tsx
@@
-          <Route path="/" element={<Navigate to="/accuracy" replace />} />
+          <Route path="/" element={<Navigate to="/build" replace />} />
@@
-      <div className="border-b border-purple-200 bg-purple-50">
-        <div className="mx-auto px-4 py-2 text-sm text-purple-800 sm:px-6 lg:px-8">
-          <span className="font-medium">Текущий раздел:</span> {currentRoute.description}
-          <span className="mx-2">•</span>
-          <span>Интеграция Chart.js с наложением нескольких моделей</span>
-        </div>
-      </div>
+      <div className="border-b border-purple-200 bg-purple-50">
+        <div className="mx-auto px-4 py-2 text-sm text-purple-800 sm:px-6 lg:px-8">
+          <span className="font-medium">Текущий раздел:</span> {currentRoute.description}
+        </div>
+      </div>
```

*(No change needed in `src/main.tsx`; confirm BrowserRouter remains.)*

## Phase 2: Deterministic Fixtures & Data Wiring

### Overview
Create shared fixtures aligning with manual data, replace RNG in dashboards/services, and provide helpers for new workspaces.

### Changes Required

#### 1. Add fixtures module
**File:** `src/data/forecastingFixtures.ts` *(new)*

```ts
import { addHours, startOfDay } from 'date-fns';

export interface QueueNode {
  id: string;
  name: string;
  children?: QueueNode[];
}

export interface ForecastSeriesPoint {
  timestamp: string;
  forecast: number;
  actual?: number;
}

const baseStart = startOfDay(new Date(Date.UTC(2025, 9, 20)));

export const queueTree: QueueNode[] = [
  {
    id: 'contact-center',
    name: 'Контакт-центр 1010.ru',
    children: [
      { id: 'support', name: 'Отдел поддержки' },
      { id: 'sales', name: 'Активные продажи' },
      { id: 'back-office', name: 'Бэк-офис' },
    ],
  },
];

export const forecastSeries: ForecastSeriesPoint[] = Array.from({ length: 96 }, (_, index) => {
  const timestamp = addHours(baseStart, index);
  const hour = timestamp.getUTCHours();
  const base = hour >= 6 && hour <= 17 ? 150 : 90;
  const scheduleBump = hour === 12 || hour === 13 ? 20 : 0;
  const forecast = base + scheduleBump;
  const actual = index < 72 ? forecast + (index % 6 === 0 ? 10 : -5) : undefined;
  return {
    timestamp: timestamp.toISOString(),
    forecast,
    actual,
  };
});

export const buildForecastDefaults = {
  horizonDays: 90,
  buildPeriodStart: forecastSeries[0].timestamp,
  buildPeriodEnd: forecastSeries[forecastSeries.length - 1].timestamp,
  absenteeismProfileId: 'default-profile',
};

export const absenteeismProfiles = [
  {
    id: 'default-profile',
    label: 'Базовый профиль — будни 5%',
    coverage: 'ПН–ПТ, 09:00–18:00',
    valuePercent: 5,
  },
  {
    id: 'peak-season',
    label: 'Праздничный период (декабрь)',
    coverage: '01.12–15.01, 10%',
    valuePercent: 10,
  },
];

export const exceptionTemplates = [
  {
    id: 'new-year',
    label: 'Новогодние праздники',
    mode: 'periodic' as const,
    frequency: 'Ежегодно',
    period: '29.12–08.01',
    horizon: 'История 90 дней',
  },
  {
    id: 'march-8',
    label: '08 марта',
    mode: 'single' as const,
    frequency: 'Разово',
    period: '08.03 00:00–23:59',
    horizon: 'История 60 дней',
  },
];

export const validationSummary = {
  totalQueues: 3,
  lastBuild: '2025-10-18T05:00:00.000Z',
  lastAuthor: 'planner@1010.ru',
};
```

#### 2. Use fixtures inside AccuracyDashboard
**File:** `src/components/forecasting/AccuracyDashboard.tsx`

```tsx
@@
-import React, { useState, useMemo, useEffect } from 'react';
+import React, { useState, useMemo, useEffect } from 'react';
@@
-import { calculateAllMetrics } from '../../utils/accuracyCalculations';
-import { performTTest } from '../../utils/statisticalTests';
+import { calculateAllMetrics } from '../../utils/accuracyCalculations';
+import { performTTest } from '../../utils/statisticalTests';
+import { forecastSeries } from '../../data/forecastingFixtures';
@@
-  const currentMetrics = useMemo((): AccuracyMetricsType => {
-    const dataWithActuals = forecastData.filter(d => d.actual !== undefined);
+  const currentMetrics = useMemo((): AccuracyMetricsType => {
+    const dataWithActuals = forecastData.filter((d) => d.actual !== undefined);
@@
-    if (dataWithActuals.length === 0) {
-      // Mock data for demonstration
-      return {
-        mape: 12.4 + Math.random() * 5,
-        mae: 15.2 + Math.random() * 8,
-        rmse: 18.7 + Math.random() * 10,
-        rSquared: 0.85 + Math.random() * 0.1,
-        bias: -1.2 + Math.random() * 4,
-        confidenceInterval: {
-          lower: 8.5,
-          upper: 16.3,
-          level: 95
-        },
-        pValue: 0.023,
-        sampleSize: forecastData.length
-      };
-    }
+    if (dataWithActuals.length === 0) {
+      return {
+        mape: 11.8,
+        mae: 14.6,
+        rmse: 18.2,
+        rSquared: 0.89,
+        bias: -1.1,
+        confidenceInterval: {
+          lower: 9.2,
+          upper: 15.0,
+          level: 95,
+        },
+        pValue: 0.021,
+        sampleSize: forecastData.length,
+      };
+    }
@@
-  const algorithmComparisons = useMemo((): ModelComparisonType[] => {
-    const algorithms = [
-      { id: 'arima' as AlgorithmType, name: 'ARIMA модель' },
-      { id: 'basic_extrapolation' as AlgorithmType, name: 'Базовая экстраполяция' },
-      { id: 'linear_regression' as AlgorithmType, name: 'Линейная регрессия' },
-      { id: 'seasonal_naive' as AlgorithmType, name: 'Сезонная наивная' },
-      { id: 'exponential_smoothing' as AlgorithmType, name: 'Экспоненциальное сглаживание' }
-    ];
-
-    return algorithms.map((alg, index) => ({
-      algorithmId: alg.id,
-      algorithmName: alg.name,
-      metrics: {
-        mape: 8 + index * 3 + Math.random() * 5,
-        mae: 10 + index * 4 + Math.random() * 6,
-        rmse: 12 + index * 5 + Math.random() * 8,
-        rSquared: 0.95 - index * 0.05 + Math.random() * 0.05,
-        bias: -2 + Math.random() * 4,
-        confidenceInterval: {
-          lower: 6 + index * 2,
-          upper: 14 + index * 3,
-          level: 95
-        },
-        pValue: 0.01 + Math.random() * 0.04,
-        sampleSize: 1440
-      },
-      processingTime: 50 + index * 60 + Math.random() * 100,
-      lastUpdated: new Date(Date.now() - index * 3600000),
-      status: 'active' as const
-    }));
-  }, []);
+  const algorithmComparisons = useMemo((): ModelComparisonType[] => (
+    [
+      {
+        algorithmId: 'arima',
+        algorithmName: 'ARIMA модель',
+        metrics: { mape: 10.6, mae: 13.8, rmse: 17.9, rSquared: 0.91, bias: -0.8, confidenceInterval: { lower: 8.7, upper: 14.5, level: 95 }, pValue: 0.018, sampleSize: 1440 },
+        processingTime: 95,
+        lastUpdated: new Date('2025-10-20T05:00:00.000Z'),
+        status: 'active',
+      },
+      {
+        algorithmId: 'basic_extrapolation',
+        algorithmName: 'Базовая экстраполяция',
+        metrics: { mape: 14.2, mae: 18.1, rmse: 22.4, rSquared: 0.82, bias: -1.6, confidenceInterval: { lower: 11.0, upper: 21.5, level: 95 }, pValue: 0.034, sampleSize: 1440 },
+        processingTime: 42,
+        lastUpdated: new Date('2025-10-18T05:00:00.000Z'),
+        status: 'active',
+      },
+      {
+        algorithmId: 'exponential_smoothing',
+        algorithmName: 'Экспоненциальное сглаживание',
+        metrics: { mape: 12.9, mae: 16.0, rmse: 20.5, rSquared: 0.86, bias: -1.2, confidenceInterval: { lower: 9.6, upper: 18.4, level: 95 }, pValue: 0.026, sampleSize: 1440 },
+        processingTime: 58,
+        lastUpdated: new Date('2025-10-19T05:00:00.000Z'),
+        status: 'active',
+      },
+    ]
+  ), []);
@@
-  const dataWithActuals = useMemo<ForecastDataPoint[]>(() => {
-    if (forecastData.length) return forecastData;
-    return Array.from({ length: 168 }, (_, index) => ({
-      timestamp: new Date(Date.now() - (168 - index) * 60 * 60 * 1000).toISOString(),
-      predicted: 120 + Math.sin(index * 0.4) * 15,
-      actual: index < 144 ? 118 + Math.sin(index * 0.45) * 18 : undefined,
-    }));
-  }, [forecastData]);
+  const dataWithActuals = useMemo<ForecastDataPoint[]>(() => (
+    forecastData.length ? forecastData : forecastSeries.map(({ timestamp, forecast, actual }) => ({
+      timestamp,
+      predicted: forecast,
+      actual,
+    }))
+  ), [forecastData]);
```

#### 3. Use fixtures inside TrendAnalysisDashboard
**File:** `src/components/forecasting/trends/TrendAnalysisDashboard.tsx`

```tsx
@@
-import React, { useEffect, useMemo, useState } from 'react';
+import React, { useEffect, useMemo, useState } from 'react';
@@
-import { TrendDataPoint, TrendDashboardProps, AnomalyEvent } from '../../../types/trends';
+import { TrendDataPoint, TrendDashboardProps, AnomalyEvent } from '../../../types/trends';
 import { LineChart, BarChart } from '../../charts';
@@
-import {
-  buildForecastVsFactSeries,
-  buildSeasonalitySeries,
-  buildAnomalySeries,
-  buildTrendMetaSummary,
-} from '../../../adapters/forecasting';
+import {
+  buildForecastVsFactSeries,
+  buildSeasonalitySeries,
+  buildAnomalySeries,
+  buildTrendMetaSummary,
+} from '../../../adapters/forecasting';
+import { forecastSeries } from '../../../data/forecastingFixtures';
@@
-  useEffect(() => {
-    const generateSampleData = () => {
-      const now = new Date();
-      const data: TrendDataPoint[] = [];
-      const anomalySamples: AnomalyEvent[] = [];
-
-      for (let i = 168; i >= 0; i -= 1) {
-        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
-        const baseline = 160 + Math.sin(i * 0.12) * 25;
-        const seasonal = Math.sin(i * 0.5) * 18;
-        const noise = (Math.random() - 0.5) * 12;
-        const fact = Math.max(0, Math.round(baseline + seasonal + noise));
-        const forecast = Math.max(0, Math.round(baseline + seasonal + (Math.random() - 0.25) * 10));
-
-        data.push({
-          timestamp,
-          value: fact,
-          forecast,
-          trend: Math.round(baseline + seasonal),
-          seasonal,
-          residual: noise,
-        });
-
-        if (Math.abs(noise) > 9 && Math.random() > 0.8) {
-          anomalySamples.push({
-            timestamp,
-            value: fact,
-            expectedValue: forecast,
-            severity: Math.abs(noise) > 11 ? 'high' : 'medium',
-            type: noise > 0 ? 'spike' : 'drop',
-            explanation: 'Нестандартная нагрузка в очереди',
-            confidence: 0.8,
-            impact: 'negative',
-            actionRequired: true,
-          });
-        }
-      }
-
-      const seasonality = Array.from({ length: 24 }, (_, hour) => {
-        if (hour >= 9 && hour <= 18) {
-          return 110 + Math.sin((hour - 8) * Math.PI / 8) * 12;
-        }
-        return 80 - Math.cos(hour * Math.PI / 8) * 6;
-      });
-
-      setTrendData(data);
-      setSeasonalData(seasonality.map((value) => Math.round(value)));
-      setAnomalies(anomalySamples.slice(0, 6));
-    };
-
-    generateSampleData();
-    const interval = setInterval(generateSampleData, refreshInterval);
-    return () => clearInterval(interval);
-  }, [refreshInterval]);
+  useEffect(() => {
+    const data: TrendDataPoint[] = forecastSeries.map(({ timestamp, forecast, actual }) => ({
+      timestamp: new Date(timestamp),
+      value: actual ?? forecast,
+      forecast,
+      trend: forecast,
+      seasonal: forecast - 140,
+      residual: (actual ?? forecast) - forecast,
+    }));
+    setTrendData(data);
+    setSeasonalData(Array.from({ length: 24 }, (_, hour) => (hour >= 6 && hour <= 17 ? 115 : 80)));
+    setAnomalies([]);
+  }, []);
```

#### 4. Reuse fixtures in services
**File:** `src/services/forecastingApi.ts`

```ts
@@
-import { v4 as uuid } from 'uuid';
-// existing mock logic
+import { forecastSeries } from '../data/forecastingFixtures';
@@
-export async function validateAdjustments(payload: AdjustmentPayload[]): Promise<ValidationResult[]> {
-  return payload.map((item) => ({
-    id: item.id,
-    status: Math.abs(item.adjustment ?? 0) > 20 ? 'warning' : 'ok',
-    message:
-      Math.abs(item.adjustment ?? 0) > 20
-        ? 'Проверьте корректировку — превышение порога 20%'
-        : Math.random() > 0.7
-          ? 'Напоминание: профиль «Праздничный период» ещё не активирован'
-          : undefined,
-  }));
-}
+export async function validateAdjustments(payload: AdjustmentPayload[]): Promise<ValidationResult[]> {
+  return payload.map((item) => ({
+    id: item.id,
+    status: Math.abs(item.adjustment ?? 0) > 20 ? 'warning' : 'ok',
+    message: Math.abs(item.adjustment ?? 0) > 20 ? 'Проверьте корректировку — превышение порога 20%' : undefined,
+  }));
+}
@@
-export async function fetchForecastSeries(): Promise<Array<AdjustmentPayload & { requiredAgents: number }>> {
-  return Array.from({ length: 48 }, (_, index) => ({
-    id: `slot-${index}`,
-    timestamp: new Date(Date.now() + index * 60 * 60 * 1000).toISOString(),
-    predicted: 120 + Math.sin(index * 0.3) * 15,
-    adjustment: 0,
-    total: 120,
-    requiredAgents: 20 + Math.round(Math.sin(index * 0.2) * 5),
-  }));
-}
+export async function fetchForecastSeries(): Promise<Array<AdjustmentPayload & { requiredAgents: number }>> {
+  return forecastSeries.slice(0, 48).map((point, index) => ({
+    id: `slot-${index}`,
+    timestamp: point.timestamp,
+    predicted: point.forecast,
+    adjustment: 0,
+    total: point.actual ?? point.forecast,
+    requiredAgents: Math.round((point.forecast / 6) * 0.5),
+  }));
+}
```

## Phase 3: New Workspaces (Build, Exceptions, Absenteeism)

### Overview
Create three new React components rendering manual-aligned shells using fixtures.

### Changes Required

#### 1. Build Forecast workspace
**File:** `src/components/forecasting/build/BuildForecastWorkspace.tsx` *(new folder/file)*

```tsx
import React, { useMemo, useState } from 'react';
import { CalendarRange, PlayCircle, Upload, Download, ChevronRight } from 'lucide-react';
import { absenteeismProfiles, buildForecastDefaults, queueTree, validationSummary } from '../../../data/forecastingFixtures';

const flattenQueues = () => {
  const nodes: Array<{ id: string; label: string }> = [];
  queueTree.forEach((root) => {
    nodes.push({ id: root.id, label: root.name });
    root.children?.forEach((child) => nodes.push({ id: child.id, label: `${root.name} › ${child.name}` }));
  });
  return nodes;
};

const BuildForecastWorkspace: React.FC = () => {
  const queues = useMemo(flattenQueues, []);
  const [selected, setSelected] = useState<Set<string>>(new Set(['support']));
  const [profileId, setProfileId] = useState(buildForecastDefaults.absenteeismProfileId);

  const toggleQueue = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next.size ? next : prev;
    });
  };

  const profile = absenteeismProfiles.find((item) => item.id === profileId);

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Построить прогноз</h2>
        <p className="mt-2 text-sm text-gray-500">Шаги соответствуют §4.1 руководства: выберите точки структуры, период истории и профиль абсентеизма перед запуском.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">1. Очереди</h3>
            <p className="mt-1 text-xs text-gray-500">Структура «Рабочая структура» (§4.1, блок 1).</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {queues.map((node) => {
                const isActive = selected.has(node.id);
                return (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => toggleQueue(node.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                        isActive ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <span>{node.label}</span>
                      {isActive ? <ChevronRight className="h-4 w-4" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">2. Период и история</h3>
            <p className="mt-1 text-xs text-gray-500">Исторический горизонт и период построения (§4.1, блок 2).</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarRange className="h-4 w-4 text-purple-500" /> История
                </div>
                <p className="mt-2 text-xl font-semibold text-gray-900">{buildForecastDefaults.horizonDays} дней</p>
                <p className="text-xs text-gray-500">Автоматически подставляется для расчёта.</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarRange className="h-4 w-4 text-purple-500" /> Период построения
                </div>
                <p className="mt-2 text-sm text-gray-900">{new Date(buildForecastDefaults.buildPeriodStart).toLocaleDateString('ru-RU')} — {new Date(buildForecastDefaults.buildPeriodEnd).toLocaleDateString('ru-RU')}</p>
                <p className="text-xs text-gray-500">Редактирование появится после подключения API.</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">3. Абсентеизм</h3>
            <p className="mt-1 text-xs text-gray-500">Выберите профиль (§4.3, рис.29.9).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {absenteeismProfiles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProfileId(item.id)}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    profileId === item.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.coverage}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-600">{item.valuePercent}%</p>
                </button>
              ))}
            </div>
            {profile ? (
              <p className="mt-3 text-xs text-gray-500">Выбрано: {profile.label}. Значение применяется ко всем выбранным очередям на период построения.</p>
            ) : null}
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">4. Действия</h3>
            <p className="mt-1 text-xs text-gray-500">Кнопки соответствуют блоку (3) на рис.26.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-purple-700">
                <PlayCircle className="h-4 w-4" /> Построить прогноз
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200">
                <Upload className="h-4 w-4" /> Загрузить прогноз
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200">
                <Upload className="h-4 w-4" /> Загрузить факт
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200">
                <Download className="h-4 w-4" /> Экспорт отчёта
              </button>
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Последний запуск</h3>
            <dl className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-gray-500">Очереди</dt>
                <dd>{validationSummary.totalQueues}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Дата</dt>
                <dd>{new Date(validationSummary.lastBuild).toLocaleDateString('ru-RU')}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Запустил</dt>
                <dd>{validationSummary.lastAuthor}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-gray-500">Реальное сохранение появится после подключения API. Сейчас данные берутся из детерминированного фикстура.</p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default BuildForecastWorkspace;
```

#### 2. Exceptions workspace
**File:** `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx`

```tsx
import React, { useState } from 'react';
import { exceptionTemplates } from '../../../data/forecastingFixtures';

const ExceptionsWorkspace: React.FC = () => {
  const [mode, setMode] = useState<'day' | 'interval'>('day');

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Задать исключения</h2>
        <p className="mt-2 text-sm text-gray-500">Повторяет шаги из §4.1: настройка празничных и разовых исключений.</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('day')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${mode === 'day' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            День
          </button>
          <button
            type="button"
            onClick={() => setMode('interval')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${mode === 'interval' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Интервал
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">Режим определяется требованиями §4.1 (рис.26.3). Интерфейс поддерживает выбор либо конкретных дат, либо повторяющихся интервалов.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {exceptionTemplates.map((template) => (
            <article key={template.id} className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">{template.label}</h3>
              <dl className="mt-2 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <dt>Тип</dt>
                  <dd>{template.mode === 'periodic' ? 'Периодический' : 'Разовый'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Период</dt>
                  <dd>{template.period}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Частота</dt>
                  <dd>{template.frequency}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>История</dt>
                  <dd>{template.horizon}</dd>
                </div>
              </dl>
              <button type="button" className="mt-4 w-full rounded-lg border border-purple-500 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                Добавить в расчёт
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Контроль перед запуском</h3>
        <p className="mt-2 text-xs text-gray-500">Перед нажатием «Построить» система проверит конфликты и предложит подтвердить исключения (§4.1, шаг «Проверить установленные правила»).</p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
          Построить c исключениями
        </button>
      </div>
    </section>
  );
};

export default ExceptionsWorkspace;
```

#### 3. Absenteeism workspace
**File:** `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`

```tsx
import React from 'react';
import { absenteeismProfiles } from '../../../data/forecastingFixtures';

const AbsenteeismWorkspace: React.FC = () => (
  <section className="space-y-6">
    <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Расчёт абсентеизма</h2>
      <p className="mt-2 text-sm text-gray-500">Работа с шаблонами (§4.3) — коэффициенты применяются к выбранным очередям.</p>
    </header>

    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left font-medium text-gray-600">Профиль</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Покрытие</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Значение</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Действия</th>
          </tr>
        </thead>
        <tbody>
          {absenteeismProfiles.map((profile) => (
            <tr key={profile.id} className="border-b border-gray-200">
              <td className="px-3 py-3 font-medium text-gray-900">{profile.label}</td>
              <td className="px-3 py-3 text-gray-600">{profile.coverage}</td>
              <td className="px-3 py-3 text-gray-600">{profile.valuePercent}%</td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-lg border border-purple-500 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">Применить</button>
                  <button type="button" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-purple-200">Скачать</button>
                  <button type="button" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-purple-200">Редактировать</button>
                  <button type="button" className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50">Удалить</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-gray-500">Таблица соответствует рис.29.9/29.10: действия пока показывают заглушки, реальное сохранение появится при интеграции API.</p>
    </article>
  </section>
);

export default AbsenteeismWorkspace;
```

## Phase 4: Smoke, Deploy & Documentation

### Overview
Extend smoke routes for new pages, then update UAT artifacts and system docs after execution.

### Changes Required

#### 1. Expand smoke routes
**File:** `scripts/smoke-routes.mjs`

```js
@@
-const routes = [
-  {
-    path: '/accuracy',
-    expectSelector: 'text=Аналитика моделей',
-    screenshot: 'playwright-forecasting-accuracy.png',
-  },
-  {
-    path: '/trends',
-    expectSelector: 'text=Анализ трендов',
-    screenshot: 'playwright-forecasting-trend.png',
-  },
-  {
-    path: '/adjustments',
-    expectSelector: 'text=Ручные корректировки',
-    screenshot: 'playwright-forecasting-adjustments.png',
-  },
-];
+const routes = [
+  {
+    path: '/build',
+    expectSelector: 'text=Построить прогноз',
+    screenshot: 'playwright-forecasting-build.png',
+  },
+  {
+    path: '/exceptions',
+    expectSelector: 'text=Задать исключения',
+    screenshot: 'playwright-forecasting-exceptions.png',
+  },
+  {
+    path: '/trends',
+    expectSelector: 'text=Анализ трендов',
+    screenshot: 'playwright-forecasting-trend.png',
+  },
+  {
+    path: '/absenteeism',
+    expectSelector: 'text=Расчёт абсентеизма',
+    screenshot: 'playwright-forecasting-absenteeism.png',
+  },
+  {
+    path: '/adjustments',
+    expectSelector: 'text=Ручные корректировки',
+    screenshot: 'playwright-forecasting-adjustments.png',
+  },
+  {
+    path: '/accuracy',
+    expectSelector: 'text=Аналитика моделей',
+    screenshot: 'playwright-forecasting-accuracy.png',
+  },
+];
```

*(Ensure screenshots saved in `test-results/`.)*

#### 2. UAT pack & crosswalk updates
- **File:** `uat-agent-tasks/2025-10-26_forecasting-uat.md`
  - Replace the checks table via Python to add Build/Exceptions/Absenteeism rows.

```sh
python - <<'PY'
from pathlib import Path
path = Path('uat-agent-tasks/2025-10-26_forecasting-uat.md')
text = path.read_text(encoding='utf-8')
table = """| Check | Pass/Fail | Notes | Screenshot |
| --- | --- | --- | --- |
| FA‑0 build forecast queues + absenteeism toggle |  |  |  |
| FA‑1 exceptions templates apply |  |  |  |
| FA‑2 trends confidence band + legend |  |  |  |
| FA‑3 adjustments badges + undo/redo |  |  |  |
| FA‑4 accuracy KPI + error analysis |  |  |  |"""
path.write_text(text.split('| Check |')[0] + table + "\n\n" + "\n".join(text.split('\n\n', 1)[1]), encoding='utf-8')
PY
```

- **File:** `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`
  - Append new rows for `/build`, `/exceptions`, `/absenteeism` using Python append helper.

```sh
python - <<'PY'
from pathlib import Path
path = Path('uat-agent-tasks/manual_forecasting-analytics-crosswalk.md')
lines = path.read_text(encoding='utf-8').splitlines()
insert_at = next(i for i, line in enumerate(lines) if line.strip().startswith('| Manual section(s)')) + 2
rows = [
    "| Запустить построение прогноза | `/build` — карточки «1. Очереди», «2. Период` (`src/components/forecasting/build/BuildForecastWorkspace.tsx`) | **CH4 §4.1** (рис.26) | Скриншот `playwright-forecasting-build.png`. |",
    "| Настроить исключения | `/exceptions` — вкладки «День/Интервал» (`src/components/forecasting/exceptions/ExceptionsWorkspace.tsx`) | **CH4 §4.1** (рис.26.3) | Сравните с реальным модулем. |",
    "| Управлять профилями абсентеизма | `/absenteeism` — таблица профилей (`src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`) | **CH4 §4.3** (рис.29.9–29.10) | Скриншот `playwright-forecasting-absenteeism.png`. |",
]
lines[insert_at:insert_at] = rows
path.write_text("\n".join(lines) + "\n", encoding='utf-8')
PY
```

- **File:** `docs/Tasks/uat-packs/parity_static.md`
  - Use Python to add forecast bullets under the Forecasting section.

```sh
python - <<'PY'
from pathlib import Path
path = Path('docs/Tasks/uat-packs/parity_static.md')
text = path.read_text(encoding='utf-8')
anchor = '### Forecasting & Analytics\n'
before, after = text.split(anchor, 1)
bullets = """### Forecasting & Analytics
  - Build Forecast — очередь выбирается, период отображается (`/build`, §4.1)
  - Исключения — режимы «День/Интервал» и шаблоны (`/exceptions`, §4.1)
  - Профили абсентеизма — таблица и действия (`/absenteeism`, §4.3)
  - Validation badges flag ±20% overrides — Present
"""
path.write_text(before + bullets + "\n" + "\n".join(after.split('\n', 1)[1]), encoding='utf-8')
PY
```

#### 3. System docs & tracker
- Update system docs using targeted Python snippets to avoid manual editing.

```sh
# WRAPPER_ADOPTION_MATRIX row update
python - <<'PY'
from pathlib import Path
path = Path('docs/System/WRAPPER_ADOPTION_MATRIX.md')
text = path.read_text(encoding='utf-8')
old = 'Prod: https://forecasting-analytics-cv3t45r52-granins-projects.vercel.app | Run `parity_static` + `chart_visual_spec` on new deploy; wire manual adjustments to live API validation |'
new = 'Prod: <new-prod-url> | Step 6 UAT Pass — Build/Exceptions/Absenteeism фикстуры (`src/data/forecastingFixtures.ts`); API интеграция в работе |'
path.write_text(text.replace(old, new), encoding='utf-8')
PY

# PARITY_MVP_CHECKLISTS note
python - <<'PY'
from pathlib import Path
path = Path('docs/System/PARITY_MVP_CHECKLISTS.md')
text = path.read_text(encoding='utf-8')
needle = 'Manual adjustments now call API wrapper; connect to real backend validation/persist pipeline before sign-off.'
replacement = needle + '\n- Build/Exceptions/Absenteeism маршруты используют фикстуры; подключить реальный API перед финальной сдачей.'
if needle in text:
    path.write_text(text.replace(needle, replacement), encoding='utf-8')
PY

# learning-log entry
python - <<'PY'
from pathlib import Path
path = Path('docs/System/learning-log.md')
path.write_text(path.read_text(encoding='utf-8') + '\n- **Finding:** Добавлены `forecastingFixtures.ts` и маршруты `/build`, `/exceptions`, `/absenteeism`; UAT покрывает §4.1–4.3 без RNG.\n', encoding='utf-8')
PY

# CodeMap components/data sections
python - <<'PY'
from pathlib import Path
path = Path('docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md')
text = path.read_text(encoding='utf-8')
text = text.replace('`src/components/forecasting/ManualAdjustmentSystem.tsx`', '`src/components/forecasting/ManualAdjustmentSystem.tsx`, `src/components/forecasting/build/BuildForecastWorkspace.tsx`, `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx`, `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`')
if 'Data |' not in text:
    text += '\nData | `src/data/forecastingFixtures.ts` — детерминированные серии для UAT\n'
path.write_text(text, encoding='utf-8')
PY

# Tracker row
python - <<'PY'
from pathlib import Path
path = Path('docs/Tasks/post-phase9-demo-execution.md')
text = path.read_text(encoding='utf-8')
old_row = '| Forecasting & Analytics | `${FORECASTING_ANALYTICS_REPO}` | Executor | Agent_Codex | In Progress – wrappers migrated | https://forecasting-analytics-cv3t45r52-granins-projects.vercel.app | Prod redeployed 2025-10-25; run parity_static + chart_visual_spec and connect adjustments to live API validation |'
new_row = '| Forecasting & Analytics | `${FORECASTING_ANALYTICS_REPO}` | Executor | Agent_Codex | Completed – UAT Pass | <new-prod-url> | Step 6 UAT: build/exceptions/absenteeism/trends/accuracy/adjustments; API подключение остаётся задачей |'
path.write_text(text.replace(old_row, new_row), encoding='utf-8')
PY
```

- **Files:** `docs/SESSION_HANDOFF.md`, `PROGRESS.md`
  - Executor documents final tests + deploy URL per standard handoff.

## Tests & Validation
1. `npm install` (if dependency graph changes)
2. `npm run test:run`
3. `npm run build`
4. `npm run smoke:routes`
5. Manual browser check across `/build`, `/exceptions`, `/trends`, `/absenteeism`, `/accuracy`, `/adjustments`
6. Deploy: `npx vercel deploy --prod --yes`
7. Run Step 6 UAT using updated packs; capture screenshots listed above and attach to UAT doc.

## Rollback
- If execution fails before commit: `git restore .` and `git clean -fd` to remove new directories (`src/components/forecasting/{build,exceptions,absenteeism}`, `src/data/forecastingFixtures.ts`).
- After commit: `git revert <commit>`.
- If prod deploy fails, run `vercel rollback` to previous deployment ID.

## Handoff
- During execution, set `PROGRESS.md` Active Plan to this plan and log progress.
- After completion, update `docs/SESSION_HANDOFF.md` with tests, deploy URL, outstanding API integration notes.
- Ensure tracker/docs listed above are in sync before closing the plan.
