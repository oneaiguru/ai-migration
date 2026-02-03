import { addMinutes, startOfDay, subDays } from 'date-fns';
import type {
  AbsenteeismProfile,
  AbsenteeismTemplate,
  AbsenteeismCalculatorPreset,
  ExceptionInterval,
  ExceptionTemplate,
  ForecastBuildDefaults,
  ForecastDetailRow,
  ForecastHorizonOption,
  ForecastTimezoneOption,
  ForecastWindowOption,
  QueueNode,
} from '../types/forecasting';
import type { TrendSeedDefaults, TrendSeriesFixture } from '../types/trends';

const baseStart = startOfDay(new Date(Date.UTC(2025, 9, 20)));

const timestampAt = (index: number) => addMinutes(baseStart, index * 15).toISOString();

export const timezoneOptions: ForecastTimezoneOption[] = [
  {
    id: 'europe-moscow',
    label: 'Москва (UTC+03)',
    shortLabel: 'UTC+03',
    offsetMinutes: 180,
    iana: 'Europe/Moscow',
  },
  {
    id: 'asia-yekaterinburg',
    label: 'Челябинск (UTC+05)',
    shortLabel: 'UTC+05',
    offsetMinutes: 300,
    iana: 'Asia/Yekaterinburg',
  },
];

export const defaultTimezoneId = timezoneOptions[0]?.id ?? 'europe-moscow';

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

const scaleSeries = (
  factor: number,
  offset: number,
  noiseAmplitude: number,
  limit = forecastSeries.length,
) =>
  forecastSeries.slice(0, limit).map((point, index) => {
    const swing = Math.sin((index + offset) / 6) * noiseAmplitude;
    const forecast = Math.max(0, Math.round(point.forecast * factor + swing));
    const actual = point.actual != null ? Math.max(0, Math.round(point.actual * factor + swing / 2)) : undefined;
    const confidence = 0.82 + ((index + offset) % 9) * 0.01;
    return {
      timestamp: point.timestamp,
      forecast,
      actual,
      confidence: Number.isFinite(confidence) ? Math.min(0.96, confidence) : 0.88,
    };
  });

export const trendSeriesByQueue: TrendSeriesFixture[] = [
  {
    queueId: 'support',
    queueName: 'Отдел поддержки',
    serviceLevelTarget: 88,
    strategic: scaleSeries(1, 0, 12),
    tactical: scaleSeries(1.05, 2, 10),
    operational: scaleSeries(0.98, 4, 8, 64),
  },
  {
    queueId: 'support-l1',
    queueName: 'Первая линия',
    serviceLevelTarget: 90,
    strategic: scaleSeries(0.75, 3, 9),
    tactical: scaleSeries(0.78, 5, 8),
    operational: scaleSeries(0.8, 7, 7, 64),
  },
  {
    queueId: 'sales',
    queueName: 'Активные продажи',
    serviceLevelTarget: 85,
    strategic: scaleSeries(0.95, 6, 15),
    tactical: scaleSeries(1.08, 8, 12),
    operational: scaleSeries(1.12, 9, 9, 64),
  },
  {
    queueId: 'sales-outbound',
    queueName: 'Исходящие звонки',
    serviceLevelTarget: 80,
    strategic: scaleSeries(0.68, 5, 14),
    tactical: scaleSeries(0.72, 6, 10),
    operational: scaleSeries(0.74, 7, 9, 64),
  },
  {
    queueId: 'it-service',
    queueName: 'IT сервис-деск',
    serviceLevelTarget: 82,
    strategic: scaleSeries(0.58, 4, 11),
    tactical: scaleSeries(0.62, 6, 9),
    operational: scaleSeries(0.67, 8, 7, 64),
  },
];

export const trendSeedDefaults: TrendSeedDefaults = {
  queueId: 'support',
  period: {
    start: forecastSeries[0].timestamp,
    end: forecastSeries[forecastSeries.length - 1].timestamp,
  },
};

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

const leafQueueIds = (nodes: QueueNode[]): string[] =>
  nodes.flatMap((node) =>
    node.children && node.children.length ? leafQueueIds(node.children) : [node.id],
  );

const defaultQueueSelection = () => {
  const leaves = leafQueueIds(queueTree);
  return leaves.length ? leaves.slice(0, 2) : ['queue'];
};

const defaultBuildPeriodStart = forecastSeries[0].timestamp;
const defaultBuildPeriodEnd = forecastSeries[forecastSeries.length - 1].timestamp;

const defaultHistoryEnd = defaultBuildPeriodStart;
const defaultHistoryStart = subDays(new Date(defaultHistoryEnd), 60).toISOString();

export const buildForecastDefaults: ForecastBuildDefaults = {
  historyDays: 60,
  forecastDays: 30,
  granularity: 'interval',
  absenteeismProfileId: 'weekday-5',
  queueIds: defaultQueueSelection(),
  historyStart: defaultHistoryStart,
  historyEnd: defaultHistoryEnd,
  buildPeriodStart: defaultBuildPeriodStart,
  buildPeriodEnd: defaultBuildPeriodEnd,
  timezoneId: defaultTimezoneId,
};

export const forecastHorizonOptions: ForecastHorizonOption[] = [
  {
    id: 'hist-30-interval',
    label: 'История 30 дней · 15 минут',
    historyDays: 30,
    forecastDays: 14,
    granularity: 'interval',
    days: 30,
  },
  {
    id: 'hist-60-day',
    label: 'История 60 дней · сутки',
    historyDays: 60,
    forecastDays: 30,
    granularity: 'day',
    days: 60,
  },
  {
    id: 'hist-90-day',
    label: 'История 90 дней · сутки',
    historyDays: 90,
    forecastDays: 45,
    granularity: 'day',
    days: 90,
  },
  {
    id: 'hist-120-interval',
    label: 'История 120 дней · 15 минут',
    historyDays: 120,
    forecastDays: 60,
    granularity: 'interval',
    days: 120,
  },
];

export const forecastWindowOptions: ForecastWindowOption[] = [
  { id: 'forecast-14', label: 'Прогноз 14 дней', days: 14 },
  { id: 'forecast-30', label: 'Прогноз 30 дней', days: 30 },
  { id: 'forecast-45', label: 'Прогноз 45 дней', days: 45 },
  { id: 'forecast-60', label: 'Прогноз 60 дней', days: 60 },
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

export const absenteeismCalculatorPresets: AbsenteeismCalculatorPreset[] = [
  {
    id: 'calc-default',
    label: 'Типовой офис (30/14)',
    historyDays: 30,
    forecastDays: 14,
    intervalMinutes: 15,
    baselinePercent: 5,
  },
  {
    id: 'calc-peak',
    label: 'Праздничный пик (60/30)',
    historyDays: 60,
    forecastDays: 30,
    intervalMinutes: 30,
    baselinePercent: 8,
  },
  {
    id: 'calc-night',
    label: 'Ночная смена (45/21)',
    historyDays: 45,
    forecastDays: 21,
    intervalMinutes: 60,
    baselinePercent: 3,
  },
];

export const exceptionWorkspaceDefaults = {
  historyStart: subDays(new Date(defaultHistoryEnd), 30).toISOString(),
  historyEnd: defaultHistoryEnd,
  buildStart: defaultBuildPeriodStart,
  buildEnd: defaultBuildPeriodEnd,
  initialMode: 'day' as const,
  timezoneId: defaultTimezoneId,
};
