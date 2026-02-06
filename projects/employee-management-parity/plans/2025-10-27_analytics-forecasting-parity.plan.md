## Metadata
- Task: Analytics Dashboard — Forecasting Parity Upgrade
- Author: analytics-dashboard-planner-2025-10-27-codex
- Date: 2025-10-27
- Repo: ${ANALYTICS_REPO}
- Based on: docs/Tasks/analytics-dashboard_parity-scout-2025-10-26-codex.task.md, /Users/m/Desktop/e.tex, docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md, docs/Workspace/Coordinator/analytics-dashboard/Subtask_Analytics_Agent_TBD_2025-10-13.md

## Desired End State
- Forecasting module mirrors the real Naumen flow at a demo level: users can choose an organisation, pick historical horizon/projection window, trigger a mock build, inspect confidence bands, and download a CSV snapshot.
- Advanced analytics screen supports manual trend adjustments (smooth, target nudge, reset) with persisted state during the session and visual confidence shading.
- Dedicated absenteeism panel surfaces absenteeism KPIs and a stacked area chart sourced from deterministic mocks.
- Reports section lists key reports (T‑13, punctuality, deviations) with download stubs and inline status badges.
- Organisation selector sits in the hero header, propagating to build/analytics/reports views.
- Tests: unit coverage for forecasting adapters + adjustment reducer, new Storybook stories for forecasting and absenteeism, Playwright slice validating build → adjustments → export happy path. `npm run ci` passes.
- Docs (`CodeMap`, Findings, System reports) note the new flows and artefacts; SESSION_HANDOFF includes deploy + UAT pack updates.

### Key Discoveries
- Mock data is regenerated every render and lacks forecast semantics (`${ANALYTICS_REPO}/src/data/mock.ts:18-194`).
- App shell renders a single analytics view with no forecast routes or organisation context (`${ANALYTICS_REPO}/src/App.tsx:7-36`).
- Advanced analytics chart is static; LineChart wrapper has no hooks for adjustments or confidence bands (`${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:10-68`, `${ANALYTICS_REPO}/src/components/charts/LineChart.tsx:33-169`).
- Reports/export functionality is absent (scout search confirmed no CSV stubs) while real system exposes reports (CH6 / `/Users/m/Desktop/e.tex`).
- Absenteeism analytics called out in real comparison are missing from the demo (same files as above).

## What We're NOT Doing
- No real API wiring or persistence beyond in-memory mocks.
- No attempt to rebuild the unified shell or schedule modules.
- No additional chart libraries; stay on existing Chart.js wrappers.
- No backend deploy changes beyond Vercel redeploy.
- No localisation sweep beyond new strings introduced here (ensure RU labels out of the gate).

## Implementation Approach
Extend the current single-page dashboard into a light module switcher. Reuse existing wrapper components while layering form state, reducers, and deterministic mocks to emulate the real forecasting, adjustment, and reporting behaviour. Keep data generation deterministic so Playwright tests and CSV output remain stable. Use context to flow the selected organisation across panels. Introduce minimal new modules (`features/forecasting`, `features/reports`, `state/organization`) and update styles to support form layouts. Validate via existing ci pipeline plus new story/e2e slices, then refresh coordinator docs and UAT packs.

## Phase 1: Forecast Build Flow

### Overview
Create deterministic mocks, a forecast build service, and a new ForecastBuilder section with form controls and results.

### Changes Required:

