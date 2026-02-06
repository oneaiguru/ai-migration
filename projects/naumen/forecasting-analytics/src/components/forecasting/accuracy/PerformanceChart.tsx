// PerformanceChart.tsx - Historical Accuracy Trends Chart

import React, { useMemo } from 'react';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { HistoricalAccuracy, AlgorithmType } from '../../../types/accuracy';
import { LineChart } from '../../charts';
import { buildAccuracyTrendSeries } from '../../../adapters/forecasting';

interface PerformanceChartProps {
  data: HistoricalAccuracy[];
  selectedMetric: 'mape' | 'mae' | 'rmse' | 'bias';
  timeRange: '7d' | '30d' | '90d' | '6m';
  algorithms?: AlgorithmType[];
  showConfidenceBands?: boolean;
  height?: number;
  className?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  selectedMetric,
  timeRange,
  algorithms = [],
  showConfidenceBands = false,
  height = 400,
  className = ''
}) => {
  const algorithmLabels = useMemo<Record<AlgorithmType, string>>(() => ({
    arima: 'ARIMA',
    basic_extrapolation: 'Базовая экстраполяция',
    linear_regression: 'Линейная регрессия',
    seasonal_naive: 'Сезонная наивная',
    exponential_smoothing: 'Экспоненциальное сглаживание',
  }), []);

  const { series, yUnit } = useMemo(
    () => buildAccuracyTrendSeries({
      history: data,
      selectedMetric,
      algorithms,
      algorithmLabels,
      includeArea: showConfidenceBands,
    }),
    [algorithmLabels, algorithms, data, selectedMetric, showConfidenceBands],
  );

  const trend = useMemo(() => {
    const primary = series[0];
    const values = primary?.points.map((point) => point.value).filter((value) => Number.isFinite(value)) ?? [];
    if (values.length < 2) return null;

    const recentAvg = values.slice(-3).reduce((sum, value) => sum + value, 0) / Math.min(3, values.length);
    const earlierAvg = values.slice(0, 3).reduce((sum, value) => sum + value, 0) / Math.min(3, values.length);
    const delta = earlierAvg === 0 ? 0 : ((recentAvg - earlierAvg) / earlierAvg) * 100;

    return {
      direction: delta > 5 ? 'up' : delta < -5 ? 'down' : 'stable',
      percentage: Math.abs(delta),
    };
  }, [series]);

  const hasData = series.some((entry) => entry.points.length > 0);

  const getTimeRangeLabel = (range: string): string => {
    const labels: Record<string, string> = {
      '7d': '7 дней',
      '30d': '30 дней',
      '90d': '90 дней',
      '6m': '6 месяцев',
    };
    return labels[range] ?? range;
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">История точности</h3>
          <p className="text-sm text-gray-500">Динамика выбранной метрики по алгоритмам за {getTimeRangeLabel(timeRange)}.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{getTimeRangeLabel(timeRange)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>{series.length} алгоритма</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6" style={{ height }}>
        {hasData ? (
          <LineChart
            series={series}
            yUnit={yUnit}
            timeScale="day"
            area
            ariaTitle="Историческая точность прогнозов"
            ariaDesc="Линейный график с показателями точности по каждому алгоритму"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
            Нет данных для построения графика за выбранный период.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-gray-100 bg-gray-50 px-6 py-4 md:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Динамика</div>
            <div className="text-sm text-gray-900">
              {trend ? (
                <span>
                  {trend.direction === 'up' ? 'Улучшение' : trend.direction === 'down' ? 'Падение' : 'Стабильно'} на {trend.percentage.toFixed(1)}%
                </span>
              ) : 'Недостаточно данных'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <span className="text-sm font-semibold">{selectedMetric.toUpperCase()}</span>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Метрика</div>
            <div className="text-sm text-gray-900">{selectedMetric.toUpperCase()}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <span className="text-sm font-semibold">{series[0]?.points.length ?? 0}</span>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Точек данных</div>
            <div className="text-sm text-gray-900">Всего наблюдений в текущем диапазоне.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
