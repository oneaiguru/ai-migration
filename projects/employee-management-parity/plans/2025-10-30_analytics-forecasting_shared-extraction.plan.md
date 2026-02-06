# Analytics ↔ Forecasting Shared Extraction Plan (Phase 2)

## Metadata
- **Task**: Extract remaining forecasting flows (exceptions, absenteeism profiles, report exports, trend adapters, adjustments) into the shared module and point both demos at the unified API.
- **Discovery Source**: `docs/Tasks/analytics-forecasting-overlap-discovery.md` (Phase 2 findings @ lines 100-178).
- **Trigger Plan**: `plans/2025-10-27_analytics-forecasting-parity.plan.md` (Phase cadence).
- **Repos in play**:
  - Shared library: this repo (`${EMPLOYEE_MGMT_REPO}` — employee-management-parity).
  - Analytics dashboard demo: `${ANALYTICS_REPO}`.
  - Forecasting & Analytics demo: `${FORECASTING_ANALYTICS_REPO}`.
- **UAT table**: updates land in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` under AD-1…AD-4 and FA-1…FA-3.
- **Manual references**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md`, `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md`.

## Desired End State
- `src/modules/forecasting/` exposes shared, deterministic helpers covering exceptions, absenteeism profile management, report export metadata, trend data/adapters, and manual adjustments (including undo/redo).
- `${ANALYTICS_REPO}` imports those helpers to render the full forecasting surface (builder, exceptions wizard, absenteeism profiles, manual adjustments, report exports) without duplicating logic.
- `${FORECASTING_ANALYTICS_REPO}` swaps its local implementations to consume the shared module so both demos stay in sync.
- Vitest and Playwright coverage follow the shared code (migrated suites in the shared repo plus updated analytics/forecasting smoke tests).
- Documentation, UAT notes, and parity matrices reflect the unified module.

