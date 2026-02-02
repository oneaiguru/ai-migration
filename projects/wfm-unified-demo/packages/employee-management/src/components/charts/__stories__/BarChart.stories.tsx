import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from '..';
import type { BarChartProps } from '../types';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Столбчатая диаграмма поддерживает переключатели видов (день/сводно) и целевые линии. Не забывайте передавать `ariaTitle`/`ariaDesc` и подписывать кнопки переключения.',
      },
    },
  },
  argTypes: {
    activeViewId: {
      options: ['daily', 'overall', undefined],
      control: { type: 'inline-radio' },
      description: 'Какой таб активен (передаётся напрямую в компонент).',
    },
    stacked: {
      control: 'boolean',
      description: 'Включить режим накопления по оси Y.',
    },
    clamp: {
      control: 'object',
      description: 'Границы оси Y.',
    },
    targets: {
      control: 'object',
      description: 'Целевые линии поверх столбиков.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BarChart>;

const dailySeries: BarChartProps['series'] = [
  {
    id: 'daily-coverage',
    label: 'Покрытие',
    unit: 'percent',
    color: '#2563eb',
    points: [
      { label: 'Пн', value: 78, metadata: { viewId: 'daily' } },
      { label: 'Вт', value: 79, metadata: { viewId: 'daily' } },
      { label: 'Ср', value: 81, metadata: { viewId: 'daily' } },
      { label: 'Чт', value: 82, metadata: { viewId: 'daily' } },
      { label: 'Пт', value: 84, metadata: { viewId: 'daily' } },
    ],
  },
  {
    id: 'daily-adherence',
    label: 'Соблюдение',
    unit: 'percent',
    color: '#16a34a',
    points: [
      { label: 'Пн', value: 85, metadata: { viewId: 'daily' } },
      { label: 'Вт', value: 84, metadata: { viewId: 'daily' } },
      { label: 'Ср', value: 86, metadata: { viewId: 'daily' } },
      { label: 'Чт', value: 87, metadata: { viewId: 'daily' } },
      { label: 'Пт', value: 88, metadata: { viewId: 'daily' } },
    ],
  },
  {
    id: 'overall-coverage',
    label: 'Покрытие (общий)',
    unit: 'percent',
    color: '#1d4ed8',
    points: [{ label: 'Неделя', value: 83, metadata: { viewId: 'overall' } }],
  },
  {
    id: 'overall-adherence',
    label: 'Соблюдение (общий)',
    unit: 'percent',
    color: '#15803d',
    points: [{ label: 'Неделя', value: 86, metadata: { viewId: 'overall' } }],
  },
];

export const DailyView: Story = {
  render: (args) => <BarChart {...args} />,
  args: {
    series: dailySeries,
    viewToggle: [
      { id: 'daily', label: 'По дням' },
      { id: 'overall', label: 'Сводно' },
    ],
    stacked: false,
    yUnit: 'percent',
    activeViewId: 'daily',
    clamp: { min: 60, max: 100 },
  },
  parameters: {
    docs: {
      description: {
        story: 'Используйте контрол `activeViewId`, чтобы показать, как диаграмма перестраивается между ежедневным и сводным отчётом.',
      },
    },
  },
};

export const StackedWithTarget: Story = {
  render: (args) => <BarChart {...args} />,
  args: {
    series: [
      {
        id: 'planned',
        label: 'План',
        unit: 'hours',
        color: '#0ea5e9',
        points: [
          { label: 'Команда А', value: 420 },
          { label: 'Команда Б', value: 360 },
          { label: 'Команда В', value: 390 },
        ],
      },
      {
        id: 'actual',
        label: 'Факт',
        unit: 'hours',
        color: '#1d4ed8',
        points: [
          { label: 'Команда А', value: 410 },
          { label: 'Команда Б', value: 372 },
          { label: 'Команда В', value: 384 },
        ],
      },
    ],
    stacked: true,
    categories: ['Команда А', 'Команда Б', 'Команда В'],
    yUnit: 'hours',
    targets: [{ label: 'Цель по часовому фонду', value: 400, style: 'dashed', color: '#475569' }],
    clamp: { min: 0, max: 500 },
  },
  parameters: {
    docs: {
      description: {
        story: 'Пример накопительной диаграммы с сравнениями "План"/"Факт" и целевой линией.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: (args) => <BarChart {...args} />,
  args: {
    series: [],
    categories: ['Пн', 'Вт', 'Ср'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Пустое состояние подтверждает, что компонент корректно сообщает об отсутствии данных.',
      },
    },
  },
};
