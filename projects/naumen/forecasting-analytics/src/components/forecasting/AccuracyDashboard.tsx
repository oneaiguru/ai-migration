// AccuracyDashboard.tsx - Main Accuracy Analytics Dashboard

import React, { useState, useMemo, useEffect } from 'react';
import { Activity, AlertTriangle, Settings, RefreshCw } from 'lucide-react';

// Import all accuracy components
import AccuracyMetrics from './accuracy/AccuracyMetrics';
import PerformanceChart from './accuracy/PerformanceChart';
import ModelComparison from './accuracy/ModelComparison';
import ConfidenceIndicator from './accuracy/ConfidenceIndicator';
import ModelValidation from './accuracy/ModelValidation';
import ErrorAnalysis from './accuracy/ErrorAnalysis';
import AccuracyExport from './accuracy/AccuracyExport';
import { ReportTable } from '../charts';

// Import types
import {
  AccuracyMetrics as AccuracyMetricsType,
  ModelComparison as ModelComparisonType,
  HistoricalAccuracy,
  ValidationResult,
  ForecastDataPoint,
  AlgorithmType,
  ExportOptions,
  Alert,
} from '../../types/accuracy';

import { calculateAllMetrics, formatPercent } from '../../utils/accuracyCalculations';
import { performTTest } from '../../utils/statisticalTests';
import { forecastSeries } from '../../data/forecastingFixtures';
import { createAccuracyExport, fetchForecastDetail } from '../../services/forecastingApi';
import { triggerBrowserDownload } from '../../utils/download';
import { useNotificationCenter } from './common/NotificationCenter';
import type { ForecastDetailRow } from '../../types/forecasting';
import { buildForecastDetailTable } from '../../adapters/forecasting';

