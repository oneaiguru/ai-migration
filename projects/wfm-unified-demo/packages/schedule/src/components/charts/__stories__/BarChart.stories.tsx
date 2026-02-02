import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from '..';
import type { BarChartProps } from '../types';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    stacked: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof BarChart>;

const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

const coverageSeries: BarChartProps['series'] = [
  {
    id: 'coverage',
    label: 'Покрытие',
    unit: 'percent',
    color: '#2563eb',
    points: labels.map((label, idx) => ({ label, value: 78 + idx * 2 })),
  },
  {
    id: 'adherence',
    label: 'Соблюдение',
    unit: 'percent',
    color: '#16a34a',
    points: labels.map((label, idx) => ({ label, value: 80 + idx })),
  },
];

const deviationSeries: BarChartProps['series'] = [
  {
    id: 'deviations',
    label: 'Отклонения',
    unit: 'people',
    color: '#2563eb',
    points: labels.map((label, idx) => ({
      label,
      value: idx % 2 === 0 ? 5 : -4,
      metadata: { color: idx % 2 === 0 ? '#059669' : '#dc2626', viewId: 'deviations' },
    })),
  },
];

export const Baseline: Story = {
  args: {
    labels,
    series: coverageSeries,
    clamp: { min: 70, max: 100 },
    ariaTitle: 'Покрытие и соблюдение',
    ariaDesc: 'Сравнение дневных показателей покрытия и соблюдения',
  },
};

export const WithToggle: Story = {
  args: {
    labels,
    viewToggle: [
      { id: 'coverage', label: 'Покрытие/Соблюдение' },
      { id: 'deviations', label: 'Отклонения' },
    ],
    series: [
      ...coverageSeries.map((entry) => ({
        ...entry,
        points: entry.points.map((point) => ({ ...point, metadata: { ...(point.metadata ?? {}), viewId: 'coverage' } })),
      })),
      ...deviationSeries,
    ],
    clamp: { min: 60, max: 100 },
    ariaTitle: 'Покрытие/Отклонения',
    ariaDesc: 'Переключение между показателями покрытия и отклонений',
  },
};

export const Empty: Story = {
  args: {
    labels,
    series: [],
  },
};
