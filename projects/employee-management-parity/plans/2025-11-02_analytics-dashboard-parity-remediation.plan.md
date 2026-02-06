# Analytics Dashboard Parity Remediation Plan (2025-11-02)

## Metadata
- **Task**: Analytics Dashboard parity remediation (`docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md`)
- **Discovery**: `docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md` (Scout Notes §§Build/Exceptions/Trend/Absenteeism/Accuracy/Reports)
- **Related Guides**: `docs/System/forecasting-analytics_illustrated-guide.md`, `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md`
- **Repos**:
  - Shared module: `${EMPLOYEE_MGMT_REPO}` (`src/modules/forecasting/*`)
  - Analytics demo: `${ANALYTICS_REPO}` (`src/features/forecasting/*`, `src/services/forecasting.ts`, tooling)
- **Manual Evidence**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md`, `CH6_Reports.md`

## Desired End State
- `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting` exposes queue tree helpers, horizon presets, absenteeism run history, trend tables, accuracy table with RU formatting, exception CSV export, and report notification APIs used by both demos.
- `${ANALYTICS_REPO}` consumes those shared exports (no local runtime duplication) and renders the Naumen parity behaviours: gated queue tree, template flows, exceptions wizard, tactical/operational trend tables, absenteeism history badges, RU accuracy KPIs, and multi-format report downloads triggering the header bell.
- Test matrix passes (`npm_config_workspaces=false npm run ci` in analytics); new unit tests in the shared module cover accuracy/trend/report helpers.
- Documentation and UAT briefs updated to mark the gaps closed, and task/hand-off notes reflect the new plan + validation steps.

### Key Discoveries
- Real queue tree + horizons live in `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/build/BuildForecastWorkspace.tsx:205-382`; shared module must expose identical helpers before wiring analytics.
- Exceptions CSV/export logic and interval builder patterns reside in `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:88-214` and `forecastingFixtures.ts:66-83`.
- Trend equalisation tables implemented in forecasting demo adapters `${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/trends.ts:40-128`; analytics currently mocks them.
- Absenteeism run history + badges captured in `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:24-240` but the shared module lacks run generators.
- Accuracy RU locale formatting defined in `${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/accuracy.ts:70-210`; analytics UAT flagged English decimals (see `/Users/m/Desktop/q/q.markdown` + `docs/System/forecasting-analytics_illustrated-guide.md:159-166`).
- Report notifications + filename helpers exist in forecasting services `${FORECASTING_ANALYTICS_REPO}/src/services/forecastingApi.ts:446-520` and shell layout `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ForecastingLayout.tsx:49-88`.

## What We're NOT Doing
- No backend/API integration; deterministic data remains local.
- No visual redesign or copy rewrites beyond RU locale fixes already documented.
- No changes to `${FORECASTING_ANALYTICS_REPO}` besides reading source patterns.
- No new Playwright targets outside forecasting flows already scoped (queue gating, trend tables, reports bell).

## Implementation Approach
Promote forecasting helpers from the forecasting demo into `src/modules/forecasting` (types, deterministic data, CSV/export utilities, report notifications), cover them with Vitest, then repoint the analytics dashboard to those exports by tightening TypeScript/Vite aliases. Clean up the analytics runtime stub to re-export the shared module so only one implementation remains. Finally, update docs/UAT notes to mark build/exceptions/trend/absenteeism/accuracy/report gaps resolved and queue validations/tests for the executor.

## Phase 1: Expand Shared Forecasting Module

### Overview
Bring queue tree, horizons, run history, trend/accuracy generators, exception CSV helpers, and report notification APIs into `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting`, including unit tests.

### Changes Required:

#### 1. Shared types
**File**: `src/modules/forecasting/types.ts`
**Changes**: Add queue node, horizon, absenteeism run, trend table, accuracy row, and report notification types reused across helpers.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/modules/forecasting/types.ts
@@
 export interface AbsenteeismSnapshot {
   organisation: string;
   observed: ForecastSeries;
   forecast: ForecastSeries;
   deltaPercent: number;
   reasonBreakdown: ReportTableRow[];
 }
+
+export interface QueueNode {
+  id: string;
+  label: string;
+  type: 'group' | 'queue';
+  favourite?: boolean;
+  skills?: number;
+  children?: QueueNode[];
+}
+
+export interface HorizonConfig {
+  id: string;
+  label: string;
+  historyWeeks: number;
+  projectionWeeks: number;
+}
+
+export interface ForecastRunSummary {
+  appliedQueues: number;
+  horizonWeeks: number;
+  projectionWeeks: number;
+  absenteeismMode: 'value' | 'profile';
+  absenteeismValue?: number;
+  absenteeismProfile?: string;
+  generatedAt: string;
+}
+
+export type AbsenteeismRunStatus = 'completed' | 'scheduled' | 'failed';
+
+export interface AbsenteeismRun {
+  id: string;
+  requestedBy: string;
+  executedAt: string;
+  status: AbsenteeismRunStatus;
+  mode: 'value' | 'profile';
+  horizonWeeks: number;
+  absenteeismPercent?: number;
+  profileName?: string;
+}
+
+export interface TrendTables {
+  strategic: ReportTableRow[];
+  tactical: ReportTableRow[];
+  operational: ReportTableRow[];
+}
+
+export interface AccuracyRow extends ReportTableRow {
+  period: string;
+  forecast: string;
+  actual: string;
+  absoluteDelta: string;
+  relativeDelta: string;
+  absenteeism: string;
+  lostCalls: string;
+  serviceLevel: string;
+  aht: string;
+}
+
+export type ReportFormat = 'csv' | 'xlsx' | 'pdf';
+export type ReportStatus = 'available' | 'processing' | 'comingSoon';
+
+export interface ReportParameter {
+  id: string;
+  label: string;
+  value: string;
+  hint?: string;
+}
+
+export interface ReportDefinition {
+  id: string;
+  name: string;
+  description: string;
+  category: 'forecasting' | 'schedule' | 'attendance' | 'performance' | 'licence' | 'payroll';
+  availableFormats: ReportFormat[];
+  defaultFormat: ReportFormat;
+  parameters: ReportParameter[];
+  status: ReportStatus;
+}
+
+export interface ReportDownloadNotice {
+  id: string;
+  reportId: string;
+  format: ReportFormat;
+  filename: string;
+  requestedAt: string;
+  status: 'queued' | 'ready';
+}
*** End Patch
PATCH
```

#### 2. Deterministic data & helpers
**File**: `src/modules/forecasting/data.ts`
**Changes**: Import `nanoid`, add queue tree, horizons, absenteeism runs, trend tables, accuracy table, RU formatting helpers.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/modules/forecasting/data.ts
@@
-import type { AbsenteeismSnapshot, ForecastBuildResult, ForecastSeries, ReportTableRow } from './types';
+import { nanoid } from 'nanoid';
+import type {
+  AbsenteeismRun,
+  AbsenteeismSnapshot,
+  AccuracyRow,
+  ForecastBuildResult,
+  ForecastRunSummary,
+  ForecastSeries,
+  HorizonConfig,
+  QueueNode,
+  ReportDefinition,
+  ReportDownloadNotice,
+  ReportFormat,
+  ReportParameter,
+  ReportStatus,
+  ReportTableRow,
+  TrendTables,
+} from './types';
@@
 export const generateAbsenteeismSnapshot = (organisation: string): AbsenteeismSnapshot => {
@@
 };
+
+const BASE_QUEUE_TREE: QueueNode[] = [
+  {
+    id: 'contact-centre',
+    label: 'Контакт-центр 1010.ru',
+    type: 'group',
+    favourite: true,
+    children: [
+      {
+        id: 'inbound',
+        label: 'Входящие обращения',
+        type: 'group',
+        children: [
+          { id: 'voice-general', label: 'Голос — общий поток', type: 'queue', favourite: true, skills: 42 },
+          { id: 'voice-vip', label: 'Голос — VIP', type: 'queue', skills: 12 },
+          { id: 'chat', label: 'Чат и мессенджеры', type: 'queue', skills: 18 },
+          { id: 'email', label: 'Электронная почта', type: 'queue', skills: 9 },
+        ],
+      },
+      {
+        id: 'outbound',
+        label: 'Исходящие кампании',
+        type: 'group',
+        children: [
+          { id: 'sales-proactive', label: 'Продажи — проактивные', type: 'queue', skills: 7 },
+          { id: 'retention', label: 'Удержание', type: 'queue', favourite: true, skills: 6 },
+        ],
+      },
+      {
+        id: 'support',
+        label: 'Техподдержка',
+        type: 'group',
+        children: [
+          { id: 'level1', label: '1-я линия', type: 'queue', skills: 15 },
+          { id: 'level2', label: '2-я линия', type: 'queue', skills: 8 },
+          { id: 'field', label: 'Выездные инженеры', type: 'queue', skills: 4 },
+        ],
+      },
+    ],
+  },
+  {
+    id: 'regional',
+    label: 'Региональные площадки',
+    type: 'group',
+    children: [
+      { id: 'kazan', label: 'Казань — голос', type: 'queue', skills: 11 },
+      { id: 'perm', label: 'Пермь — back-office', type: 'queue', skills: 5 },
+      { id: 'omsk', label: 'Омск — голос', type: 'queue', skills: 6 },
+    ],
+  },
+  {
+    id: 'partners',
+    label: 'Партнёрские команды',
+    type: 'group',
+    children: [
+      { id: 'outsourcing-alpha', label: 'Альфа контакт', type: 'queue', skills: 20 },
+      { id: 'outsourcing-beta', label: 'Бета сервис', type: 'queue', skills: 14 },
+    ],
+  },
+];
+
+const cloneQueue = (node: QueueNode): QueueNode => ({
+  ...node,
+  children: node.children?.map(cloneQueue),
+});
+
+export const listOrganisationQueues = (): QueueNode[] => BASE_QUEUE_TREE.map(cloneQueue);
+
+export const createDefaultHorizons = (): HorizonConfig[] => [
+  { id: 'baseline', label: 'Базовый', historyWeeks: 8, projectionWeeks: 8 },
+  { id: 'promo', label: 'Промо-период', historyWeeks: 6, projectionWeeks: 4 },
+];
+
+export const buildHorizon = (
+  historyWeeks: number,
+  projectionWeeks: number,
+  label = 'Дополнительный диапазон',
+): HorizonConfig => ({ id: nanoid(6), label, historyWeeks, projectionWeeks });
+
+export const buildForecastSummary = (
+  result: ForecastBuildResult,
+  selectedQueues: number,
+  absenteeism: { mode: 'value' | 'profile'; value?: number; profileName?: string },
+): ForecastRunSummary => ({
+  appliedQueues: selectedQueues,
+  horizonWeeks: result.horizonWeeks,
+  projectionWeeks: result.projectionWeeks,
+  absenteeismMode: absenteeism.mode,
+  absenteeismValue: absenteeism.mode === 'value' ? absenteeism.value ?? 0 : undefined,
+  absenteeismProfile: absenteeism.mode === 'profile' ? absenteeism.profileName : undefined,
+  generatedAt: result.generatedAt,
+});
+
+const ABSENTEEISM_RUNS: AbsenteeismRun[] = [
+  {
+    id: 'run-001',
+    requestedBy: 'planner@1010.ru',
+    executedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
+    status: 'completed',
+    mode: 'profile',
+    profileName: 'Базовый профиль call-центра',
+    horizonWeeks: 8,
+  },
+  {
+    id: 'run-002',
+    requestedBy: 'resource_team@1010.ru',
+    executedAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
+    status: 'completed',
+    mode: 'value',
+    absenteeismPercent: 11.5,
+    horizonWeeks: 6,
+  },
+  {
+    id: 'run-003',
+    requestedBy: 'planner@1010.ru',
+    executedAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
+    status: 'scheduled',
+    mode: 'profile',
+    profileName: 'Сезон отпусков',
+    horizonWeeks: 12,
+  },
+  {
+    id: 'run-004',
+    requestedBy: 'planner@1010.ru',
+    executedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
+    status: 'failed',
+    mode: 'value',
+    absenteeismPercent: 18.2,
+    horizonWeeks: 4,
+  },
+];
+
+export const listAbsenteeismRuns = (): AbsenteeismRun[] => ABSENTEEISM_RUNS.map((run) => ({ ...run }));
+
+const trendSeededRandom = (seed: number) => {
+  let current = seed;
+  return () => {
+    const value = Math.sin(current++) * 10000;
+    return value - Math.floor(value);
+  };
+};
+
+export const generateTrendTables = (options: { seed?: number } = {}): TrendTables => {
+  const random = trendSeededRandom((options.seed ?? 42) + 17);
+
+  const weeks = Array.from({ length: 6 }, (_, index) => {
+    const start = new Date();
+    start.setDate(start.getDate() - index * 7);
+    const end = new Date(start);
+    end.setDate(end.getDate() + 6);
+    return {
+      label: `${start.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}`,
+      forecast: Number((83 + random() * 6).toFixed(1)),
+      actual: Number((81 + random() * 6).toFixed(1)),
+      seasonality: Number((random() * 8 - 4).toFixed(1)),
+    };
+  }).reverse();
+
+  const strategic: ReportTableRow[] = weeks.map((week) => ({
+    period: week.label,
+    forecast: week.forecast,
+    actual: week.actual,
+    delta: Number((week.actual - week.forecast).toFixed(1)),
+    seasonality: week.seasonality,
+  }));
+
+  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
+  const tactical: ReportTableRow[] = days.map((day) => {
+    const forecast = Number((random() * 25 + 75).toFixed(1));
+    const actual = Number((forecast + (random() - 0.5) * 6).toFixed(1));
+    return {
+      day,
+      forecast,
+      actual,
+      delta: Number((actual - forecast).toFixed(1)),
+    };
+  });
+
+  const operational = Array.from({ length: 12 }, (_, index) => {
+    const hour = 8 + Math.floor(index / 2);
+    const minute = index % 2 === 0 ? '00' : '30';
+    const label = `${hour.toString().padStart(2, '0')}:${minute}`;
+    const forecast = Number((random() * 15 + 45).toFixed(1));
+    const actual = Number((forecast + (random() - 0.5) * 5).toFixed(1));
+    return {
+      interval: label,
+      forecast,
+      actual,
+      delta: Number((actual - forecast).toFixed(1)),
+    };
+  });
+
+  return { strategic, tactical, operational };
+};
+
+const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
+
+const accuracyDeck: AccuracyRow[] = Array.from({ length: 8 }, (_, index) => {
+  const base = 760 + index * 12;
+  const actual = base + (index % 2 === 0 ? -35 : 28);
+  const absoluteDelta = actual - base;
+  const relativeDelta = Number(((absoluteDelta / base) * 100).toFixed(1));
+  const absenteeism = Number((6 + (index % 3) * 1.2).toFixed(1));
+  const lostCalls = Number((1.4 + (index % 4) * 0.3).toFixed(1));
+  const serviceLevel = Number((94 - index * 0.6).toFixed(1));
+  const aht = Number((4.2 + index * 0.05).toFixed(2));
+
+  return {
+    period: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', {
+      day: '2-digit',
+      month: 'short',
+    }),
+    forecast: numberFormatter.format(base),
+    actual: numberFormatter.format(actual),
+    absoluteDelta: numberFormatter.format(absoluteDelta),
+    relativeDelta: `${relativeDelta.toFixed(1)}%`,
+    absenteeism: `${absenteeism.toFixed(1)}%`,
+    lostCalls: `${lostCalls.toFixed(1)}%`,
+    serviceLevel: `${serviceLevel.toFixed(1)}%`,
+    aht: `${aht.toFixed(2)} ч`,
+  };
+}).reverse();
+
+export const generateAccuracyTable = (): AccuracyRow[] => accuracyDeck.map((row) => ({ ...row }));
+
+const REPORTS: ReportDefinition[] = [
+  {
+    id: 'forecast-summary',
+    name: 'Сводка прогноза',
+    description: 'Итоговая таблица прогноза с фактом и отклонениями',
+    category: 'forecasting',
+    availableFormats: ['xlsx', 'csv'],
+    defaultFormat: 'xlsx',
+    parameters: [
+      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
+      { id: 'range', label: 'Период', value: 'Октябрь 2025' },
+    ],
+    status: 'available',
+  },
+  {
+ ...