#### 1. Extend dashboard mocks with forecast + absenteeism seeds
**File**: `src/data/mock.ts`
**Changes**: Add deterministic pseudo-data for forecasts (historical demand, forecast projections, confidence bands) and absenteeism KPIs; export helper functions consumed by new features.
```diff
@@
 export interface DashboardData {
   generatedAt: string;
   kpi: KpiCard[];
   callVolumeSeries: LineSeries[];
   departmentRows: ReportTableRow[];
   heatmap: HeatmapPoint[];
   radar: RadarSeries[];
   trend: {
     series: LineSeries[];
     targets: TargetLine[];
+    confidence?: ConfidenceBand;
   };
 }
+
+export interface ConfidenceBand {
+  lower: LineSeries;
+  upper: LineSeries;
+}
+
+export interface ForecastBuildResult {
+  organisation: string;
+  horizonWeeks: number;
+  projectionWeeks: number;
+  generatedAt: string;
+  actual: LineSeries;
+  forecast: LineSeries;
+  confidence: ConfidenceBand;
+  table: ReportTableRow[];
+}
+
+export interface AbsenteeismSnapshot {
+  organisation: string;
+  observed: LineSeries;
+  forecast: LineSeries;
+  deltaPercent: number;
+  reasonBreakdown: ReportTableRow[];
+}
@@
-const randomBetween = (min: number, max: number): number => Number((Math.random() * (max - min) + min).toFixed(1));
+const seededRandom = (seed: number) => () => {
+  const x = Math.sin(seed++) * 10000;
+  return x - Math.floor(x);
+};
+
+const randomBetween = (seedFn: () => number, min: number, max: number): number =>
+  Number((seedFn() * (max - min) + min).toFixed(1));
@@
-const buildHeatmap = (): HeatmapPoint[] => {
+const buildHeatmap = (seedFn: () => number): HeatmapPoint[] => {
@@
-const buildLineSeries = (): LineSeries[] => {
+const buildLineSeries = (seedFn: () => number): LineSeries[] => {
@@
-        value: Math.round(Math.random() * 200 + 50),
+        value: Math.round(seedFn() * 200 + 50),
@@
-const buildKpiCards = (): KpiCard[] => [
+const buildKpiCards = (seedFn: () => number): KpiCard[] => [
@@
-const buildDepartmentRows = (): ReportTableRow[] =>
+const buildDepartmentRows = (seedFn: () => number): ReportTableRow[] =>
@@
-const buildTrend = (): { series: LineSeries[]; targets: TargetLine[] } => {
+const buildTrend = (seedFn: () => number): { series: LineSeries[]; targets: TargetLine[]; confidence: ConfidenceBand } => {
@@
-  const serviceLevel = [91, 93, 89, 94, 96, 94];
-  const satisfaction = [4.2, 4.3, 4.1, 4.5, 4.7, 4.6];
-  const efficiency = [78, 82, 85, 87, 89, 91];
+  const serviceLevel = [91, 93, 89, 94, 96, 94];
+  const satisfaction = [4.2, 4.3, 4.1, 4.5, 4.7, 4.6];
+  const efficiency = [78, 82, 85, 87, 89, 91];
+
+  const confidence: ConfidenceBand = {
+    lower: {
+      id: 'service-level-lower',
+      label: 'SL нижняя граница',
+      unit: 'percent',
+      axis: 'primary',
+      color: '#bfdbfe',
+      area: true,
+      points: months.map((timestamp, index) => ({ timestamp, value: serviceLevel[index] - 3 })),
+    },
+    upper: {
+      id: 'service-level-upper',
+      label: 'SL верхняя граница',
+      unit: 'percent',
+      axis: 'primary',
+      color: '#bfdbfe',
+      area: true,
+      points: months.map((timestamp, index) => ({ timestamp, value: serviceLevel[index] + 3 })),
+    },
+  };
@@
-  const targets: TargetLine[] = [
+  const targets: TargetLine[] = [
@@
-  return { series, targets };
+  return { series, targets, confidence };
 };
 
-export const generateDashboardData = (): DashboardData => ({
-  generatedAt: new Date().toISOString(),
-  kpi: buildKpiCards(),
-  callVolumeSeries: buildLineSeries(),
-  departmentRows: buildDepartmentRows(),
-  heatmap: buildHeatmap(),
-  radar: buildRadar(),
-  trend: buildTrend(),
-});
+export const generateDashboardData = (seed = 42): DashboardData => {
+  const random = seededRandom(seed);
+  return {
+    generatedAt: new Date().toISOString(),
+    kpi: buildKpiCards(random),
+    callVolumeSeries: buildLineSeries(random),
+    departmentRows: buildDepartmentRows(random),
+    heatmap: buildHeatmap(random),
+    radar: buildRadar(),
+    trend: buildTrend(random),
+  };
+};
+
+export const generateForecastBuild = (organisation: string, horizonWeeks: number, projectionWeeks: number): ForecastBuildResult => {
+  const random = seededRandom(organisation.length + horizonWeeks + projectionWeeks);
+  const now = new Date();
+  const timestamps = Array.from({ length: horizonWeeks + projectionWeeks }, (_, index) => {
+    const dt = new Date(now);
+    dt.setDate(dt.getDate() - (horizonWeeks + projectionWeeks - index - 1) * 7);
+    return dt.toISOString();
+  });
+  const actualPoints = timestamps.slice(0, horizonWeeks).map((timestamp) => ({
+    timestamp,
+    value: Math.round(random() * 180 + 120),
+  }));
+  const forecastPoints = timestamps.slice(horizonWeeks - 1).map((timestamp, index) => ({
+    timestamp,
+    value: Math.round((actualPoints.at(-1)?.value ?? 160) + index * random() * 4),
+  }));
+  const confidence: ConfidenceBand = {
+    lower: {
+      id: 'forecast-lower',
+      label: 'Нижняя граница',
+      color: '#bfdbfe',
+      axis: 'primary',
+      area: true,
+      unit: 'count',
+      points: forecastPoints.map((point) => ({ timestamp: point.timestamp, value: point.value * 0.92 })),
+    },
+    upper: {
+      id: 'forecast-upper',
+      label: 'Верхняя граница',
+      color: '#bfdbfe',
+      axis: 'primary',
+      area: true,
+      unit: 'count',
+      points: forecastPoints.map((point) => ({ timestamp: point.timestamp, value: point.value * 1.08 })),
+    },
+  };
+
+  const table: ReportTableRow[] = forecastPoints.map((point) => ({
+    period: new Date(point.timestamp).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
+    forecast: point.value,
+    target: Math.round(point.value * 0.97),
+    delta: Math.round(point.value - (actualPoints.at(-1)?.value ?? 0)),
+  }));
+
+  return {
+    organisation,
+    horizonWeeks,
+    projectionWeeks,
+    generatedAt: new Date().toISOString(),
+    actual: {
+      id: 'history',
+      label: 'История',
+      unit: 'count',
+      axis: 'primary',
+      points: actualPoints,
+      color: '#3b82f6',
+    },
+    forecast: {
+      id: 'projection',
+      label: 'Прогноз',
+      unit: 'count',
+      axis: 'primary',
+      points: forecastPoints,
+      color: '#22c55e',
+    },
+    confidence,
+    table,
+  };
+};
+
+export const generateAbsenteeismSnapshot = (organisation: string): AbsenteeismSnapshot => {
+  const random = seededRandom(organisation.length * 13);
+  const base = Array.from({ length: 12 }, (_, index) => {
+    const dt = new Date();
+    dt.setMonth(dt.getMonth() - (11 - index));
+    dt.setDate(1);
+    dt.setHours(0, 0, 0, 0);
+    return dt.toISOString();
+  });
+
+  const observed = base.map((timestamp) => ({ timestamp, value: Math.round(random() * 12 + 8) }));
+  const forecast = base.map((timestamp) => ({ timestamp, value: Math.round(random() * 11 + 7) }));
+
+  const reasonBreakdown: ReportTableRow[] = [
+    { reason: 'Болезнь', share: `${Math.round(random() * 40 + 35)}%` },
+    { reason: 'Опоздания', share: `${Math.round(random() * 20 + 15)}%` },
+    { reason: 'Отпуск', share: `${Math.round(random() * 15 + 10)}%` },
+    { reason: 'Учеба/тренинги', share: `${Math.round(random() * 10 + 5)}%` },
+  ];
+
+  const observedSeries: LineSeries = {
+    id: 'absenteeism-observed',
+    label: 'Фактическая текучесть',
+    unit: 'percent',
+    axis: 'primary',
+    color: '#f97316',
+    points: observed,
+  };
+
+  const forecastSeries: LineSeries = {
+    id: 'absenteeism-forecast',
+    label: 'Прогноз текучести',
+    unit: 'percent',
+    axis: 'primary',
+    color: '#8b5cf6',
+    points: forecast,
+  };
+
+  return {
+    organisation,
+    observed: observedSeries,
+    forecast: forecastSeries,
+    deltaPercent: Number((((forecast.at(-1)?.value ?? 0) - (observed.at(-1)?.value ?? 0)) / (observed.at(-1)?.value ?? 1) * 100).toFixed(1)),
+    reasonBreakdown,
+  };
+};
```

