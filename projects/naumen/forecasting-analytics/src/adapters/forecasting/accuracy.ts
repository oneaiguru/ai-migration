import type {
  AccuracyMetrics,
  HistoricalAccuracy,
  ModelComparison,
  ValidationResult,
  ForecastDataPoint,
  AlgorithmType,
} from '../../types/accuracy';
import type {
  KpiCardItem,
  Series,
  TargetLine,
  Unit,
  ReportTableColumn,
} from '../../components/charts/types';
import { formatMetricValue, formatPercent } from '../../utils/accuracyCalculations';
import type { ForecastDetailRow } from '../../types/forecasting';

export interface AccuracyTrendSeries {
  series: Series[];
  targets?: TargetLine[];
  yUnit: Unit;
}

const METRIC_UNITS: Record<string, Unit> = {
  mape: 'percent',
  mae: 'people',
  rmse: 'people',
  bias: 'people',
  rSquared: 'percent',
};

const METRIC_LABELS: Record<string, string> = {
  mape: 'MAPE',
  mae: 'MAE',
  rmse: 'RMSE',
  bias: 'Смещение',
  rSquared: 'R²',
};

const trendDirection = (current: number, previous?: number, higherIsBetter = false): 'up' | 'down' | 'stable' => {
  if (previous == null || Number.isNaN(previous)) return 'stable';
  const improved = higherIsBetter ? current >= previous : current <= previous;
  const worsened = higherIsBetter ? current < previous : current > previous;

  if (Math.abs(current - previous) < 0.001) return 'stable';
  return improved ? 'up' : worsened ? 'down' : 'stable';
};

const resolveVariant = (metric: string, value: number): KpiCardItem['variant'] => {
  if (metric === 'mape') {
    if (value <= 10) return 'success';
    if (value <= 20) return 'primary';
    if (value <= 30) return 'warning';
    return 'danger';
  }

  if (metric === 'rSquared') {
    if (value >= 0.9) return 'success';
    if (value >= 0.75) return 'primary';
    if (value >= 0.6) return 'warning';
    return 'danger';
  }

  if (value <= 20) return 'success';
  if (value <= 35) return 'primary';
  if (value <= 45) return 'warning';
  return 'danger';
};

export const buildAccuracyKpiItems = (
  metrics: AccuracyMetrics,
  previous?: AccuracyMetrics,
): KpiCardItem[] => {
  const config: Array<{ key: keyof AccuracyMetrics; higherIsBetter?: boolean }> = [
    { key: 'mape' },
    { key: 'mae' },
    { key: 'rmse' },
    { key: 'bias' },
    { key: 'rSquared', higherIsBetter: true },
  ];

  return config.map(({ key, higherIsBetter }) => {
    const current = metrics[key];
    const prev = previous?.[key];
    const trend = trendDirection(current, prev, higherIsBetter);

    return {
      label: METRIC_LABELS[key] ?? String(key).toUpperCase(),
      value: formatMetricValue(current, String(key)),
      trend,
      variant: resolveVariant(String(key), current),
    };
  });
};

const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

const toTimestamp = (date: string | Date): string => {
  const instance = date instanceof Date ? date : new Date(date);
  return Number.isNaN(instance.getTime()) ? new Date().toISOString() : instance.toISOString();
};

const metricUnit = (metric: string): Unit => METRIC_UNITS[metric] ?? 'percent';

interface TrendSeriesOptions {
  history: HistoricalAccuracy[];
  selectedMetric: keyof AccuracyMetrics;
  algorithms?: AlgorithmType[];
  algorithmLabels?: Record<AlgorithmType, string>;
  includeArea?: boolean;
}

