import { nanoid } from 'nanoid';
import type {
  AbsenteeismRun,
  AbsenteeismSnapshot,
  AccuracyRow,
  ForecastBuildResult,
  ForecastRunSummary,
  ForecastSeries,
  HorizonConfig,
  QueueNode,
  ReportDownloadNotice,
  ReportTableRow,
  TrendTables,
} from './types';
import type { ReportFormat } from './reports';

const seededRandom = (seed: number) => {
  let current = seed;
  return () => {
    const x = Math.sin(current++) * 10000;
    return x - Math.floor(x);
  };
};

const buildSeries = (
  id: string,
  label: string,
  unit: ForecastSeries['unit'],
  points: Array<{ timestamp: string; value: number }>,
  overrides: Partial<ForecastSeries> = {},
): ForecastSeries => ({
  id,
  label,
  unit,
  points,
  ...overrides,
});

/**
 * Generates deterministic forecast data with actual history and confidence bands.
 * Uses seeded random number generator for reproducible results across sessions.
 *
 * @param organisation - Name of the organisation
 * @param horizonWeeks - Number of weeks in historical horizon
 * @param projectionWeeks - Number of weeks for forecast projection
 * @returns Complete forecast build result with actual/forecast/confidence bands and table
 *
 * @example
 * const build = generateForecastBuild('1010.ru', 8, 8);
 * console.log(build.actual.points.length); // 8 historical points
 * console.log(build.forecast.points.length); // 8 forecast points
 */
export const generateForecastBuild = (
  organisation: string,
  horizonWeeks: number,
  projectionWeeks: number,
): ForecastBuildResult => {
  const random = seededRandom(organisation.length + horizonWeeks + projectionWeeks);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const totalPoints = horizonWeeks + projectionWeeks;

  const timestamps = Array.from({ length: totalPoints }, (_, index) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - (totalPoints - index - 1) * 7);
    return dt.toISOString();
  });

  const actualPoints = timestamps.slice(0, horizonWeeks).map((timestamp) => ({
    timestamp,
    value: Math.round(random() * 180 + 120),
  }));

  const lastActual = actualPoints.length ? actualPoints[actualPoints.length - 1].value : 160;
  const forecastPoints = timestamps.slice(horizonWeeks).map((timestamp, index) => ({
    timestamp,
    value: Math.round(lastActual + index * random() * 4),
  }));

  const confidenceLower = buildSeries(
    'forecast-lower',
    'Нижняя граница',
    'count',
    forecastPoints.map((point) => ({ timestamp: point.timestamp, value: Number((point.value * 0.92).toFixed(1)) })),
    { color: '#bfdbfe', area: true, hiddenInLegend: true },
  );

  const confidenceUpper = buildSeries(
    'forecast-upper',
    'Верхняя граница',
    'count',
    forecastPoints.map((point) => ({ timestamp: point.timestamp, value: Number((point.value * 1.08).toFixed(1)) })),
    { color: '#bfdbfe', area: true, hiddenInLegend: true },
  );

  const table: ReportTableRow[] = forecastPoints.map((point) => ({
    period: new Date(point.timestamp).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
    forecast: point.value,
    target: Math.round(point.value * 0.97),
    delta: Math.round(point.value - lastActual),
  }));

  return {
    organisation,
    horizonWeeks,
    projectionWeeks,
    generatedAt: new Date().toISOString(),
    actual: buildSeries('history', 'История', 'count', actualPoints, { color: '#3b82f6' }),
    forecast: buildSeries('projection', 'Прогноз', 'count', forecastPoints, { color: '#22c55e' }),
    confidence: {
      lower: confidenceLower,
      upper: confidenceUpper,
    },
    table,
  };
};

/**
 * Generates absenteeism (turnover) forecast data with observed vs forecasted rates.
 * Returns 12 months of data with breakdown by reason (illness, tardiness, vacation, training).
 *
 * @param organisation - Name of the organisation
 * @returns Absenteeism snapshot with observed/forecast series and reason breakdown
 *
 * @example
 * const snapshot = generateAbsenteeismSnapshot('1010.ru');
 * console.log(snapshot.deltaPercent); // Percentage change from observed to forecasted
 * console.log(snapshot.reasonBreakdown.length); // 4 reasons
 */