#### 2. Add forecast service wrapper
**File**: `src/services/forecasting.ts` (new)
**Changes**: Provide async helpers that wrap the deterministic generators so UI code can await builds and mimic network latency.
```bash
cat <<'EOF' > src/services/forecasting.ts
import { generateForecastBuild, generateAbsenteeismSnapshot, type ForecastBuildResult, type AbsenteeismSnapshot } from '../data/mock';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const runForecastBuild = async (
  organisation: string,
  horizonWeeks: number,
  projectionWeeks: number,
): Promise<ForecastBuildResult> => {
  await delay(400);
  return generateForecastBuild(organisation, horizonWeeks, projectionWeeks);
};

export const loadAbsenteeismSnapshot = async (organisation: string): Promise<AbsenteeismSnapshot> => {
  await delay(200);
  return generateAbsenteeismSnapshot(organisation);
};
EOF
```

#### 3. Introduce ForecastBuilder feature
**File**: `src/features/forecasting/ForecastBuilder.tsx` (new)
**Changes**: Form + result panels leveraging LineChart and ReportTable.
```bash
mkdir -p src/features/forecasting
cat <<'EOF' > src/features/forecasting/ForecastBuilder.tsx
import { useMemo, useReducer, useState } from 'react';
import { LineChart, ReportTable } from '../../components/charts';
import type { ForecastBuildResult } from '../../data/mock';
import { runForecastBuild } from '../../services/forecasting';

interface ForecastBuilderProps {
  organisation: string;
}

interface FormState {
  horizonWeeks: number;
  projectionWeeks: number;
}

type Action = { type: 'setHorizon'; value: number } | { type: 'setProjection'; value: number } | { type: 'reset' };

const initialState: FormState = {
  horizonWeeks: 8,
  projectionWeeks: 8,
};

const reducer = (state: FormState, action: Action): FormState => {
  switch (action.type) {
    case 'setHorizon':
      return { ...state, horizonWeeks: action.value };
    case 'setProjection':
      return { ...state, projectionWeeks: action.value };
    case 'reset':
      return initialState;
    default:
      return state;
  }
};

export const ForecastBuilder = ({ organisation }: ForecastBuilderProps) => {
  const [form, dispatch] = useReducer(reducer, initialState);
  const [result, setResult] = useState<ForecastBuildResult | null>(null);
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const build = await runForecastBuild(organisation, form.horizonWeeks, form.projectionWeeks);
      setResult(build);
    } finally {
      setLoading(false);
    }
  };

  const chartSeries = useMemo(() => {
    if (!result) return [];
    const { actual, forecast, confidence } = result;
    return [confidence.lower, confidence.upper, actual, forecast];
  }, [result]);

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Построение прогноза</h2>
          <span>Выберите горизонт истории и построения — результат появится на графике.</span>
        </div>
        <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'reset' })}>
          Сбросить
        </button>
      </header>

      <form className="forecast-form" onSubmit={handleSubmit}>
        <label className="forecast-form__field">
          <span>История (недель)</span>
          <input
            type="number"
            min={4}
            max={24}
            step={1}
            value={form.horizonWeeks}
            onChange={(event) => dispatch({ type: 'setHorizon', value: Number(event.target.value) })}
          />
        </label>
        <label className="forecast-form__field">
          <span>Прогноз (недель)</span>
          <input
            type="number"
            min={4}
            max={24}
            step={1}
            value={form.projectionWeeks}
            onChange={(event) => dispatch({ type: 'setProjection', value: Number(event.target.value) })}
          />
        </label>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Строим…' : 'Построить прогноз'}
        </button>
      </form>

      {result ? (
        <div className="panel__full">
          <LineChart
            series={chartSeries}
            ariaTitle="Прогноз спроса"
            ariaDescription="История, прогноз и доверительный интервал по неделям"
            timeUnit="day"
            clamp={{ min: 0 }}
          />
          <ReportTable
            ariaTitle="Результаты прогноза"
            ariaDescription="Сравнение прогнозных значений с целевыми показателями"
            columns={[
              { id: 'period', label: 'Период' },
              { id: 'forecast', label: 'Прогноз' },
              { id: 'target', label: 'Цель' },
              { id: 'delta', label: 'Δ' },
            ]}
            rows={result.table}
          />
        </div>
      ) : (
        <p className="forecast-placeholder">Постройте прогноз, чтобы увидеть график и таблицу.</p>
      )}
    </section>
  );
};

export default ForecastBuilder;
EOF
```