### Key Discoveries
- Exceptions wizard logic (templates + toggle state) lives only in forecasting: `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:1-74`, data in `${FORECASTING_ANALYTICS_REPO}/src/data/forecastingFixtures.ts:66-83`; analytics lacks this flow (`${ANALYTICS_REPO}/src/App.tsx:22-118`).
- Absenteeism profile management resides in `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:1-63`; analytics only shows a snapshot (`${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:1-65`).
- Report exports in forecasting provide multi-format options (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/trends/TrendExport.tsx:1-312`, `.../accuracy/AccuracyExport.tsx:1-210`), whereas analytics supplies three CSV cards (`${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:18-89`).
- Trend adapters + anomaly metadata exist in forecasting (`${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/trends.ts:1-184`, tests `tests/forecasting/trends.test.ts:1-32`); analytics uses simplified mocks (`${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:47-126`).
- Manual adjustments (undo/redo, validation badges) live only in forecasting (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:1-240`, services `src/services/forecastingApi.ts:1-137`, adapters `src/adapters/forecasting/adjustments.ts:1-83`, tests `tests/forecasting/adjustments.test.ts:1-23`).

## What We're NOT Doing
- No visual redesign or copy rewrites; retain existing RU labels and layouts.
- No backend/API integrations—stubs remain deterministic in shared module.
- No new routing patterns beyond what's required to mirror forecasting tabs (analytics can keep local state tabs).
- No Storybook/Playwright additions beyond the flows touched; do not widen coverage to unrelated modules.

## Implementation Approach
1. Expand the shared forecasting module to house exceptions, absenteeism profiles, report definitions, trend builders, and adjustments, moving reusable data/services out of forecasting demo while maintaining deterministic seeds.
2. Migrate vitest suites alongside the shared code and add minimal smoke tests in this repo to guard API contracts.
3. Update the analytics dashboard to consume the shared module by introducing forecasting sub-tabs (builder, exceptions, absenteeism, adjustments) and wiring report exports to the shared metadata.
4. Refactor the Forecasting & Analytics demo to import the same shared helpers, deleting now-redundant local adapters/data/services.
5. Refresh documentation/hand-offs, ensuring UAT IDs (AD-1..4, FA-1..3) point at the new shared logic and evidence paths.
6. Validate both demos (typecheck/test/build/Playwright) and capture reference screenshots per the existing checklist.

## Phase 1: Expand Shared Forecasting Module

### Overview
Create shared deterministic APIs for exceptions, absenteeism profiles, report exports, trend datasets, and manual adjustments inside `src/modules/forecasting/`, exporting them for downstream consumers.

### Changes Required:
1. **File:** `src/modules/forecasting/index.ts`
   - **Changes:** Export new module entrypoints.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/modules/forecasting/index.ts
@@
-export * from './types';
-export * from './data';
-export * from './services';
+export * from './types';
+export * from './data';
+export * from './services';
+export * from './exceptions';
+export * from './absenteeism';
+export * from './reports';
+export * from './trends';
+export * from './adjustments';
*** End Patch
PATCH
```

2. **Create directories:**
```bash
mkdir -p src/modules/forecasting/{exceptions,absenteeism,reports,trends,adjustments,__tests__}
```

3. **File:** `src/modules/forecasting/exceptions/index.ts`
   - **Changes:** Introduce shared exception types, deterministic templates, and helper functions (`loadExceptionTemplates`, `applyExceptionTemplates`, `summariseExceptionImpact`). Base the implementation on `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx` plus fixtures `src/data/forecastingFixtures.ts:66-83`, but promote pure helpers without React state.
```bash
cat <<'TS' > src/modules/forecasting/exceptions/index.ts
import { cloneDeep } from 'lodash-es';
import type { ForecastSeries } from '../types';

export type ExceptionMode = 'day' | 'interval';
export type ExceptionRecurrence = 'once' | 'weekly' | 'monthly';

export interface ExceptionInterval {
  startTime: string;
  endTime: string;
  deltaPercent: number;
}

export interface ExceptionTemplate {
  id: string;
  title: string;
  description: string;
  mode: ExceptionMode;
  recurrence: ExceptionRecurrence;
  startDate: string;
  endDate: string;
  defaultDeltaPercent: number;
  intervals?: ExceptionInterval[];
  reason: string;
  tags: string[];
}

export interface ExceptionServiceOptions {
  delayMs?: number;
}

const EXCEPTION_TEMPLATES: ExceptionTemplate[] = [
  {
    id: 'promo-week',
    title: 'Промо неделя',
    description: 'Повышенный входящий поток во время маркетинговой кампании',
    mode: 'day',
    recurrence: 'weekly',
    startDate: '2025-11-04',
    endDate: '2025-12-02',
    defaultDeltaPercent: 0.18,
    reason: 'Маркетинг',
    tags: ['Реклама', 'Пик'],
  },
  {
    id: 'holiday',
    title: 'Праздничный штурм',
    description: 'Двухдневный всплеск обращений вокруг праздников',
    mode: 'interval',
    recurrence: 'once',
    startDate: '2025-12-30',
    endDate: '2025-12-31',
    defaultDeltaPercent: 0.25,
    intervals: [
      { startTime: '08:00', endTime: '13:30', deltaPercent: 0.32 },
      { startTime: '17:00', endTime: '22:00', deltaPercent: 0.28 },
    ],
    reason: 'Праздники',
    tags: ['Сезонность'],
  },
  {
    id: 'night-maintenance',
    title: 'Ночная профилактика',
    description: 'Плановое снижение трафика из-за обслуживаемых каналов',
    mode: 'interval',
    recurrence: 'monthly',
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    defaultDeltaPercent: -0.22,
    intervals: [{ startTime: '00:30', endTime: '03:30', deltaPercent: -0.35 }],
    reason: 'Обслуживание',
    tags: ['Ночь', 'Плановые работы'],
  },
  {
    id: 'staffing-gap',
    title: 'Дефицит персонала',
    description: 'Краткосрочный дефицит из-за обучения и отпусков',
    mode: 'day',
    recurrence: 'once',
    startDate: '2025-11-18',
    endDate: '2025-11-20',
    defaultDeltaPercent: -0.12,
    reason: 'Ресурсы',
    tags: ['Факт', 'Снижение'],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const matchesInterval = (template: ExceptionTemplate, date: Date): number => {
  if (!template.intervals || template.intervals.length === 0) {
    return template.defaultDeltaPercent;
  }
  const minutes = date.getHours() * 60 + date.getMinutes();
  const hits = template.intervals
    .filter((interval) => minutes >= toMinutes(interval.startTime) && minutes <= toMinutes(interval.endTime))
    .map((interval) => interval.deltaPercent);
  return hits.length ? hits.reduce((acc, value) => acc + value, 0) : 0;
};

const isActiveOnDate = (template: ExceptionTemplate, date: Date): boolean => {
  const start = new Date(template.startDate);
  const end = new Date(template.endDate);
  if (date < start || date > end) {
    return false;
  }
  if (template.recurrence === 'once') {
    return true;
  }
  if (template.recurrence === 'weekly') {
    const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % 7 === 0;
  }
  if (template.recurrence === 'monthly') {
    return date.getDate() === start.getDate();
  }
  return false;
};

const cloneSeries = (series: ForecastSeries): ForecastSeries => cloneDeep(series);

export const loadExceptionTemplates = async (
  options: ExceptionServiceOptions = {},
): Promise<ExceptionTemplate[]> => {
  await delay(options.delayMs ?? 220);
  return EXCEPTION_TEMPLATES.map((template) => ({ ...template, intervals: template.intervals?.map((interval) => ({ ...interval })) }));
};

export interface AppliedException {
  templateId: string;
  deltaPercent: number;
}

export interface ExceptionApplicationResult {
  adjusted: ForecastSeries;
  applied: AppliedException[];
}

export const applyExceptionTemplates = (
  baseSeries: ForecastSeries,
  templates: ExceptionTemplate[],
): ExceptionApplicationResult => {
  const adjusted = cloneSeries(baseSeries);
  const applied: AppliedException[] = [];
  adjusted.points = adjusted.points.map((point) => {
    const date = new Date(point.timestamp);
    const totalDelta = templates
      .filter((template) => isActiveOnDate(template, date))
      .map((template) => matchesInterval(template, date))
      .reduce((acc, value) => acc + value, 0);
    if (totalDelta === 0) {
      return point;
    }
    const newValue = Number((point.value * (1 + totalDelta)).toFixed(1));
    applied.push({ templateId: `${date.toISOString()}::${totalDelta.toFixed(2)}`, deltaPercent: totalDelta });
    return { ...point, value: newValue };
  });
  return { adjusted, applied };
};

export interface ExceptionSummary {
  absoluteDelta: number;
  percentDelta: number;
}

export const summariseExceptionImpact = (
  baseSeries: ForecastSeries,
  adjustedSeries: ForecastSeries,
): ExceptionSummary => {
  const totalBase = baseSeries.points.reduce((acc, point) => acc + point.value, 0);
  const totalAdjusted = adjustedSeries.points.reduce((acc, point) => acc + point.value, 0);
  const absoluteDelta = Number((totalAdjusted - totalBase).toFixed(1));
  const percentDelta = totalBase === 0 ? 0 : Number(((absoluteDelta / totalBase) * 100).toFixed(1));
  return { absoluteDelta, percentDelta };
};

export const resetExceptionTemplates = async (): Promise<ExceptionTemplate[]> => EXCEPTION_TEMPLATES.map((template) => ({ ...template }));
TS
```

4. **File:** `src/modules/forecasting/absenteeism/index.ts`
   - **Changes:** Provide profile CRUD helpers shared between demos (list/create/update/delete/duplicate). Rehost data from `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx` + fixtures.
```bash
cat <<'TS' > src/modules/forecasting/absenteeism/index.ts
import { nanoid } from 'nanoid';

export type AbsenteeismInterval = 'daily' | 'weekly';

export interface AbsenteeismRule {
  id: string;
  label: string;
  percent: number;
  appliesTo?: string;
}

export interface AbsenteeismProfile {
  id: string;
  name: string;
  interval: AbsenteeismInterval;
  horizonWeeks: number;
  exceptions: number;
  nextRun: string;
  updatedAt: string;
  createdBy: string;
  rules: AbsenteeismRule[];
}

export interface AbsenteeismMutationOptions {
  delayMs?: number;
}

const BASE_PROFILES: AbsenteeismProfile[] = [
  {
    id: 'default-profile',
    name: 'Базовый профиль call-центра',
    interval: 'weekly',
    horizonWeeks: 12,
    exceptions: 2,
    nextRun: '2025-11-04T05:00:00.000Z',
    updatedAt: '2025-10-18T10:00:00.000Z',
    createdBy: 'planner',
    rules: [
      { id: 'weekday', label: 'Пн–Пт', percent: 9.5, appliesTo: 'weekday' },
      { id: 'weekend', label: 'Сб–Вс', percent: 6.2, appliesTo: 'weekend' },
    ],
  },
  {
    id: 'training-gap',
    name: 'Сессия обучения декабрь',
    interval: 'daily',
    horizonWeeks: 6,
    exceptions: 4,
    nextRun: '2025-11-12T05:00:00.000Z',
    updatedAt: '2025-10-25T12:00:00.000Z',
    createdBy: 'hr_manager',
    rules: [
      { id: 'mon', label: 'Понедельник', percent: 14 },
      { id: 'wed', label: 'Среда', percent: 16 },
      { id: 'fri', label: 'Пятница', percent: 12 },
    ],
  },
  {
    id: 'seasonal',
    name: 'Сезон отпусков',
    interval: 'weekly',
    horizonWeeks: 20,
    exceptions: 6,
    nextRun: '2025-11-01T05:00:00.000Z',
    updatedAt: '2025-09-17T09:00:00.000Z',
    createdBy: 'resource_team',
    rules: [
      { id: 'peak', label: 'Недели 26-31', percent: 18, appliesTo: 'summer' },
      { id: 'off-peak', label: 'Остальные недели', percent: 8 },
    ],
  },
];

let profiles: AbsenteeismProfile[] = BASE_PROFILES.map((profile) => ({
  ...profile,
  rules: profile.rules.map((rule) => ({ ...rule })),
}));

const delay = (ms?: number) => new Promise((resolve) => setTimeout(resolve, ms ?? 200));

const cloneProfile = (profile: AbsenteeismProfile): AbsenteeismProfile => ({
  ...profile,
  rules: profile.rules.map((rule) => ({ ...rule })),
});

export const resetAbsenteeismProfiles = (): void => {
  profiles = BASE_PROFILES.map(cloneProfile);
};

export const loadAbsenteeismProfiles = async (
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  return profiles.map(cloneProfile);
};

export interface AbsenteeismProfileInput {
  id?: string;
  name: string;
  interval: AbsenteeismInterval;
  horizonWeeks: number;
  exceptions: number;
  nextRun: string;
  rules: Array<Omit<AbsenteeismRule, 'id'>>;
}

export const upsertAbsenteeismProfile = async (
  input: AbsenteeismProfileInput,
  actor: string,
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  const now = new Date().toISOString();
  const existingIndex = input.id ? profiles.findIndex((profile) => profile.id === input.id) : -1;
  const rules = input.rules.map((rule) => ({ ...rule, id: rule.id ?? nanoid(6) }));
  const nextProfile: AbsenteeismProfile = {
    id: input.id ?? nanoid(10),
    name: input.name,
    interval: input.interval,
    horizonWeeks: input.horizonWeeks,
    exceptions: input.exceptions,
    nextRun: input.nextRun,
    rules,
    updatedAt: now,
    createdBy: actor,
  };
  if (existingIndex >= 0) {
    profiles.splice(existingIndex, 1, nextProfile);
  } else {
    profiles.unshift(nextProfile);
  }
  return profiles.map(cloneProfile);
};

export const duplicateAbsenteeismProfile = async (
  id: string,
  actor: string,
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  const profile = profiles.find((item) => item.id === id);
  if (!profile) {
    return profiles.map(cloneProfile);
  }
  const duplicated: AbsenteeismProfileInput = {
    name: `${profile.name} (копия)`,
    interval: profile.interval,
    horizonWeeks: profile.horizonWeeks,
    exceptions: profile.exceptions,
    nextRun: profile.nextRun,
    rules: profile.rules.map(({ id: _id, ...rest }) => rest),
  };
  return upsertAbsenteeismProfile(duplicated, actor, options);
};

export const deleteAbsenteeismProfile = async (
  id: string,
  options: AbsenteeismMutationOptions = {},
): Promise<AbsenteeismProfile[]> => {
  await delay(options.delayMs);
  profiles = profiles.filter((profile) => profile.id !== id);
  return profiles.map(cloneProfile);
};

export const findAbsenteeismProfile = (id: string): AbsenteeismProfile | undefined =>
  profiles.find((profile) => profile.id === id);
TS
```

5. **File:** `src/modules/forecasting/reports/index.ts`
   - **Changes:** Surface full report catalogue (formats + metadata) based on CH6 and forecasting components, supporting CSV/XLSX/PDF toggles.
```bash
cat <<'TS' > src/modules/forecasting/reports/index.ts
export type ReportFormat = 'csv' | 'xlsx' | 'pdf';

export type ReportStatus = 'available' | 'processing' | 'comingSoon';

export interface ReportParameter {
  id: string;
  label: string;
  value: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: 'schedule' | 'attendance' | 'payroll' | 'licence';
  availableFormats: ReportFormat[];
  defaultFormat: ReportFormat;
  parameters: ReportParameter[];
  status: ReportStatus;
}

const REPORTS: ReportDefinition[] = [
  {
    id: 't13',
    name: 'Т‑13 (табель учёта)',
    description: 'Официальная форма с учётом минут и отсутствий',
    category: 'attendance',
    availableFormats: ['csv', 'xlsx'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'Октябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 'work-schedule',
    name: 'График рабочего времени',
    description: 'Месячный график смен по сотрудникам',
    category: 'schedule',
    availableFormats: ['csv', 'xlsx', 'pdf'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'Ноябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 'daily-schedule',
    name: 'График рабочего времени (сутки)',
    description: 'Помесячный разрез по суткам и сменам',
    category: 'schedule',
    availableFormats: ['csv', 'xlsx'],
    defaultFormat: 'csv',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: '1–7 ноября 2025' },
    ],
    status: 'available',
  },
  {
    id: 'deviations',
    name: 'Отклонения от нормы часов',
    description: 'Сравнение плана и факта по часам',
    category: 'attendance',
    availableFormats: ['csv', 'xlsx'],
    defaultFormat: 'csv',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'Октябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 'employee-schedule',
    name: 'Рабочий график сотрудников',
    description: 'Отчёт по сменам и статусу по каждому сотруднику',
    category: 'schedule',
    availableFormats: ['xlsx'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'Ноябрь 2025' },
    ],
    status: 'processing',
  },
  {
    id: 'payroll',
    name: 'Расчёт заработной платы',
    description: 'Агрегация смен, ставок и сверхурочных',
    category: 'payroll',
    availableFormats: ['xlsx'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'III квартал 2025' },
    ],
    status: 'comingSoon',
  },
  {
    id: 'build-log',
    name: 'Журнал построения прогнозов',
    description: 'Последние действия по построению прогнозов и исключениям',
    category: 'attendance',
    availableFormats: ['csv'],
    defaultFormat: 'csv',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'range', label: 'Диапазон', value: 'Последние 14 дней' },
    ],
    status: 'available',
  },
  {
    id: 'licence',
    name: 'Статус лицензий',
    description: 'Текущее потребление лицензий WFM',
    category: 'licence',
    availableFormats: ['pdf'],
    defaultFormat: 'pdf',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'snapshot', label: 'Срез', value: new Date().toLocaleString('ru-RU') },
    ],
    status: 'available',
  },
];

