import type { Series, TargetLine, Unit, ConfidenceBand } from '../../components/charts/types';
import type { TrendDataPoint, TrendDashboardProps, AnomalyEvent } from '../../types/trends';

export interface TrendSeriesConfig {
  forecast: Series;
  fact: Series;
  target?: TargetLine;
  trend?: Series;
  band?: ConfidenceBand;
  secondaryAxis?: {
    unit: Unit;
    clamp?: { min?: number; max?: number };
    label?: string;
  };
  yUnit: Unit;
}

const toTimestamp = (date: Date): string => {
  const value = date instanceof Date ? date : new Date(date);
  return Number.isNaN(value.getTime()) ? new Date().toISOString() : value.toISOString();
};

export const buildForecastVsFactSeries = (
  data: TrendDataPoint[],
  serviceLevelTarget?: number,
): TrendSeriesConfig => {
  const sorted = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const fact: Series = {
    id: 'fact',
    label: 'Факт',
    unit: 'people',
    points: sorted.map((entry) => ({
      timestamp: toTimestamp(entry.timestamp),
      value: Number(entry.value),
    })),
  };

  const forecast: Series = {
    id: 'forecast',
    label: 'Прогноз',
    unit: 'people',
    points: sorted.map((entry) => ({
      timestamp: toTimestamp(entry.timestamp),
      value: Number(entry.forecast ?? entry.value ?? 0),
      metadata: entry.confidence != null ? { confidence: entry.confidence } : undefined,
    })),
  };

  const trendSeries: Series = {
    id: 'trend-percent',
    label: 'Отклонение, %',
    unit: 'percent',
    axis: 'secondary',
    points: sorted.map((entry) => {
      const base = Number(entry.value) || 1;
      const trend = Number(entry.trend ?? entry.value);
      const percent = (trend / base) * 100;
      return {
        timestamp: toTimestamp(entry.timestamp),
        value: Number.isFinite(percent) ? percent : 0,
      };
    }),
  };

  const confidenceBand: ConfidenceBand | undefined = sorted.length
    ? {
        id: 'forecast-confidence',
        label: 'Доверительный интервал',
        color: '#4f46e5',
        upper: sorted.map((entry) => {
          const base = Number(entry.forecast ?? entry.value ?? 0);
          const confidence = typeof entry.confidence === 'number' ? entry.confidence : 0.85;
          const spread = Math.max(0.05, 1 - confidence);
          return base + base * spread;
        }),
        lower: sorted.map((entry) => {
          const base = Number(entry.forecast ?? entry.value ?? 0);
          const confidence = typeof entry.confidence === 'number' ? entry.confidence : 0.85;
          const spread = Math.max(0.05, 1 - confidence);
          const value = base - base * spread;
          return value < 0 ? 0 : value;
        }),
      }
    : undefined;

  const targetValue = typeof serviceLevelTarget === 'number'
    ? serviceLevelTarget
    : sorted.length
      ? Math.round(sorted.reduce((sum, entry) => sum + entry.value, 0) / sorted.length)
      : undefined;

  const target = targetValue != null
    ? {
        label: 'Целевое значение',
        value: targetValue,
        style: 'dashed',
      } satisfies TargetLine
    : undefined;

  return {
    forecast,
    fact,
    trend: trendSeries,
    band: confidenceBand,
    target,
    secondaryAxis: {
      unit: 'percent',
      clamp: { min: 60, max: 140 },
      label: 'Отклонение, %',
    },
    yUnit: 'people',
  };
};

export interface SeasonalitySeries {
  series: Series[];
  categories: string[];
  yUnit: Unit;
}

export const buildSeasonalitySeries = (values: number[]): SeasonalitySeries => {
  const categories = Array.from({ length: values.length }, (_, hour) => `${hour}:00`);
  const series: Series = {
    id: 'seasonality',
    label: 'Сезонность',
    unit: 'percent',
    points: values.map((value, index) => ({
      label: categories[index],
      value: Number(value),
      metadata: {
        viewId: 'seasonality',
        stack: value >= 100 ? 'positive' : 'negative',
      },
    })),
  };

  return { series: [series], categories, yUnit: 'percent' };
};

export const buildAnomalySeries = (data: TrendDataPoint[], anomalies: AnomalyEvent[]): Series[] => {
  if (!anomalies?.length) return [];

  const anomalySet = new Set(anomalies.map((anomaly) => anomaly.timestamp.toISOString()));

  return [
    {
      id: 'anomalies',
      label: 'Аномалии',
      unit: 'people',
      points: data
        .filter((point) => anomalySet.has(point.timestamp.toISOString()))
        .map((point) => ({
          timestamp: toTimestamp(point.timestamp),
          value: Number(point.value),
          metadata: { severity: anomalies.find((anomaly) => anomaly.timestamp.toISOString() === point.timestamp.toISOString())?.severity },
        })),
    },
  ];
};

export interface TrendMetaSummary {
  title: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
}

const createFallbackDateRange = () => {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
};

export const buildTrendMetaSummary = (
  props: Pick<TrendDashboardProps, 'organizationId' | 'queueIds' | 'dateRange'>,
): TrendMetaSummary => {
  const { organizationId, queueIds, dateRange } = props;
  const formatDate = (value?: Date) => {
    const valid = value instanceof Date && !Number.isNaN(value.getTime()) ? value : undefined;
    return valid ? valid.toLocaleDateString('ru-RU') : '—';
  };

  const safeQueues = queueIds && queueIds.length ? queueIds : ['Контакт-центр 1010'];
  const safeRange = dateRange?.start && dateRange?.end ? dateRange : createFallbackDateRange();

  return {
    title: 'Контекст дашборда',
    description: 'Параметры текущего анализа трендов',
    meta: [
      { label: 'Организация', value: organizationId || '—' },
      { label: 'Очереди', value: safeQueues.join(', ') },
      { label: 'Период', value: `${formatDate(safeRange.start)} — ${formatDate(safeRange.end)}` },
    ],
  };
};