#### 4. Style forecasting form + buttons
**File**: `src/styles/index.css`
**Changes**: Add reusable button / form layout styles referenced above.
```diff
@@
 .panel__full .chart-container {
   height: clamp(300px, 40vw, 420px);
 }
 
 @media (max-width: 768px) {
   .panel__full .chart-container {
     height: clamp(240px, 55vw, 360px);
   }
 }
+
+.btn {
+  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
+  border: none;
+  border-radius: 12px;
+  color: #fff;
+  padding: 10px 20px;
+  font-size: 14px;
+  font-weight: 600;
+  cursor: pointer;
+  transition: opacity 0.2s ease;
+}
+
+.btn:disabled {
+  opacity: 0.6;
+  cursor: not-allowed;
+}
+
+.btn--ghost {
+  background: transparent;
+  color: #2563eb;
+  border: 1px solid rgba(37, 99, 235, 0.3);
+}
+
+.forecast-form {
+  display: flex;
+  gap: 16px;
+  flex-wrap: wrap;
+  align-items: flex-end;
+}
+
+.forecast-form__field {
+  display: flex;
+  flex-direction: column;
+  gap: 6px;
+  font-size: 14px;
+  color: #475569;
+}
+
+.forecast-form__field input {
+  border-radius: 10px;
+  border: 1px solid rgba(148, 163, 184, 0.5);
+  padding: 10px 14px;
+  font-size: 16px;
+  width: 140px;
+}
+
+.forecast-placeholder {
+  margin: 0;
+  font-size: 15px;
+  color: #64748b;
+}
```

## Phase 2: Trend Adjustments & Confidence Bands

### Overview
Allow analysts to toggle smoothing, nudge targets, and display confidence shading on the Advanced Analytics line chart.

### Changes Required:

#### 1. Enhance LineChart wrapper
**File**: `src/components/charts/LineChart.tsx`
**Changes**: Accept confidence band and toolbar hook; ensure area datasets render without legend clutter.
```diff
@@
-export interface LineSeries {
+export interface LineSeries {
@@
-  area?: boolean;
+  area?: boolean;
   axis?: 'primary' | 'secondary';
+  hiddenInLegend?: boolean;
 }
@@
-export interface LineChartProps {
+export interface LineChartProps {
   series: LineSeries[];
   ariaTitle: string;
   ariaDescription: string;
   timeUnit?: 'hour' | 'day' | 'month';
   clamp?: { min?: number; max?: number };
   targets?: TargetLine[];
   secondaryAxis?: {
@@
-const FALLBACK_COLORS = ['#2563eb', '#16a34a', '#f97316', '#a855f7'];
+  confidenceBand?: {
+    lower: LineSeries;
+    upper: LineSeries;
+  };
+  toolbar?: React.ReactNode;
+}
+
+const FALLBACK_COLORS = ['#2563eb', '#16a34a', '#f97316', '#a855f7'];
@@
-    const datasets = series.map((entry, index) => {
+    const baseSeries = confidenceBand ? [confidenceBand.lower, confidenceBand.upper, ...series] : series;
+    const datasets = baseSeries.map((entry, index) => {
       const color = entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
       const axisId = entry.axis === 'secondary' ? secondaryAxisId : 'y';
       return {
         label: entry.label,
         data: entry.points.map((point) => ({
@@
-        fill: entry.area ?? false,
-        pointRadius: 3,
+        fill: entry.area ?? false,
+        pointRadius: entry.area ? 0 : 3,
         yAxisID: axisId,
+        borderWidth: entry.area ? 0 : 2,
+        hidden: entry.hiddenInLegend ?? false,
       };
     });
@@
-    return {
-      datasets: [...datasets, ...targetDatasets],
-    };
-  }, [labels, secondaryAxisId, series, targets]);
+    return {
+      datasets: [...datasets, ...targetDatasets],
+    };
+  }, [confidenceBand, labels, secondaryAxisId, series, targets]);
@@
-      ...series.map((entry, index) => ({
+      ...(confidenceBand
+        ? [confidenceBand.lower, confidenceBand.upper]
+        : []
+      ).map((entry) => ({
+        label: entry.label,
+        color: entry.color ?? '#bfdbfe',
+        axis: entry.axis ?? 'primary',
+        hidden: entry.hiddenInLegend ?? true,
+      })),
+      ...series.map((entry, index) => ({
         label: entry.label,
         color: entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
         axis: entry.axis ?? 'primary',
       })),
@@
-    <figure aria-label={ariaTitle} aria-description={ariaDescription} className="chart-container">
+    <figure aria-label={ariaTitle} aria-description={ariaDescription} className="chart-container">
+      {toolbar ? <div className="chart-toolbar">{toolbar}</div> : null}
       <Line data={data} options={options} datasetIdKey="id" />
       {legendItems.length ? (
         <figcaption className="chart-legend" data-testid="chart-legend" aria-hidden>
           {legendItems.map((item, idx) => (
             <span
               key={`${item.label}-${idx}`}
               className="chart-legend__item"
               data-testid={`legend-item-${slugify(item.label)}`}
-              data-axis={item.axis}
+              data-axis={item.axis}
+              data-hidden={item.hidden ? 'true' : 'false'}
             >
               <span
                 className="chart-legend__swatch"
                 style={{ backgroundColor: item.color }}
                 aria-hidden
@@
 export default LineChart;
```

