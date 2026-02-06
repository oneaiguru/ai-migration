import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import type { LineChartProps, SeriesPoint, TargetLine, ConfidenceBand } from './types';
import { registerCharts } from '../../utils/charts/register';
import {
  DEFAULT_LOCALE,
  formatTooltipTitle,
  formatTooltipValue,
  sanitizeDatasetLabel,
} from '../../utils/charts/format';

registerCharts();

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
  unit: string,
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
    borderCapStyle: 'round' as const,
    yAxisID: 'y',
    unit,
  };
};

const buildBandDatasets = (
  band: ConfidenceBand,
  xValues: string[],
  useTimeScale: boolean,
  unit: string,
) => {
  const color = band.color ?? '#6366f1';
  const label = sanitizeDatasetLabel(band.label ?? 'Доверительный интервал');

  const toData = (values: number[]) => (
    useTimeScale
      ? values.map((value, idx) => ({ x: xValues[idx] ?? '', y: Number(value) }))
      : values.map((value) => Number(value))
  );

  const upper = toData(band.upper);
  const lower = toData(band.lower);

  const upperDataset: any = {
    type: 'line' as const,
    label,
    data: upper,
    borderColor: color,
    backgroundColor: hexToRgba(color, 0.16),
    borderWidth: 1,
    pointRadius: 0,
    fill: false,
    tension: 0,
    yAxisID: 'y',
    unit,
  };

  const lowerDataset: any = {
    type: 'line' as const,
    label: `${label} (нижняя граница)`,
    data: lower,
    borderColor: 'transparent',
    backgroundColor: hexToRgba(color, 0.16),
    borderWidth: 0,
    pointRadius: 0,
    fill: '-1',
    tension: 0,
    yAxisID: 'y',
    unit,
    skipLegend: true,
  };

  return [upperDataset, lowerDataset];
};

const LineChart: React.FC<LineChartProps> = ({
  series = [],
  labels = [],
  yUnit = 'percent',
  clamp,
  targets: targetLines = [],
  area,
  timeScale,
  bands = [],
  secondaryAxis,
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

    const datasets: ChartData<'line'>['datasets'] = [];

    series.forEach((entry, idx) => {
      const color = entry.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
      const datasetLabel = sanitizeDatasetLabel(entry.label ?? `Серия ${idx + 1}`);
      const points = entry.points as SeriesPoint[];
      const datasetData = useTimeScale
        ? points.map((point) => ({ x: point.timestamp ?? point.label ?? '', y: Number(point.value) }))
        : (baseCategories ?? []).map((categoryLabel, pointIndex) => {
            const point = points.find((candidate) => candidate.label === categoryLabel) ?? points[pointIndex];
            return point ? Number(point.value) : null;
          });

      const suffix = entry.axis === 'secondary' ? ' · вторичная ось' : '';
      const dataset: any = {
        label: `${datasetLabel}${suffix}`,
        data: datasetData,
        borderColor: color,
        backgroundColor: (entry.area ?? area) ? hexToRgba(color, 0.18) : color,
        fill: entry.area ?? area ?? false,
        pointRadius: 3,
        pointHoverRadius: 4,
        tension: 0.3,
        yAxisID: entry.axis === 'secondary' ? 'y1' : 'y',
        unit: entry.unit ?? yUnit,
      };

      datasets.push(dataset);
    });

    targetLines.forEach((target, idx) => {
      datasets.push(buildTargetDataset(target, idx, xValues, useTimeScale, yUnit));
    });

    bands.forEach((band) => {
      buildBandDatasets(band, xValues, useTimeScale, yUnit).forEach((dataset) => datasets.push(dataset));
    });

    return {
      labels: useTimeScale ? undefined : (labels.length > 0 ? labels : xValues),
      datasets,
    };
  }, [area, bands, labels, series, targetLines, useTimeScale, xValues, yUnit]);

  const options = useMemo<ChartOptions<'line'>>(() => {
    const yScales: ChartOptions<'line'>['scales'] = {
      y: {
        min: clamp?.min,
        max: clamp?.max,
        ticks: {
          callback: (value) => formatTooltipValue(Number(value), yUnit),
        },
      },
    };

    if (secondaryAxis) {
      yScales.y1 = {
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        min: secondaryAxis.clamp?.min,
        max: secondaryAxis.clamp?.max,
        ticks: {
          callback: (value) => formatTooltipValue(Number(value), secondaryAxis.unit),
        },
        title: secondaryAxis.label ? {
          display: true,
          text: secondaryAxis.label,
        } : undefined,
      };
    }

    return {
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
        ...yScales,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            filter: (legendItem, chart) => {
              const datasets = chart?.data?.datasets ?? [];
              const dataset: any = datasets[legendItem.datasetIndex];
              return !dataset?.skipLegend;
            },
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
              const datasetUnit = (item.dataset as any)?.unit ?? yUnit;
              const label = item.dataset.label ? `${item.dataset.label}: ` : '';
              return `${label}${formatTooltipValue(parsed, datasetUnit)}`;
            },
          },
        },
      },
    };
  }, [clamp?.max, clamp?.min, secondaryAxis, timeScale, useTimeScale, yUnit]);

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

  const summaryParts = [
    `${series.length} серии`,
    `${totalPoints} точек`,
    `основная ось: ${yUnit}`,
  ];
  if (secondaryAxis) {
    summaryParts.push(`вторичная ось: ${secondaryAxis.unit}`);
  }

  const summary = summaryParts.join(', ');

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
