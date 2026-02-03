import { DataTable } from '@/components/data-display/data-table';
import statsDaysData from '@/data/stats-days.json';

export const metadata = {
  title: 'Статистика по распределению обработки звонков по дням',
};

interface Day {
  date: string;
  processed: number;
  received: number;
  errors: number;
  callsProcessed: number;
  callsProcessedErrors: number;
  minutesTotal: number;
}

export default function StatsDaysPage() {
  const { period, days } = statsDaysData;

  const columns = [
    {
      key: 'date',
      label: 'Дата',
      align: 'left' as const,
    },
    {
      key: 'processed',
      label: 'Звонков обработано / принято [ошибок]',
      align: 'right' as const,
      monospace: true,
      render: (row: Day) =>
        `${row.processed} / ${row.received} [${row.errors}]`,
    },
    {
      key: 'callsProcessed',
      label: 'Кол-во звонков обработанных за день [ошибок]',
      align: 'right' as const,
      monospace: true,
      render: (row: Day) =>
        row.callsProcessedErrors !== 0
          ? `${row.callsProcessed} [${row.callsProcessedErrors}]`
          : `${row.callsProcessed}`,
    },
    {
      key: 'minutesTotal',
      label: 'Кол-во минут, обработанных за день',
      align: 'right' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">
        Статистика по распределению обработки звонков по дням
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата звонка с:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            20.01.2025
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата звонка по:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            31.01.2025
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Воркспейс:</label>
          <div className="border border-border px-3 py-2 rounded bg-white w-64">
            {period.workspace}
          </div>
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded font-button hover:bg-primary-hover">
          ПРИМЕНИТЬ
        </button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={days} />
    </div>
  );
}
