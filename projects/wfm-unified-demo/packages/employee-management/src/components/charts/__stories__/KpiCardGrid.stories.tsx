import type { Meta, StoryObj } from '@storybook/react';
import { KpiCardGrid } from '..';

const meta: Meta<typeof KpiCardGrid> = {
  title: 'Charts/KpiCardGrid',
  component: KpiCardGrid,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Карточки KPI отображают основные показатели. Следите за контрастом значений и не забывайте указывать `ariaTitle`/`ariaDesc` при встраивании.',
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Список карточек и их трендов.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof KpiCardGrid>;

export const Default: Story = {
  render: (args) => <KpiCardGrid {...args} />,
  args: {
    items: [
      { label: 'Удовлетворённость', value: '4.6', trend: 'up', variant: 'success' },
      { label: 'SLA, %', value: '89%', trend: 'down', variant: 'warning' },
      { label: 'Среднее время обработки', value: '7.5 мин', trend: 'stable', variant: 'primary' },
      { label: 'Пропущенные звонки', value: '12', trend: 'down', variant: 'danger' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Базовый набор карточек с цветовой кодировкой по статусу.',
      },
    },
  },
};

export const Neutral: Story = {
  render: (args) => <KpiCardGrid {...args} />,
  args: {
    items: [
      { label: 'Всего сотрудников', value: '218', trend: 'up' },
      { label: 'Новые сотрудники', value: '12', trend: 'up' },
      { label: 'Текучесть', value: '4%', trend: 'stable' },
      { label: 'Обучение', value: '36', trend: 'down' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Нейтральная палитра показывает внешний вид без тематических вариантов.',
      },
    },
  },
};