export const listReportDefinitions = (): ReportDefinition[] =>
  REPORTS.map((report) => ({
    ...report,
    parameters: report.parameters.map((parameter) => ({ ...parameter })),
  }));

export const findReportDefinition = (id: string): ReportDefinition | undefined =>
  REPORTS.find((report) => report.id === id);

export const buildReportFilename = (
  reportId: string,
  format: ReportFormat,
  timestamp = new Date(),
): string => `${reportId}_${timestamp.toISOString().slice(0, 10)}.${format}`;
TS
```

6. **File:** `src/modules/forecasting/trends/index.ts`
   - **Changes:** Expose shared trend dataset builder and anomaly metadata, porting logic from `${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/trends.ts`.
```bash
cat <<'TS' > src/modules/forecasting/trends/index.ts
import type { ConfidenceBand, ForecastSeries } from '../types';

export interface TrendDataset {
  series: ForecastSeries[];
  confidence: ConfidenceBand;
  anomalies: TrendAnomaly[];
  seasonality: SeasonalityBucket[];
}

export interface TrendAnomaly {
  timestamp: string;
  label: string;
  deltaPercent: number;
}

export interface SeasonalityBucket {
  label: string;
  forecast: number;
  actual: number;
}

export interface TrendGenerationOptions {
  seed?: number;
  points?: number;
  unit?: ForecastSeries['unit'];
}

const seededRandom = (seed: number) => {
  let current = seed;
  return () => {
    const value = Math.sin(current++) * 10000;
    return value - Math.floor(value);
  };
};

const buildTimestamps = (count: number): string[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (count - index - 1));
    return date.toISOString();
  });
};

