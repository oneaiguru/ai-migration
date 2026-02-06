import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, CalendarRange, Download, FlagTriangleRight, Layers } from 'lucide-react';
import { LineChart, BarChart, type Series } from '../../charts';
import type { TrendDashboardProps, TrendDataPoint, AnomalyEvent } from '../../../types/trends';
import {
  buildAnomalySeries,
  buildForecastVsFactSeries,
  buildSeasonalitySeries,
  buildTrendMetaSummary,
} from '../../../adapters/forecasting';
import { trendSeriesByQueue, trendSeedDefaults } from '../../../data/forecastingFixtures';
import { createTrendExport } from '../../../services/forecastingApi';
import { useNotificationCenter } from '../common/NotificationCenter';
import { useTimezone } from '../common/TimezoneContext';
import { triggerBrowserDownload } from '../../../utils/download';

const TABS: Array<{ id: 'strategic' | 'tactical' | 'operational'; label: string; description: string }> = [
  { id: 'strategic', label: 'Стратегический', description: 'Длинные ряды и доверительные интервалы' },
  { id: 'tactical', label: 'Тактический', description: 'Смена и сутки — детализация по очередям' },
  { id: 'operational', label: 'Оперативный', description: 'Последние 48 часов для мониторинга отклонений' },
];

const queueOptions = trendSeriesByQueue.map((item) => ({ value: item.queueId, label: item.queueName }));

const defaultPeriodStart = new Date(trendSeedDefaults.period.start);
const defaultPeriodEnd = new Date(trendSeedDefaults.period.end);

const clampDate = (date: Date) => (Number.isNaN(date.getTime()) ? new Date() : date);

const computeSeasonality = (points: TrendDataPoint[]): number[] => {
  const buckets = Array.from({ length: 24 }, () => ({ total: 0, count: 0 }));
  points.forEach((point) => {
    const date = point.timestamp;
    const hour = date instanceof Date ? date.getHours() : new Date(point.timestamp).getHours();
    const bucket = buckets[hour];
    bucket.total += Number(point.forecast ?? point.value ?? 0);
    bucket.count += 1;
  });
  const baseline =
    buckets.reduce((sum, bucket) => sum + bucket.total, 0) /
    Math.max(1, buckets.reduce((sum, bucket) => sum + bucket.count, 0));
  return buckets.map((bucket) => {
    if (!bucket.count) return 0;
    const value = bucket.total / bucket.count;
    return baseline > 0 ? Math.round((value / baseline) * 100) : 0;
  });
};

