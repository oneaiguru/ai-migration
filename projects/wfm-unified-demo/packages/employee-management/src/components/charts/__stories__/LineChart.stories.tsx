import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from '..';
import type { LineChartProps } from '../types';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Используйте `ariaTitle` и `ariaDesc`, чтобы описать график для скринридеров. При необходимости добавляйте `targets` и `clamp`, чтобы подчеркнуть референсные значения.',
      },
    },
  },
  argTypes: {
    timeScale: {
      options: ['day', 'week', 'month'],
      control: { type: 'inline-radio' },
      description: 'Единица времени для оси X',
    },
    clamp: {
      control: 'object',
      description: 'Границы оси Y (min/max)',
    },
    targets: {
      control: 'object',
      description: 'Целевые линии (показатели плана)',
    },
    area: {
      control: 'boolean',
      description: 'Включить заливку под линией',
    },
  },
};

export default meta;

type Story = StoryObj<typeof LineChart>;

const baseSeries: LineChartProps['series'] = [
  {
    id: 'adherence',
    label: 'Соблюдение графика',
    unit: 'percent',
    color: '#2563eb',
    area: true,
    points: [
      { timestamp: '2025-10-01', value: 82.5 },
      { timestamp: '2025-10-02', value: 84.1 },
      { timestamp: '2025-10-03', value: 83.3 },
      { timestamp: '2025-10-04', value: 85.2 },
      { timestamp: '2025-10-05', value: 86.7 },
      { timestamp: '2025-10-06', value: 87.3 },
      { timestamp: '2025-10-07', value: 88.9 },
    ],
  },
  {
    id: 'coverage',
    label: 'Покрытие смен',
    unit: 'percent',
    color: '#16a34a',
    points: [
      { timestamp: '2025-10-01', value: 78.1 },
      { timestamp: '2025-10-02', value: 79.5 },
      { timestamp: '2025-10-03', value: 80.2 },
      { timestamp: '2025-10-04', value: 81.6 },
      { timestamp: '2025-10-05', value: 82.9 },
      { timestamp: '2025-10-06', value: 84.4 },
      { timestamp: '2025-10-07', value: 85.1 },
    ],
  },
];

export const Baseline: Story = {
  render: (args) => <LineChart {...args} />,
  args: {
    series: baseSeries,
    timeScale: 'day',
    yUnit: 'percent',
    ariaTitle: 'Динамика показателей',
    clamp: { min: 70, max: 95 },
  },
  parameters: {
    docs: {
      description: {
        story: 'Базовый сценарий с двумя сериями и заливкой для показателя соблюдения графика. Используйте управляющие элементы справа, чтобы изменить шкалу времени или границы.',
      },
    },
  },
};

export const WithTargets: Story = {
  render: (args) => <LineChart {...args} />,
  args: {
    series: baseSeries,
    timeScale: 'day',
    yUnit: 'percent',
    targets: [
      { label: 'Цель 85%', value: 85, style: 'dashed', color: '#475569' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Пример с целевой линией. Проверьте, что dashed-стиль считывается как подсказка о плане.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: (args) => <LineChart {...args} />,
  args: {
    series: [],
    yUnit: 'percent',
  },
  parameters: {
    docs: {
      description: {
        story: 'График показывает пустое состояние, чтобы подтвердить корректность озвучивания скринридером.',
      },
    },
  },
};
