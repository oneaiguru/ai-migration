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
    .filter((_, index) => index % 9 === 0)
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