#### 2. Surface adjustments in AdvancedAnalytics
**File**: `src/features/analytics/AdvancedAnalytics.tsx`
**Changes**: Introduce reducer for smoothing/target adjustments and pass confidence band to LineChart.
```diff
-import { DoughnutGauge, HeatmapChart, LineChart, RadarChart } from '../../components/charts';
+import { useMemo, useReducer } from 'react';
+import { DoughnutGauge, HeatmapChart, LineChart, RadarChart } from '../../components/charts';
 import type { DashboardData } from '../../data/mock';
@@
-export const AdvancedAnalytics = ({ data }: AdvancedAnalyticsProps) => (
+type TrendAction =
+  | { type: 'toggleSmooth' }
+  | { type: 'nudgeTarget'; axis: 'primary' | 'secondary'; delta: number }
+  | { type: 'reset' };
+
+const initialTrendState = {
+  smooth: false,
+  primaryTargetOffset: 0,
+  secondaryTargetOffset: 0,
+};
+
+const trendReducer = (state: typeof initialTrendState, action: TrendAction) => {
+  switch (action.type) {
+    case 'toggleSmooth':
+      return { ...state, smooth: !state.smooth };
+    case 'nudgeTarget':
+      return {
+        ...state,
+        primaryTargetOffset:
+          action.axis === 'primary' ? state.primaryTargetOffset + action.delta : state.primaryTargetOffset,
+        secondaryTargetOffset:
+          action.axis === 'secondary' ? state.secondaryTargetOffset + action.delta : state.secondaryTargetOffset,
+      };
+    case 'reset':
+      return initialTrendState;
+    default:
+      return state;
+  }
+};
+
+export const AdvancedAnalytics = ({ data }: AdvancedAnalyticsProps) => {
+  const [state, dispatch] = useReducer(trendReducer, initialTrendState);
+
+  const chartTargets = useMemo(
+    () =>
+      data.trend.targets.map((target) => ({
+        ...target,
+        value:
+          target.axis === 'secondary'
+            ? target.value + state.secondaryTargetOffset
+            : target.value + state.primaryTargetOffset,
+      })),
+    [data.trend.targets, state.primaryTargetOffset, state.secondaryTargetOffset],
+  );
+
+  const chartSeries = useMemo(
+    () =>
+      data.trend.series.map((series) => ({
+        ...series,
+        points: state.smooth
+          ? series.points.map((point, index, arr) => {
+              const prev = arr[index - 1]?.value ?? point.value;
+              const next = arr[index + 1]?.value ?? point.value;
+              return {
+                ...point,
+                value: Number(((prev + point.value + next) / 3).toFixed(series.unit === 'count' ? 2 : 1)),
+              };
+            })
+          : series.points,
+      })),
+    [data.trend.series, state.smooth],
+  );
+
+  return (
   <section className="panel">
@@
-    <div className="panel__full">
+    <div className="panel__full">
       <LineChart
-        series={data.trend.series}
-        targets={data.trend.targets}
+        series={chartSeries}
+        targets={chartTargets}
+        confidenceBand={data.trend.confidence}
         ariaTitle="6-месячный тренд KPI"
         ariaDescription="Сервис, CSAT и эффективность по месяцам с целевыми ориентирами"
         timeUnit="month"
         clamp={{ min: 70, max: 100 }}
         secondaryAxis={{
           label: 'CSAT (1–5)',
           unit: 'count',
           clamp: { min: 0, max: 5 },
           position: 'right',
           grid: false,
         }}
+        toolbar={
+          <div className="trend-toolbar">
+            <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'toggleSmooth' })}>
+              {state.smooth ? 'Сглаживание: вкл.' : 'Сглаживание: выкл.'}
+            </button>
+            <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'nudgeTarget', axis: 'primary', delta: 1 })}>
+              Цель SL +1%
+            </button>
+            <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'nudgeTarget', axis: 'primary', delta: -1 })}>
+              Цель SL -1%
+            </button>
+            <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'nudgeTarget', axis: 'secondary', delta: 0.1 })}>
+              Цель CSAT +0.1
+            </button>
+            <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: 'nudgeTarget', axis: 'secondary', delta: -0.1 })}>
+              Цель CSAT -0.1
+            </button>
+            <button type="button" className="btn" onClick={() => dispatch({ type: 'reset' })}>
+              Сбросить цели
+            </button>
+          </div>
+        }
       />
     </div>
-  </section>
-);
+  </section>
+);
 
 export default AdvancedAnalytics;
```

#### 3. Add toolbar styles
**File**: `src/styles/index.css`
```diff
@@
 .chart-legend__swatch {
   width: 12px;
   height: 12px;
   border-radius: 999px;
   box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
 }
+
+.chart-toolbar {
+  display: flex;
+  flex-wrap: wrap;
+  gap: 12px;
+  margin-bottom: 12px;
+}
+
+.trend-toolbar {
+  display: flex;
+  flex-wrap: wrap;
+  gap: 8px;
+}
```

## Phase 3: Absenteeism Analytics Panel

### Overview
Create an absenteeism-focused panel fed by new mocks, rendering area chart + table.

### Changes Required:

#### 1. Add AbsenteeismPanel component
**File**: `src/features/analytics/AbsenteeismPanel.tsx` (new)
**Changes**: Use LineChart & ReportTable with absenteeism snapshot.
```bash
cat <<'EOF' > src/features/analytics/AbsenteeismPanel.tsx
import { useEffect, useState } from 'react';
import { LineChart, ReportTable } from '../../components/charts';
import type { AbsenteeismSnapshot } from '../../data/mock';
import { loadAbsenteeismSnapshot } from '../../services/forecasting';

interface AbsenteeismPanelProps {
  organisation: string;
}

export const AbsenteeismPanel = ({ organisation }: AbsenteeismPanelProps) => {
  const [snapshot, setSnapshot] = useState<AbsenteeismSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadAbsenteeismSnapshot(organisation);
      if (!cancelled) {
        setSnapshot(data);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [organisation]);

  if (!snapshot) {
    return (
      <section className="panel">
        <header className="panel__header">
          <h2>Аналитика абсентеизма</h2>
          <span>Загружаем данные…</span>
        </header>
      </section>
    );
  }

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Аналитика абсентеизма</h2>
          <span>Организация: {snapshot.organisation}. Δ {snapshot.deltaPercent}%</span>
        </div>
      </header>

      <div className="panel__full">
        <LineChart
          series={[snapshot.observed, snapshot.forecast]}
          ariaTitle="Динамика абсентеизма"
          ariaDescription="Сравнение фактических и прогнозных показателей"
          timeUnit="month"
          clamp={{ min: 0, max: 25 }}
        />
      </div>

      <ReportTable
        ariaTitle="Причины абсентеизма"
        ariaDescription="Распределение причин отсутствий"
        columns={[
          { id: 'reason', label: 'Причина' },
          { id: 'share', label: 'Доля' },
        ]}
        rows={snapshot.reasonBreakdown}
      />
    </section>
  );
};

export default AbsenteeismPanel;
EOF
```

