## Metadata
- **Task**: Forecasting & Analytics Parity Gap Remediation (2025-10-29)
- **Source discovery**: `docs/Tasks/forecasting-analytics_parity-gap-remediation-2025-10-29.task.md`
- **Supporting docs**: `uat-agent-tasks/2025-10-29_forecasting-demo-vs-naumen.md`, `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`, `docs/Workspace/Coordinator/forecasting-analytics/Progress_Forecasting-Analytics_2025-10-14.md`, `${MANUALS_ROOT}/specs-bdd/CH4_FORECASTS.md`, `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md`
- **Repo**: `${FORECASTING_ANALYTICS_REPO}` (`/Users/m/git/client/naumen/forecasting-analytics`)
- **Preview port**: `http://127.0.0.1:4155/` per `docs/System/ports-registry.md`
- **Related history**: `plans/2025-10-29_forecasting-analytics-env-hardening.plan.md` (complete)

## Desired End State
- Build Forecast workspace mirrors Chapter 4 §4.1 with queue tree selection, horizon + granularity controls, day/interval toggle, absenteeism profile picker, editable absenteeism %, and live build/import/export stubs.
- Exceptions workspace surfaces periodic vs single editors, history selector, interval list with add/edit/delete, and persists templates via service helper.
- Trend Analysis dashboard enables period presets/custom range, anomaly tagging, and CSV export while keeping charts responsive.
- Absenteeism workspace manages templates (rules + overrides), supports apply/download actions, and uses shared services.
- Accuracy dashboard includes RU-localised KPI values, a report-table detail grid, and CSV export using new helpers.
- Services centralise deterministic forecast data, templates, and exports ready to swap for live API; unit tests cover new helpers and localisation.
- Step 6 UAT rerun on new prod deploy with evidence captured in UAT doc, tracker, parity matrices, Code Map, PROGRESS, and `docs/SESSION_HANDOFF.md`.

### Key Discoveries
- Build Forecast UI is static; handlers/buttons stubbed (`src/components/forecasting/build/BuildForecastWorkspace.tsx:40-136`) and fixtures lack tree/horizon/forms (`docs/Tasks/forecasting-analytics_parity-gap-remediation-2025-10-29.task.md:12-24`).
- Exceptions workspace only renders canned cards (`src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:14-68`), no editors or history controls (`docs/Tasks/forecasting-analytics_parity-gap-remediation-2025-10-29.task.md:26-33`).
- Trend dashboard discards anomaly data and ignores period selection (`src/components/forecasting/trends/TrendAnalysisDashboard.tsx:57-190`; discovery lines 35-43).
- Absenteeism table is fixture-only (`src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:4-39`; discovery lines 45-51).
- Accuracy metrics use `toFixed` with English separators (`src/utils/accuracyCalculations.ts:123-132`) and the dashboard lacks detail table/export (`src/components/forecasting/AccuracyDashboard.tsx:186-274`), causing UAT fail (`uat-agent-tasks/2025-10-29_forecasting-demo-vs-naumen.md:9-23`).
- Service layer handles only adjustment validation (`src/services/forecastingApi.ts:18-136`)—no forecast options, templates, or exports.

## What We're NOT Doing
- Hooking to live Naumen APIs (deliver deterministic mocks + clear TODOs only).
- Reworking chart wrapper infrastructure or Storybook assets.
- Changing unified shell or other repos beyond docs updates.
- Implementing backend auth/session or Playwright UAT automation—document findings instead.

## Implementation Approach
1. Extend forecasting types + fixtures to cover queue tree, forecast detail rows, templates, horizon controls, and RU-friendly data.
2. Expand `forecastingApi` with option loaders, template CRUD, CSV export helpers, and RU formatters while preserving adjustment mocks.
3. Rewrite Build, Exceptions, Absenteeism workspaces around service data (forms, stateful interactions, messaging, and download/upload stubs).
4. Enhance Trend dashboard (period presets, anomaly toggles, CSV export) and Accuracy dashboard (detail table, RU formatting, export hook).
5. Update Vitest suites for localisation + helper coverage and document new flows (Code Map, parity packs, tracker, PROGRESS, SESSION_HANDOFF).

## Phase 1: Data Contracts & Service Layer

### Overview
Create shared forecasting type definitions, enrich fixtures with deterministic data that matches Chapter 4 workflows, and extend `forecastingApi` to provide options, template CRUD, exports, and RU formatting fallbacks.

### Changes Required:

#### 1. Add forecasting type contracts
**File**: `src/types/forecasting.ts`
**Changes**: Introduce reusable interfaces for queue nodes, forecast options, templates, detail rows, and export helpers.
```bash
cat <<'CODE' > src/types/forecasting.ts
export type GranularityMode = 'day' | 'interval';

export interface QueueNode {
  id: string;
  name: string;
  parentId?: string;
  children?: QueueNode[];
}

export interface ForecastPeriod {
  start: string;
  end: string;
}

export interface ForecastBuildDefaults {
  horizonDays: number;
  buildPeriodStart: string;
  buildPeriodEnd: string;
  absenteeismProfileId: string;
}

export interface ForecastHorizonOption {
  id: string;
  label: string;
  days: number;
  granularity: GranularityMode;
}

export interface AbsenteeismProfile {
  id: string;
  label: string;
  coverage: string;
  valuePercent: number;
  notes?: string;
}

export interface ForecastDetailRow {
  id: string;
  timestamp: string;
  forecast: number;
  actual: number;
  absenteeismPercent: number;
  lostCalls: number;
  ahtSeconds: number;
  serviceLevel: number;
}

export interface ForecastOptions {
  queueTree: QueueNode[];
  horizons: ForecastHorizonOption[];
  granularityModes: GranularityMode[];
  defaultPeriod: ForecastPeriod;
  absenteeismProfiles: AbsenteeismProfile[];
  defaults: ForecastBuildDefaults;
}

export interface ForecastBuildRequest {
  queueIds: string[];
  period: ForecastPeriod;
  horizonDays: number;
  granularity: GranularityMode;
  absenteeismProfileId: string;
  absenteeismPercent: number;
}

export interface ForecastBuildResponse {
  jobId: string;
  createdAt: string;
  message: string;
  downloadUrl?: string;
}

export type ForecastUploadKind = 'forecast' | 'actual' | 'absenteeism';

export interface UploadResult {
  kind: ForecastUploadKind;
  savedAt: string;
  message: string;
}

export interface ExportPayload {
  filename: string;
  mimeType: string;
  content: string;
}

export interface ExceptionInterval {
  id: string;
  mode: 'day' | 'interval';
  dayOfWeek?: string;
  date?: string;
  start: string;
  end: string;
  smoothing?: number;
}

export interface ExceptionTemplate {
  id: string;
  label: string;
  historyHorizon: number;
  periodLabel: string;
  mode: 'periodic' | 'single';
  intervals: ExceptionInterval[];
  lastRunAt?: string;
  author?: string;
}

export interface ExceptionTemplateInput {
  id?: string;
  label: string;
  historyHorizon: number;
  periodLabel: string;
  mode: 'periodic' | 'single';
  intervals: Omit<ExceptionInterval, 'id'>[];
}

export interface AbsenteeismRule {
  id: string;
  dayOfWeek: string;
  start: string;
  end: string;
  valuePercent: number;
}

export interface AbsenteeismException {
  id: string;
  date: string;
  valuePercent: number;
}

export interface AbsenteeismTemplate {
  id: string;
  name: string;
  coverage: string;
  valuePercent: number;
  periodicRules: AbsenteeismRule[];
  singleOverrides: AbsenteeismException[];
  updatedAt: string;
  author: string;
}

export interface AbsenteeismTemplateInput {
  id?: string;
  name: string;
  coverage: string;
  valuePercent: number;
  periodicRules: Omit<AbsenteeismRule, 'id'>[];
  singleOverrides: Omit<AbsenteeismException, 'id'>[];
}

export interface ForecastDetailRequest {
  queueIds: string[];
  period: ForecastPeriod;
}

export interface TrendExportRequest {
  organizationId: string;
  queueIds: string[];
  period: ForecastPeriod;
  mode: 'strategic' | 'tactical' | 'operational';
}
CODE
```

