import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import type { BarChartProps, SeriesPoint, TargetLine } from './types';
import {
  formatTooltipValue,
  sanitizeDatasetLabel,
} from '../../utils/charts/format';

const FALLBACK_COLORS = [
  '#2563eb',
  '#16a34a',
  '#f97316',
  '#a855f7',
  '#0ea5e9',
  '#facc15',
  '#ef4444',
];

const resolveLabels = (
  categories: string[] | undefined,
  labels: string[] | undefined,
  series: BarChartProps['series'],
): string[] => {
  if (categories?.length) return categories;
  if (labels?.length) return labels;
  const firstSeries = series?.[0];
  if (firstSeries) {
    return firstSeries.points.map((point, index) => point.label ?? `Категория ${index + 1}`);
  }
  return [];
};

const metadataString = (metadata: Record<string, unknown> | undefined, key: string): string | undefined => {
  if (!metadata) return undefined;
  const value = metadata[key];
  return typeof value === 'string' ? value : undefined;
};

const viewIdForSeries = (
  id: string | undefined,
  metadata: Record<string, unknown> | undefined,
): string | undefined => metadataString(metadata, 'viewId') ?? id;

const backgroundColorFromPoints = (points: SeriesPoint[], fallbackColor: string): string | string[] => {
  const colors = points.map((point) => {
    const metadata = point.metadata;
    const explicit = metadataString(metadata, 'color');
    if (explicit) {
      return explicit;
    }
    const value = Number(point.value);
    if (Number.isFinite(value) && value < 0) {
      return '#dc2626';
    }
    return fallbackColor;
  });

  const distinct = new Set(colors);
  return distinct.size === 1 ? colors[0] : colors;
};

const buildTargetDataset = (
  target: TargetLine,
  labels: string[],
): ChartData<'bar' | 'line'>['datasets'][number] => {
  const label = sanitizeDatasetLabel(target.label);
  const values = target.series ?? labels.map(() => target.value ?? null);
  return {
    type: 'line',
    label,
    data: labels.map((_, idx) => {
      const value = values?.[idx] ?? target.value;
      const numeric = value == null ? Number.NaN : Number(value);
      return Number.isFinite(numeric) ? numeric : Number.NaN;
    }),
    borderColor: target.color ?? '#475569',
    backgroundColor: 'transparent',
    borderDash: target.style === 'solid' ? undefined : [6, 6],
    pointRadius: 0,
    tension: 0,
    order: 1,
  };
};

const BarChart: React.FC<BarChartProps> = ({
  series = [],
  labels = [],
  categories = [],
  yUnit = 'percent',
  clamp,
  stacked,
  viewToggle,
  activeViewId,
  targets = [],
  ariaTitle,
  ariaDesc,
  className,
  chartHeightClass,
  errorMessage,
}) => {
  const title = ariaTitle ?? 'Столбчатая диаграмма';
  const desc = ariaDesc ?? 'Распределение показателей по категориям';
  const [internalViewId, setInternalViewId] = useState(viewToggle?.[0]?.id);

  if (errorMessage) {
    return (
      <figure
        role="group"
        aria-label={title}
        aria-description={`${desc}. Ошибка отображения данных.`}
        className={className ?? 'rounded-lg border border-red-200 bg-white p-4'}
      >
        <div className="text-sm text-red-600">{errorMessage}</div>
      </figure>
    );
  }

  useEffect(() => {
    if (activeViewId) {
      setInternalViewId(activeViewId);
    }
  }, [activeViewId]);

  const resolvedViewId = activeViewId ?? internalViewId;

  const activeSeries = useMemo(() => {
    if (!viewToggle?.length) {
      return series;
    }
    const filtered = series.filter((entry) => {
      const entryViewId = viewIdForSeries(entry.id, entry.points[0]?.metadata);
      if (!resolvedViewId) {
        return !entryViewId;
      }
      return entryViewId === resolvedViewId;
    });

    return filtered.length ? filtered : series;
  }, [resolvedViewId, series, viewToggle?.length]);

  const resolvedLabels = resolveLabels(categories, labels, activeSeries);
  const totalBars = activeSeries.reduce((acc, entry) => acc + entry.points.length, 0);

  const data = useMemo<ChartData<'bar' | 'line'>>(() => {
    const datasets = activeSeries.map((entry, idx) => {
      const label = sanitizeDatasetLabel(entry.label ?? `Серия ${idx + 1}`);
      const color = entry.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
      const metadata = entry.points[0]?.metadata;
      const stackKey = metadataString(metadata, 'stack') ?? (stacked ? 'stack' : undefined);

      const orderedPoints = resolvedLabels.map((labelValue, index) => {
        const point = entry.points.find((candidate) => candidate.label === labelValue) ?? entry.points[index];
        return point ?? { label: labelValue, value: Number.NaN };
      });

      const backgroundColor = backgroundColorFromPoints(orderedPoints, color);

      return {
        label,
        data: orderedPoints.map((point) => (Number.isFinite(point.value) ? point.value : null)),
        backgroundColor,
        borderColor: backgroundColor,
        borderRadius: 4,
        stack: stackKey,
        order: 0,
      };
    });

    return {
      labels: resolvedLabels,
      datasets,
    };
  }, [activeSeries, resolvedLabels, stacked]);

  const options = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: Boolean(stacked),
          ticks: {
            maxRotation: 0,
          },
        },
        y: {
          stacked: Boolean(stacked),
          min: clamp?.min,
          max: clamp?.max,
          ticks: {
            callback: (value) => formatTooltipValue(Number(value), yUnit),
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            title: (items) => (items.length ? String(items[0].label) : ''),
            label: (item: TooltipItem<'bar'>) => {
              const label = item.dataset.label ? `${item.dataset.label}: ` : '';
              const value = item.parsed.y ?? item.parsed;
              return `${label}${formatTooltipValue(value, yUnit)}`;
            },
          },
        },
      },
    }), [clamp?.max, clamp?.min, stacked, yUnit]);

  const summary = `${activeSeries.length} серии, ${resolvedLabels.length} категорий, единицы: ${yUnit}`;

  if (!activeSeries.length || !totalBars) {
    return (
      <figure
        role="group"
        aria-label={title}
        aria-description={`${desc}. Данные отсутствуют.`}
        className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500"
      >
        Данные для отображения отсутствуют.
      </figure>
    );
  }

  const handleToggle = (id: string) => {
    if (!viewToggle?.length) return;
    setInternalViewId(id);
  };

  return (
    <figure
      role="group"
      aria-label={title}
      aria-description={desc}
      className={className ?? 'rounded-lg border border-gray-200 bg-white p-4'}
    >
      {viewToggle?.length ? (
        <div role="tablist" aria-label="Переключение режимов" className="mb-4 flex flex-wrap gap-2">
          {viewToggle.map((option) => {
            const isActive = option.id === resolvedViewId;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200'
                }`}
                onClick={() => handleToggle(option.id)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className={chartHeightClass ?? 'h-72'}>
        <Bar<'bar' | 'line'>
          data={{
            ...data,
            datasets: [...data.datasets, ...targets.map((target) => buildTargetDataset(target, resolvedLabels))],
          }}
          options={options}
        />
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
};

export default BarChart;
