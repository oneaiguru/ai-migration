import { MultiLineChart } from '@/components/charts/multi-line-chart';
import trendsData from '@/data/trends.json';

export const metadata = {
  title: 'Динамика развития показателей',
};

export default function ReportsTrendsPage() {
  const { months, series } = trendsData;

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">Динамика показателей</h1>

      {/* Chart */}
      <div className="border border-border p-6 bg-white">
        <h3 className="text-section-header mb-6 text-center">
          Динамика показателей по месяцам
        </h3>
        <MultiLineChart months={months} series={series} height={400} />

        {/* Legend */}
        <div className="mt-6 space-y-2">
          <p className="text-small font-semibold mb-3">Легенда:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {series.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className="w-6 h-0.5"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-small">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
