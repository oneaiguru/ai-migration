// ErrorAnalysis.tsx - Detailed Error Pattern Analysis

import React, { useMemo, useState } from 'react';
import { Clock, Calendar, AlertTriangle, BarChart3 } from 'lucide-react';
import { ForecastDataPoint } from '../../../types/accuracy';
import { BarChart } from '../../charts';
import { buildErrorAnalysisSeries } from '../../../adapters/forecasting';

interface ErrorAnalysisProps {
  forecastData: ForecastDataPoint[];
  className?: string;
}

const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({
  forecastData,
  className = ''
}) => {
  const [view, setView] = useState<'time' | 'day' | 'magnitude'>('time');

  const { series, viewToggle, categories } = useMemo(
    () => buildErrorAnalysisSeries({ forecastData }),
    [forecastData],
  );

  const activeSeries = useMemo(() => series.filter((entry) => {
    if (!entry.points.length) return false;
    const viewId = entry.points[0]?.metadata?.viewId as string | undefined;
    return viewId ? viewId === view : true;
  }), [series, view]);

  const activeCategories = categories[view] ?? [];
  const totalIntervals = forecastData.length;
  const adjustedIntervals = forecastData.filter((point) => (point.adjustments ?? 0) !== 0).length;

  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Анализ ошибок</h3>
          <p className="text-sm text-gray-500">Распределение ошибок прогноза по времени суток, дням недели и величине отклонения.</p>
        </div>
        <div className="flex items-center gap-2">
          {viewToggle.map((toggle) => (
            <button
              key={toggle.id}
              onClick={() => setView(toggle.id as typeof view)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                view === toggle.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {toggle.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        <BarChart
          series={activeSeries}
          categories={activeCategories}
          yUnit="people"
          viewToggle={viewToggle}
          activeViewId={view}
          ariaTitle="Анализ ошибок прогноза"
          ariaDesc="Столбчатая диаграмма, показывающая величину ошибок прогноза по выбранному измерению"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 border-t border-gray-100 bg-gray-50 px-6 py-4 md:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Текущее представление</div>
            <div className="text-sm text-gray-900">{viewToggle.find((item) => item.id === view)?.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Интервалы</div>
            <div className="text-sm text-gray-900">{totalIntervals} записей</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">С корректировками</div>
            <div className="text-sm text-gray-900">{adjustedIntervals} ({totalIntervals ? Math.round((adjustedIntervals / totalIntervals) * 100) : 0}% )</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAnalysis;
