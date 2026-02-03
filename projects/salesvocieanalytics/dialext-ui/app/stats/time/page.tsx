import { LineChart } from '@/components/charts/line-chart';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import statsTimeData from '@/data/stats-time.json';

export const metadata = {
  title: 'Статистика по распределению обработки звонков по времени',
};

export default function StatsTimePage() {
  const { period, hourly, peak, minimum } = statsTimeData;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Статистика', href: '/stats/time' },
          { label: 'По времени' },
        ]}
      />

      <h1 className="text-page-title">
        Статистика по распределению обработки звонков по времени
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Воркспейс:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            {period.workspace} ▼
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата от:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            дд.мм.гггг
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label text-info">Дата до:</label>
          <div className="border border-border px-3 py-2 rounded bg-white">
            дд.мм.гггг
          </div>
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded font-button hover:bg-primary-hover">
          ПРИМЕНИТЬ
        </button>
      </div>

      {/* Chart */}
      <div className="border border-border p-6 bg-white">
        <h2 className="text-section-header text-center mb-4">
          Количество звонков по времени
        </h2>
        <LineChart data={hourly} height={300} />
        <div className="mt-4 text-small text-info space-y-1">
          <p>{peak.label}</p>
          <p>{minimum.label}</p>
        </div>
      </div>
    </div>
  );
}
