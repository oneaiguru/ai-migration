import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSiteForecast } from '../hooks/useSiteForecast';

export function SiteForecast({ siteId, window, days = 7 }: { siteId: string; window?: string; days?: number }) {
  const { rows, loading, error } = useSiteForecast(siteId, window, days);
  const series = React.useMemo(() => rows.map((r) => ({
    date: r.date,
    y: typeof r.pred_mass_kg === 'number' ? r.pred_mass_kg : (typeof r.fill_pct === 'number' ? Math.round((r.fill_pct || 0) * 1000) / 10 : null),
  })).filter((p) => p.y !== null), [rows]);

  return (
    <section role="region" aria-label="Прогноз по площадке">
      {loading && <div aria-live="polite">Загрузка…</div>}
      {error && !loading && <div role="status" aria-live="polite">Ошибка: {error}</div>}
      {!loading && !error && series.length === 0 && <div>Нет данных</div>}
      {!loading && !error && series.length > 0 && (
        <div style={{ width: '100%', height: 260 }} data-testid="site-forecast-chart">
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={0} height={30} />
              <YAxis tick={{ fontSize: 12 }} width={50} />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