const TrendAnalysisDashboard: React.FC<TrendDashboardProps> = ({
  organizationId,
  queueIds,
  dateRange,
  refreshInterval = 300000,
}) => {
  const [activeTab, setActiveTab] = useState<'strategic' | 'tactical' | 'operational'>('strategic');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [seasonalData, setSeasonalData] = useState<number[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);

  const [selectedQueueId, setSelectedQueueId] = useState<string>(
    queueIds?.[0] ?? trendSeedDefaults.queueId ?? queueOptions[0]?.value ?? '',
  );
  const [periodPreset, setPeriodPreset] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStart, setCustomStart] = useState<string | undefined>(trendSeedDefaults.period.start.slice(0, 10));
  const [customEnd, setCustomEnd] = useState<string | undefined>(trendSeedDefaults.period.end.slice(0, 10));
  const [exporting, setExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const { pushNotification, pushError } = useNotificationCenter();
  const { timezone } = useTimezone();

  useEffect(() => {
    if (!queueOptions.find((option) => option.value === selectedQueueId)) {
      setSelectedQueueId(queueOptions[0]?.value ?? selectedQueueId);
    }
  }, [selectedQueueId]);

  const currentQueue = useMemo(
    () => queueOptions.find((option) => option.value === selectedQueueId) ?? queueOptions[0],
    [selectedQueueId],
  );

  const activeFixture = useMemo(
    () => trendSeriesByQueue.find((item) => item.queueId === selectedQueueId) ?? trendSeriesByQueue[0],
    [selectedQueueId],
  );

  const defaultRange = useMemo(() => (
    dateRange?.start && dateRange?.end
      ? { start: dateRange.start, end: dateRange.end }
      : { start: new Date(defaultPeriodStart), end: new Date(defaultPeriodEnd) }
  ), [dateRange]);

  const selectedRange = useMemo(() => {
    if (periodPreset === 'custom' && customStart && customEnd) {
      return {
        start: clampDate(new Date(`${customStart}T00:00:00.000Z`)),
        end: clampDate(new Date(`${customEnd}T23:59:59.000Z`)),
      };
    }

    const end = new Date(defaultRange.end);
    const days = periodPreset === '7d' ? 7 : periodPreset === '90d' ? 90 : 30;
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    return { start, end };
  }, [periodPreset, customStart, customEnd, defaultRange]);

  useEffect(() => {
    const fixture = activeFixture ?? trendSeriesByQueue[0];
    const source = fixture[activeTab];
    const mapped: TrendDataPoint[] = source.map((point) => ({
      timestamp: new Date(point.timestamp),
      value: point.actual ?? point.forecast,
      forecast: point.forecast,
      trend: point.forecast,
      seasonal: point.forecast - Math.max(1, source.reduce((sum, entry) => sum + entry.forecast, 0) / source.length),
      residual: (point.actual ?? point.forecast) - point.forecast,
      confidence: point.confidence,
    }));
    setTrendData(mapped);
    setSeasonalData(computeSeasonality(mapped));
    setAnomalies([]);
  }, [activeTab, activeFixture]);

  useEffect(() => {
    if (!refreshInterval) return;
    const timer = setInterval(() => {
      setTrendData((prev) => [...prev]);
    }, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const markAnomaly = useCallback((point: TrendDataPoint) => {
    setAnomalies((prev) => {
      const key = point.timestamp.toISOString();
      const exists = prev.find((item) => item.timestamp.toISOString() === key);
      if (exists) {
        return prev.filter((item) => item.timestamp.toISOString() !== key);
      }
      return [
        ...prev,
        {
          timestamp: point.timestamp,
          type: point.residual > 0 ? 'spike' : 'dip',
          value: point.value,
          expectedValue: point.trend ?? point.value,
          severity: Math.abs(point.residual) > 20 ? 'high' : 'medium',
        },
      ];
    });
  }, []);

  const filteredTrendData = useMemo(
    () => trendData.filter((item) => item.timestamp >= selectedRange.start && item.timestamp <= selectedRange.end),
    [trendData, selectedRange],
  );

  const forecastConfig = useMemo(
    () => buildForecastVsFactSeries(filteredTrendData, activeFixture?.serviceLevelTarget),
    [filteredTrendData, activeFixture?.serviceLevelTarget],
  );
  const forecastSeries = useMemo<Series[]>(() => {
    const baseSeries = [forecastConfig.fact, forecastConfig.forecast, forecastConfig.trend].filter(
      (entry): entry is Series => Boolean(entry),
    );

    return baseSeries.map((series) => {
      if (series.id !== 'fact') {
        return series;
      }

      return {
        ...series,
        points: series.points.map((point) => {
          const timestamp = point.timestamp ?? '';
          const date = timestamp ? new Date(timestamp) : null;

          if (!date || Number.isNaN(date.getTime())) {
            return point;
          }

          return {
            ...point,
            onClick: () =>
              markAnomaly({
                timestamp: date,
                value: point.value,
                forecast: point.value,
                residual: 0,
                seasonal: 0,
                trend: point.value,
              }),
            icon: <FlagTriangleRight className="h-3 w-3 text-purple-500" />,
          };
        }),
      } satisfies Series;
    });
  }, [forecastConfig, markAnomaly]);

  const seasonalitySeries = useMemo(() => buildSeasonalitySeries(seasonalData), [seasonalData]);
  const anomalySeries = useMemo(() => buildAnomalySeries(filteredTrendData, anomalies), [anomalies, filteredTrendData]);
  const operationalWindow = useMemo(() => filteredTrendData.slice(-48), [filteredTrendData]);

  const meta = useMemo(
    () =>
      buildTrendMetaSummary({
        organizationId,
        queueIds: currentQueue ? [currentQueue.label] : queueIds,
        dateRange: selectedRange,
      }),
    [organizationId, currentQueue, queueIds, selectedRange],
  );

  const exportTrend = async () => {
    setExporting(true);
    setStatusMessage(null);
    try {
      const payload = createTrendExport({
        organizationId: organizationId ?? 'demo-org',
        queueIds: selectedQueueId ? [selectedQueueId] : queueIds ?? [trendSeedDefaults.queueId],
        period: {
          start: selectedRange.start.toISOString(),
          end: selectedRange.end.toISOString(),
        },
        mode: activeTab,
        timezoneId: timezone.id,
      });
      triggerBrowserDownload({
        filename: payload.filename,
        mimeType: payload.mimeType,
        content: payload.content,
      });
      const href = `data:${payload.mimeType};charset=utf-8,${encodeURIComponent(payload.content)}`;
      pushNotification({
        title: 'CSV готов',
        message: `Тренд для ${currentQueue?.label ?? 'очередей'} сформирован`,
        kind: 'success',
        downloadHref: href,
        downloadLabel: payload.filename,
      });
      setStatusMessage({ kind: 'success', text: 'Экспорт трендов готов. Файл доступен в колокольчике.' });
    } catch (error) {
      console.error('Не удалось экспортировать тренды', error);
      pushError('Ошибка экспорта трендов', 'Попробуйте выбрать другой период или повторите позже.');
      setStatusMessage({ kind: 'error', text: 'Не удалось выгрузить тренды. Повторите попытку позже.' });
    } finally {
      setExporting(false);
    }
  };

  const handlePresetChange = (preset: '7d' | '30d' | '90d' | 'custom') => {
    setPeriodPreset(preset);
    if (preset !== 'custom') {
      setCustomStart(undefined);
      setCustomEnd(undefined);
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Анализ трендов</h2>
            <p className="text-sm text-gray-500">Стратегические/тактические/оперативные сценарии из §4.2: отслеживайте отклонения, сезонность и отмечайте аномалии.</p>
          </div>
          <div className="flex items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  activeTab === tab.id ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">{TABS.find((tab) => tab.id === activeTab)?.description}</p>
      </header>

      {statusMessage && (
        <div
          className={`rounded-xl border p-4 text-sm shadow-sm ${
            statusMessage.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarRange className="h-4 w-4 text-purple-500" />
            <span>Период:</span>
            <button
              type="button"
              onClick={() => handlePresetChange('7d')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                periodPreset === '7d' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              7 дней
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('30d')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                periodPreset === '30d' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              30 дней
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('90d')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                periodPreset === '90d' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              90 дней
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('custom')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                periodPreset === 'custom' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Свой диапазон
            </button>
          </div>
          {periodPreset === 'custom' ? (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-500">Начало</span>
                <input
                  type="date"
                  value={customStart ?? ''}
                  onChange={(event) => setCustomStart(event.target.value || undefined)}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-500">Конец</span>
                <input
                  type="date"
                  value={customEnd ?? ''}
                  onChange={(event) => setCustomEnd(event.target.value || undefined)}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Layers className="h-4 w-4 text-purple-500" /> Рабочая структура
            <select
              value={selectedQueueId}
              onChange={(event) => setSelectedQueueId(event.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              {queueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Прогноз vs факт</h3>
                <p className="text-sm text-gray-500">Confidence band, вторичная ось и легенда соответствуют chart_visual_spec.</p>
              </div>
              <button
                type="button"
                onClick={() => exportTrend()}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:border-purple-200"
              >
                <Download className="h-3 w-3" /> CSV
              </button>
            </div>
            <div className="px-6 pb-6" style={{ height: 320 }}>
              <LineChart
                series={[...forecastSeries, ...anomalySeries]}
                bands={forecastConfig.band ? [forecastConfig.band] : []}
                targets={forecastConfig.target ? [forecastConfig.target] : []}
                secondaryAxis={forecastConfig.secondaryAxis}
                timeScale="day"
                yUnit={forecastConfig.yUnit}
                ariaTitle="Прогноз по очередям"
                ariaDesc="Сравнение прогноза и факта с доверительным интервалом"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Оперативное окно</h3>
                <p className="text-sm text-gray-500">Последние часы для мониторинга отклонений.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Layers className="h-4 w-4" /> {operationalWindow.length} точек
              </div>
            </div>
            <div className="px-6 pb-6" style={{ height: 220 }}>
              <LineChart
                series={[{
                  id: 'operational-fact',
                  label: 'Факт',
                  unit: 'people',
                  points: operationalWindow.map((point) => ({
                    timestamp: point.timestamp.toISOString(),
                    value: point.value,
                  })),
                }]}
                timeScale="day"
                yUnit="people"
                ariaTitle="Оперативное окно"
                ariaDesc="Последние 48 часов для оперативного контроля"
              />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Сезонность по часам</h3>
              <p className="text-sm text-gray-500">Сравнение нагрузки относительно среднего.</p>
            </div>
            <div className="px-6 pb-6" style={{ height: 260 }}>
              <BarChart
                series={seasonalitySeries.series}
                categories={seasonalitySeries.categories}
                yUnit={seasonalitySeries.yUnit}
                stacked
                ariaTitle="Сезонность по часам"
                ariaDesc="Столбчатая диаграмма сезонного распределения"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Контекст</h3>
            </div>
            <dl className="space-y-3 px-6 py-4 text-sm text-gray-600">
              {meta.meta.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">{item.label}</dt>
                  <dd className="font-medium text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-gray-100 px-6 py-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Очередь</label>
              <select
                value={selectedQueueId}
                onChange={(event) => setSelectedQueueId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {queueOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Аномалии</h3>
              <p className="text-sm text-gray-500">Отмечайте всплески или провалы, чтобы повторить проверку §4.2.</p>
            </div>
            <div className="px-6 py-4">
              {anomalies.length ? (
                <ul className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <li key={anomaly.timestamp.toISOString()} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <Activity className="mt-1 h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">{anomaly.type === 'spike' ? 'Всплеск нагрузки' : 'Падение нагрузки'}</div>
                        <div className="text-xs text-amber-800">{anomaly.timestamp.toLocaleString('ru-RU')}</div>
                        <div className="mt-1 text-xs text-amber-900">Отклонение {Math.round(anomaly.value - anomaly.expectedValue)} ед.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setAnomalies((prev) =>
                            prev.filter((item) => item.timestamp.toISOString() !== anomaly.timestamp.toISOString()),
                          )
                        }
                        className="rounded border border-amber-200 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100"
                      >
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Аномалии не отмечены. Кликните по точке графика (иконка флага), чтобы добавить.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <footer className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ArrowUpRight className="h-5 w-5 text-purple-500" /> Следующий шаг: подтвердить сценарии в UAT (chart_visual_spec).
          </div>
          <button
            type="button"
            onClick={exportTrend}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> {exporting ? 'Экспортируем…' : 'Экспортировать в отчёт'}
          </button>
        </div>
      </footer>
    </section>
  );
};

export default TrendAnalysisDashboard;