const buildSeries = (
  id: string,
  label: string,
  color: string,
  unit: ForecastSeries['unit'],
  points: Array<{ timestamp: string; value: number }>,
  overrides: Partial<ForecastSeries> = {},
): ForecastSeries => ({
  id,
  label,
  color,
  unit,
  axis: overrides.axis ?? 'primary',
  area: overrides.area,
  hiddenInLegend: overrides.hiddenInLegend,
  points,
});

export const generateTrendDataset = (
  options: TrendGenerationOptions = {},
): TrendDataset => {
  const pointCount = options.points ?? 30;
  const unit = options.unit ?? 'percent';
  const random = seededRandom(options.seed ?? 42);
  const timestamps = buildTimestamps(pointCount);

  const forecastPoints = timestamps.map((timestamp, index) => ({
    timestamp,
    value: Number((86 + random() * 10 + index * 0.1).toFixed(1)),
  }));
  const actualPoints = forecastPoints.map((point) => ({
    timestamp: point.timestamp,
    value: Number((point.value + (random() - 0.5) * 6).toFixed(1)),
  }));
  const secondaryPoints = forecastPoints.map((point) => ({
    timestamp: point.timestamp,
    value: Number((4.4 + random() * 0.4).toFixed(2)),
  }));

  const forecastSeries = buildSeries('forecast', 'Прогноз', '#2563eb', unit, forecastPoints);
  const actualSeries = buildSeries('actual', 'Факт', '#22c55e', unit, actualPoints);
  const secondarySeries = buildSeries(
    'csat',
    'CSAT',
    '#f97316',
    'count',
    secondaryPoints,
    { axis: 'secondary' },
  );

  const confidence: ConfidenceBand = {
    lower: buildSeries(
      'confidence-lower',
      'Нижняя граница',
      '#bfdbfe',
      unit,
      forecastPoints.map((point) => ({
        timestamp: point.timestamp,
        value: Number((point.value * 0.95).toFixed(1)),
      })),
      { area: true, hiddenInLegend: true },
    ),
    upper: buildSeries(
      'confidence-upper',
      'Верхняя граница',
      '#bfdbfe',
      unit,
      forecastPoints.map((point) => ({
        timestamp: point.timestamp,
        value: Number((point.value * 1.05).toFixed(1)),
      })),
      { area: true, hiddenInLegend: true },
    ),
  };

  const anomalies: TrendAnomaly[] = forecastPoints
    .filter((point, index) => index % 9 === 0)
    .map((point) => ({
      timestamp: point.timestamp,
      label: 'Скачок нагрузки',
      deltaPercent: Number((random() * 12 + 5).toFixed(1)),
    }));

  const seasonality: SeasonalityBucket[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label, index) => ({
    label,
    forecast: Number((forecastPoints[index % forecastPoints.length].value + random() * 2).toFixed(1)),
    actual: Number((actualPoints[index % actualPoints.length].value + random() * 2).toFixed(1)),
  }));

  return {
    series: [confidence.lower, confidence.upper, forecastSeries, actualSeries, secondarySeries],
    confidence,
    anomalies,
    seasonality,
  };
};
TS
```

7. **File:** `src/modules/forecasting/adjustments/index.ts`
   - **Changes:** Provide shared adjustment table helpers with undo/redo and validation thresholds inspired by forecasting services/adapters.
```bash
cat <<'TS' > src/modules/forecasting/adjustments/index.ts
import { nanoid } from 'nanoid';