interface AccuracyDashboardProps {
  currentAlgorithm: AlgorithmType;
  forecastData: ForecastDataPoint[];
  historicalData?: HistoricalAccuracy[];
  onAlgorithmChange?: (algorithmId: AlgorithmType) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

const AccuracyDashboard: React.FC<AccuracyDashboardProps> = ({
  currentAlgorithm,
  forecastData,
  historicalData = [],
  onAlgorithmChange,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'validation' | 'analysis' | 'export'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'mape' | 'mae' | 'rmse' | 'bias'>('mape');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<AlgorithmType[]>([currentAlgorithm]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isValidating, setIsValidating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [detailRows, setDetailRows] = useState<ForecastDetailRow[]>([]);

  const resolvedForecastData = useMemo<ForecastDataPoint[]>(
    () => (
      forecastData.length
        ? forecastData
        : forecastSeries.map(({ timestamp, forecast, actual }) => ({
            timestamp,
            predicted: forecast,
            actual,
          }))
    ),
    [forecastData],
  );

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    if (!resolvedForecastData.length) {
      setDetailRows([]);
      return;
    }

    let active = true;

    const periodStart = resolvedForecastData[0]?.timestamp ?? new Date().toISOString();
    const periodEnd = resolvedForecastData[resolvedForecastData.length - 1]?.timestamp ?? periodStart;

    (async () => {
      try {
        const rows = await fetchForecastDetail({
          queueIds: ['support'],
          period: {
            start: periodStart,
            end: periodEnd,
          },
        });
        if (active) {
          setDetailRows(rows ?? []);
        }
      } catch (error) {
        console.error('Не удалось загрузить детализацию прогноза', error);
      }
    })();

    return () => {
      active = false;
    };
  }, [resolvedForecastData]);

  const detailTable = useMemo(() => buildForecastDetailTable(detailRows), [detailRows]);

  // Calculate current accuracy metrics
  const currentMetrics = useMemo((): AccuracyMetricsType => {
    const dataWithActuals = resolvedForecastData.filter((d) => d.actual !== undefined);
    
    if (dataWithActuals.length === 0) {
      return {
        mape: 11.8,
        mae: 14.6,
        rmse: 18.2,
        rSquared: 0.89,
        bias: -1.1,
        confidenceInterval: {
          lower: 9.2,
          upper: 15.0,
          level: 95,
        },
        pValue: 0.021,
        sampleSize: resolvedForecastData.length,
      };
    }

    const predicted = dataWithActuals.map(d => d.predicted);
    const actual = dataWithActuals.map(d => d.actual!);
    
    const metrics = calculateAllMetrics({ predicted, actual });
    const errors = predicted.map((p, i) => Math.abs(p - actual[i]));
    const tTestResult = performTTest({ values: errors, confidence: 0.95 });
    
    return {
      mape: metrics.mape,
      mae: metrics.mae,
      rmse: metrics.rmse,
      rSquared: metrics.rSquared,
      bias: metrics.bias,
      confidenceInterval: tTestResult.confidenceInterval,
      pValue: tTestResult.pValue,
      sampleSize: dataWithActuals.length
    };
  }, [resolvedForecastData]);

  // Mock algorithm comparisons
  const algorithmComparisons = useMemo((): ModelComparisonType[] => (
    [
      {
        algorithmId: 'arima',
        algorithmName: 'ARIMA модель',
        metrics: { mape: 10.6, mae: 13.8, rmse: 17.9, rSquared: 0.91, bias: -0.8, confidenceInterval: { lower: 8.7, upper: 14.5, level: 95 }, pValue: 0.018, sampleSize: 1440 },
        processingTime: 95,
        lastUpdated: new Date('2025-10-20T05:00:00.000Z'),
        status: 'active',
      },
      {
        algorithmId: 'basic_extrapolation',
        algorithmName: 'Базовая экстраполяция',
        metrics: { mape: 14.2, mae: 18.1, rmse: 22.4, rSquared: 0.82, bias: -1.6, confidenceInterval: { lower: 11.0, upper: 21.5, level: 95 }, pValue: 0.034, sampleSize: 1440 },
        processingTime: 42,
        lastUpdated: new Date('2025-10-18T05:00:00.000Z'),
        status: 'active',
      },
      {
        algorithmId: 'exponential_smoothing',
        algorithmName: 'Экспоненциальное сглаживание',
        metrics: { mape: 12.9, mae: 16.0, rmse: 20.5, rSquared: 0.86, bias: -1.2, confidenceInterval: { lower: 9.6, upper: 18.4, level: 95 }, pValue: 0.026, sampleSize: 1440 },
        processingTime: 58,
        lastUpdated: new Date('2025-10-19T05:00:00.000Z'),
        status: 'active',
      },
    ]
  ), []);

  // Mock validation results
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([
    {
      method: 'crossValidation',
      folds: 5,
      testSize: 20,
      metrics: {
        mape: currentMetrics.mape + Math.random() * 2,
        mae: currentMetrics.mae + Math.random() * 3,
        rmse: currentMetrics.rmse + Math.random() * 4,
        rSquared: currentMetrics.rSquared - Math.random() * 0.05,
        bias: currentMetrics.bias + Math.random() * 1,
        confidenceInterval: currentMetrics.confidenceInterval,
        pValue: currentMetrics.pValue,
        sampleSize: Math.floor(currentMetrics.sampleSize * 0.8)
      }
    }
  ]);

  // Handle validation run
  const handleValidationRun = async (method: 'holdout' | 'crossValidation' | 'timeSeries') => {
    setIsValidating(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newResult: ValidationResult = {
      method,
      folds: method === 'crossValidation' ? 5 : undefined,
      testSize: method === 'holdout' ? 30 : 20,
      metrics: {
        mape: currentMetrics.mape + (Math.random() - 0.5) * 4,
        mae: currentMetrics.mae + (Math.random() - 0.5) * 6,
        rmse: currentMetrics.rmse + (Math.random() - 0.5) * 8,
        rSquared: Math.max(0, currentMetrics.rSquared + (Math.random() - 0.5) * 0.1),
        bias: currentMetrics.bias + (Math.random() - 0.5) * 2,
        confidenceInterval: currentMetrics.confidenceInterval,
        pValue: Math.max(0.001, currentMetrics.pValue + (Math.random() - 0.5) * 0.02),
        sampleSize: Math.floor(currentMetrics.sampleSize * (method === 'holdout' ? 0.7 : 0.8))
      }
    };
    
    setValidationResults(prev => [newResult, ...prev.slice(0, 4)]);
    setIsValidating(false);
  };

  // Handle export
  const { pushNotification, pushError } = useNotificationCenter();

  const handleExport = async (_options: ExportOptions) => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      await handleValidationRun('timeSeries');
      const payload = await createAccuracyExport();
      triggerBrowserDownload({
        filename: payload.filename,
        mimeType: payload.mimeType,
        content: payload.content,
      });
      pushNotification({
        title: 'Экспорт точности готов',
        message: `Файл ${payload.filename} выгружен`,
        kind: 'success',
        downloadHref: `data:${payload.mimeType};charset=utf-8,${encodeURIComponent(payload.content)}`,
        downloadLabel: payload.filename,
      });
      setExportStatus({ kind: 'success', text: 'Отчёт по точности выгружен. Файл доступен в колокольчике.' });
    } catch (error) {
      console.error('Не удалось выполнить экспорт точности', error);
      pushError('Ошибка экспорта точности', 'Не удалось сформировать CSV. Повторите попытку позже.');
      setExportStatus({ kind: 'error', text: 'Экспорт не выполнен. Попробуйте ещё раз.' });
    } finally {
      setIsExporting(false);
    }
  };