export const generateAbsenteeismSnapshot = (organisation: string): AbsenteeismSnapshot => {
  const random = seededRandom(organisation.length * 13);
  const base = Array.from({ length: 12 }, (_, index) => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() - (11 - index));
    dt.setDate(1);
    dt.setHours(0, 0, 0, 0);
    return dt.toISOString();
  });

  const observed = base.map((timestamp) => ({ timestamp, value: Math.round(random() * 12 + 8) }));
  const forecast = base.map((timestamp) => ({ timestamp, value: Math.round(random() * 11 + 7) }));

  const observedLatest = observed.length ? observed[observed.length - 1].value : 1;
  const forecastLatest = forecast.length ? forecast[forecast.length - 1].value : observedLatest;

  const reasonBreakdown: ReportTableRow[] = [
    { reason: 'Болезнь', share: `${Math.round(random() * 40 + 35)}%` },
    { reason: 'Опоздания', share: `${Math.round(random() * 20 + 15)}%` },
    { reason: 'Отпуск', share: `${Math.round(random() * 15 + 10)}%` },
    { reason: 'Учеба/тренинги', share: `${Math.round(random() * 10 + 5)}%` },
  ];

  const observedSeries = buildSeries('absenteeism-observed', 'Фактическая текучесть', 'percent', observed, {
    color: '#f97316',
  });

  const forecastSeries = buildSeries('absenteeism-forecast', 'Прогноз текучести', 'percent', forecast, {
    color: '#8b5cf6',
  });

  const deltaPercent = Number((((forecastLatest - observedLatest) / observedLatest) * 100).toFixed(1));

  return {
    organisation,
    observed: observedSeries,
    forecast: forecastSeries,
    deltaPercent,
    reasonBreakdown,
  };
};

const BASE_QUEUE_TREE: QueueNode[] = [
  {
    id: 'contact-centre',
    label: 'Контакт-центр 1010.ru',
    type: 'group',
    favourite: true,
    children: [
      {
        id: 'inbound',
        label: 'Входящие обращения',
        type: 'group',
        children: [
          { id: 'voice-general', label: 'Голос — общий поток', type: 'queue', favourite: true, skills: 42 },
          { id: 'voice-vip', label: 'Голос — VIP', type: 'queue', skills: 12 },
          { id: 'chat', label: 'Чат и мессенджеры', type: 'queue', skills: 18 },
          { id: 'email', label: 'Электронная почта', type: 'queue', skills: 9 },
        ],
      },
      {
        id: 'outbound',
        label: 'Исходящие кампании',
        type: 'group',
        children: [
          { id: 'sales-proactive', label: 'Продажи — проактивные', type: 'queue', skills: 7 },
          { id: 'retention', label: 'Удержание', type: 'queue', favourite: true, skills: 6 },
        ],
      },
      {
        id: 'support',
        label: 'Техподдержка',
        type: 'group',
        children: [
          { id: 'level1', label: '1-я линия', type: 'queue', skills: 15 },
          { id: 'level2', label: '2-я линия', type: 'queue', skills: 8 },
          { id: 'field', label: 'Выездные инженеры', type: 'queue', skills: 4 },
        ],
      },
    ],
  },
  {
    id: 'regional',
    label: 'Региональные площадки',
    type: 'group',
    children: [
      { id: 'kazan', label: 'Казань — голос', type: 'queue', skills: 11 },
      { id: 'perm', label: 'Пермь — back-office', type: 'queue', skills: 5 },
      { id: 'omsk', label: 'Омск — голос', type: 'queue', skills: 6 },
    ],
  },
  {
    id: 'partners',
    label: 'Партнёрские команды',
    type: 'group',
    children: [
      { id: 'outsourcing-alpha', label: 'Альфа контакт', type: 'queue', skills: 20 },
      { id: 'outsourcing-beta', label: 'Бета сервис', type: 'queue', skills: 14 },
    ],
  },
];

const cloneQueue = (node: QueueNode): QueueNode => ({
  ...node,
  children: node.children?.map(cloneQueue),
});

/**
 * Returns the complete queue hierarchy for contact centre operations.
 * Each call returns a deep clone to prevent mutation of the original tree.
 *
 * Structure includes:
 * - Contact Centre (1010.ru) with Inbound/Outbound/Support queues
 * - Regional locations (Kazan, Perm, Omsk)
 * - Partner teams (outsourcing)
 *
 * @returns Array of top-level queue groups with children
 *
 * @example
 * const queues = listOrganisationQueues();
 * const contactCentre = queues[0]; // 'Контакт-центр 1010.ru'
 * const inboundQueues = contactCentre.children?.[0]; // 'Входящие обращения'
 */
export const listOrganisationQueues = (): QueueNode[] => BASE_QUEUE_TREE.map(cloneQueue);

/**
 * Creates predefined forecast horizons for standard planning scenarios.
 * Baseline: 8 weeks history + 8 weeks forecast (standard quarterly planning)
 * Promo: 6 weeks history + 4 weeks forecast (short promotional period)
 *
 * @returns Array of two default horizon configurations
 */
