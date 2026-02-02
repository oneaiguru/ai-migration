import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from '..';
import type { LineChartProps } from '../types';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    timeScale: {
      options: ['day', 'week', 'month'],
      control: { type: 'inline-radio' },
    },
    clamp: { control: 'object' },
    targets: { control: 'object' },
    errorMessage: { control: 'text' },
  },
  args: {
    ariaTitle: 'Динамика показателей',
    ariaDesc: 'График на основе данных CH5',
    timeScale: 'day',
    clamp: { min: 70, max: 100 },
  },
};

export default meta;

type Story = StoryObj<typeof LineChart>;

const baseSeries: LineChartProps['series'] = [
  {
    id: 'coverage',
    label: 'Покрытие смен',
    unit: 'percent',
    color: '#2563eb',
    points: [
      { timestamp: '2025-07-01', value: 82 },
      { timestamp: '2025-07-02', value: 83 },
      { timestamp: '2025-07-03', value: 84 },
      { timestamp: '2025-07-04', value: 86 },
      { timestamp: '2025-07-05', value: 87 },
      { timestamp: '2025-07-06', value: 88 },
      { timestamp: '2025-07-07', value: 89 },
    ],
  },
  {
    id: 'adherence',
    label: 'Соблюдение графика',
    unit: 'percent',
    color: '#16a34a',
    points: [
      { timestamp: '2025-07-01', value: 78 },
      { timestamp: '2025-07-02', value: 79 },
      { timestamp: '2025-07-03', value: 80 },
      { timestamp: '2025-07-04', value: 82 },
      { timestamp: '2025-07-05', value: 83 },
      { timestamp: '2025-07-06', value: 84 },
      { timestamp: '2025-07-07', value: 85 },
    ],
  },
];

export const Baseline: Story = {
  render: (args) => <LineChart {...args} />,
  args: {
    series: baseSeries,
  },
};

export const WithTarget: Story = {
  render: (args) => <LineChart {...args} />,
  args: {
    series: baseSeries,
    targets: [{ label: 'Цель 90%', value: 90, style: 'dashed' }],
  },
};

export const Empty: Story = {
  render: (args) => <LineChart {...args} />,
  args: {
    series: [],
  },
};

export const ErrorState: Story = {
  render: (args) => <LineChart {...args} />,
  args: {
    series: baseSeries,
    errorMessage: 'Не удалось загрузить данные графика',
  },
};
