import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import type { DoughnutChartProps } from './types';
import {
  formatPercent,
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
  '#22d3ee',
];

const DoughnutChart: React.FC<DoughnutChartProps> = ({
  labels = [],
  series = [],
  legendPosition = 'bottom',
  ariaTitle,
  ariaDesc,
}) => {
  const title = ariaTitle ?? 'Кольцевая диаграмма';
  const desc = ariaDesc ?? 'Распределение показателей по категориям';

  const segments = series.length ? series : [];

  const chartData = useMemo<ChartData<'doughnut'>>(() => {
    const resolvedLabels = labels.length ? labels : segments.map((entry, idx) => sanitizeDatasetLabel(entry.label ?? `Категория ${idx + 1}`));
    const values = segments.map((entry) => entry.points[0]?.value ?? 0);
    const colors = segments.map((entry, idx) => entry.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length]);

    return {
      labels: resolvedLabels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }, [labels, segments]);

  const total = chartData.datasets[0]?.data.reduce((acc, value) => acc + (Number(value) || 0), 0) ?? 0;

  const options = useMemo<ChartOptions<'doughnut'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: legendPosition,
          labels: {
            usePointStyle: true,
            padding: 12,
          },
        },
        tooltip: {
          callbacks: {
            label: (item: TooltipItem<'doughnut'>) => {
              const label = item.label ? `${item.label}: ` : '';
              const value = item.parsed;
              const percent = total ? (Number(value) / total) * 100 : 0;
              return `${label}${formatPercent(percent, 1)}`;
            },
          },
        },
      },
    }), [legendPosition, total]);

  if (!segments.length || !chartData.datasets[0]?.data.some((value) => Number(value) > 0)) {
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

  const summary = `${chartData.labels?.length ?? 0} категорий, суммарное значение ${total}`;

  return (
    <figure
      role="group"
      aria-label={title}
      aria-description={desc}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <div className="mx-auto h-72 max-w-sm">
        <Doughnut data={chartData} options={options} />
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
};

export default DoughnutChart;