#### 2. Enrich deterministic fixtures
**File**: `src/data/forecastingFixtures.ts`
**Changes**: Replace inline interfaces with imports from the new types file, generate 15-minute forecast data, add detail rows, horizon options, exception templates, absenteeism templates, and expose granularity list.
```bash
cat <<'CODE' > src/data/forecastingFixtures.ts
import { addMinutes, startOfDay } from 'date-fns';
import type {
  AbsenteeismProfile,
  AbsenteeismTemplate,
  ExceptionInterval,
  ExceptionTemplate,
  ForecastBuildDefaults,
  ForecastDetailRow,
  ForecastHorizonOption,
  QueueNode,
} from '../types/forecasting';

const baseStart = startOfDay(new Date(Date.UTC(2025, 9, 20)));

const timestampAt = (index: number) => addMinutes(baseStart, index * 15).toISOString();

export const queueTree: QueueNode[] = [
  {
    id: 'cc-1010',
    name: 'Контакт-центр 1010.ru',
    children: [
      {
        id: 'support',
        name: 'Отдел поддержки',
        parentId: 'cc-1010',
        children: [
          { id: 'support-l1', name: 'Первая линия', parentId: 'support' },
          { id: 'support-l2', name: 'Вторая линия', parentId: 'support' },
        ],
      },
      {
        id: 'sales',
        name: 'Активные продажи',
        parentId: 'cc-1010',
        children: [
          { id: 'sales-inbound', name: 'Входящие заявки', parentId: 'sales' },
          { id: 'sales-outbound', name: 'Исходящие звонки', parentId: 'sales' },
        ],
      },
      { id: 'back-office', name: 'Бэк-офис', parentId: 'cc-1010' },
    ],
  },
  {
    id: 'it-service',
    name: 'IT сервис-деск',
    children: [
      { id: 'it-first', name: 'Линия L1', parentId: 'it-service' },
      { id: 'it-second', name: 'Линия L2', parentId: 'it-service' },
    ],
  },
];

export const forecastSeries = Array.from({ length: 96 }, (_, index) => {
  const timestamp = timestampAt(index);
  const minutes = index * 15;
  const base = minutes >= 360 && minutes <= 1020 ? 150 : 90;
  const seasonal = minutes % 180 === 0 ? 18 : 0;
  const forecast = base + seasonal;
  const actual = minutes < 960 ? forecast + (index % 8 === 0 ? 8 : -4) : undefined;
  return { timestamp, forecast, actual };
});

export const forecastDetailRows: ForecastDetailRow[] = forecastSeries.map((point, index) => ({
  id: `slot-${index}`,
  timestamp: point.timestamp,
  forecast: point.forecast,
  actual: point.actual ?? point.forecast - 6,
  absenteeismPercent: index % 12 === 0 ? 7 : 4,
  lostCalls: index % 10 === 0 ? 3 : 0,
  ahtSeconds: 290 + (index % 6) * 12,
  serviceLevel: 88 + (index % 7),
}));

export const buildForecastDefaults: ForecastBuildDefaults = {
  horizonDays: 30,
  buildPeriodStart: forecastSeries[0].timestamp,
  buildPeriodEnd: forecastSeries[forecastSeries.length - 1].timestamp,
  absenteeismProfileId: 'weekday-5',
};

export const forecastHorizonOptions: ForecastHorizonOption[] = [
  { id: 'h-14-interval', label: '14 дней · 15 минут', days: 14, granularity: 'interval' },
  { id: 'h-30-day', label: '30 дней · сутки', days: 30, granularity: 'day' },
  { id: 'h-60-day', label: '60 дней · сутки', days: 60, granularity: 'day' },
  { id: 'h-90-interval', label: '90 дней · 15 минут', days: 90, granularity: 'interval' },
];

export const granularityModes: Array<'day' | 'interval'> = ['day', 'interval'];

export const absenteeismProfiles: AbsenteeismProfile[] = [
  {
    id: 'weekday-5',
    label: 'Базовый профиль — будни 5%',
    coverage: 'Пн–Пт, 09:00–18:00',
    valuePercent: 5,
    notes: 'Оптимизирован под типовой офисный график',
  },
  {
    id: 'peak-season',
    label: 'Праздничный период — декабрь',
    coverage: '01.12–15.01, 10%',
    valuePercent: 10,
    notes: 'Используйте при пиковых нагрузках',
  },
  {
    id: 'night-shift',
    label: 'Ночная смена — 3%',
    coverage: 'Ежедневно 22:00–07:00',
    valuePercent: 3,
  },
];

const periodicRule = (
  overrides: Partial<ExceptionInterval> & { start: string; end: string },
): ExceptionInterval => ({
  id: `rule-${Math.random().toString(36).slice(2, 9)}`,
  mode: overrides.mode ?? 'interval',
  dayOfWeek: overrides.dayOfWeek,
  date: overrides.date,
  start: overrides.start,
  end: overrides.end,
  smoothing: overrides.smoothing,
});

export const exceptionTemplates: ExceptionTemplate[] = [
  {
    id: 'new-year',
    label: 'Новогодние праздники',
    historyHorizon: 90,
    periodLabel: '29.12–08.01',
    mode: 'periodic',
    intervals: [
      periodicRule({ mode: 'day', start: '2025-12-29', end: '2026-01-08', smoothing: 0.3 }),
    ],
    lastRunAt: '2025-12-15T05:00:00.000Z',
    author: 'planner@1010.ru',
  },
  {
    id: 'march-8',
    label: '08 марта',
    historyHorizon: 60,
    periodLabel: '08.03 00:00–23:59',
    mode: 'single',
    intervals: [
      periodicRule({ mode: 'day', start: '2026-03-08', end: '2026-03-08' }),
      periodicRule({ mode: 'interval', dayOfWeek: 'sunday', start: '09:00', end: '21:00' }),
    ],
    lastRunAt: '2025-03-02T05:00:00.000Z',
    author: 'analytics@1010.ru',
  },
  {
    id: 'black-friday',
    label: 'Black Friday',
    historyHorizon: 45,
    periodLabel: 'Пт–Вс последней недели ноября',
    mode: 'periodic',
    intervals: [
      periodicRule({ dayOfWeek: 'friday', start: '08:00', end: '22:00' }),
      periodicRule({ dayOfWeek: 'saturday', start: '09:00', end: '21:00' }),
      periodicRule({ dayOfWeek: 'sunday', start: '10:00', end: '20:00' }),
    ],
  },
];

export const absenteeismTemplates: AbsenteeismTemplate[] = [
  {
    id: 'template-weekday',
    name: 'Будние дни — 5%',
    coverage: 'Пн–Пт, 09:00–18:00',
    valuePercent: 5,
    periodicRules: [
      { id: 'rule-weekday-1', dayOfWeek: 'monday', start: '09:00', end: '18:00', valuePercent: 5 },
      { id: 'rule-weekday-2', dayOfWeek: 'tuesday', start: '09:00', end: '18:00', valuePercent: 5 },
      { id: 'rule-weekday-3', dayOfWeek: 'wednesday', start: '09:00', end: '18:00', valuePercent: 5 },
      { id: 'rule-weekday-4', dayOfWeek: 'thursday', start: '09:00', end: '18:00', valuePercent: 5 },
      { id: 'rule-weekday-5', dayOfWeek: 'friday', start: '09:00', end: '18:00', valuePercent: 5 },
    ],
    singleOverrides: [
      { id: 'override-jan-02', date: '2026-01-02', valuePercent: 8 },
    ],
    updatedAt: '2025-09-18T08:30:00.000Z',
    author: 'planner@1010.ru',
  },
  {
    id: 'template-peak',
    name: 'Пик декабрьских продаж',
    coverage: '01.12–15.01',
    valuePercent: 10,
    periodicRules: [
      { id: 'rule-peak-1', dayOfWeek: 'monday', start: '08:00', end: '22:00', valuePercent: 12 },
      { id: 'rule-peak-2', dayOfWeek: 'saturday', start: '10:00', end: '20:00', valuePercent: 15 },
      { id: 'rule-peak-3', dayOfWeek: 'sunday', start: '11:00', end: '19:00', valuePercent: 14 },
    ],
    singleOverrides: [
      { id: 'override-dec-31', date: '2025-12-31', valuePercent: 20 },
      { id: 'override-jan-01', date: '2026-01-01', valuePercent: 25 },
    ],
    updatedAt: '2025-10-10T10:15:00.000Z',
    author: 'naumen-forecast@1010.ru',
  },
];
CODE
```

#### 3. Expand forecasting API helpers
**File**: `src/services/forecastingApi.ts`
**Changes**: Import enriched fixtures/types, add option loader, build runner, upload/download stubs, exception/absenteeism template CRUD, detail fetcher, trend & accuracy exports, and retain adjustment validation.
```bash
cat <<'CODE' > src/services/forecastingApi.ts
import {
  absenteeismProfiles,
  absenteeismTemplates as absenteeismTemplateFixtures,
  buildForecastDefaults,
  exceptionTemplates as exceptionTemplateFixtures,
  forecastDetailRows,
  forecastHorizonOptions,
  forecastSeries,
  granularityModes,
  queueTree,
} from '../data/forecastingFixtures';
import type {
  AbsenteeismTemplate,
  AbsenteeismTemplateInput,
  ExceptionTemplate,
  ExceptionTemplateInput,
  ExportPayload,
  ForecastBuildRequest,
  ForecastBuildResponse,
  ForecastDetailRequest,
  ForecastDetailRow,
  ForecastOptions,
  ForecastUploadKind,
  TrendExportRequest,
  UploadResult,
} from '../types/forecasting';
import type { AdjustmentPayload, AdjustmentResult } from '../types/adjustments';

const API_URL = import.meta.env.VITE_FORECASTING_API_URL;
const hasApiEndpoint = typeof API_URL === 'string' && API_URL.length > 0;

const withBase = (path: string) => (hasApiEndpoint ? `${API_URL!.replace(/\/$/, '')}${path}` : path);

const cloneExceptions = (templates: ExceptionTemplate[]): ExceptionTemplate[] =>
  templates.map((template) => ({
    ...template,
    intervals: template.intervals.map((interval) => ({ ...interval })),
  }));

const cloneAbsenteeism = (templates: AbsenteeismTemplate[]): AbsenteeismTemplate[] =>
  templates.map((template) => ({
    ...template,
    periodicRules: template.periodicRules.map((rule) => ({ ...rule })),
    singleOverrides: template.singleOverrides.map((override) => ({ ...override })),
  }));

const exceptionStore = cloneExceptions(exceptionTemplateFixtures);
const absenteeismStore = cloneAbsenteeism(absenteeismTemplateFixtures);

const wait = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const ruNumber = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const fetchForecastOptions = async (): Promise<ForecastOptions> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/options'));
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось получить настройки прогноза из API', error);
    }
  }

  return {
    queueTree,
    horizons: forecastHorizonOptions,
    granularityModes,
    defaultPeriod: {
      start: buildForecastDefaults.buildPeriodStart,
      end: buildForecastDefaults.buildPeriodEnd,
    },
    absenteeismProfiles,
    defaults: buildForecastDefaults,
  };
};

export const runForecastBuild = async (payload: ForecastBuildRequest): Promise<ForecastBuildResponse> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase('/forecast/build'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Forecast build failed: ${response.status}`);
    }
    return response.json();
  }

  await wait(350);
  return {
    jobId: `sim-${Date.now()}`,
    createdAt: new Date().toISOString(),
    message: `Расчёт запущен для ${payload.queueIds.length} очередей (${payload.granularity === 'interval' ? '15 минут' : 'сутки'}) на ${payload.horizonDays} дней.`,
  };
};

export const uploadForecastFile = async (kind: ForecastUploadKind, file: File): Promise<UploadResult> => {
  if (hasApiEndpoint) {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(withBase(`/forecast/upload/${kind}`), { method: 'POST', body: form });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    const json = await response.json();
    return {
      kind,
      savedAt: json?.savedAt ?? new Date().toISOString(),
      message: json?.message ?? 'Файл принят на обработку',
    };
  }

  await wait(200);
  return {
    kind,
    savedAt: new Date().toISOString(),
    message: `Загружен файл «${file.name}» (${Math.round(file.size / 1024)} КБ). Реальное сохранение появится после интеграции API.`,
  };
};

