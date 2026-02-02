import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import type { LineChartProps, SeriesPoint, TargetLine } from './types';
import {
  DEFAULT_LOCALE,
  formatTooltipTitle,
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

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace('#', '');
  const bigint = Number.parseInt(normalized.length === 3 ? normalized.repeat(2) : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const collectXValues = (series: LineChartProps['series'], labels: string[]): string[] => {
  if (labels.length > 0) {
    return labels;
  }

  const set = new Set<string>();
  series?.forEach((entry) => {
    entry.points.forEach((point) => {
      if (point.timestamp) {
        set.add(point.timestamp);
      } else if (point.label) {
        set.add(point.label);
      }
    });
  });

  return Array.from(set);
};

const buildTargetDataset = (
  target: TargetLine,
  index: number,
  xValues: string[],
  useTimeScale: boolean,
) => {
  const label = sanitizeDatasetLabel(target.label ?? `Цель ${index + 1}`);
  const baseColor = target.color ?? '#475569';
  const values = target.series ?? xValues.map(() => target.value ?? null);
  const data = xValues.map((x, idx) => {
    const pointValue = values?.[idx] ?? target.value;
    if (pointValue == null) {
      return useTimeScale ? { x, y: Number.NaN } : Number.NaN;
    }
    const numeric = Number(pointValue);
    const value = Number.isFinite(numeric) ? numeric : Number.NaN;
    return useTimeScale ? { x, y: value } : value;
  });

  return {
    type: 'line' as const,
    label,
    data: data as unknown[],
    borderColor: baseColor,
    borderWidth: 2,
    borderDash: target.style === 'solid' ? undefined : [6, 6],
    pointRadius: 0,
    fill: false,
    tension: 0,
  };
};

const LineChart: React.FC<LineChartProps> = ({
  series = [],
  labels = [],
  yUnit = 'percent',
  clamp,
  targets = [],
  area,
  timeScale,
  ariaTitle,
  ariaDesc,
}) => {
  const title = ariaTitle ?? 'Линейный график';
  const desc = ariaDesc ?? 'График показателей во времени';

  const useTimeScale = Boolean(timeScale ?? series.some((entry) => entry.points.some((p) => p.timestamp)));

  const xValues = collectXValues(series, labels);
  const totalPoints = series.reduce((acc, entry) => acc + entry.points.length, 0);

  const data = useMemo<ChartData<'line'>>(() => {
    const baseCategories = !useTimeScale ? (labels.length ? labels : xValues) : undefined;

    const datasets = series.map((entry, idx) => {
      const color = entry.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
      const datasetLabel = sanitizeDatasetLabel(entry.label ?? `Серия ${idx + 1}`);
      const points = entry.points as SeriesPoint[];
      const datasetData = useTimeScale
        ? points.map((point) => ({ x: point.timestamp ?? point.label ?? '', y: Number(point.value) }))
        : (baseCategories ?? []).map((categoryLabel, pointIndex) => {
            const point = points.find((candidate) => candidate.label === categoryLabel) ?? points[pointIndex];
            return point ? Number(point.value) : null;
          });

      return {
        label: datasetLabel,
        data: datasetData,
        borderColor: color,
        backgroundColor: (entry.area ?? area) ? hexToRgba(color, 0.18) : color,
        fill: entry.area ?? area ?? false,
        pointRadius: 3,
        pointHoverRadius: 4,
        tension: 0.3,
      };
    });

    const targetDatasets = targets.map((target, idx) =>
      buildTargetDataset(target, idx, xValues, useTimeScale),
    );

    return {
      labels: useTimeScale ? undefined : (labels.length > 0 ? labels : xValues),
      datasets: [...datasets, ...targetDatasets],
    };
  }, [area, labels, series, targets, useTimeScale, xValues]);

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: useTimeScale
          ? {
              type: 'time',
              time: {
                unit: timeScale ?? 'day',
              },
              ticks: {
                maxRotation: 0,
              },
            }
          : {
              type: 'category',
            },
        y: {
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
            title: (items) => {
              if (!items.length) return '';
              const primary = items[0];
              if (useTimeScale) {
                return formatTooltipTitle(primary.parsed.x ?? primary.label, DEFAULT_LOCALE, {
                  day: 'numeric',
                  month: 'short',
                });
              }
              return String(primary.label ?? '');
            },
            label: (item: TooltipItem<'line'>) => {
              const parsed = item.parsed.y;
              const label = item.dataset.label ? `${item.dataset.label}: ` : '';
              return `${label}${formatTooltipValue(parsed, yUnit)}`;
            },
          },
        },
      },
    }), [clamp?.max, clamp?.min, timeScale, useTimeScale, yUnit]);

  if (!series.length || !totalPoints) {
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

  const summary = `${series.length} серии, ${totalPoints} точек, единицы: ${yUnit}`;

  return (
    <figure
      role="group"
      aria-label={title}
      aria-description={desc}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
};

export default LineChart;
