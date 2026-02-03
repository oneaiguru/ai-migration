import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-display/data-table';
import { StackedBarChart } from '@/components/charts/stacked-bar-chart';
import { ScoreBadge } from '@/components/data-display/score-badge';
import managersData from '@/data/managers.json';

export const metadata = {
  title: 'Отчет по менеджерам',
};

interface Manager {
  name: string;
  callsCount: number;
  averageScore: number;
}

export default function ReportsManagersPage() {
  const { managers } = managersData;

  const totalCalls = managers.reduce((sum, m) => sum + m.callsCount, 0);
  const avgScore = Math.round(
    managers.reduce((sum, m) => sum + m.averageScore, 0) / managers.length
  );

  const columns = [
    { key: 'name', label: 'Менеджер', align: 'left' as const },
    { key: 'callsCount', label: 'Звонков', align: 'center' as const },
    {
      key: 'averageScore',
      label: 'Ср. оценка',
      align: 'center' as const,
      render: (row: Manager) => (
        <ScoreBadge percent={row.averageScore}>
          {row.averageScore}%
        </ScoreBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checklists" className="w-full">
        <TabsList>
          <TabsTrigger value="checklists">Оценка по чек-листам</TabsTrigger>
          <TabsTrigger value="dynamics">Динамика развития менеджеров</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="space-y-6 mt-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <label className="text-label">Период:</label>
            <div className="border border-border px-4 py-2 rounded bg-white">
              24/01/2025 — 31/01/2025
            </div>
          </div>

          {/* Description */}
          <div className="bg-bg-secondary p-4 rounded border border-border">
            <p className="text-body mb-3">
              Отчет предоставляет обзор по эффективности менеджеров за выбранный
              период времени.
            </p>
            <p className="text-body mb-2">Из отчета можно понять:</p>
            <ol className="list-decimal list-inside text-body space-y-1 ml-2">
              <li>Количество звонков каждого менеджера и их эффективность</li>
              <li>
                Доля звонков с положительными/хорошими звонками по каждому
                менеджеру
              </li>
              <li>
                Уровень соответствия отдельным критериям качества в каждом
                звонке
              </li>
            </ol>
          </div>

          {/* Table */}
          <div>
            <DataTable columns={columns} data={managers} />
            <div className="mt-2 flex justify-between text-body font-semibold px-4">
              <span>SUM</span>
              <span>{totalCalls}</span>
              <span>AVERAGE {avgScore}%</span>
            </div>
          </div>

          {/* Stacked Chart */}
          <div className="border border-border p-6 bg-white">
            <h3 className="text-section-header mb-4 text-center">
              Оценка звонков по менеджерам
            </h3>
            <StackedBarChart managers={managers} />
            <div className="flex gap-6 justify-center mt-4 text-small">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-score-good rounded-sm" />
                <span>Хорошо</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-score-acceptable rounded-sm" />
                <span>Удовлетворительно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-score-poor rounded-sm" />
                <span>Неудовлетворительно</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dynamics">
          <p className="text-body text-info">Динамика развития менеджеров...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