const pickSeries = (count: number) => forecastSeries.slice(0, count);

const templateHeader = (kind: ForecastUploadKind) =>
  kind === 'forecast'
    ? 'timestamp,queue_id,forecast'
    : kind === 'actual'
      ? 'timestamp,queue_id,actual'
      : 'timestamp,queue_id,absenteeism_percent';

export const createTemplateExport = (
  kind: ForecastUploadKind,
  queueIds: string[],
  period: { start: string; end: string },
): ExportPayload => {
  const header = templateHeader(kind);
  const rows = pickSeries(48)
    .filter((point) => point.timestamp >= period.start && point.timestamp <= period.end)
    .map((point) =>
      queueIds
        .map((queueId) => {
          const value = kind === 'absenteeism'
            ? 5
            : kind === 'actual'
              ? point.actual ?? point.forecast
              : point.forecast;
          return `${point.timestamp},${queueId},${value}`;
        })
        .join('\n'),
    )
    .join('\n');

  return {
    filename: `${kind}-template_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${header}\n${rows}`,
  };
};

export const fetchExceptionTemplates = async (): Promise<ExceptionTemplate[]> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/exceptions'));
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось получить исключения из API', error);
    }
  }

  await wait(120);
  return cloneExceptions(exceptionStore);
};

export const saveExceptionTemplate = async (input: ExceptionTemplateInput): Promise<ExceptionTemplate> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase('/forecast/exceptions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Exception save failed: ${response.status}`);
    }
    return response.json();
  }

  await wait(150);
  const id = input.id ?? `tmpl-${Date.now()}`;
  const template: ExceptionTemplate = {
    id,
    label: input.label,
    historyHorizon: input.historyHorizon,
    periodLabel: input.periodLabel,
    mode: input.mode,
    intervals: input.intervals.map((interval) => ({
      ...interval,
      id: interval.id ?? `rule-${Math.random().toString(36).slice(2, 9)}`,
    })),
    lastRunAt: new Date().toISOString(),
    author: 'planner@demo',
  };

  const index = exceptionStore.findIndex((item) => item.id === id);
  if (index >= 0) {
    exceptionStore.splice(index, 1, template);
  } else {
    exceptionStore.push(template);
  }
  return template;
};

export const deleteExceptionTemplate = async (id: string): Promise<void> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase(`/forecast/exceptions/${id}`), { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Удаление исключения не удалось: ${response.status}`);
    }
    return;
  }

  await wait(120);
  const index = exceptionStore.findIndex((template) => template.id === id);
  if (index >= 0) {
    exceptionStore.splice(index, 1);
  }
};

export const fetchAbsenteeismTemplates = async (): Promise<AbsenteeismTemplate[]> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/absenteeism/templates'));
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось получить шаблоны абсентеизма из API', error);
    }
  }

  await wait(100);
  return cloneAbsenteeism(absenteeismStore);
};

export const saveAbsenteeismTemplate = async (input: AbsenteeismTemplateInput): Promise<AbsenteeismTemplate> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase('/forecast/absenteeism/templates'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Absenteeism template save failed: ${response.status}`);
    }
    return response.json();
  }

  await wait(180);
  const id = input.id ?? `abs-${Date.now()}`;
  const template: AbsenteeismTemplate = {
    id,
    name: input.name,
    coverage: input.coverage,
    valuePercent: input.valuePercent,
    periodicRules: input.periodicRules.map((rule) => ({ ...rule, id: rule.id ?? `rule-${Math.random().toString(36).slice(2, 9)}` })),
    singleOverrides: input.singleOverrides.map((override) => ({ ...override, id: override.id ?? `override-${Math.random().toString(36).slice(2, 9)}` })),
    updatedAt: new Date().toISOString(),
    author: 'planner@demo',
  };

  const index = absenteeismStore.findIndex((item) => item.id === id);
  if (index >= 0) {
    absenteeismStore.splice(index, 1, template);
  } else {
    absenteeismStore.push(template);
  }
  return template;
};

export const deleteAbsenteeismTemplate = async (id: string): Promise<void> => {
  if (hasApiEndpoint) {
    const response = await fetch(withBase(`/forecast/absenteeism/templates/${id}`), { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Удаление шаблона абсентеизма не удалось: ${response.status}`);
    }
    return;
  }

  await wait(120);
  const index = absenteeismStore.findIndex((template) => template.id === id);
  if (index >= 0) {
    absenteeismStore.splice(index, 1);
  }
};

export const fetchForecastDetail = async (request: ForecastDetailRequest): Promise<ForecastDetailRow[]> => {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/detail'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Не удалось получить детализацию прогноза из API', error);
    }
  }

  await wait(80);
  return forecastDetailRows.filter((row) => row.timestamp >= request.period.start && row.timestamp <= request.period.end);
};

export const createTrendExport = (request: TrendExportRequest): ExportPayload => {
  const header = 'timestamp,queue_id,mode,forecast,fact,abs_delta,rel_delta';
  const rows = pickSeries(48)
    .filter((point) => point.timestamp >= request.period.start && point.timestamp <= request.period.end)
    .map((point) => {
      const forecast = point.forecast;
      const actual = point.actual ?? point.forecast - 8;
      const abs = actual - forecast;
      const rel = forecast === 0 ? 0 : (abs / forecast) * 100;
      return request.queueIds
        .map((queueId) => `${point.timestamp},${queueId},${request.mode},${forecast},${actual},${ruNumber.format(abs)},${ruNumber.format(rel)}`)
        .join('\n');
    })
    .join('\n');

  return {
    filename: `trend_${request.mode}_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${header}\n${rows}`,
  };
};

export const createAccuracyExport = async (): Promise<ExportPayload> => {
  const header = 'timestamp,forecast,actual,absenteeism_percent,lost_calls,aht_seconds,service_level';
  const rows = forecastDetailRows
    .map((row) => `${row.timestamp},${row.forecast},${row.actual},${row.absenteeismPercent},${row.lostCalls},${row.ahtSeconds},${row.serviceLevel}`)
    .join('\n');

  return {
    filename: `accuracy_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: `${header}\n${rows}`,
  };
};

export const validateAdjustments = async (payload: AdjustmentPayload[]): Promise<AdjustmentResult[]> => {
  if (!payload.length) return [];

  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/adjustments/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustments: payload }),
      });
      if (response.ok) {
        const json = await response.json();
        return (json?.results ?? []).map((item: any) => ({
          id: String(item.id ?? ''),
          status: item.status === 'error' ? 'error' : item.status === 'warning' ? 'warning' : 'ok',
          message: typeof item.message === 'string' ? item.message : undefined,
        }));
      }
    } catch (error) {
      console.warn('Не удалось выполнить запрос валидации корректировок', error);
    }
  }

  return payload.map((item) => {
    const exceeds = Math.abs(item.adjustment ?? 0) > 20;
    return exceeds
      ? { id: item.id, status: 'warning', message: 'Проверьте корректировку — превышение порога 20%' }
      : { id: item.id, status: 'ok' };
  });
};

export const saveAdjustments = async (payload: AdjustmentPayload[]): Promise<void> => {
  if (!payload.length) return;

  if (hasApiEndpoint) {
    const response = await fetch(withBase('/adjustments/save'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustments: payload }),
    });
    if (!response.ok) {
      throw new Error(`Adjustments save failed: ${response.status}`);
    }
    await response.json().catch(() => undefined);
    return;
  }

  await wait(200);
};

export async function fetchForecastSeries(): Promise<Array<AdjustmentPayload & { requiredAgents: number }>> {
  if (hasApiEndpoint) {
    try {
      const response = await fetch(withBase('/forecast/series'));
      if (response.ok) {
        const json = await response.json();
        return json?.series ?? [];
      }
    } catch (error) {
      console.warn('Не удалось получить серии прогноза из API', error);
    }
  }

  return forecastSeries.slice(0, 48).map((point, index) => ({
    id: `slot-${index}`,
    timestamp: point.timestamp,
    predicted: point.forecast,
    adjustment: 0,
    total: point.actual ?? point.forecast,
    requiredAgents: Math.round((point.forecast / 6) * 0.5),
  }));
}
CODE
```

#### 4. RU-aware metric formatting
**File**: `src/utils/accuracyCalculations.ts`
**Changes**: Replace `toFixed` usage with RU number/percent formatters reused by adapters.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/utils/accuracyCalculations.ts
@@
-export function formatMetricValue(value: number, metricType: string): string {
-  switch (metricType.toLowerCase()) {
-    case 'mape':
-    case 'accuracy':
-      return `${value.toFixed(1)}%`;
-    case 'rsquared':
-      return value.toFixed(3);
-    default:
-      return value.toFixed(2);
-  }
-}
+const percentFormatter = new Intl.NumberFormat('ru-RU', {
+  minimumFractionDigits: 1,
+  maximumFractionDigits: 1,
+});
+
+const numberFormatter = new Intl.NumberFormat('ru-RU', {
+  minimumFractionDigits: 0,
+  maximumFractionDigits: 2,
+});
+
+export function formatMetricValue(value: number, metricType: string): string {
+  const normalized = metricType.toLowerCase();
+
+  if (normalized === 'mape' || normalized === 'accuracy') {
+    return `${percentFormatter.format(value)} %`;
+  }
+
+  if (normalized === 'rsquared') {
+    return percentFormatter.format(value * 100).replace('%', '').trim();
+  }
+
+  return numberFormatter.format(value);
+}
*** End Patch
PATCH
```

## Phase 2: Build Forecast Workspace & Imports

### Overview
Rebuild the Build Forecast page around the service helpers: queue tree multiselect, horizon/granularity controls, editable absenteeism %, CSV download/upload buttons, and success/error messaging that matches Chapter 4.

### Changes Required:

