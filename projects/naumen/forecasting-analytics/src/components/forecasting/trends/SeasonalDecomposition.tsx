// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/SeasonalDecomposition.tsx
// SeasonalDecomposition.tsx - Mathematical decomposition into trend/seasonal/residual

import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { TrendDataPoint } from '../../../types/trends';

interface SeasonalDecompositionProps {
  data: TrendDataPoint[];
  decompositionMethod?: 'additive' | 'multiplicative' | 'stl';
  seasonalPeriod?: number;
  onDecompositionComplete?: (components: DecompositionResult) => void;
  className?: string;
}

interface DecompositionResult {
  original: number[];
  trend: number[];
  seasonal: number[];
  residual: number[];
  seasonalityStrength: number;
  trendStrength: number;
  residualVariance: number;
  decompositionQuality: number;
}

const SeasonalDecomposition: React.FC<SeasonalDecompositionProps> = ({
  data,
  decompositionMethod = 'additive',
  seasonalPeriod = 24, // 24 hours by default
  onDecompositionComplete,
  className = ''
}) => {
  const [decomposition, setDecomposition] = useState<DecompositionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<'all' | 'trend' | 'seasonal' | 'residual'>('all');
  const [showStatistics, setShowStatistics] = useState(true);

  // Moving average calculation
  const calculateMovingAverage = (values: number[], window: number): number[] => {
    const result: number[] = [];
    const halfWindow = Math.floor(window / 2);
    
    for (let i = 0; i < values.length; i++) {
      if (i < halfWindow || i >= values.length - halfWindow) {
        result.push(values[i]); // Use original values at edges
      } else {
        let sum = 0;
        for (let j = i - halfWindow; j <= i + halfWindow; j++) {
          sum += values[j];
        }
        result.push(sum / window);
      }
    }
    
    return result;
  };

  // STL (Seasonal and Trend decomposition using Loess) - simplified version
  const performSTLDecomposition = (values: number[]): DecompositionResult => {
    const n = values.length;
    const period = Math.min(seasonalPeriod, Math.floor(n / 2));
    
    // Step 1: Initial trend estimation using moving average
    let trend = calculateMovingAverage(values, period);
    
    // Step 2: Detrend the series
    const detrended = values.map((val, i) => val - trend[i]);
    
    // Step 3: Calculate seasonal component
    const seasonal: number[] = new Array(n).fill(0);
    
    // Calculate seasonal indices for each position in the cycle
    const seasonalIndices: number[] = new Array(period).fill(0);
    const seasonalCounts: number[] = new Array(period).fill(0);
    
    for (let i = 0; i < n; i++) {
      const seasonIndex = i % period;
      seasonalIndices[seasonIndex] += detrended[i];
      seasonalCounts[seasonIndex]++;
    }
    
    // Average seasonal effects
    for (let i = 0; i < period; i++) {
      if (seasonalCounts[i] > 0) {
        seasonalIndices[i] /= seasonalCounts[i];
      }
    }
    
    // Apply seasonal pattern
    for (let i = 0; i < n; i++) {
      seasonal[i] = seasonalIndices[i % period];
    }
    
    // Step 4: Re-estimate trend after removing seasonal component
    const seasonallyAdjusted = values.map((val, i) => val - seasonal[i]);
    trend = calculateMovingAverage(seasonallyAdjusted, Math.max(3, Math.floor(period / 3)));
    
    // Step 5: Calculate residuals
    const residual = values.map((val, i) => val - trend[i] - seasonal[i]);
    
    return {
      original: values,
      trend,
      seasonal,
      residual,
      seasonalityStrength: 0,
      trendStrength: 0,
      residualVariance: 0,
      decompositionQuality: 0
    };
  };

  // Additive decomposition
  const performAdditiveDecomposition = (values: number[]): DecompositionResult => {
    const n = values.length;
    const period = Math.min(seasonalPeriod, Math.floor(n / 2));
    
    // Calculate trend using centered moving average
    const trend = calculateMovingAverage(values, period);
    
    // Calculate seasonal component
    const seasonal: number[] = new Array(n).fill(0);
    const seasonalPattern: number[] = new Array(period).fill(0);
    const seasonalCounts: number[] = new Array(period).fill(0);
    
    // Detrend first
    const detrended = values.map((val, i) => val - trend[i]);
    
    // Calculate average seasonal pattern
    for (let i = 0; i < n; i++) {
      const seasonIndex = i % period;
      seasonalPattern[seasonIndex] += detrended[i];
      seasonalCounts[seasonIndex]++;
    }
    
    for (let i = 0; i < period; i++) {
      if (seasonalCounts[i] > 0) {
        seasonalPattern[i] /= seasonalCounts[i];
      }
    }
    
    // Center the seasonal pattern (make it sum to zero)
    const seasonalMean = seasonalPattern.reduce((sum, val) => sum + val, 0) / period;
    for (let i = 0; i < period; i++) {
      seasonalPattern[i] -= seasonalMean;
    }
    
    // Apply seasonal pattern to all observations
    for (let i = 0; i < n; i++) {
      seasonal[i] = seasonalPattern[i % period];
    }
    
    // Calculate residuals
    const residual = values.map((val, i) => val - trend[i] - seasonal[i]);
    
    return {
      original: values,
      trend,
      seasonal,
      residual,
      seasonalityStrength: 0,
      trendStrength: 0,
      residualVariance: 0,
      decompositionQuality: 0
    };
  };

  // Multiplicative decomposition
  const performMultiplicativeDecomposition = (values: number[]): DecompositionResult => {
    const n = values.length;
    const period = Math.min(seasonalPeriod, Math.floor(n / 2));
    
    // Ensure all values are positive for multiplicative decomposition
    const minValue = Math.min(...values);
    const adjustedValues = minValue <= 0 ? values.map(v => v + Math.abs(minValue) + 1) : values;
    
    // Calculate trend
    const trend = calculateMovingAverage(adjustedValues, period);
    
    // Calculate seasonal indices
    const seasonal: number[] = new Array(n).fill(1);
    const seasonalPattern: number[] = new Array(period).fill(0);
    const seasonalCounts: number[] = new Array(period).fill(0);
    
    // Detrend by division
    const detrended = adjustedValues.map((val, i) => trend[i] > 0 ? val / trend[i] : 1);
    
    // Calculate seasonal pattern
    for (let i = 0; i < n; i++) {
      const seasonIndex = i % period;
      seasonalPattern[seasonIndex] += detrended[i];
      seasonalCounts[seasonIndex]++;
    }
    
    for (let i = 0; i < period; i++) {
      if (seasonalCounts[i] > 0) {
        seasonalPattern[i] /= seasonalCounts[i];
      } else {
        seasonalPattern[i] = 1;
      }
    }
    
    // Normalize seasonal pattern
    const seasonalMean = seasonalPattern.reduce((sum, val) => sum + val, 0) / period;
    for (let i = 0; i < period; i++) {
      seasonalPattern[i] /= seasonalMean;
    }
    
    // Apply seasonal pattern
    for (let i = 0; i < n; i++) {
      seasonal[i] = seasonalPattern[i % period];
    }
    
    // Calculate residuals
    const residual = adjustedValues.map((val, i) => 
      (trend[i] > 0 && seasonal[i] > 0) ? val / (trend[i] * seasonal[i]) : 1
    );
    
    // Convert back to additive form for display
    const additiveResidual = residual.map(r => r - 1);
    const additiveSeasonal = seasonal.map(s => s - 1);
    
    return {
      original: values,
      trend: trend,
      seasonal: additiveSeasonal,
      residual: additiveResidual,
      seasonalityStrength: 0,
      trendStrength: 0,
      residualVariance: 0,
      decompositionQuality: 0
    };
  };

  // Calculate decomposition quality metrics
  const calculateMetrics = (result: DecompositionResult): DecompositionResult => {
    const { original, trend, seasonal, residual } = result;
    const n = original.length;
    
    // Calculate variance for each component
    const originalMean = original.reduce((sum, val) => sum + val, 0) / n;
    const originalVar = original.reduce((sum, val) => sum + Math.pow(val - originalMean, 2), 0) / n;
    
    const trendVar = trend.reduce((sum, val) => sum + Math.pow(val - originalMean, 2), 0) / n;
    const seasonalVar = seasonal.reduce((sum, val) => sum + Math.pow(val, 2), 0) / n;
    const residualVar = residual.reduce((sum, val) => sum + Math.pow(val, 2), 0) / n;
    
    // Strength measures
    const seasonalityStrength = seasonalVar / (seasonalVar + residualVar);
    const trendStrength = trendVar / (trendVar + residualVar);
    
    // Decomposition quality (how much variance is explained)
    const explainedVar = trendVar + seasonalVar;
    const decompositionQuality = explainedVar / originalVar;
    
    return {
      ...result,
      seasonalityStrength,
      trendStrength,
      residualVariance: residualVar,
      decompositionQuality: Math.min(1, decompositionQuality)
    };
  };

  // Main decomposition function
  const performDecomposition = useMemo(() => {
    if (data.length < seasonalPeriod * 2) return null;
    
    setIsProcessing(true);
    const values = data.map(d => d.value);
    
    let result: DecompositionResult;
    
    switch (decompositionMethod) {
      case 'multiplicative':
        result = performMultiplicativeDecomposition(values);
        break;
      case 'stl':
        result = performSTLDecomposition(values);
        break;
      default:
        result = performAdditiveDecomposition(values);
    }
    
    const finalResult = calculateMetrics(result);
    setIsProcessing(false);
    return finalResult;
  }, [data, decompositionMethod, seasonalPeriod]);

  useEffect(() => {
    setDecomposition(performDecomposition);
    if (performDecomposition && onDecompositionComplete) {
      onDecompositionComplete(performDecomposition);
    }
  }, [performDecomposition, onDecompositionComplete]);

  // Chart data generation
  const getChartData = () => {
    if (!decomposition) return { labels: [], datasets: [] };

    const labels = data.map(d => d.timestamp);
    const datasets = [];

    if (selectedComponent === 'all') {
      datasets.push(
        {
          label: 'Исходные данные',
          data: decomposition.original,
          borderColor: '#374151',
          backgroundColor: 'rgba(55, 65, 81, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          label: 'Тренд',
          data: decomposition.trend,
          borderColor: '#DC2911',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          label: 'Сезонность',
          data: decomposition.seasonal,
          borderColor: '#35BA9A',
          backgroundColor: 'rgba(53, 186, 154, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          yAxisID: 'y1',
          fill: true
        },
        {
          label: 'Остатки',
          data: decomposition.residual,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          yAxisID: 'y2',
          fill: true
        }
      );
    } else {
      const componentData = {
        trend: decomposition.trend,
        seasonal: decomposition.seasonal,
        residual: decomposition.residual
      }[selectedComponent];

      const componentColors = {
        trend: '#DC2911',
        seasonal: '#35BA9A',
        residual: '#8B5CF6'
      };

      datasets.push({
        label: selectedComponent === 'trend' ? 'Тренд' :
               selectedComponent === 'seasonal' ? 'Сезонность' : 'Остатки',
        data: componentData,
        borderColor: componentColors[selectedComponent],
        backgroundColor: `${componentColors[selectedComponent]}20`,
        borderWidth: 2,
        pointRadius: 0,
        fill: true
      });
    }

    return { labels, datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#374151',
          maxTicksLimit: 8
        }
      },
      y: {
        type: 'linear' as const,
        display: selectedComponent === 'all' || selectedComponent === 'trend',
        position: 'left' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#374151'
        },
        title: {
          display: true,
          text: 'Основные значения'
        }
      },
      y1: {
        type: 'linear' as const,
        display: selectedComponent === 'all' || selectedComponent === 'seasonal',
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#374151'
        },
        title: {
          display: true,
          text: 'Сезонность'
        }
      },
      y2: {
        type: 'linear' as const,
        display: selectedComponent === 'all' || selectedComponent === 'residual',
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#374151'
        },
        title: {
          display: true,
          text: 'Остатки'
        }
      }
    }
  };

  return (
    <div className={`seasonal-decomposition bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">🧮 Сезонная декомпозиция</h3>
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Обработка...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Метод:</label>
            <select
              value={decompositionMethod}
              onChange={(e) => setDecompositionMethod(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value="additive">Аддитивный</option>
              <option value="multiplicative">Мультипликативный</option>
              <option value="stl">STL</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Период:</label>
            <select
              value={seasonalPeriod}
              onChange={(e) => setSeasonalPeriod(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value={24}>24 часа</option>
              <option value={168}>7 дней</option>
              <option value={720}>30 дней</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Компонент:</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все компоненты</option>
              <option value="trend">Тренд</option>
              <option value="seasonal">Сезонность</option>
              <option value="residual">Остатки</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showStatistics}
              onChange={(e) => setShowStatistics(e.target.checked)}
              className="rounded"
            />
            <span>Показать статистику</span>
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ height: '400px', padding: '16px' }}>
        <Line data={getChartData()} options={chartOptions} />
      </div>

      {/* Decomposition Statistics */}
      {showStatistics && decomposition && (
        <div className="p-4 border-t border-gray-100">
          <h4 className="text-md font-medium text-gray-900 mb-3">Статистика декомпозиции</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Качество декомпозиции</div>
              <div className={`text-lg font-semibold ${
                decomposition.decompositionQuality > 0.8 ? 'text-green-600' :
                decomposition.decompositionQuality > 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(decomposition.decompositionQuality * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Сила сезонности</div>
              <div className="text-lg font-semibold text-blue-600">
                {(decomposition.seasonalityStrength * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Сила тренда</div>
              <div className="text-lg font-semibold text-green-600">
                {(decomposition.trendStrength * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Дисперсия остатков</div>
              <div className="text-lg font-semibold text-purple-600">
                {decomposition.residualVariance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Component Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-3">
              <h5 className="font-medium text-red-900 mb-2">Тренд</h5>
              <div className="text-sm text-red-700">
                <div>Объясняет {(decomposition.trendStrength * 100).toFixed(1)}% вариации</div>
                <div className="mt-1">
                  {decomposition.trendStrength > 0.7 ? 'Сильный долгосрочный тренд' :
                   decomposition.trendStrength > 0.3 ? 'Умеренный тренд' : 'Слабый тренд'}
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <h5 className="font-medium text-green-900 mb-2">Сезонность</h5>
              <div className="text-sm text-green-700">
                <div>Объясняет {(decomposition.seasonalityStrength * 100).toFixed(1)}% вариации</div>
                <div className="mt-1">
                  {decomposition.seasonalityStrength > 0.7 ? 'Сильная сезонность' :
                   decomposition.seasonalityStrength > 0.3 ? 'Умеренная сезонность' : 'Слабая сезонность'}
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <h5 className="font-medium text-purple-900 mb-2">Остатки</h5>
              <div className="text-sm text-purple-700">
                <div>Дисперсия: {decomposition.residualVariance.toFixed(2)}</div>
                <div className="mt-1">
                  {decomposition.residualVariance < 100 ? 'Хорошее качество модели' :
                   decomposition.residualVariance < 500 ? 'Удовлетворительное качество' : 'Требует улучшения'}
                </div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Интерпретация</h5>
            <div className="text-sm text-blue-800 space-y-1">
              {decomposition.decompositionQuality > 0.8 && (
                <div>• Отличное качество декомпозиции - компоненты хорошо объясняют данные</div>
              )}
              {decomposition.seasonalityStrength > 0.5 && (
                <div>• Выраженная сезонная составляющая - учитывайте при планировании</div>
              )}
              {decomposition.trendStrength > 0.5 && (
                <div>• Значимый тренд - важен для долгосрочного прогнозирования</div>
              )}
              {decomposition.residualVariance < 100 && (
                <div>• Низкая случайная составляющая - высокая предсказуемость</div>
              )}
              {decomposition.decompositionQuality < 0.6 && (
                <div>• Низкое качество декомпозиции - попробуйте другой метод или период</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalDecomposition;