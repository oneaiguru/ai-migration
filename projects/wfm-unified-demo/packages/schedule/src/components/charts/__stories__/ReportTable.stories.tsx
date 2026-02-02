import type { Meta, StoryObj } from '@storybook/react';
import { ReportTable } from '..';

const meta: Meta<typeof ReportTable> = {
  title: 'Charts/ReportTable',
  component: ReportTable,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof ReportTable>;

const columns = [
  { id: 'date', label: 'Дата', width: 120 },
  { id: 'shift', label: 'Смена', width: 140 },
  { id: 'planned', label: 'План', width: 120 },
  { id: 'actual', label: 'Факт', width: 120 },
];

const rows = [
  { date: '01.07.2025', shift: 'Дневная', planned: 120, actual: 118 },
  { date: '02.07.2025', shift: 'Дневная', planned: 122, actual: 121 },
  { date: '03.07.2025', shift: 'Вечерняя', planned: 110, actual: 112 },
];

export const Baseline: Story = {
  args: {
    columns,
    rows,
    ariaTitle: 'Журнал смен',
    ariaDesc: 'Сравнение плановых и фактических значений по сменам',
  },
};

export const Empty: Story = {
  args: {
    columns,
    rows: [],
  },
};