#### 1. Replace Build workspace component
**File**: `src/components/forecasting/build/BuildForecastWorkspace.tsx`
**Changes**: Load options on mount, render tree recursively, capture form state, wire buttons to new service helpers, and surface status messages.
```bash
cat <<'CODE' > src/components/forecasting/build/BuildForecastWorkspace.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileDown,
  FileUp,
  PlayCircle,
  Upload,
} from 'lucide-react';
import type {
  AbsenteeismProfile,
  ForecastOptions,
  GranularityMode,
  QueueNode,
} from '../../../types/forecasting';
import {
  createTemplateExport,
  fetchForecastOptions,
  runForecastBuild,
  uploadForecastFile,
} from '../../../services/forecastingApi';
import type { ForecastUploadKind } from '../../../types/forecasting';

const flattenQueues = (nodes: QueueNode[]): string[] =>
  nodes.flatMap((node) => [node.id, ...(node.children ? flattenQueues(node.children) : [])]);

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString('ru-RU');
  } catch (error) {
    return value;
  }
};

const BuildForecastWorkspace: React.FC = () => {
  const [options, setOptions] = useState<ForecastOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<GranularityMode>('day');
  const [horizonId, setHorizonId] = useState<string>('');
  const [period, setPeriod] = useState(() => ({
    start: new Date().toISOString(),
    end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }));
  const [selectedQueues, setSelectedQueues] = useState<Set<string>>(new Set());
  const [profileId, setProfileId] = useState<string>('');
  const [absenteeismPercent, setAbsenteeismPercent] = useState<number>(5);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<ForecastUploadKind | null>(null);

  const forecastInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = useRef<HTMLInputElement>(null);
  const absenteeismInputRef = useRef<HTMLInputElement>(null);

  const currentProfile = useMemo<AbsenteeismProfile | null>(() => {
    if (!options) return null;
    return options.absenteeismProfiles.find((profile) => profile.id === profileId) ?? null;
  }, [options, profileId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const loaded = await fetchForecastOptions();
        if (!alive) return;
        setOptions(loaded);
        const defaultHorizon = loaded.horizons[0];
        setGranularity(defaultHorizon?.granularity ?? 'day');
        setHorizonId(defaultHorizon?.id ?? '');
        setPeriod({ start: loaded.defaultPeriod.start, end: loaded.defaultPeriod.end });
        setProfileId(loaded.defaults.absenteeismProfileId);
        setSelectedQueues(new Set(flattenQueues(loaded.queueTree)));
        const defaultProfile = loaded.absenteeismProfiles.find((profile) => profile.id === loaded.defaults.absenteeismProfileId);
        if (defaultProfile) {
          setAbsenteeismPercent(defaultProfile.valuePercent);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage('Не удалось загрузить настройки. Попробуйте обновить страницу.');
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const toggleQueue = useCallback(
    (id: string) => {
      setSelectedQueues((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next.size ? next : prev;
      });
    },
    [],
  );

  const handleGranularityChange = (mode: GranularityMode) => {
    setGranularity(mode);
    const candidate = options?.horizons.find((option) => option.granularity === mode);
    if (candidate) {
      setHorizonId(candidate.id);
    }
  };

  const handleHorizonChange = (id: string) => {
    setHorizonId(id);
    const target = options?.horizons.find((option) => option.id === id);
    if (target) {
      setGranularity(target.granularity);
    }
  };

  const updatePeriod = (key: 'start' | 'end', value: string) => {
    setPeriod((prev) => ({ ...prev, [key]: value }));
  };

  const updateProfile = (id: string) => {
    setProfileId(id);
    const target = options?.absenteeismProfiles.find((item) => item.id === id);
    if (target) {
      setAbsenteeismPercent(target.valuePercent);
    }
  };

  const handlePercentChange = (value: number) => {
    if (Number.isNaN(value)) return;
    const clamped = Math.max(0, Math.min(40, value));
    setAbsenteeismPercent(clamped);
  };

  const handleBuild = async () => {
    if (!options) return;
    if (!selectedQueues.size) {
      setErrorMessage('Выберите хотя бы одну очередь.');
      return;
    }

    setIsBuilding(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        queueIds: Array.from(selectedQueues),
        period,
        horizonDays: options.horizons.find((option) => option.id === horizonId)?.days ?? options.defaults.horizonDays,
        granularity,
        absenteeismProfileId: profileId,
        absenteeismPercent,
      } satisfies ForecastBuildRequest;

      const result = await runForecastBuild(payload);
      setStatusMessage(result.message ?? 'Прогноз рассчитан. Проверьте отчёт и графики.');
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось запустить расчёт. Попробуйте ещё раз.');
    } finally {
      setIsBuilding(false);
    }
  };

  const triggerTemplateDownload = (kind: ForecastUploadKind) => {
    if (!options) return;
    const exportPayload = createTemplateExport(kind, Array.from(selectedQueues), period);
    if (typeof window === 'undefined') {
      console.info(`Download simulated for ${exportPayload.filename}`);
      return;
    }
    const blob = new Blob([exportPayload.content], { type: exportPayload.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = exportPayload.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Шаблон CSV выгружен. Заполните его и загрузите обратно.');
  };

  const handleUpload = async (kind: ForecastUploadKind, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingKind(kind);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const result = await uploadForecastFile(kind, file);
      setStatusMessage(result.message);
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось загрузить файл. Проверьте формат CSV.');
    } finally {
      setUploadingKind(null);
      event.target.value = '';
    }
  };

  const renderNode = (node: QueueNode, depth = 0) => {
    const isActive = selectedQueues.has(node.id);
    return (
      <li key={node.id} className={`relative ${depth ? `pl-${Math.min(depth * 4, 12)}` : ''}`}>
        <button
          type="button"
          onClick={() => toggleQueue(node.id)}
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
            isActive ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-200'
          }`}
        >
          <span className="flex items-center gap-2">
            {node.children?.length ? <ChevronRight className="h-4 w-4 text-gray-400" /> : null}
            <span>{node.name}</span>
          </span>
          {isActive ? <CheckCircle2 className="h-4 w-4 text-purple-500" /> : null}
        </button>
        {node.children?.length ? (
          <ul className="mt-2 space-y-2 border-l border-dashed border-gray-200 pl-3">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock3 className="h-4 w-4 animate-spin text-purple-500" /> Загружаем настройки построения прогноза…
        </div>
      </section>
    );
  }

  if (!options) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5" /> Не удалось инициализировать страницу. Попробуйте обновить.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Построить прогноз</h2>
        <p className="mt-2 text-sm text-gray-500">Повторяем §4.1 руководства: выберите структуру, горизонт и профиль абсентеизма, затем запустите расчёт или обмен CSV.</p>
      </header>

      {statusMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{statusMessage}</span>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">1. Очереди</h3>
            <p className="mt-1 text-xs text-gray-500">Структура «Рабочая структура» из Chapter 4.</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {options.queueTree.map((node) => renderNode(node))}
            </ul>
            <p className="mt-4 text-xs text-gray-500">Выбрано: <strong>{selectedQueues.size}</strong> элементов.</p>
          </article>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">2. Период и история</h3>
            <p className="mt-1 text-xs text-gray-500">Настройте горизонт, период и гранулярность данных.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-gray-700">
                <span className="font-medium">Исторический горизонт</span>
                <select
                  value={horizonId}
                  onChange={(event) => handleHorizonChange(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  {options.horizons.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-700">
                <span className="font-medium">Гранулярность</span>
                <div className="flex items-center gap-3">
                  {options.granularityModes.map((mode) => (
                    <label key={mode} className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="radio"
                        name="granularity"
                        value={mode}
                        checked={granularity === mode}
                        onChange={() => handleGranularityChange(mode)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      {mode === 'interval' ? '15 минут' : 'Сутки'}
                    </label>
                  ))}
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm text-gray-700">
                <span className="font-medium">Дата начала</span>
                <input
                  type="date"
                  value={period.start.split('T')[0]}
                  onChange={(event) => updatePeriod('start', `${event.target.value}T00:00:00.000Z`)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>

              <label className="flex замена flex-col gap-2 text-sm text-gray-700">
                <span className="font-medium">Дата окончания</span>
                <input
                  type="date"
                  value={period.end.split('T')[0]}
                  onChange={(event) => updatePeriod('end', `${event.target.value}T23:59:59.000Z`)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Текущий период: {formatDate(period.start)} — {formatDate(period.end)}.
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">3. Абсентеизм</h3>
            <p className="mt-1 текст-xs text-gray-500">Выберите профиль (§4.3) или задайте процент.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {options.absenteeismProfiles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateProfile(item.id)}
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
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-700">
              <label className="flex items-center gap-3">
                <span className="w-28 text-xs uppercase tracking-wide text-gray-500">Процент</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={absenteeismPercent}
                  onChange={(event) => handlePercentChange(Number(event.target.value))}
                  className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
                <span className="text-xs text-gray-500">Применится ко всем выбранным очередям</span>
              </label>
              {currentProfile?.notes ? <p className="text-xs text-gray-500">{currentProfile.notes}</p> : null}
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">4. Действия</h3>
            <p className="mt-1 text-xs text-gray-500">Импорт/экспорт CSV и запуск расчёта согласно рис.26.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBuild}
                disabled={isBuilding}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
              >
                <PlayCircle className="h-4 w-4" /> {isBuilding ? 'Построение…' : 'Построить прогноз'}
              </button>

              <button
                type="button"
                onClick={() => forecastInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Upload className="h-4 w-4" /> Загрузить прогноз
              </button>
              <button
                type="button"
                onClick={() => actualInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Upload className="h-4 w-4" /> Загрузить факт
              </button>
              <button
                type="button"
                onClick={() => absenteeismInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Upload className="h-4 w-4" /> Загрузить абсентеизм
              </button>

              <button
                type="button"
                onClick={() => triggerTemplateDownload('forecast')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 текст-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <FileDown className="h-4 w-4" /> Шаблон прогноза
              </button>
              <button
                type="button"
                onClick={() => triggerTemplateDownload('actual')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 текст-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <FileDown className="h-4 w-4" /> Шаблон факта
              </button>
              <button
                type="button"
                onClick={() => triggerTemplateDownload('absenteeism')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 текст-sm font-medium text-gray-700 hover:border-purple-200"
              >
                <Download className="h-4 w-4" /> Шаблон абсентеизма
              </button>
            </div>

            {uploadingKind ? (
              <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Clock3 className="h-3 w-3 animate-spin" /> Загружаем {uploadingKind === 'forecast' ? 'прогноз' : uploadingKind === 'actual' ? 'факт' : 'абсентеизм'}…
              </p>
            ) : null}

            <input ref={forecastInputRef} type="file" accept=".csv" className="hidden" onChange={(event) => handleUpload('forecast', event)} />
            <input ref={actualInputRef} type="file" accept=".csv" className="hidden" onChange={(event) => handleUpload('actual', event)} />
            <input ref={absenteeismInputRef} type="file" accept=".csv" className="hidden" onChange={(event) => handleUpload('absenteeism', event)} />
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Последний запуск</h3>
            <dl className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-gray-500">Очереди</dt>
                <dd>{selectedQueues.size}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Период</dt>
                <dd>{formatDate(period.start)} — {formatDate(period.end)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Профиль</dt>
                <dd>{currentProfile?.label ?? '—'}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-gray-500">Сохранение пока имитируется, данные берутся из детерминированного фикстура.</p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default BuildForecastWorkspace;
CODE
```

## Phase 3: Exceptions & Absenteeism Workspaces

### Overview
Replace static cards with interactive forms driven by the new services: periodic vs single exceptions, template CRUD, absenteeism rule builder, and download/apply stubs.

### Changes Required:

#### 1. Rewrite Exceptions workspace
**File**: `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx`
**Changes**: Load templates, provide form for intervals, allow add/edit/delete, and surface status messaging.
```bash
cat <<'CODE' > src/components/forecasting/exceptions/ExceptionsWorkspace.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarPlus,
  FileDown,
  Repeat,
  Save,
  Trash2,
} from 'lucide-react';
import type { ExceptionInterval, ExceptionTemplate } from '../../../types/forecasting';
import {
  deleteExceptionTemplate,
  fetchExceptionTemplates,
  saveExceptionTemplate,
} from '../../../services/forecastingApi';
import { forecastHorizonOptions } from '../../../data/forecastingFixtures';

interface IntervalDraft extends Omit<ExceptionInterval, 'id'> {
  id?: string;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
};

const createInterval = (mode: 'day' | 'interval'): IntervalDraft => ({
  mode,
  dayOfWeek: mode === 'interval' ? 'monday' : undefined,
  date: mode === 'day' ? new Date().toISOString().split('T')[0] : undefined,
  start: mode === 'interval' ? '09:00' : `${new Date().toISOString().split('T')[0]}`,
  end: mode === 'interval' ? '18:00' : `${new Date().toISOString().split('T')[0]}`,
  smoothing: mode === 'interval' ? 0.2 : undefined,
});

const ExceptionsWorkspace: React.FC = () => {
  const [templates, setTemplates] = useState<ExceptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'day' | 'interval'>('day');
  const [label, setLabel] = useState('Новый шаблон');
  const [historyHorizon, setHistoryHorizon] = useState<number>(forecastHorizonOptions[0].days);
  const [periodLabel, setPeriodLabel] = useState('');
  const [intervals, setIntervals] = useState<IntervalDraft[]>([createInterval('day')]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await fetchExceptionTemplates();
        if (active) {
          setTemplates(loaded);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError('Не удалось загрузить существующие исключения.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setMode('day');
    setLabel('Новый шаблон');
    setHistoryHorizon(forecastHorizonOptions[0].days);
    setPeriodLabel('');
    setIntervals([createInterval('day')]);
    setEditingId(null);
  };

  const addInterval = () => setIntervals((prev) => [...prev, createInterval(mode)]);

  const updateInterval = (index: number, key: keyof IntervalDraft, value: string | number | undefined) => {
    setIntervals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const editTemplate = (template: ExceptionTemplate) => {
    setMode(template.mode === 'single' ? 'day' : 'interval');
    setLabel(template.label);
    setHistoryHorizon(template.historyHorizon);
    setPeriodLabel(template.periodLabel);
    setIntervals(
      template.intervals.map((interval) => ({
        ...interval,
        date: interval.mode === 'day' ? interval.date ?? interval.start : interval.date,
      })),
    );
    setEditingId(template.id);
    setStatus(null);
    setError(null);
  };

  const removeTemplate = async (id: string) => {
    try {
      await deleteExceptionTemplate(id);
      setTemplates((prev) => prev.filter((template) => template.id !== id));
      setStatus('Шаблон удалён.');
      if (editingId === id) {
        resetForm();
      }
    } catch (deleteError) {
      console.error(deleteError);
      setError('Удаление не удалось. Попробуйте позже.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (!intervals.length) {
      setError('Добавьте хотя бы один интервал.');
      return;
    }

    try {
      const saved = await saveExceptionTemplate({
        id: editingId ?? undefined,
        label,
        historyHorizon,
        periodLabel: periodLabel || (mode === 'day' ? 'Разовый период' : 'Периодическая настройка'),
        mode: mode === 'day' ? 'single' : 'periodic',
        intervals: intervals.map((interval) => ({
          ...interval,
          id: interval.id,
        })),
      });

      setTemplates((prev) => {
        const index = prev.findIndex((item) => item.id === saved.id);
        if (index >= 0) {
          const next = [...prev];
          next.splice(index, 1, saved);
          return next;
        }
        return [...prev, saved];
      });

      setStatus(editingId ? 'Шаблон обновлён.' : 'Шаблон сохранён.');
      resetForm();
    } catch (saveError) {
      console.error(saveError);
      setError('Не удалось сохранить шаблон. Проверьте данные.');
    }
  };

  const renderedTemplates = useMemo(
    () => templates.slice().sort((a, b) => a.label.localeCompare(b.label, 'ru')),
    [templates],
  );

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Задать исключения</h2>
        <p className="mt-2 text-sm text-gray-500">Повторяет шаги §4.1: настройка праздничных и периодических исключений.</p>
      </header>

      {status ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">{status}</div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
          <button
            type="button"
            onClick={() => {
              setMode('day');
              setIntervals([createInterval('day')]);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              mode === 'day' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            День
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('interval');
              setIntervals([createInterval('interval')]);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              mode === 'interval' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Интервал
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            <span className="font-semibold uppercase tracking-wide">Название</span>
            <input
              required
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-600">
            <span className="font-semibold uppercase tracking-wide">История</span>
            <select
              value={historyHorizon}
              onChange={(event) => setHistoryHorizon(Number(event.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {forecastHorizonOptions.map((option) => (
                <option key={option.id} value={option.days}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-1 text-xs text-gray-600">
            <span className="font-semibold uppercase tracking-wide">Описание периода</span>
            <input
              type="text"
              value={periodLabel}
              onChange={(event) => setPeriodLabel(event.target.value)}
              placeholder={mode === 'day' ? '29.12–08.01' : 'Каждую субботу 09:00–21:00'}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Интервалы</h4>
            <button
              type="button"
              onClick={addInterval}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-500 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
            >
              <CalendarPlus className="h-3 w-3" /> Добавить интервал
            </button>
          </div>

          <div className="space-y-3">
            {intervals.map((interval, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                <div className="grid gap-3 md:grid-cols-4">
                  {mode === 'day' ? (
                    <label className="flex flex-col gap-1 text-xs text-gray-500">
                      <span className="font-medium">Дата</span>
                      <input
                        type="date"
                        value={interval.date ?? ''}
                        onChange={(event) => updateInterval(index, 'date', event.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </label>
                  ) : (
                    <label className="flex flex-col gap-1 text-xs text-gray-500">
                      <span className="font-medium">День недели</span>
                      <select
                        value={interval.dayOfWeek ?? 'monday'}
                        onChange={(event) => updateInterval(index, 'dayOfWeek', event.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      >
                        {Object.entries(DAY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">Начало</span>
                    <input
                      type={mode === 'day' ? 'date' : 'time'}
                      value={mode === 'day' ? interval.start : interval.start ?? '09:00'}
                      onChange={(event) => updateInterval(index, 'start', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">Окончание</span>
                    <input
                      type={mode === 'day' ? 'date' : 'time'}
                      value={mode === 'day' ? interval.end : interval.end ?? '18:00'}
                      onChange={(event) => updateInterval(index, 'end', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outlineNone focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>

                  {mode === 'interval' ? (
                    <label className="flex flex-col gap-1 text-xs text-gray-500">
                      <span className="font-medium">Сглаживание</span>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        value={interval.smoothing ?? 0.2}
                        onChange={(event) => updateInterval(index, 'smoothing', Number(event.target.value))}
                        className="rounded-lg border border-gray-200 px-3 py-2 текст-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </label>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setIntervals((prev) => prev.filter((_, i) => i !== index))}
                    className="flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-purple-700"
          >
            <Save className="h-4 w-4" /> {editingId ? 'Обновить шаблон' : 'Сохранить шаблон'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
          >
            <Repeat className="h-4 w-4" /> Очистить форму
          </button>
        </div>
      </form>

      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Сохранённые шаблоны</h3>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-purple-200"
          >
            <FileDown className="h-3 w-3" /> Экспортировать список (заглушка)
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-xs text-gray-500">Загружаем…</p>
          ) : renderedTemplates.length ? (
            renderedTemplates.map((template) => (
              <div key={template.id} className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{template.label}</p>
                    <p className="text-xs text-gray-500">{template.periodLabel}</p>
                    <p className="text-xs text-gray-500">История: {template.historyHorizon} дн. · Интервалов: {template.intervals.length}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editTemplate(template)}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-purple-200"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTemplate(template.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3 w-3" /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">Шаблоны отсутствуют. Создайте шаблон выше.</p>
          )}
        </div>
      </article>
    </section>
  );
};

export default ExceptionsWorkspace;
CODE
```

#### 2. Rewrite Absenteeism workspace
**File**: `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`
**Changes**: Load templates, allow periodic rule editing and overrides, expose download/apply/delete actions, and wire to service helpers.
```bash
cat <<'CODE' > src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx
import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FilePlus2,
  Pencil,
  Save,
  Trash2,
} from 'lucide-react';
import type { AbsenteeismRule, AbsenteeismTemplate } from '../../../types/forecasting';
import {
  createTemplateExport,
  deleteAbsenteeismTemplate,
  fetchAbsenteeismTemplates,
  saveAbsenteeismTemplate,
} from '../../../services/forecastingApi';

const DAY_OPTIONS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
};

interface RuleDraft extends Omit<AbsenteeismRule, 'id'> {
  id?: string;
}

interface OverrideDraft {
  id?: string;
  date: string;
  valuePercent: number;
}

const createRule = (): RuleDraft => ({
  dayOfWeek: 'monday',
  start: '09:00',
  end: '18:00',
  valuePercent: 5,
});

const createOverride = (): OverrideDraft => ({
  date: new Date().toISOString().split('T')[0],
  valuePercent: 10,
});

const AbsenteeismWorkspace: React.FC = () => {
  const [templates, setTemplates] = useState<AbsenteeismTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('Новый профиль');
  const [coverage, setCoverage] = useState('Пн–Пт, 09:00–18:00');
  const [valuePercent, setValuePercent] = useState<number>(5);
  const [rules, setRules] = useState<RuleDraft[]>([createRule()]);
  const [overrides, setOverrides] = useState<OverrideDraft[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await fetchAbsenteeismTemplates();
        if (active) {
          setTemplates(result);
        }
      } catch (fetchError) {
        console.error(fetchError);
        setError('Не удалось получить шаблоны абсентеизма.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('Новый профиль');
    setCoverage('Пн–Пт, 09:00–18:00');
    setValuePercent(5);
    setRules([createRule()]);
    setOverrides([]);
  };

  const editTemplate = (template: AbsenteeismTemplate) => {
    setEditingId(template.id);
    setName(template.name);
    setCoverage(template.coverage);
    setValuePercent(template.valuePercent);
    setRules(template.periodicRules.map((rule) => ({
      id: rule.id,
      dayOfWeek: rule.dayOfWeek,
      start: rule.start,
      end: rule.end,
      valuePercent: rule.valuePercent,
    })));
    setOverrides(template.singleOverrides.map((override) => ({ id: override.id, date: override.date, valuePercent: override.valuePercent })));
    setStatus(null);
    setError(null);
  };

  const removeTemplate = async (id: string) => {
    try {
      await deleteAbsenteeismTemplate(id);
      setTemplates((prev) => prev.filter((template) => template.id !== id));
      setStatus('Профиль удалён.');
      if (editingId === id) {
        resetForm();
      }
    } catch (deleteError) {
      console.error(deleteError);
      setError('Удалить профиль не удалось.');
    }
  };

  const updateRule = (index: number, key: keyof RuleDraft, value: string | number) => {
    setRules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const updateOverride = (index: number, key: keyof OverrideDraft, value: string | number) => {
    setOverrides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (!rules.length) {
      setError('Добавьте хотя бы одно периодическое правило.');
      return;
    }

    try {
      const saved = await saveAbsenteeismTemplate({
        id: editingId ?? undefined,
        name,
        coverage,
        valuePercent,
        periodicRules: rules.map((rule) => ({ ...rule, id: rule.id })),
        singleOverrides: overrides.map((override) => ({ ...override, id: override.id })),
      });

      setTemplates((prev) => {
        const index = prev.findIndex((item) => item.id === saved.id);
        if (index >= 0) {
          const next = [...prev];
          next.splice(index, 1, saved);
          return next;
        }
        return [...prev, saved];
      });

      setStatus(editingId ? 'Профиль обновлён.' : 'Профиль сохранён.');
      resetForm();
    } catch (saveError) {
      console.error(saveError);
      setError('Сохранение не удалось. Проверьте поля и попробуйте снова.');
    }
  };

  const downloadTemplate = (template: AbsenteeismTemplate) => {
    const payload = createTemplateExport('absenteeism', ['support'], {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    if (typeof window === 'undefined') {
      console.info(`Download simulated for ${template.id}`);
      return;
    }
    const blob = new Blob([payload.content], { type: payload.mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = payload.filename.replace('template', template.id);
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('CSV-шаблон абсентеизма скачан.');
  };

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Расчёт абсентеизма</h2>
        <p className="mt-2 text-sm text-gray-500">Шаблоны из §4.3: периодические правила, разовые даты и выгрузка CSV.</p>
      </header>

      {status ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /><span>{status}</span></div>
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /><span>{error}</span></div>
        </div>
      ) : null}

      <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            <span className="font-semibold uppercase tracking-wide">Название</span>
            <input
              required
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-600">
            <span className="font-semibold uppercase tracking-wide">Покрытие</span>
            <input
              required
              type="text"
              value={coverage}
              onChange={(event) => setCoverage(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-600">
            <span className="font-semibold uppercase tracking-wide">Значение, %</span>
            <input
              type="number"
              min={0}
              max={40}
              value={valuePercent}
              onChange={(event) => setValuePercent(Number(event.target.value))}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Периодические правила</h4>
            <button
              type="button"
              onClick={() => setRules((prev) => [...prev, createRule()])}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-500 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
            >
              <FilePlus2 className="h-3 w-3" /> Добавить правило
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                <div className="grid gap-3 md:grid-cols-5">
                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">День</span>
                    <select
                      value={rule.dayOfWeek}
                      onChange={(event) => updateRule(index, 'dayOfWeek', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    >
                      {DAY_OPTIONS.map((day) => (
                        <option key={day} value={day}>
                          {DAY_LABELS[day]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">Начало</span>
                    <input
                      type="time"
                      value={rule.start}
                      onChange={(event) => updateRule(index, 'start', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">Окончание</span>
                    <input
                      type="time"
                      value={rule.end}
                      onChange={(event) => updateRule(index, 'end', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">Значение, %</span>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={rule.valuePercent}
                      onChange={(event) => updateRule(index, 'valuePercent', Number(event.target.value))}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setRules((prev) => prev.filter((_, i) => i !== index))}
                    className="flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Разовые даты</h4>
            <button
              type="button"
              onClick={() => setOverrides((prev) => [...prev, createOverride()])}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-500 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
            >
              <FilePlus2 className="h-3 w-3" /> Добавить дату
            </button>
          </div>

          <div className="space-y-3">
            {overrides.map((override, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                <div className="grid gap-3 md:grid-cols-4">
                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">Дата</span>
                    <input
                      type="date"
                      value={override.date}
                      onChange={(event) => updateOverride(index, 'date', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-gray-500">
                    <span className="font-medium">Значение, %</span>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={override.valuePercent}
                      onChange={(event) => updateOverride(index, 'valuePercent', Number(event.target.value))}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setOverrides((prev) => prev.filter((_, i) => i !== index))}
                    className="flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium текст-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-purple-700"
          >
            <Save className="h-4 w-4" /> {editingId ? 'Обновить профиль' : 'Сохранить профиль'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-purple-200"
          >
            <Pencil className="h-4 w-4" /> Очистить форму
          </button>
        </div>
      </form>

      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Сохранённые профили</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Профиль</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Покрытие</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Периодические правила</th>
                <th className="px-3 py-2 text-left font-medium текст-gray-600">Разовые даты</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-xs text-gray-500">Загружаем…</td>
                </tr>
              ) : templates.length ? (
                templates.map((template) => (
                  <tr key={template.id} className="border-b border-gray-200">
                    <td className="px-3 py-3 font-medium text-gray-900">{template.name}</td>
                    <td className="px-3 py-3 text-gray-600">{template.coverage}</td>
                    <td className="px-3 py-3 text-gray-600">{template.periodicRules.length}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {template.singleOverrides.length
                        ? template.singleOverrides.map((override) => override.date).slice(0, 3).join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editTemplate(template)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-purple-200"
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadTemplate(template)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-purple-200"
                        >
                          <Download className="h-3 w-3" /> Скачать
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTemplate(template.id)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" /> Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-xs text-gray-500">Шаблоны не найдены. Создайте профиль выше.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default AbsenteeismWorkspace;
CODE
```

## Phase 4: Trend & Accuracy Enhancements

### Overview
Enhance Trend dashboard with filters/export/anomaly tagging and update Accuracy dashboard to use RU formatting, detail table, and CSV export.

### Changes Required:

#### 1. Refresh Trend dashboard interactions
**File**: `src/components/forecasting/trends/TrendAnalysisDashboard.tsx`
**Changes**: Add period presets/custom range, anomaly toggles, export button using new helper, and ensure data filters without clearing anomalies.
```bash
cat <<'CODE' > src/components/forecasting/trends/TrendAnalysisDashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  CalendarRange,
  Download,
  FlagTriangleRight,
  Layers,
  Maximize2,
} from 'lucide-react';
import { LineChart, BarChart } from '../../charts';
import type { TrendDashboardProps, TrendDataPoint, AnomalyEvent } from '../../../types/trends';
import {
  buildAnomalySeries,
  buildForecastVsFactSeries,
  buildSeasonalitySeries,
  buildTrendMetaSummary,
} from '../../../adapters/forecasting';
import { forecastSeries } from '../../../data/forecastingFixtures';
import { createTrendExport } from '../../../services/forecastingApi';

const TABS: Array<{ id: 'strategic' | 'tactical' | 'operational'; label: string; description: string }> = [
  { id: 'strategic', label: 'Стратегический', description: 'Длинные ряды и доверительные интервалы' },
  { id: 'tactical', label: 'Тактический', description: 'Смена и сутки — детализация по очередям' },
  { id: 'operational', label: 'Оперативный', description: 'Последние 48 часов для мониторинга отклонений' },
];

const DEFAULT_QUEUE_OPTIONS = ['Контакт-центр 1010.ru', 'Отдел поддержки', 'Активные продажи'];

const createDefaultDateRange = () => {
  if (forecastSeries.length) {
    const start = new Date(forecastSeries[0].timestamp);
    const end = new Date(forecastSeries[forecastSeries.length - 1].timestamp);
    return { start, end };
  }
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
};

const TrendAnalysisDashboard: React.FC<TrendDashboardProps> = ({
  organizationId,
  queueIds,
  dateRange,
  refreshInterval = 300000,
}) => {
  const [activeTab, setActiveTab] = useState<'strategic' | 'tactical' | 'operational'>('strategic');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [seasonalData, setSeasonalData] = useState<number[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const safeQueues = useMemo(
    () => (queueIds && queueIds.length ? queueIds : DEFAULT_QUEUE_OPTIONS),
    [queueIds],
  );
  const safeDateRange = useMemo(
    () => (dateRange?.start && dateRange?.end ? dateRange : createDefaultDateRange()),
    [dateRange],
  );
  const [selectedQueue, setSelectedQueue] = useState<string>(safeQueues[0]);
  const [periodPreset, setPeriodPreset] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStart, setCustomStart] = useState<string | undefined>(safeDateRange.start.toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState<string | undefined>(safeDateRange.end.toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setSelectedQueue((prev) => (safeQueues.includes(prev) ? prev : safeQueues[0]));
  }, [safeQueues]);

  useEffect(() => {
    const data: TrendDataPoint[] = forecastSeries.map(({ timestamp, forecast, actual }) => ({
      timestamp: new Date(timestamp),
      value: actual ?? forecast,
      forecast,
      trend: forecast,
      seasonal: forecast - 140,
      residual: (actual ?? forecast) - forecast,
    }));
    setTrendData(data);
    setSeasonalData(Array.from({ length: 24 }, (_, hour) => (hour >= 6 && hour <= 17 ? 115 : 80)));
  }, []);

  useEffect(() => {
    if (!refreshInterval) return;
    const timer = setInterval(() => {
      setTrendData((prev) => [...prev]);
    }, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const meta = useMemo(
    () => buildTrendMetaSummary({ organizationId, queueIds: safeQueues, dateRange: safeDateRange }),
    [organizationId, safeDateRange, safeQueues],
  );

  const selectedRange = useMemo(() => {
    if (periodPreset === 'custom' && customStart && customEnd) {
      return {
        start: new Date(`${customStart}T00:00:00.000Z`),
        end: new Date(`${customEnd}T23:59:59.000Z`),
      };
    }

    const days = periodPreset === '7d' ? 7 : periodPreset === '90d' ? 90 : 30;
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return { start, end };
  }, [periodPreset, customStart, customEnd]);

  const filteredTrendData = useMemo(
    () => trendData.filter((item) => item.timestamp >= selectedRange.start && item.timestamp <= selectedRange.end),
    [trendData, selectedRange],
  );

  const forecastVsFact = useMemo(() => buildForecastVsFactSeries(filteredTrendData), [filteredTrendData]);
  const seasonalitySeries = useMemo(() => buildSeasonalitySeries(seasonalData), [seasonalData]);
  const anomalySeries = useMemo(() => buildAnomalySeries(filteredTrendData, anomalies), [anomalies, filteredTrendData]);
  const operationalWindow = useMemo(() => filteredTrendData.slice(-48), [filteredTrendData]);

  const markAnomaly = (point: TrendDataPoint) => {
    setAnomalies((prev) => {
      const key = point.timestamp.toISOString();
      const exists = prev.find((item) => item.timestamp.toISOString() === key);
      if (exists) {
        return prev.filter((item) => item.timestamp.toISOString() !== key);
      }
      return [
        ...prev,
        {
          timestamp: point.timestamp,
          type: point.residual > 0 ? 'spike' : 'dip',
          value: point.value,
          expectedValue: point.trend ?? point.value,
          severity: Math.abs(point.residual) > 20 ? 'high' : 'medium',
        },
      ];
    });
  };

  const exportTrend = async () => {
    setExporting(true);
    try {
      const payload = createTrendExport({
        organizationId: organizationId ?? 'demo-org',
        queueIds: safeQueues,
        period: {
          start: selectedRange.start.toISOString(),
          end: selectedRange.end.toISOString(),
        },
        mode: activeTab,
      });
      if (typeof window === 'undefined') {
        console.info(`Download simulated for ${payload.filename}`);
        return;
      }
      const blob = new Blob([payload.content], { type: payload.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = payload.filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Анализ трендов</h2>
            <p className="text-sm text-gray-500">Три режима: стратегический горизонт, тактическая смена и оперативные отклонения.</p>
          </div>
          <div className="flex items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  activeTab === tab.id ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">{TABS.find((tab) => tab.id === activeTab)?.description}</p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
          <CalendarRange className="h-4 w-4 text-purple-500" /> Период анализа:
          <select
            value={periodPreset}
            onChange={(event) => setPeriodPreset(event.target.value as typeof periodPreset)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            <option value="7d">Последние 7 дней</option>
            <option value="30d">Последние 30 дней</option>
            <option value="90d">Последние 90 дней</option>
            <option value="custom">Произвольный период</option>
          </select>
          {periodPreset === 'custom' ? (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <span>—</span>
              <input
                type="date"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </>
          ) : null}
          <button
            type="button"
            onClick={exportTrend}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-3 w-3" /> {exporting ? 'Формируем…' : 'Экспорт CSV'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Прогноз vs факт</h3>
                <p className="text-sm text-gray-500">Доверительный интервал, целевое значение и отклонения.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Layers className="h-4 w-4" /> {forecastVsFact.forecast.points.length} точек
              </div>
            </div>
            <div className="px-6 pb-6" style={{ height: 320 }}>
              <LineChart
                series={[forecastVsFact.fact, forecastVsFact.forecast, forecastVsFact.trend!]}
                timeScale="hour"
                yUnit={forecastVsFact.yUnit}
                secondaryAxis={forecastVsFact.secondaryAxis}
                bands={forecastVsFact.band ? [forecastVsFact.band] : undefined}
                targets={forecastVsFact.target ? [forecastVsFact.target] : undefined}
                ariaTitle="Прогноз против фактических значений"
                ariaDesc="Сравнение прогноза и факта с целевым уровнем и выделением аномалий"
                onPointClick={(point) => markAnomaly({
                  timestamp: new Date(point.timestamp),
                  value: point.value,
                  forecast: point.value,
                  trend: point.value,
                  seasonal: 0,
                  residual: 0,
                })}
                pointIcon={<FlagTriangleRight className="h-3 w-3 text-purple-500" />}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Оперативное окно (48 ч)</h3>
                <p className="text-sm text-gray-500">Последние сутки и ближайшие часы.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Layers className="h-4 w-4" /> {operationalWindow.length} точек
              </div>
            </div>
            <div className="px-6 pb-6" style={{ height: 220 }}>
              <LineChart
                series={[{
                  id: 'operational-fact',
                  label: 'Факт',
                  unit: 'people',
                  points: operationalWindow.map((point) => ({
                    timestamp: point.timestamp.toISOString(),
                    value: point.value,
                  })),
                }]}
                timeScale="hour"
                yUnit="people"
                ariaTitle="Оперативное окно"
                ariaDesc="Отрезок последних 48 часов"
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Сезонность по часам</h3>
              <p className="text-sm text-gray-500">Сравнение нагрузки относительно среднего.</p>
            </div>
            <div className="px-6 pb-6" style={{ height: 260 }}>
              <BarChart
                series={seasonalitySeries.series}
                categories={seasonalitySeries.categories}
                yUnit={seasonalitySeries.yUnit}
                stacked
                ariaTitle="Сезонность по часам"
                ariaDesc="Столбчатая диаграмма сезонного распределения"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Контекст</h3>
            </div>
            <dl className="space-y-3 px-6 py-4 text-sm text-gray-600">
              {meta.meta.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">{item.label}</dt>
                  <dd className="font-medium text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-gray-100 px-6 py-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Очередь</label>
              <select
                value={selectedQueue}
                onChange={(event) => setSelectedQueue(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {safeQueues.map((queue) => (
                  <option key={queue} value={queue}>
                    {queue}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Аномалии</h3>
              <p className="text-sm текст-gray-500">Отмечайте всплески или провалы, чтобы повторить проверку §4.2.</p>
            </div>
            <div className="px-6 py-4">
              {anomalies.length ? (
                <ul className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <li key={anomaly.timestamp.toISOString()} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <Activity className="mt-1 h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">{anomaly.type === 'spike' ? 'Всплеск нагрузки' : 'Падение нагрузки'}</div>
                        <div className="text-xs text-amber-800">{anomaly.timestamp.toLocaleString('ru-RU')}</div>
                        <div className="mt-1 text-xs text-amber-900">Отклонение {Math.round(anomaly.value - anomaly.expectedValue)} ед.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnomalies((prev) => prev.filter((item) => item.timestamp.toISOString() !== anomaly.timestamp.toISOString()))}
                        className="rounded border border-amber-200 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100"
                      >
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Аномалии не отмечены. Кликните по точке графика (иконка флага), чтобы добавить.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <footer className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ArrowUpRight className="h-5 w-5 text-purple-500" /> Следующий шаг: подтвердить сценарии в UAT (chart_visual_spec).
          </div>
          <button
            type="button"
            onClick={exportTrend}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> {exporting ? 'Экспортируем…' : 'Экспортировать в отчёт'}
          </button>
        </div>
      </footer>
    </section>
  );
};

export default TrendAnalysisDashboard;
CODE
```

#### 2. Extend accuracy adapter for detail table
**File**: `src/adapters/forecasting/accuracy.ts`
**Changes**: Import forecast detail rows, provide RU-formatted table builder, reuse new format helper.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/forecasting/accuracy.ts
@@
-import { formatMetricValue } from '../../utils/accuracyCalculations';
+import { formatMetricValue } from '../../utils/accuracyCalculations';
+import type { ForecastDetailRow } from '../../types/forecasting';
@@
 export interface ValidationTable {
   columns: ReportTableColumn[];
   rows: Array<Record<string, string | number>>;
 }
@@
   return { columns, rows };
 };
+
+export interface ForecastDetailTable {
+  columns: ReportTableColumn[];
+  rows: Array<Record<string, string>>;
+}
+
+const ruNumber = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
+
+export const buildForecastDetailTable = (rows: ForecastDetailRow[]): ForecastDetailTable => {
+  const columns: ReportTableColumn[] = [
+    { id: 'time', label: 'Интервал' },
+    { id: 'forecast', label: 'Прогноз (FTE)' },
+    { id: 'actual', label: 'Факт (FTE)' },
+    { id: 'abs', label: 'Отклонение' },
+    { id: 'rel', label: 'Отклонение, %' },
+    { id: 'absenteeism', label: 'Абсентеизм, %' },
+    { id: 'lostCalls', label: 'Потерянные звонки' },
+    { id: 'aht', label: 'AHT, сек' },
+    { id: 'sl', label: 'SL, %' },
+  ];
+
+  const mapped = rows.map((row) => {
+    const abs = row.actual - row.forecast;
+    const rel = row.forecast === 0 ? 0 : (abs / row.forecast) * 100;
+    return {
+      time: new Date(row.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
+      forecast: ruNumber.format(row.forecast),
+      actual: ruNumber.format(row.actual),
+      abs: ruNumber.format(abs),
+      rel: `${ruNumber.format(rel)} %`,
+      absenteeism: `${ruNumber.format(row.absenteeismPercent)} %`,
+      lostCalls: ruNumber.format(row.lostCalls),
+      aht: ruNumber.format(row.ahtSeconds),
+      sl: `${ruNumber.format(row.serviceLevel)} %`,
+    };
+  });
+
+  return { columns, rows: mapped };
+};
*** End Patch
PATCH
```

#### 3. Update Accuracy dashboard for detail table/export
**File**: `src/components/forecasting/AccuracyDashboard.tsx`
**Changes**: Import `ReportTable`, fetch detail rows from service, render RU-localised table, and wire export button to new helper.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forecasting/AccuracyDashboard.tsx
@@
-import AccuracyExport from './accuracy/AccuracyExport';
+import AccuracyExport from './accuracy/AccuracyExport';
+import { ReportTable } from '../charts';
@@
-import {
+import {
   buildAccuracyKpiItems,
   buildAccuracyTrendSeries,
   buildErrorAnalysisSeries,
   buildModelComparisonTable,
   buildValidationTable,
+  buildForecastDetailTable,
 } from '../../adapters/forecasting';
@@
-import { forecastSeries } from '../../data/forecastingFixtures';
+import { forecastSeries } from '../../data/forecastingFixtures';
+import { createAccuracyExport, fetchForecastDetail } from '../../services/forecastingApi';
+import type { ForecastDetailRow } from '../../types/forecasting';
@@
   const [alerts, setAlerts] = useState<Alert[]>([]);
+  const [detailRows, setDetailRows] = useState<ForecastDetailRow[]>([]);
@@
-  useEffect(() => {
-    if (!autoRefresh) return;
-
-    const interval = setInterval(() => {
-      setLastUpdate(new Date());
-    }, refreshInterval);
-
-    return () => clearInterval(interval);
-  }, [autoRefresh, refreshInterval]);
+  useEffect(() => {
+    if (!autoRefresh) return;
+
+    const interval = setInterval(() => {
+      setLastUpdate(new Date());
+    }, refreshInterval);
+
+    return () => clearInterval(interval);
+  }, [autoRefresh, refreshInterval]);
@@
+  useEffect(() => {
+    let active = true;
+    (async () => {
+      try {
+        const rows = await fetchForecastDetail({
+          queueIds: ['support'],
+          period: {
+            start: resolvedForecastData[0]?.timestamp ?? new Date().toISOString(),
+            end: resolvedForecastData[resolvedForecastData.length - 1]?.timestamp ?? new Date().toISOString(),
+          },
+        });
+        if (active) {
+          setDetailRows(rows);
+        }
+      } catch (error) {
+        console.error('Не удалось загрузить детализацию прогноза', error);
+      }
+    })();
+    return () => {
+      active = false;
+    };
+  }, [resolvedForecastData]);
+
@@
   const detailTable = useMemo(() => buildForecastDetailTable(detailRows), [detailRows]);
@@
-  const handleExport = async (options: ExportOptions) => {
+  const handleExport = async (options: ExportOptions) => {
     setIsExporting(true);
 
-    // Simulate export process
     try {
-      await handleValidationRun('timeSeries');
-      await new Promise(resolve => setTimeout(resolve, 3000));
-      console.log('Экспортируем...', options);
+      await handleValidationRun('timeSeries');
+      const payload = await createAccuracyExport();
+      if (typeof window === 'undefined') {
+        console.info(`Download simulated for ${payload.filename}`);
+        return;
+      }
+      const blob = new Blob([payload.content], { type: payload.mimeType });
+      const url = URL.createObjectURL(blob);
+      const anchor = document.createElement('a');
+      anchor.href = url;
+      anchor.download = payload.filename;
+      anchor.click();
+      URL.revokeObjectURL(url);
     } finally {
       setIsExporting(false);
     }
   };
@@
               {alerts.length > 0 && (
                 <div className="space-y-2">
                   {alerts.map((alert) => (
@@
               )}
 
+              <div className="rounded-lg border border-gray-200">
+                <ReportTable columns={detailTable.columns} rows={detailTable.rows} ariaLabel="Детализация прогноза" />
+              </div>
+
               {/* Performance Chart */}
*** End Patch
PATCH
```

## Phase 5: Tests & Documentation Prep

### Overview
Adjust Vitest expectations for RU formatting, add coverage for detail table/export helpers, and prepare documentation updates for executor.

### Changes Required:

#### 1. Update accuracy unit tests
**File**: `tests/forecasting/accuracy.test.ts`
**Changes**: Expect RU-formatted KPI values and detail table rows; import new helpers.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/forecasting/accuracy.test.ts
@@
-import {
-  buildAccuracyKpiItems,
-  buildAccuracyTrendSeries,
-  buildErrorAnalysisSeries,
-} from '../../src/adapters/forecasting';
+import {
+  buildAccuracyKpiItems,
+  buildAccuracyTrendSeries,
+  buildErrorAnalysisSeries,
+  buildForecastDetailTable,
+} from '../../src/adapters/forecasting';
+import type { ForecastDetailRow } from '../../src/types/forecasting';
@@
-    expect(items[0]).toMatchObject({ label: 'MAPE', value: '12.0%', trend: 'up' });
-    expect(items[4]).toMatchObject({ label: 'R²', trend: 'up' });
+    expect(items[0]).toMatchObject({ label: 'MAPE', value: '12,0 %', trend: 'up' });
+    expect(items[4]).toMatchObject({ label: 'R²', trend: 'up' });
@@
 describe('buildErrorAnalysisSeries', () => {
@@
 });
+
+describe('buildForecastDetailTable', () => {
+  const rows: ForecastDetailRow[] = [
+    {
+      id: 'slot-1',
+      timestamp: new Date(2025, 9, 20, 10).toISOString(),
+      forecast: 150,
+      actual: 160,
+      absenteeismPercent: 5,
+      lostCalls: 2,
+      ahtSeconds: 320,
+      serviceLevel: 89,
+    },
+  ];
+
+  it('returns RU formatted detail rows', () => {
+    const table = buildForecastDetailTable(rows);
+    expect(table.columns).toHaveLength(9);
+    expect(table.rows[0].forecast).toBe('150');
+    expect(table.rows[0].rel).toContain('%');
+    expect(table.rows[0].time).toMatch(/\d{2}:\d{2}/);
+  });
+});
*** End Patch
PATCH
```

#### 2. Cover export helpers in trend tests
**File**: `tests/forecasting/trends.test.ts`
**Changes**: Import service helpers and assert CSV headers/dataset.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/forecasting/trends.test.ts
@@
-import { buildForecastVsFactSeries, buildSeasonalitySeries } from '../../src/adapters/forecasting/trends';
+import { buildForecastVsFactSeries, buildSeasonalitySeries } from '../../src/adapters/forecasting/trends';
+import { createTemplateExport, createTrendExport } from '../../src/services/forecastingApi';
@@
 describe('buildSeasonalitySeries', () => {
   it('creates stacked series for hourly values', () => {
@@
 });
+
+describe('forecast export helpers', () => {
+  it('generates CSV content for forecast templates', () => {
+    const payload = createTemplateExport('forecast', ['support'], {
+      start: new Date().toISOString(),
+      end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
+    });
+    expect(payload.content.split('\n')[0]).toBe('timestamp,queue_id,forecast');
+  });
+
+  it('creates trend export with RU values', () => {
+    const payload = createTrendExport({
+      organizationId: 'demo',
+      queueIds: ['support'],
+      period: {
+        start: new Date().toISOString(),
+        end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
+      },
+      mode: 'strategic',
+    });
+    expect(payload.filename).toContain('trend_strategic');
+    expect(payload.content).toContain('strategic');
+  });
+});
*** End Patch
PATCH
```

## Tests & Validation
- `npm ci`
- `npm run test:run`
- `npm run build`
- `npm run smoke:routes`
- Manual preview: `npm run preview -- --host 127.0.0.1 --port 4155` and walk /build → /exceptions → /absenteeism → /trends → /accuracy → /adjustments following parity packs.
- Production smoke: `SMOKE_BASE_URL=https://<new-deploy>.vercel.app npm run smoke:routes`
- Step 6 UAT (uat-agent-tasks/2025-10-26_forecasting-uat.md) using parity packs (`docs/Tasks/uat-packs/parity_static.md`, `chart_visual_spec.md`); capture screenshots per alias list.

## Rollback
- Restore updated files if needed: `git checkout -- src/types/forecasting.ts src/data/forecastingFixtures.ts src/services/forecastingApi.ts src/utils/accuracyCalculations.ts src/components/forecasting/build/BuildForecastWorkspace.tsx src/components/forecasting/exceptions/ExceptionsWorkspace.tsx src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx src/components/forecasting/trends/TrendAnalysisDashboard.tsx src/adapters/forecasting/accuracy.ts src/components/forecasting/AccuracyDashboard.tsx tests/forecasting/accuracy.test.ts tests/forecasting/trends.test.ts`
- Remove new data if preview deploy fails: `git restore --staged` + `git checkout --` for affected files, redeploy last known good commit.

## Handoff
- Update `docs/SESSION_HANDOFF.md` with execution summary (tests, deploy URL, UAT results, outstanding items).
- In `PROGRESS.md`, log this plan under Forecasting phase with status “Ready for execution – parity remediation”.
- Documentation to refresh post-execution: `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`, `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/Tasks/post-phase9-demo-execution.md`, parity packs (`docs/Tasks/uat-packs/*.md`), UAT report `uat-agent-tasks/2025-10-29_forecasting-demo-vs-naumen.md`.
- Stage screenshots in `/Users/m/Desktop/tmp-forecasting-uat/` and update aliases in `docs/SCREENSHOT_INDEX.md` during UAT evidence capture.
