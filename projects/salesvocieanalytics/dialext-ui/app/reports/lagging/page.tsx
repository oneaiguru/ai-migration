import { BarChart } from '@/components/charts/bar-chart';
import { DataTable } from '@/components/data-display/data-table';
import { ScoreBadge } from '@/components/data-display/score-badge';
import laggingData from '@/data/lagging-indicators.json';
import managersData from '@/data/managers.json';

export const metadata = {
  title: 'Западающие показатели',
};

interface Manager {
  name: string;
  callsCount: number;
  averageScore: number;
}

export default function ReportsLaggingPage() {
  const { checklist, metrics } = laggingData;
  const { managers } = managersData;

  const managerColumns = [
    { key: 'name', label: 'Менеджер', align: 'left' as const },
    { key: 'callsCount', label: 'Звон...', align: 'center' as const },
    {
      key: 'averageScore',
      label: 'Средняя оценка',
      align: 'center' as const,
      render: (row: Manager) => (
        <ScoreBadge percent={row.averageScore}>
          {row.averageScore}%
        </ScoreBadge>
      ),
    },
  ];

  const totalCalls = managers.reduce((sum, m) => sum + m.callsCount, 0);
  const avgScore = (
    managers.reduce((sum, m) => sum + m.averageScore, 0) / managers.length
  ).toFixed(3);

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">Западающие показатели</h1>

      {/* Managers Table */}
      <div>
        <DataTable columns={managerColumns} data={managers} />
        <div className="mt-2 flex justify-between text-body font-semibold px-4">
          <span>SUM</span>
          <span>{totalCalls}</span>
          <span>AVERAGE {avgScore}%</span>
        </div>
      </div>

      {/* Checklist Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-label">Чек-лист:</label>
        <div className="border border-border px-4 py-2 rounded bg-white w-64">
          {checklist} ▼
        </div>
      </div>

      {/* Bar Chart */}
      <div className="border border-border p-6 bg-white">
        <h3 className="text-section-header mb-6">
          Показатели за весь выбранный период
        </h3>
        <BarChart metrics={metrics} />
      </div>
    </div>
  );
}