export type AdjustmentStatus = 'ok' | 'warning' | 'error';

export interface AdjustmentRow {
  id: string;
  period: string;
  forecast: number;
  adjustmentPercent: number;
  total: number;
  requiredAgents: number;
  confidence: number;
  status: AdjustmentStatus;
}

export interface AdjustmentSession {
  rows: AdjustmentRow[];
  undo: AdjustmentRow[][];
  redo: AdjustmentRow[][];
}

export interface AdjustmentSeedOptions {
  days?: number;
  base?: number;
  seed?: number;
}

const seededRandom = (seed: number) => {
  let current = seed;
  return () => {
    const value = Math.sin(current++) * 10000;
    return value - Math.floor(value);
  };
};

const cloneRows = (rows: AdjustmentRow[]): AdjustmentRow[] => rows.map((row) => ({ ...row }));

const evaluateStatus = (percent: number): AdjustmentStatus => {
  const absolute = Math.abs(percent * 100);
  if (absolute >= 20 && absolute < 30) {
    return 'warning';
  }
  if (absolute >= 30) {
    return 'error';
  }
  return 'ok';
};

export const createAdjustmentRows = (
  options: AdjustmentSeedOptions = {},
): AdjustmentRow[] => {
  const days = options.days ?? 7;
  const base = options.base ?? 160;
  const random = seededRandom(options.seed ?? 17);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const forecast = Math.round(base + random() * 30 - 15);
    const adjustmentPercent = Number(((random() - 0.5) * 0.1).toFixed(3));
    const total = Math.round(forecast * (1 + adjustmentPercent));
    const requiredAgents = Math.max(10, Math.round(total / 8));
    const confidence = Number((70 + random() * 20).toFixed(1));
    const status = evaluateStatus(adjustmentPercent);
    return {
      id: nanoid(8),
      period: date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
      forecast,
      adjustmentPercent,
      total,
      requiredAgents,
      confidence,
      status,
    };
  });
};

