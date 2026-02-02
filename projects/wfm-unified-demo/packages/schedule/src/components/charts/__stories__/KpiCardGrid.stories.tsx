import type { Meta, StoryObj } from '@storybook/react';
import { KpiCardGrid } from '..';

const meta: Meta<typeof KpiCardGrid> = {
  title: 'Charts/KpiCardGrid',
  component: KpiCardGrid,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof KpiCardGrid>;

export const Baseline: Story = {
  args: {
    items: [
      { label: 'Покрытие смен', value: '87%', trend: 'up', variant: 'success' },
      { label: 'Соблюдение графика', value: '82%', trend: 'stable', variant: 'primary' },
      { label: 'Уровень сервиса', value: '94%', trend: 'up', variant: 'success' },
      { label: 'Среднее время', value: '7,8 ч', trend: 'down', variant: 'warning' },
    ],
    ariaTitle: 'KPI показателей',
    ariaDesc: 'Карточки ключевых показателей сменного планирования',
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};