## Phase 4: Reports & Export Stub

### Overview
Add Reports panel with download stub referencing deterministic CSV export.

### Changes Required:

#### 1. Create export helper
**File**: `src/utils/export.ts` (new)
```bash
cat <<'EOF' > src/utils/export.ts
export const downloadCsv = (filename: string, rows: Record<string, string | number>[]): void => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(';'), ...rows.map((row) => headers.map((header) => row[header]).join(';'))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
EOF
```

#### 2. ReportsPanel component
**File**: `src/features/reports/ReportsPanel.tsx` (new)
```bash
mkdir -p src/features/reports
cat <<'EOF' > src/features/reports/ReportsPanel.tsx
import { useMemo } from 'react';
import { ReportTable } from '../../components/charts';
import { downloadCsv } from '../../utils/export';
import type { ReportTableRow } from '../../components/charts/ReportTable';

interface ReportsPanelProps {
  organisation: string;
}

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  available: boolean;
  rows: ReportTableRow[];
}

export const ReportsPanel = ({ organisation }: ReportsPanelProps) => {
  const reports = useMemo<ReportDefinition[]>(
    () => [
      {
        id: 't13',
        name: 'Т‑13 (табель учёта)',
        description: 'Экспорт смен и явок за месяц',
        available: true,
        rows: [
          { parameter: 'Организация', value: organisation },
          { parameter: 'Период', value: 'Текущий месяц' },
          { parameter: 'Формат', value: 'CSV' },
        ],
      },
      {
        id: 'punctuality',
        name: 'Пунктуальность',
        description: 'Опоздания и прогулы за период',
        available: true,
        rows: [
          { parameter: 'Организация', value: organisation },
          { parameter: 'Выгрузка', value: 'Последние 30 дней' },
          { parameter: 'Формат', value: 'CSV' },
        ],
      },
      {
        id: 'deviations',
        name: 'Отклонения расписания',
        description: 'Сравнение плана и факта по сменам',
        available: false,
        rows: [
          { parameter: 'Статус', value: 'В разработке' },
        ],
      },
    ],
    [organisation],
  );

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <h2>Отчёты</h2>
          <span>Скачайте ключевые отчёты Naumen WFM</span>
        </div>
      </header>

      <div className="reports-grid">
        {reports.map((report) => (
          <article key={report.id} className="report-card">
            <header>
              <h3>{report.name}</h3>
              <span>{report.description}</span>
            </header>
            <ReportTable
              ariaTitle={`Метаданные отчёта ${report.name}`}
              ariaDescription="Параметры выгрузки"
              columns={[{ id: 'parameter', label: 'Параметр' }, { id: 'value', label: 'Значение' }]}
              rows={report.rows}
            />
            <button
              type="button"
              className="btn"
              disabled={!report.available}
              onClick={() => downloadCsv(`${report.id}.csv`, report.rows as Record<string, string | number>[])}
            >
              {report.available ? 'Скачать CSV' : 'Скоро'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ReportsPanel;
EOF
```

#### 3. Add styles for reports grid
**File**: `src/styles/index.css`
```diff
@@
 .kpi-card__header {
@@
 }
+
+.reports-grid {
+  display: grid;
+  gap: 24px;
+}
+
+.report-card {
+  display: flex;
+  flex-direction: column;
+  gap: 16px;
+  padding: 20px;
+  border-radius: 18px;
+  background: rgba(248, 250, 252, 0.9);
+  border: 1px solid rgba(148, 163, 184, 0.2);
+}
+
+.report-card header h3 {
+  margin: 0;
+  font-size: 18px;
+}
+
+.report-card header span {
+  color: #64748b;
+  font-size: 13px;
+}
```

## Phase 5: Organisation Selector & App Shell

### Overview
Introduce organisation context, navigation pills, and mount new panels.

### Changes Required:

#### 1. Organisation context helper
**File**: `src/state/organization.ts` (new)
```bash
mkdir -p src/state
cat <<'EOF' > src/state/organization.ts
import { createContext, useContext } from 'react';

export interface OrganisationContextValue {
  organisation: string;
  setOrganisation: (value: string) => void;
}

export const OrganisationContext = createContext<OrganisationContextValue | null>(null);

export const useOrganisation = (): OrganisationContextValue => {
  const ctx = useContext(OrganisationContext);
  if (!ctx) {
    throw new Error('OrganisationContext not provided');
  }
  return ctx;
};
EOF
```