export const createAdjustmentSession = (options: AdjustmentSeedOptions = {}): AdjustmentSession => ({
  rows: createAdjustmentRows(options),
  undo: [],
  redo: [],
});

const commit = (session: AdjustmentSession, nextRows: AdjustmentRow[]): AdjustmentSession => ({
  rows: nextRows,
  undo: [...session.undo, cloneRows(session.rows)],
  redo: [],
});

export const applyAdjustment = (
  session: AdjustmentSession,
  rowId: string,
  deltaPercent: number,
): AdjustmentSession => {
  const rows = session.rows.map((row) => {
    if (row.id !== rowId) {
      return row;
    }
    const nextPercent = Number((row.adjustmentPercent + deltaPercent).toFixed(3));
    const total = Math.round(row.forecast * (1 + nextPercent));
    return {
      ...row,
      adjustmentPercent: nextPercent,
      total,
      requiredAgents: Math.max(10, Math.round(total / 8)),
      status: evaluateStatus(nextPercent),
    };
  });
  return commit(session, rows);
};

export const applyBulkAdjustment = (
  session: AdjustmentSession,
  deltaPercent: number,
): AdjustmentSession => {
  const rows = session.rows.map((row) => {
    const nextPercent = Number((row.adjustmentPercent + deltaPercent).toFixed(3));
    const total = Math.round(row.forecast * (1 + nextPercent));
    return {
      ...row,
      adjustmentPercent: nextPercent,
      total,
      requiredAgents: Math.max(10, Math.round(total / 8)),
      status: evaluateStatus(nextPercent),
    };
  });
  return commit(session, rows);
};

export const resetAdjustments = (session: AdjustmentSession): AdjustmentSession => ({
  rows: createAdjustmentRows({ days: session.rows.length }),
  undo: [...session.undo, cloneRows(session.rows)],
  redo: [],
});

export const undoAdjustment = (session: AdjustmentSession): AdjustmentSession => {
  const previous = session.undo.pop();
  if (!previous) {
    return session;
  }
  return {
    rows: previous,
    undo: [...session.undo],
    redo: [cloneRows(session.rows), ...session.redo],
  };
};

export const redoAdjustment = (session: AdjustmentSession): AdjustmentSession => {
  const next = session.redo.shift();
  if (!next) {
    return session;
  }
  return {
    rows: next,
    undo: [...session.undo, cloneRows(session.rows)],
    redo: [...session.redo],
  };
};

export interface AdjustmentSummary {
  positive: number;
  negative: number;
  warnings: number;
  errors: number;
}

export const summariseAdjustments = (rows: AdjustmentRow[]): AdjustmentSummary => {
  return rows.reduce(
    (summary, row) => {
      if (row.adjustmentPercent > 0) {
        summary.positive += row.adjustmentPercent;
      } else if (row.adjustmentPercent < 0) {
        summary.negative += row.adjustmentPercent;
      }
      if (row.status === 'warning') {
        summary.warnings += 1;
      } else if (row.status === 'error') {
        summary.errors += 1;
      }
      return summary;
    },
    { positive: 0, negative: 0, warnings: 0, errors: 0 },
  );
};
TS
```

8. **File:** `src/modules/forecasting/__tests__/exceptions.test.ts`
   - **Changes:** Add smoke tests covering template application and summary calculations.
```bash
cat <<'TS' > src/modules/forecasting/__tests__/exceptions.test.ts
import { applyExceptionTemplates, loadExceptionTemplates, summariseExceptionImpact } from '../exceptions';
import { generateForecastBuild } from '../data';

