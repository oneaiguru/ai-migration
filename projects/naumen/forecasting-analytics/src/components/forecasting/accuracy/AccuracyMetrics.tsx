// AccuracyMetrics.tsx - Individual Metric Cards Component

import React, { useMemo } from 'react';
import { Target } from 'lucide-react';
import { AccuracyMetrics as AccuracyMetricsType } from '../../../types/accuracy';
import { KpiCardGrid } from '../../charts';
import { buildAccuracyKpiItems } from '../../../adapters/forecasting';

interface AccuracyMetricsProps {
  metrics: AccuracyMetricsType;
  previousMetrics?: AccuracyMetricsType;
  showTrends?: boolean;
  className?: string;
}

const AccuracyMetrics: React.FC<AccuracyMetricsProps> = ({
  metrics,
  previousMetrics,
  showTrends = true,
  className = ''
}) => {
  const trendComparison = useMemo(() => {
    if (!showTrends || !previousMetrics) return metrics;
    return previousMetrics;
  }, [metrics, previousMetrics, showTrends]);

  const items = useMemo(
    () => buildAccuracyKpiItems(metrics, trendComparison),
    [metrics, trendComparison],
  );

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Точность прогноза</h2>
        <p className="text-sm text-gray-500">
          Сводка ключевых метрик точности. Значения формируются на основе последних фактических данных и обновляются вместе с дашбордом.
        </p>
      </div>

      <KpiCardGrid
        items={items}
        ariaTitle="Карточки точности прогноза"
        ariaDesc="Ключевые метрики оценки прогноза — MAPE, MAE, RMSE, смещение и коэффициент детерминации"
      />

      <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Target className="h-4 w-4" /> Целевые значения
          </dt>
          <dd className="mt-2 text-sm text-gray-700">
            MAPE ≤ 15%, MAE ≤ 20, RMSE ≤ 25. Значения выше подсвечиваются как зоны риска.
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Объём выборки</dt>
          <dd className="mt-2 text-2xl font-bold text-gray-900">{metrics.sampleSize ?? '—'}</dd>
          <dd className="mt-1 text-xs text-gray-500">Количество точек прогноза, задействованных при расчётах.</dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">P-value</dt>
          <dd className="mt-2 text-2xl font-bold text-gray-900">
            {metrics.pValue != null ? metrics.pValue.toFixed(3) : '—'}
          </dd>
          <dd className="mt-1 text-xs text-gray-500">Статистическая значимость текущей модели.</dd>
        </div>
      </dl>
    </section>
  );
};

export default AccuracyMetrics;