export const buildAccuracyTrendSeries = ({
  history,
  selectedMetric,
  algorithms,
  algorithmLabels = {},
  includeArea = false,
}: TrendSeriesOptions): AccuracyTrendSeries => {
  const uniqueAlgorithms = unique(history.map((item) => item.algorithmId as AlgorithmType));
  const activeAlgorithms = algorithms?.length ? algorithms : uniqueAlgorithms;

  const series: Series[] = activeAlgorithms.map((algorithmId) => {
    const points = history
      .filter((item) => item.algorithmId === algorithmId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        timestamp: toTimestamp(item.date),
        value: Number(item.metrics[selectedMetric] ?? 0),
        metadata: {
          label: item.date,
        },
      }));

    return {
      id: algorithmId,
      label: algorithmLabels[algorithmId] ?? algorithmId,
      unit: metricUnit(String(selectedMetric)),
      area: includeArea,
      points,
    };
  });

  return {
    series,
    targets: undefined,
    yUnit: metricUnit(String(selectedMetric)),
  };
};

interface ErrorAnalysisInput {
  forecastData: ForecastDataPoint[];
}

export interface ErrorAnalysisSeries {
  series: Series[];
  viewToggle: Array<{ id: string; label: string }>;
  categories: Record<string, string[]>;
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, '0')}:00`);
const WEEKDAY_ORDER = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
const MAGNITUDE_BUCKETS = ['0-5', '5-10', '10-20', '20-30', '30+'];

const mean = (values: number[]): number => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const bucketise = (value: number): string => {
  if (value < 5) return MAGNITUDE_BUCKETS[0];
  if (value < 10) return MAGNITUDE_BUCKETS[1];
  if (value < 20) return MAGNITUDE_BUCKETS[2];
  if (value < 30) return MAGNITUDE_BUCKETS[3];
  return MAGNITUDE_BUCKETS[4];
};

export const buildErrorAnalysisSeries = ({ forecastData }: ErrorAnalysisInput): ErrorAnalysisSeries => {
  const withActual = forecastData.filter((point) => point.actual != null);

  const byHour = new Map<string, number[]>();
  const byDay = new Map<string, number[]>();
  const byBucket = new Map<string, number>(MAGNITUDE_BUCKETS.map((bucket) => [bucket, 0] as const));

  withActual.forEach((point) => {
    const timestamp = new Date(point.timestamp);
    const hour = HOUR_LABELS[timestamp.getHours()];
    const weekday = timestamp.toLocaleDateString('ru-RU', { weekday: 'long' }).toLowerCase();
    const error = Math.abs((point.predicted ?? 0) - (point.actual ?? 0));

    byHour.set(hour, [...(byHour.get(hour) ?? []), error]);
    byDay.set(weekday, [...(byDay.get(weekday) ?? []), error]);
    const bucket = bucketise(error);
    byBucket.set(bucket, (byBucket.get(bucket) ?? 0) + 1);
  });

  const hourSeries: Series = {
    id: 'time',
    label: 'Средняя ошибка по часам',
    unit: 'people',
    points: HOUR_LABELS.map((label) => ({
      label,
      value: Number(mean(byHour.get(label) ?? [])),
      metadata: { viewId: 'time' },
    })),
  };

  const daySeries: Series = {
    id: 'day',
    label: 'Средняя ошибка по дням',
    unit: 'people',
    points: WEEKDAY_ORDER.map((label) => ({
      label,
      value: Number(mean(byDay.get(label) ?? [])),
      metadata: { viewId: 'day' },
    })),
  };

  const magnitudeSeries: Series = {
    id: 'magnitude',
    label: 'Количество интервалов',
    unit: 'people',
    points: MAGNITUDE_BUCKETS.map((label) => ({
      label,
      value: Number(byBucket.get(label) ?? 0),
      metadata: { viewId: 'magnitude' },
    })),
  };

  return {
    series: [hourSeries, daySeries, magnitudeSeries],
    viewToggle: [
      { id: 'time', label: 'По времени' },
      { id: 'day', label: 'По дням недели' },
      { id: 'magnitude', label: 'По величине' },
    ],
    categories: {
      time: HOUR_LABELS,
      day: WEEKDAY_ORDER,
      magnitude: MAGNITUDE_BUCKETS,
    },
  };
};

export interface ModelComparisonTable {
  columns: ReportTableColumn[];
  rows: Array<Record<string, string | number>>;
}

export const buildModelComparisonTable = (
  comparisons: ModelComparison[],
): ModelComparisonTable => {
  const columns: ReportTableColumn[] = [
    { id: 'algorithm', label: 'Алгоритм' },
    { id: 'mape', label: 'MAPE' },
    { id: 'mae', label: 'MAE' },
    { id: 'rmse', label: 'RMSE' },
    { id: 'processing', label: 'Время, с' },
    { id: 'status', label: 'Статус' },
  ];

  const rows = comparisons.map((comparison) => ({
    algorithm: comparison.algorithmName,
    mape: formatMetricValue(comparison.metrics.mape, 'mape'),
    mae: formatMetricValue(comparison.metrics.mae, 'mae'),
    rmse: formatMetricValue(comparison.metrics.rmse, 'rmse'),
    processing: comparison.processingTime.toFixed(0),
    status: comparison.status === 'active' ? 'Активен' : comparison.status === 'testing' ? 'Тестируется' : 'Архив',
  }));

  return { columns, rows };
};

export interface ValidationTable {
  columns: ReportTableColumn[];
  rows: Array<Record<string, string | number>>;
}

export const buildValidationTable = (
  results: ValidationResult[],
): ValidationTable => {
  const columns: ReportTableColumn[] = [
    { id: 'method', label: 'Метод' },
    { id: 'sample', label: 'Объём выборки' },
    { id: 'mape', label: 'MAPE' },
    { id: 'mae', label: 'MAE' },
    { id: 'rmse', label: 'RMSE' },
    { id: 'pValue', label: 'p-value' },
  ];

  const rows = results.map((result) => ({
    method: result.method === 'crossValidation'
      ? 'Кросс-валидация'
      : result.method === 'timeSeries'
        ? 'Временные срезы'
        : 'Holdout',
    sample: result.metrics.sampleSize ?? '—',
    mape: formatMetricValue(result.metrics.mape, 'mape'),
    mae: formatMetricValue(result.metrics.mae, 'mae'),
    rmse: formatMetricValue(result.metrics.rmse, 'rmse'),
    pValue: result.metrics.pValue?.toFixed(3) ?? '—',
  }));

  return { columns, rows };
};

export interface ForecastDetailTable {
  columns: ReportTableColumn[];
  rows: Array<Record<string, string>>;
}

const ruNumber = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const buildForecastDetailTable = (rows: ForecastDetailRow[]): ForecastDetailTable => {
  const columns: ReportTableColumn[] = [
    { id: 'time', label: 'Интервал' },
    { id: 'forecast', label: 'Прогноз (FTE)' },
    { id: 'actual', label: 'Факт (FTE)' },
    { id: 'abs', label: 'Отклонение' },
    { id: 'rel', label: 'Отклонение, %' },
    { id: 'absenteeism', label: 'Абсентеизм, %' },
    { id: 'lostCalls', label: 'Потерянные звонки' },
    { id: 'aht', label: 'AHT, сек' },
    { id: 'sl', label: 'SL, %' },
  ];

  const mapped = rows.map((row) => {
    const timestamp = new Date(row.timestamp);
    const abs = row.actual - row.forecast;
    const rel = row.forecast === 0 ? 0 : (abs / row.forecast) * 100;

    return {
      time: Number.isNaN(timestamp.getTime())
        ? '—'
        : timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      forecast: ruNumber.format(row.forecast),
      actual: ruNumber.format(row.actual),
      abs: ruNumber.format(abs),
      rel: formatPercent(rel, 1),
      absenteeism: formatPercent(row.absenteeismPercent, 1),
      lostCalls: ruNumber.format(row.lostCalls),
      aht: ruNumber.format(row.ahtSeconds),
      sl: formatPercent(row.serviceLevel, 1),
    };
  });

  return { columns, rows: mapped };
};

export interface AlertSummary {
  total: number;
  critical: number;
  medium: number;
  low: number;
}

export const buildAlertSummary = (alerts: AccuracyMetrics['confidenceInterval'][]): AlertSummary => {
  const defaultSummary: AlertSummary = { total: 0, critical: 0, medium: 0, low: 0 };
  if (!alerts?.length) return defaultSummary;

  return alerts.reduce<AlertSummary>((acc, _alert) => ({
    total: acc.total + 1,
    critical: acc.critical,
    medium: acc.medium + 1,
    low: acc.low,
  }), defaultSummary);
};