describe('forecasting exceptions', () => {
  it('adjusts the series when templates are applied', async () => {
    const templates = await loadExceptionTemplates({ delayMs: 0 });
    const build = generateForecastBuild('Контакт-центр 1010.ru', 4, 4);
    const { adjusted } = applyExceptionTemplates(build.forecast, templates.slice(0, 1));
    expect(adjusted.points.every((point) => point.value !== build.forecast.points[0].value)).toBe(true);
  });

  it('summarises absolute and percent deltas', async () => {
    const templates = await loadExceptionTemplates({ delayMs: 0 });
    const build = generateForecastBuild('Контакт-центр 1010.ru', 6, 2);
    const { adjusted } = applyExceptionTemplates(build.forecast, templates.slice(0, 2));
    const summary = summariseExceptionImpact(build.forecast, adjusted);
    expect(summary.percentDelta).not.toBeNaN();
  });
});
TS
```

9. **File:** `src/modules/forecasting/__tests__/adjustments.test.ts`
   - **Changes:** Add tests for adjustment session helpers (bulk, undo/redo, summary).
```bash
cat <<'TS' > src/modules/forecasting/__tests__/adjustments.test.ts
import {
  applyAdjustment,
  applyBulkAdjustment,
  createAdjustmentSession,
  redoAdjustment,
  summariseAdjustments,
  undoAdjustment,
} from '../adjustments';