export const createDefaultHorizons = (): HorizonConfig[] => [
  { id: 'baseline', label: 'Базовый', historyWeeks: 8, projectionWeeks: 8 },
  { id: 'promo', label: 'Промо-период', historyWeeks: 6, projectionWeeks: 4 },
];

/**
 * Builds a custom forecast horizon with validation.
 * Generates a unique 6-character nanoid for the horizon.
 *
 * @param historyWeeks - Number of weeks in historical horizon (must be positive)
 * @param projectionWeeks - Number of weeks for forecast projection (must be positive)
 * @param label - Display label for the horizon (default: 'Дополнительный диапазон')
 * @returns New horizon configuration with auto-generated ID
 * @throws Error if historyWeeks or projectionWeeks are not positive finite numbers
 *
 * @example
 * const custom = buildHorizon(12, 6, 'Long-term');
 * // { id: 'abc123', label: 'Long-term', historyWeeks: 12, projectionWeeks: 6 }
 */
export const buildHorizon = (
  historyWeeks: number,
  projectionWeeks: number,
  label = 'Дополнительный диапазон',
): HorizonConfig => {
  if (!Number.isFinite(historyWeeks) || historyWeeks <= 0) {
    throw new Error(`Invalid historyWeeks: ${historyWeeks}`);
  }
  if (!Number.isFinite(projectionWeeks) || projectionWeeks <= 0) {
    throw new Error(`Invalid projectionWeeks: ${projectionWeeks}`);
  }
  return { id: nanoid(6), label, historyWeeks, projectionWeeks };
};

/**
 * Builds a forecast run summary from a completed build result.
 * Captures key metadata about the forecast execution and parameters.
 *
 * @param result - Complete forecast build result
 * @param selectedQueues - Number of queues included in forecast
 * @param absenteeism - Absenteeism mode configuration (value-based or profile-based)
 * @returns Summary suitable for logging/display in UI
 */
export const buildForecastSummary = (
  result: ForecastBuildResult,
  selectedQueues: number,
  absenteeism: { mode: 'value' | 'profile'; value?: number; profileName?: string },
): ForecastRunSummary => ({
  appliedQueues: selectedQueues,
  horizonWeeks: result.horizonWeeks,
  projectionWeeks: result.projectionWeeks,
  absenteeismMode: absenteeism.mode,
  absenteeismValue: absenteeism.mode === 'value' ? absenteeism.value ?? 0 : undefined,
  absenteeismProfile: absenteeism.mode === 'profile' ? absenteeism.profileName : undefined,
  generatedAt: result.generatedAt,
});

const ABSENTEEISM_RUNS: AbsenteeismRun[] = [
  {
    id: 'run-001',
    requestedBy: 'planner@1010.ru',
    executedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    mode: 'profile',
    profileName: 'Базовый профиль call-центра',
    horizonWeeks: 8,
  },
  {
    id: 'run-002',
    requestedBy: 'resource_team@1010.ru',
    executedAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    mode: 'value',
    absenteeismPercent: 11.5,
    horizonWeeks: 6,
  },
  {
    id: 'run-003',
    requestedBy: 'planner@1010.ru',
    executedAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    mode: 'profile',
    profileName: 'Сезон отпусков',
    horizonWeeks: 12,
  },
  {
    id: 'run-004',
    requestedBy: 'planner@1010.ru',
    executedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    mode: 'value',
    absenteeismPercent: 18.2,
    horizonWeeks: 4,
  },
];

/**
 * Returns the history of absenteeism forecasting runs.
 * Includes completed, scheduled, and failed runs with various modes and parameters.
 * Each call returns a shallow clone to prevent mutation.
 *
 * @returns Array of 4 sample absenteeism runs with different statuses and modes
 *
 * @example
 * const runs = listAbsenteeismRuns();
 * const completed = runs.filter(r => r.status === 'completed');
 */
export const listAbsenteeismRuns = (): AbsenteeismRun[] => ABSENTEEISM_RUNS.map((run) => ({ ...run }));

/**
 * Generates tactical trend analysis data at multiple time granularities.
 * Strategic: 6 weeks of historical trends
 * Tactical: 7 days of weekday-level forecasts
 * Operational: 12 half-hour intervals throughout working day
 *
 * @param options.seed - Optional random seed for deterministic output
 * @returns Three-level trend tables for analysis and display
 *
 * @example
 * const trends = generateTrendTables({ seed: 100 });
 * console.log(trends.strategic.length); // 6 weeks
 * console.log(trends.tactical.length); // 7 days
 * console.log(trends.operational.length); // 12 intervals
 */