#### 2. Update App shell
**File**: `src/App.tsx`
```diff
-import { useMemo, useState } from 'react';
-import KpiOverview from './features/analytics/KpiOverview';
-import AdvancedAnalytics from './features/analytics/AdvancedAnalytics';
-import LiveStatus from './features/analytics/LiveStatus';
-import { generateDashboardData } from './data/mock';
+import { useMemo, useState } from 'react';
+import KpiOverview from './features/analytics/KpiOverview';
+import AdvancedAnalytics from './features/analytics/AdvancedAnalytics';
+import LiveStatus from './features/analytics/LiveStatus';
+import AbsenteeismPanel from './features/analytics/AbsenteeismPanel';
+import { ForecastBuilder } from './features/forecasting/ForecastBuilder';
+import ReportsPanel from './features/reports/ReportsPanel';
+import { generateDashboardData } from './data/mock';
+import { OrganisationContext } from './state/organization';
 
 const App = () => {
-  const [seed] = useState(() => Math.random());
-  const data = useMemo(() => {
-    Math.random();
-    return generateDashboardData();
-  }, [seed]);
+  const [seed] = useState(() => Math.random());
+  const [organisation, setOrganisation] = useState('Контакт-центр 1010.ru');
+  const [activeModule, setActiveModule] = useState<'analytics' | 'forecasting' | 'reports'>('analytics');
+  const data = useMemo(() => generateDashboardData(seed), [seed]);
+  const modules: { id: typeof activeModule; label: string }[] = [
+    { id: 'analytics', label: 'Аналитика' },
+    { id: 'forecasting', label: 'Прогнозы' },
+    { id: 'reports', label: 'Отчёты' },
+  ];
 
   return (
-    <main className="layout">
-      <header className="hero">
-        <div>
-          <h1>Аналитическая панель WFM</h1>
-          <p>Актуальные показатели контакт-центра в едином окне</p>
-        </div>
-        <dl>
-          <div>
-            <dt>Последняя загрузка</dt>
-            <dd>{new Date(data.generatedAt).toLocaleString('ru-RU')}</dd>
-          </div>
-          <div className="hero__status">
-            <span className="hero__status-dot" />
-            <span>Онлайн</span>
-          </div>
-        </dl>
-      </header>
-
-      <KpiOverview data={data} />
-      <LiveStatus />
-      <AdvancedAnalytics data={data} />
-    </main>
+    <OrganisationContext.Provider value={{ organisation, setOrganisation }}>
+      <main className="layout">
+        <header className="hero">
+          <div>
+            <h1>WFM — прогнозы и аналитика</h1>
+            <p>Актуальные показатели и построение прогнозов для {organisation}</p>
+          </div>
+          <div className="hero__controls">
+            <label className="hero__select">
+              <span>Организация</span>
+              <select value={organisation} onChange={(event) => setOrganisation(event.target.value)}>
+                <option>Контакт-центр 1010.ru</option>
+                <option>Региональный офис</option>
+                <option>VIP линия</option>
+              </select>
+            </label>
+            <dl>
+              <div>
+                <dt>Последняя загрузка</dt>
+                <dd>{new Date(data.generatedAt).toLocaleString('ru-RU')}</dd>
+              </div>
+              <div className="hero__status">
+                <span className="hero__status-dot" />
+                <span>Онлайн</span>
+              </div>
+            </dl>
+          </div>
+        </header>
+
+        <nav className="module-nav" aria-label="Модули">
+          {modules.map((module) => (
+            <button
+              key={module.id}
+              type="button"
+              className={`module-nav__item${activeModule === module.id ? ' module-nav__item--active' : ''}`}
+              onClick={() => setActiveModule(module.id)}
+            >
+              {module.label}
+            </button>
+          ))}
+        </nav>
+
+        {activeModule === 'analytics' ? (
+          <>
+            <KpiOverview data={data} />
+            <LiveStatus />
+            <AdvancedAnalytics data={data} />
+            <AbsenteeismPanel organisation={organisation} />
+          </>
+        ) : null}
+
+        {activeModule === 'forecasting' ? <ForecastBuilder organisation={organisation} /> : null}
+
+        {activeModule === 'reports' ? <ReportsPanel organisation={organisation} /> : null}
+      </main>
+    </OrganisationContext.Provider>
   );
 };
 
 export default App;
```

#### 3. Update hero styles for select + tabs
**File**: `src/styles/index.css`
```diff
@@
-.hero {
-  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
-  color: #fff;
-  padding: 32px;
-  border-radius: 24px;
-  display: flex;
-  justify-content: space-between;
-  align-items: center;
-  gap: 16px;
-  box-shadow: 0 20px 45px -25px rgba(15, 23, 42, 0.45);
-}
+.hero {
+  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
+  color: #fff;
+  padding: 32px;
+  border-radius: 24px;
+  display: flex;
+  justify-content: space-between;
+  align-items: center;
+  gap: 16px;
+  box-shadow: 0 20px 45px -25px rgba(15, 23, 42, 0.45);
+  flex-wrap: wrap;
+}
@@
-.hero dl {
-  margin: 0;
-  display: flex;
-  flex-direction: column;
-  gap: 12px;
-}
+.hero__controls {
+  display: flex;
+  gap: 20px;
+  align-items: center;
+}
+
+.hero__select {
+  display: flex;
+  flex-direction: column;
+  gap: 6px;
+  font-size: 14px;
+}
+
+.hero__select select {
+  border-radius: 12px;
+  padding: 10px 14px;
+  font-size: 16px;
+  border: none;
+  color: #0f172a;
+}
+
+.hero dl {
+  margin: 0;
+  display: flex;
+  flex-direction: column;
+  gap: 12px;
+}
@@
 .hero__status-dot {
   width: 10px;
   height: 10px;
   background: #22c55e;
   border-radius: 50%;
   animation: pulse 2s infinite;
 }
+
+.module-nav {
+  display: inline-flex;
+  gap: 12px;
+  background: #e2e8f0;
+  padding: 10px;
+  border-radius: 999px;
+  align-self: flex-start;
+}
+
+.module-nav__item {
+  border: none;
+  background: transparent;
+  color: #475569;
+  padding: 8px 18px;
+  border-radius: 999px;
+  font-weight: 600;
+  cursor: pointer;
+}
+
+.module-nav__item--active {
+  background: #fff;
+  color: #2563eb;
+  box-shadow: 0 6px 24px -18px rgba(37, 99, 235, 0.6);
+}
```

## Phase 6: Tests, Stories, Playwright