describe('forecasting adjustments', () => {
  it('updates rows and recalculates totals when applying adjustments', () => {
    const session = createAdjustmentSession({ seed: 3 });
    const target = session.rows[0];
    const updated = applyAdjustment(session, target.id, 0.1);
    expect(updated.rows[0].total).not.toEqual(target.total);
  });

  it('supports bulk adjustments and undo/redo history', () => {
    let session = createAdjustmentSession({ seed: 4 });
    session = applyBulkAdjustment(session, 0.05);
    const amended = undoAdjustment(session);
    expect(amended.rows[0].total).not.toEqual(session.rows[0].total);
    const redo = redoAdjustment(amended);
    expect(redo.rows[0].total).toEqual(session.rows[0].total);
  });

  it('produces adjustment summary metrics', () => {
    const session = createAdjustmentSession({ seed: 18 });
    const summary = summariseAdjustments(session.rows);
    expect(summary).toHaveProperty('positive');
    expect(summary).toHaveProperty('warnings');
  });
});
TS
```

## Phase 2: Migrate Analytics Dashboard to Shared Forecasting APIs

### Overview
Wire the analytics demo forecasting tab to the shared module: add exceptions wizard, absenteeism profile management, manual adjustments, full report catalogue, and shared trend dataset consumption. Replace local mocks/adapters with shared helpers.

### Changes Required:
1. **File:** `${ANALYTICS_REPO}/package.json`
   - **Changes:** Ensure `lodash-es` and `nanoid` are available (used by shared module). If already present, skip; otherwise add dev deps (`npm install lodash-es nanoid`).

2. **File:** `${ANALYTICS_REPO}/src/data/mock.ts`
   - **Changes:** Remove bespoke trend/forecast/absenteeism generators now provided by shared module. Keep only analytics-only seeds (KPI cards, heatmap, radar). Replace `generateDashboardData().trend` with shared `generateTrendDataset` and expose via new service module.

3. **New File:** `${ANALYTICS_REPO}/src/services/forecastingShared.ts`
   - **Changes:** Bridge functions that call shared module helpers (`runForecastBuild`, `loadExceptionTemplates`, `applyExceptionTemplates`, `loadAbsenteeismProfiles`, `upsert/duplicate/delete`, `generateTrendDataset`, `createAdjustmentSession`, etc.).

4. **File:** `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx`
   - **Changes:** Extend builder to preview exception application and link to new wizard (prop-drill shared api). Accept optional `onPreview` to show effect and render summary using `summariseExceptionImpact`.

5. **New File:** `${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx`
   - **Changes:** Create component reflecting forecasting demo: day/interval toggle, template cards with apply/download stub, preview chart using builder result and shared summary.

6. **New File:** `${ANALYTICS_REPO}/src/features/forecasting/AbsenteeismWorkspace.tsx`
   - **Changes:** Provide profile table (name, interval, horizon, rules count, next run), action buttons (duplicate/edit/delete) calling shared helpers, form dialog for create/edit.

7. **New File:** `${ANALYTICS_REPO}/src/features/forecasting/AdjustmentsPanel.tsx`
   - **Changes:** Recreate manual adjustments table with undo/redo, bulk +/-10 buttons, reuse shared session helpers. Maintain RU copy and status badges.

8. **File:** `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx`
   - **Changes:** Replace local trend generation with shared `generateTrendDataset`, wire anomalies/seasonality into UI (chart overlays + seasonality table) and remove local randomization.

9. **File:** `${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx`
   - **Changes:** Render full report catalogue from `listReportDefinitions()`. Provide format dropdown per report and use `buildReportFilename()` for downloads.

10. **File:** `${ANALYTICS_REPO}/src/App.tsx`
    - **Changes:** Replace the simple `ForecastBuilder` slot with a forecasting workspace including sub-tabs (Builder, Exceptions, Absenteeism, Adjustments). Manage local state for active subview and reuse shared components. Ensure ARIA labeling consistent.

11. **File:** `${ANALYTICS_REPO}/src/styles/index.css`
    - **Changes:** Add styles for new sub-tabs, cards, dialog forms (matching forecasting demo). Reuse existing utility classes to avoid drift.

12. **Tests:**
    - Update / extend Vitest suites: create new tests under `src/features/forecasting/__tests__/` to cover exceptions wizard state and adjustments reducer using shared module.
    - Update Playwright test `e2e/analytics.spec.ts` to cover new flows (open exceptions tab, duplicate profile, bulk adjust). Save new artifacts per screenshot checklist.

## Phase 3: Refactor Forecasting & Analytics Demo to Consume Shared Module

### Overview
Remove local forecasting implementations and import shared helpers to keep both demos aligned.

### Changes Required:
1. **Dependencies:** Ensure `${FORECASTING_ANALYTICS_REPO}` includes `lodash-es` and `nanoid` (matching shared module usage) via `npm install` if missing.
2. **File removals:** Delete redundant modules now replaced by shared exports:
   - `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx`
   - `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`
   - `src/components/forecasting/ManualAdjustmentSystem.tsx`
   - `src/services/forecastingApi.ts`
   - `src/data/forecastingFixtures.ts`
   - `src/adapters/forecasting/{trends.ts,adjustments.ts}`
   - Associated tests under `tests/forecasting/*` (they will migrate).
3. **File:** `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ForecastingTabs.tsx` (or equivalent containers)
   - **Changes:** Replace local imports with `@wfm/shared/forecasting` functions created in Phase 1. Adjust props to match shared function signatures.
4. **Tests:** Move Vitest suites (`tests/forecasting/accuracy.test.ts`, `trends.test.ts`, `adjustments.test.ts`) into this repo’s `src/modules/forecasting/__tests__/` (already added). Remove duplicates from forecasting repo and add thin wrapper tests to ensure integration (optionally assert that shared module returns expected shapes).
5. **Playwright:** Update existing forecasting e2e tests to call shared flows; ensure selectors remain stable after component swap.

## Phase 4: Tests & Validation
- **Shared repo (this):**
  - `npm run lint`
  - `npm run test -- --runInBand`
- **Analytics repo:**
  - `npm_config_workspaces=false npm run typecheck`
  - `npm_config_workspaces=false npm run test`
  - `npm_config_workspaces=false npm run build`
  - `npm_config_workspaces=false npm run test:e2e`
- **Forecasting repo:**
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
  - `npm run smoke:routes`

Capture new Playwright artifacts for exceptions, absenteeism, adjustments, and report export prompts; update checklist paths (`docs/Tasks/screenshot-checklist.md`).

## Phase 5: Documentation & UAT Updates
- `docs/Tasks/analytics-forecasting-overlap-discovery.md`: Append summary noting shared module coverage and remaining deltas (if any).
- `docs/System/WRAPPER_ADOPTION_MATRIX.md`: Mark analytics & forecasting rows as sharing exceptions/absenteeism/report helpers.
- `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, `docs/System/APPENDIX1_SCOPE_CROSSWALK.md`: Update rows with new shared module references (file:line, repo path variables).
- `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`: Update AD-1..AD-4 and FA-1..FA-3 rows with reuse notes and new evidence (Playwright artifact paths, screenshots).
- `docs/Workspace/Coordinator/{analytics-dashboard,forecasting-analytics}/CodeMap.md`: Replace local file references with shared module paths.
- `docs/SOP/demo-refactor-playbook.md`: Ensure “Forecasting ↔ Analytics Cohesion” references the new shared module directories.
- `docs/SESSION_HANDOFF.md` & `PROGRESS.md`: Log completion with validation commands and deploy URLs.

## Tests & Validation Summary (post-execution)
- Shared repo tests (Vitest) & lint.
- Analytics: typecheck, unit, build, Playwright.
- Forecasting: typecheck, unit, build, smoke/Playwright.
- UAT packs: rerun `parity_static.md` + `chart_visual_spec.md` for analytics; rerun `parity_static.md` for forecasting to confirm parity across new flows.

## Rollback
1. If analytics/forecasting repos regress, revert to previous commits using `git reset --hard` against the last known good SHA recorded in `docs/SESSION_HANDOFF.md` and redeploy.
2. In shared repo, `git checkout -- src/modules/forecasting` to restore previous module state; rerun tests to confirm.
3. Remove new documentation entries by `git checkout -- docs/...` if needed.
4. Reinstall dependencies to discard newly added packages (`npm uninstall lodash-es nanoid` in affected repos) if rollback requires.

## Handoff
- Append summary to `docs/SESSION_HANDOFF.md` (shared module extraction complete, repos updated, tests run, deploy URLs, UAT status).
- Update `PROGRESS.md` current state section referencing the deployed builds and shared module adoption.
- Ensure new Playwright artifacts/screenshot aliases recorded in `docs/Tasks/screenshot-checklist.md`.
