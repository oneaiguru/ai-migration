import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InfoTooltip } from './InfoTooltip';
import { useRegionAccuracy } from '../hooks/useRegionAccuracy';
import { useAccuracyQuarter } from '../hooks/useAccuracyQuarter';
import { API } from '../api/client';

export const Overview: React.FC = () => {
  const { quarter, setQuarter, availableQuarters } = useAccuracyQuarter();
  const { data, isLoading, error } = useRegionAccuracy();

  const distributionData = useMemo(
    () =>
      (data?.distribution ?? []).map((bin) => ({
        name: bin.bucket ?? '—',
        percent: (bin.percent ?? 0) * 1,
      })),
    [data],
  );

  const summaryCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: 'Средний WAPE',
        value: `${(data.overall_wape * 100).toFixed(1)}%`,
        tone: 'bg-green-50 text-green-600',
        tooltip: 'Региональный взвешенный WAPE — чем ниже, тем точнее прогноз.',
      },
      {
        label: 'Медиана по площадкам',
        value: `${(data.median_site_wape * 100).toFixed(1)}%`,
        tone: 'bg-blue-50 text-blue-600',
        tooltip: 'Медианный WAPE по площадкам в выбранном квартале.',
      },
      {
        label: 'Площадок в расчёте',
        value: data.site_count.toLocaleString('ru-RU'),
        tone: 'bg-gray-50 text-gray-600',
        tooltip: 'Количество площадок, попавших в бэктест для выбранного квартала.',
      },
    ];
  }, [data]);

  const accuracyCsvHref = `${API.base || ''}/api/accuracy/region?quarter=${encodeURIComponent(quarter)}&format=csv`;

  if (isLoading) {
    return <div className="card">Загрузка точности…</div>;
  }
  if (error) {
    const message = error instanceof Error ? error.message : 'неизвестно';
    return (
      <div className="card bg-red-50 border-red-200 text-red-700">
        Ошибка загрузки: {message}
      </div>
    );
  }
  if (!data) {
    return <div className="card text-gray-600">Нет данных о точности за выбранный квартал.</div>;
  }

  return (
    <div className="space-y-6" data-testid="screen-overview">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl font-semibold">Точность прогноза</h2>
          <p className="text-sm text-gray-600">Бэктест соотнесён с объёмами Jury. Данные по кварталам 2024 года.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600" htmlFor="accuracy-quarter-select">
            Квартал:
          </label>
          <select
            id="accuracy-quarter-select"
            data-testid="accuracy-quarter-select"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            {availableQuarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <a
            href={accuracyCsvHref}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-3 py-1.5 text-sm"
          >
            CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Региональная точность</h3>
              <p className="text-sm text-gray-500" data-testid="accuracy-quarter-label">
                {quarter} · WAPE (ниже — лучше)
              </p>
            </div>
            <InfoTooltip title="WAPE — средневзвешенная абсолютная процентная ошибка. Чем ниже, тем точнее прогноз." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className={`p-4 rounded border ${card.tone}`} title={card.tooltip}>
                <div className="text-xs uppercase tracking-wide text-gray-500">{card.label}</div>
                <div className="text-2xl font-semibold">{card.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Распределение WAPE</h3>
              <p className="text-sm text-gray-500">Доля площадок по диапазонам ошибок</p>
            </div>
            <InfoTooltip title="Buckets формируются по site_wape_distribution.csv в квартальном бэктесте." />
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Bar dataKey="percent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Как читать карту точности</h4>
            <p className="text-sm text-blue-800">
              Показатели WAPE берутся из бэктеста за выбранный квартал: {' '}
              {quarter}. Значение 17% означает, что прогноз ошибок по
              региону в среднем не превышает 17% от факта по объёму. Распределение слева показывает, какая доля площадок
              попала в &quot;зелёную&quot; зону (&le;8%), &quot;жёлтую&quot; (8-12%) и зону внимания (&gt;12%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
