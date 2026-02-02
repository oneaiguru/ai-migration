import type { Meta, StoryObj } from '@storybook/react';
import { DoughnutChart } from '..';

const meta: Meta<typeof DoughnutChart> = {
  title: 'Charts/DoughnutChart',
  component: DoughnutChart,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Передавайте `ariaTitle`/`ariaDesc` и учитывайте, что легенда по умолчанию фокусируемая. Используйте контролы, чтобы переключать положение легенды и набор сегментов.',
      },
    },
  },
  argTypes: {
    legendPosition: {
      options: ['top', 'bottom'],
      control: { type: 'inline-radio' },
      description: 'Расположение легенды.',
    },
    series: {
      control: 'object',
      description: 'Набор сегментов (значения берутся из первой точки каждой серии).',
    },
  },
};

export default meta;

type Story = StoryObj<typeof DoughnutChart>;

export const Distribution: Story = {
  render: (args) => <DoughnutChart {...args} />,
  args: {
    legendPosition: 'top',
    series: [
      {
        id: 'voice',
        label: 'Голосовой канал',
        unit: 'percent',
        color: '#2563eb',
        points: [{ value: 45 }],
      },
      {
        id: 'chat',
        label: 'Чат',
        unit: 'percent',
        color: '#0ea5e9',
        points: [{ value: 30 }],
      },
      {
        id: 'email',
        label: 'Email',
        unit: 'percent',
        color: '#16a34a',
        points: [{ value: 25 }],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Демонстрация распределения по каналам. Используйте контрол `legendPosition`, чтобы проверить варианты.',
      },
    },
  },
};

export const BottomLegend: Story = {
  render: (args) => <DoughnutChart {...args} />,
  args: {
    legendPosition: 'bottom',
    series: [
      {
        id: 'resolved',
        label: 'Решено с первого обращения',
        unit: 'percent',
        color: '#16a34a',
        points: [{ value: 68 }],
      },
      {
        id: 'repeated',
        label: 'Повторные обращения',
        unit: 'percent',
        color: '#f97316',
        points: [{ value: 22 }],
      },
      {
        id: 'escalated',
        label: 'Эскалации',
        unit: 'percent',
        color: '#ef4444',
        points: [{ value: 10 }],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Вариант с легендой под диаграммой. Полезно для плотных dashboards.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: (args) => <DoughnutChart {...args} />,
  args: {
    series: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Пустое состояние для демонстрации fallback-сообщения и корректного озвучивания.',
      },
    },
  },
};