export const generateTrendTables = (options: { seed?: number } = {}): TrendTables => {
  // Offset ensures trend data differs from forecast/absenteeism random sequences
  const random = seededRandom((options.seed ?? 42) + 17);

  const weeks = Array.from({ length: 6 }, (_, index) => {
    const start = new Date();
    start.setDate(start.getDate() - index * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      label: `${start.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })} – ${end.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}`,
      forecast: Number((83 + random() * 6).toFixed(1)),
      actual: Number((81 + random() * 6).toFixed(1)),
      seasonality: Number((random() * 8 - 4).toFixed(1)),
    };
  }).reverse();

  const strategic: ReportTableRow[] = weeks.map((week) => ({
    period: week.label,
    forecast: week.forecast,
    actual: week.actual,
    delta: Number((week.actual - week.forecast).toFixed(1)),
    seasonality: week.seasonality,
  }));

  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const tactical: ReportTableRow[] = days.map((day) => {
    const forecast = Number((random() * 25 + 75).toFixed(1));
    const actual = Number((forecast + (random() - 0.5) * 6).toFixed(1));
    return {
      day,
      forecast,
      actual,
      delta: Number((actual - forecast).toFixed(1)),
    };
  });

  const operational = Array.from({ length: 12 }, (_, index) => {
    const hour = 8 + Math.floor(index / 2);
    const minute = index % 2 === 0 ? '00' : '30';
    const label = `${hour.toString().padStart(2, '0')}:${minute}`;
    const forecast = Number((random() * 15 + 45).toFixed(1));
    const actual = Number((forecast + (random() - 0.5) * 5).toFixed(1));
    return {
      interval: label,
      forecast,
      actual,
      delta: Number((actual - forecast).toFixed(1)),
    };
  });

  return { strategic, tactical, operational };
};

const numberFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const percentFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const hoursFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPercent = (value: number): string => `${percentFormatter.format(value)}%`;

const accuracyDeck: AccuracyRow[] = Array.from({ length: 8 }, (_, index) => {
  const base = 760 + index * 12;
  const actual = base + (index % 2 === 0 ? -35 : 28);
  const absoluteDelta = actual - base;
  const relativeDelta = Number(((absoluteDelta / base) * 100).toFixed(1));
  const absenteeism = Number((6 + (index % 3) * 1.2).toFixed(1));
  const lostCalls = Number((1.4 + (index % 4) * 0.3).toFixed(1));
  const serviceLevel = Number((94 - index * 0.6).toFixed(1));
  const aht = Number((4.2 + index * 0.05).toFixed(2));

  return {
    period: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
    }),
    forecast: numberFormatter.format(base),
    actual: numberFormatter.format(actual),
    absoluteDelta: numberFormatter.format(absoluteDelta),
    relativeDelta: formatPercent(relativeDelta),
    absenteeism: formatPercent(absenteeism),
    lostCalls: formatPercent(lostCalls),
    serviceLevel: formatPercent(serviceLevel),
    aht: `${hoursFormatter.format(aht)} ч`,
  };
}).reverse();

/**
 * Generates 8 weeks of accuracy metrics comparing forecasts to actual outcomes.
 * All numeric values use Russian locale formatting (comma decimal separators).
 * Includes columns: forecast, actual, delta (absolute and relative), absenteeism,
 * lost calls, service level, and average handling time (AHT).
 *
 * @returns Array of 8 accuracy rows sorted chronologically
 *
 * @example
 * const accuracy = generateAccuracyTable();
 * console.log(accuracy[0].forecast); // "844" (Russian formatted)
 * console.log(accuracy[0].relativeDelta); // "5,2%" (with comma separator)
 */
export const generateAccuracyTable = (): AccuracyRow[] => accuracyDeck.map((row) => ({ ...row }));

/**
 * Creates a report download notification entry.
 * Used to track queued/ready report generation requests in the UI notification bell.
 *
 * @param reportId - Unique identifier for the report
 * @param format - Export format: 'csv', 'xlsx', or 'pdf'
 * @returns Download notice with auto-generated ID, filename, and timestamp
 *
 * @example
 * const notice = createReportDownloadNotice('forecast-2025-q1', 'xlsx');
 * // { id: 'x3k9z1', reportId: 'forecast-2025-q1', format: 'xlsx',
 * //   filename: 'forecast-2025-q1_2025-11-02.xlsx', status: 'queued' }
 */
export const createReportDownloadNotice = (
  reportId: string,
  format: ReportFormat,
): ReportDownloadNotice => ({
  id: nanoid(),
  reportId,
  format,
  filename: `${reportId}_${new Date().toISOString().slice(0, 10)}.${format}`,
  requestedAt: new Date().toISOString(),
  status: 'queued',
});