  // Get previous metrics for trend calculation
  const previousMetrics = useMemo(() => {
    if (historicalData.length === 0) return undefined;
    
    const sorted = historicalData
      .filter(h => h.algorithmId === currentAlgorithm)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return sorted[1]?.metrics; // Previous period
  }, [historicalData, currentAlgorithm]);

  // Check for alerts
  useEffect(() => {
    const newAlerts: Alert[] = [];
    
    if (currentMetrics.mape > 25) {
      newAlerts.push({
        id: 'high-mape',
        type: 'accuracy_degradation',
        severity: 'high',
        message: `MAPE превышает 25% (${formatPercent(currentMetrics.mape, 1)})`,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    if (currentMetrics.confidenceInterval.level < 85) {
      newAlerts.push({
        id: 'low-confidence',
        type: 'confidence_low',
        severity: 'medium',
        message: `Низкий уровень доверия (${currentMetrics.confidenceInterval.level}%)`,
        timestamp: new Date(),
        acknowledged: false
      });
    }
    
    setAlerts(newAlerts);
  }, [currentMetrics]);

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: Activity },
    { id: 'comparison', label: 'Сравнение', icon: Activity },
    { id: 'validation', label: 'Валидация', icon: Activity },
    { id: 'analysis', label: 'Анализ ошибок', icon: AlertTriangle },
    { id: 'export', label: 'Экспорт', icon: Settings }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Аналитика точности</h1>
            <p className="text-sm text-gray-600 mt-1">
              Текущий алгоритм: <span className="font-medium">{algorithmComparisons.find(a => a.algorithmId === currentAlgorithm)?.algorithmName}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-orange-600">{alerts.length} предупреждений</span>
              </div>
            )}
            
            {/* Auto-refresh indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>Обновлено: {lastUpdate.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
      </div>
    </div>

      {exportStatus && (
        <div
          className={`rounded-lg border p-4 text-sm shadow-sm ${
            exportStatus.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {exportStatus.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.severity === 'high' ? 'bg-red-50 border-red-200 text-red-700' :
                        alert.severity === 'medium' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                        'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">{alert.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Metrics */}
              <AccuracyMetrics
                metrics={currentMetrics}
                previousMetrics={previousMetrics}
                showTrends={true}
              />

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Confidence Indicator */}
                <ConfidenceIndicator
                  metrics={currentMetrics}
                  showDetails={true}
                  size="md"
                />

                {/* Performance Chart */}
                <PerformanceChart
                  data={historicalData}
                  selectedMetric={selectedMetric}
                  timeRange={timeRange}
                  algorithms={[currentAlgorithm]}
                  height={300}
                />
              </div>

              <ReportTable
                columns={detailTable.columns}
                rows={detailTable.rows}
                ariaTitle="Детализация прогноза"
                ariaDesc="Подробная таблица отклонений и показателей обслуживания"
              />

              {/* Controls */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Метрика:</label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="mape">MAPE</option>
                    <option value="mae">MAE</option>
                    <option value="rmse">RMSE</option>
                    <option value="bias">Bias</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Период:</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="7d">7 дней</option>
                    <option value="30d">30 дней</option>
                    <option value="90d">90 дней</option>
                    <option value="6m">6 месяцев</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <ModelComparison
                comparisons={algorithmComparisons}
                currentAlgorithm={currentAlgorithm}
                onAlgorithmSelect={onAlgorithmChange}
                viewMode="table"
              />

              <PerformanceChart
                data={historicalData}
                selectedMetric={selectedMetric}
                timeRange={timeRange}
                algorithms={selectedAlgorithms}
                showConfidenceBands={true}
                height={400}
              />

              {/* Algorithm Selection */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Алгоритмы для сравнения:</h4>
                <div className="flex flex-wrap gap-2">
                  {algorithmComparisons.map((alg) => (
                    <button
                      key={alg.algorithmId}
                      onClick={() => {
                        setSelectedAlgorithms(prev => 
                          prev.includes(alg.algorithmId)
                            ? prev.filter(id => id !== alg.algorithmId)
                            : [...prev, alg.algorithmId]
                        );
                      }}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        selectedAlgorithms.includes(alg.algorithmId)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {alg.algorithmName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === 'validation' && (
            <ModelValidation
              validationResults={validationResults}
              onValidationRun={handleValidationRun}
              isValidating={isValidating}
            />
          )}

          {/* Error Analysis Tab */}
          {activeTab === 'analysis' && (
            <ErrorAnalysis
              forecastData={resolvedForecastData}
            />
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <AccuracyExport
              availableAlgorithms={algorithmComparisons.map(a => ({ id: a.algorithmId, name: a.algorithmName }))}
              onExport={handleExport}
              isExporting={isExporting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccuracyDashboard;