### Overview
Provide deterministic tests and story coverage for new features; extend Playwright to cover forecast run.

### Changes Required:

#### 1. Unit tests for generators
**File**: `src/features/forecasting/ForecastBuilder.test.tsx` (new)
```bash
cat <<'EOF' > src/features/forecasting/ForecastBuilder.test.tsx
import { describe, expect, it } from 'vitest';
import { generateForecastBuild, generateAbsenteeismSnapshot } from '../../data/mock';

describe('forecasting generators', () => {
  it('produces deterministic forecast table', () => {
    const first = generateForecastBuild('Контакт-центр 1010.ru', 8, 8);
    const second = generateForecastBuild('Контакт-центр 1010.ru', 8, 8);
    expect(second.table).toEqual(first.table);
    expect(first.confidence.lower.points).toHaveLength(8);
  });

  it('absenteeism snapshot matches organisation seed', () => {
    const snapshot = generateAbsenteeismSnapshot('Региональный офис');
    expect(snapshot.observed.points[0].value).toBeGreaterThan(0);
    expect(snapshot.reasonBreakdown).toHaveLength(4);
  });
});
EOF
```

#### 2. Storybook slices
**File**: `src/stories/AnalyticsDashboard.stories.tsx`
```diff
@@
-import { generateDashboardData } from '../data/mock';
+import { generateDashboardData } from '../data/mock';
+import { ForecastBuilder } from '../features/forecasting/ForecastBuilder';
+import AbsenteeismPanel from '../features/analytics/AbsenteeismPanel';
@@
 export const LiveStatusPanel: StoryObj<typeof LiveStatus> = {
   name: 'Live Status',
   render: () => <LiveStatus />,
 };
+
+export const ForecastBuilderStory: StoryObj<typeof ForecastBuilder> = {
+  name: 'Forecast Builder',
+  render: () => <ForecastBuilder organisation="Контакт-центр 1010.ru" />,
+};
+
+export const AbsenteeismAnalyticsStory: StoryObj<typeof AbsenteeismPanel> = {
+  name: 'Absenteeism Analytics',
+  render: () => <AbsenteeismPanel organisation="Контакт-центр 1010.ru" />,
+};
```

#### 3. Extend Playwright scenario
**File**: `e2e/analytics.spec.ts`
```diff
@@
   test('heatmap and radar sections expose aria labels', async ({ page }) => {
     await expect(page.getByLabel('Интенсивность обращений')).toBeVisible();
     await expect(page.getByLabel('Радар эффективности')).toBeVisible();
     await expect(page.getByLabel('6-месячный тренд KPI')).toBeVisible();
   });
+
+  test('runs forecast build and exposes reports download', async ({ page, context }) => {
+    await page.getByRole('button', { name: 'Прогнозы' }).click();
+    await page.getByRole('button', { name: 'Построить прогноз' }).click();
+    await expect(page.getByLabel('Прогноз спроса')).toBeVisible();
+
+    await page.getByRole('button', { name: 'Отчёты' }).click();
+    const [popup] = await Promise.all([
+      context.waitForEvent('page'),
+      page.getByRole('button', { name: 'Скачать CSV' }).first().click(),
+    ]);
+    await popup.close();
+  });
 });
```

## Phase 7: Docs & Handoff

### Overview
Update coordinator and system docs to log new capabilities and artefacts.

### Changes Required:
- `docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md`: add ForecastBuilder, Absenteeism, Reports entries (with final line refs) plus screenshot alias for forecast build.
- `docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md`: log new AD findings row marking forecast flow Pass.
- `docs/System/{DEMO_PARITY_INDEX.md, PARITY_MVP_CHECKLISTS.md, WRAPPER_ADOPTION_MATRIX.md, CHART_COVERAGE_BY_DEMO.md}` and `docs/Reports/PARITY_MVP_CHECKLISTS.md`: mark forecasting/absenteeism/report parity tasks complete.
- `docs/Tasks/uat-packs/{parity_static.md, chart_visual_spec.md}`: extend analytics sections with forecast build, adjustments toolbar, absenteeism chart, reports download steps.
- `docs/Tasks/screenshot-checklist.md`: add aliases for forecast build chart and reports card.
- `docs/SESSION_HANDOFF.md` & `PROGRESS.md`: document implementation, tests, deploy URL.

## Tests & Validation
- `npm run test`
- `npm run typecheck`
- `npm run storybook:build`
- `npm run test:e2e`
- `npm run ci`
- Manual smoke: `npm run dev -- --host 127.0.0.1 --port <reserved>` for analytics demo.
- Deploy: `vercel deploy --prod --yes`
- UAT packs: `docs/Tasks/uat-packs/parity_static.md`, `chart_visual_spec.md` (analytics sections) with new checkpoints recorded.

## Rollback
```bash
set -euo pipefail
git restore src/App.tsx src/data/mock.ts src/components/charts/LineChart.tsx src/features/analytics/AdvancedAnalytics.tsx src/styles/index.css src/stories/AnalyticsDashboard.stories.tsx e2e/analytics.spec.ts
rm -f src/features/forecasting/ForecastBuilder.tsx src/features/forecasting/ForecastBuilder.test.tsx src/features/analytics/AbsenteeismPanel.tsx src/services/forecasting.ts src/features/reports/ReportsPanel.tsx src/utils/export.ts src/state/organization.ts
find src/features -type d -empty -delete
find src/state -type d -empty -delete
find src/utils -type d -empty -delete
```

## Handoff
- Update `PROGRESS.md` once execution lands.
- Append detailed entry to `docs/SESSION_HANDOFF.md` (tests, deploy URL, UAT results, screenshot aliases).
- Sync coordinator + system docs listed above.
- Notify UAT group with updated instructions for forecast build/absenteeism/report verification (link to revised packs).
