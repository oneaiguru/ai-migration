import type { Meta, StoryObj } from '@storybook/react';
import { ReportTable } from '..';

const meta: Meta<typeof ReportTable> = {
  title: 'Charts/ReportTable',
  component: ReportTable,
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Таблица отчётов использует стики-заголовок и ожидает текстовые значения. Для скринридеров задавайте `ariaTitle`/`ariaDesc` и при необходимости дублируйте итоги в `figcaption`.',
      },
    },
  },
  argTypes: {
    rows: {
      control: 'object',
      description: 'Данные таблицы (только строки, без виртуализации).',
    },
    columns: {
      control: 'object',
      description: 'Массив колонок с заголовками и шириной.',
    },
    export: {
      control: 'object',
      description: 'Указывает, какие форматы экспорта доступны.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ReportTable>;

const columns = [
  { id: 'employee', label: 'Сотрудник', width: '180px' },
  { id: 'team', label: 'Команда', width: '140px' },
  { id: 'hours', label: 'Часы', width: '120px' },
  { id: 'overtime', label: 'Сверхурочные', width: '140px' },
];

const rows = [
  { employee: 'Иван Петров', team: 'Поддержка', hours: '160', overtime: '8' },
  { employee: 'Анна Смирнова', team: 'Продажи', hours: '152', overtime: '4' },
  { employee: 'Мария Иванова', team: 'Поддержка', hours: '168', overtime: '10' },
  { employee: 'Павел Сидоров', team: 'Качество', hours: '154', overtime: '6' },
  { employee: 'Елена Орлова', team: 'Обучение', hours: '158', overtime: '2' },
  { employee: 'Владислав Никифоров', team: 'Продажи', hours: '162', overtime: '5' },
];

export const Baseline: Story = {
  render: (args) => <ReportTable {...args} />,
  args: {
    columns,
    rows,
    export: { pdf: true, xlsx: true, csv: true },
  },
  parameters: {
    docs: {
      description: {
        story: 'Базовая таблица с включёнными опциями экспорта.',
      },
    },
  },
};

export const EmptyState: Story = {
  render: (args) => <ReportTable {...args} />,
  args: {
    columns,
    rows: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Показывает fallback-сообщение при отсутствии данных.',
      },
    },
  },
};
