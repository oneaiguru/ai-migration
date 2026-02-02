// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/PatternRecognition.tsx
// PatternRecognition.tsx - Automatic detection of weekly/monthly/seasonal patterns

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { TrendDataPoint, TrendPattern } from '../../../types/trends';

interface PatternRecognitionProps {
  data: TrendDataPoint[];
  minPatternLength?: number;
  confidenceThreshold?: number;
  onPatternsDetected?: (patterns: TrendPattern[]) => void;
  className?: string;
}

interface DetectedPattern {
  id: string;
  type: 'cyclical' | 'seasonal' | 'trending' | 'irregular';
  period: number; // in hours
  strength: number; // 0-1
  confidence: number; // 0-1
  startIndex: number;
  endIndex: number;
  description: string;
  peaks: number[];
  valleys: number[];
}

const PatternRecognition: React.FC<PatternRecognitionProps> = ({
  data,
  minPatternLength = 24, // minimum 24 hours
  confidenceThreshold = 0.6,
  onPatternsDetected,
  className = ''
}) => {
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'patterns' | 'cycles' | 'seasonality' | 'summary'>('patterns');
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // Fourier Transform for frequency analysis
  const calculateFFT = (values: number[]) => {
    const n = values.length;
    const fft: { frequency: number; amplitude: number; period: number }[] = [];
    
    for (let k = 1; k < n / 2; k++) {
      let real = 0;
      let imag = 0;
      
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * k * i) / n;
        real += values[i] * Math.cos(angle);
        imag += values[i] * Math.sin(angle);
      }
      
      const amplitude = Math.sqrt(real * real + imag * imag) / n;
      const frequency = k / n;
      const period = 1 / frequency;
      
      fft.push({ frequency, amplitude, period });
    }
    
    return fft.sort((a, b) => b.amplitude - a.amplitude);
  };

  // Autocorrelation for pattern detection
  const calculateAutocorrelation = (values: number[], maxLag: number) => {
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    
    const autocorr: { lag: number; correlation: number; period: number }[] = [];
    
    for (let lag = 1; lag <= Math.min(maxLag, n - 1); lag++) {
      let covariance = 0;
      const validPairs = n - lag;
      
      for (let i = 0; i < validPairs; i++) {
        covariance += (values[i] - mean) * (values[i + lag] - mean);
      }
      
      const correlation = (covariance / validPairs) / variance;
      autocorr.push({ lag, correlation, period: lag });
    }
    
    return autocorr;
  };

  // Detect peaks and valleys
  const findPeaksAndValleys = (values: number[], minDistance: number = 3) => {
    const peaks: number[] = [];
    const valleys: number[] = [];
    
    for (let i = minDistance; i < values.length - minDistance; i++) {
      let isPeak = true;
      let isValley = true;
      
      // Check surrounding points
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i) {
          if (values[j] >= values[i]) isPeak = false;
          if (values[j] <= values[i]) isValley = false;
        }
      }
      
      if (isPeak) peaks.push(i);
      if (isValley) valleys.push(i);
    }
    
    return { peaks, valleys };
  };

  // Pattern detection algorithm
  const detectPatterns = useMemo(() => {
    if (data.length < minPatternLength) return [];
    
    setIsAnalyzing(true);
    const values = data.map(d => d.value);
    const patterns: DetectedPattern[] = [];
    
    // 1. Fourier analysis for periodic patterns
    const fftResults = calculateFFT(values);
    const significantFrequencies = fftResults.filter(f => f.amplitude > 0.1 * fftResults[0].amplitude);
    
    significantFrequencies.slice(0, 5).forEach((freq, index) => {
      const periodHours = freq.period;
      
      // Classify pattern type based on period
      let type: 'cyclical' | 'seasonal' = 'cyclical';
      let description = '';
      
      if (periodHours >= 22 && periodHours <= 26) {
        type = 'seasonal';
        description = 'Дневной цикл (24 часа)';
      } else if (periodHours >= 160 && periodHours <= 180) {
        type = 'seasonal';
        description = 'Недельный цикл (168 часов)';
      } else if (periodHours >= 720 && periodHours <= 780) {
        type = 'seasonal';
        description = 'Месячный цикл (~30 дней)';
      } else {
        description = `Циклический паттерн (${periodHours.toFixed(1)} часов)`;
      }
      
      const strength = freq.amplitude / fftResults[0].amplitude;
      const confidence = Math.min(0.95, strength * 2);
      
      if (confidence >= confidenceThreshold) {
        patterns.push({
          id: `fft_${index}`,
          type,
          period: periodHours,
          strength,
          confidence,
          startIndex: 0,
          endIndex: data.length - 1,
          description,
          peaks: [],
          valleys: []
        });
      }
    });

    // 2. Autocorrelation analysis
    const maxLag = Math.min(168, Math.floor(data.length / 2)); // Up to 1 week
    const autocorr = calculateAutocorrelation(values, maxLag);
    
    // Find significant autocorrelation peaks
    const significantLags = autocorr.filter(a => a.correlation > 0.3).sort((a, b) => b.correlation - a.correlation);
    
    significantLags.slice(0, 3).forEach((lag, index) => {
      const periodHours = lag.period;
      let description = '';
      let type: 'cyclical' | 'seasonal' = 'cyclical';
      
      if (periodHours >= 22 && periodHours <= 26) {
        type = 'seasonal';
        description = 'Суточная корреляция';
      } else if (periodHours >= 160 && periodHours <= 180) {
        type = 'seasonal';
        description = 'Недельная корреляция';
      } else {
        description = `Периодическая корреляция (${periodHours} ч)`;
      }
      
      const confidence = lag.correlation;
      
      if (confidence >= confidenceThreshold) {
        patterns.push({
          id: `autocorr_${index}`,
          type,
          period: periodHours,
          strength: confidence,
          confidence,
          startIndex: 0,
          endIndex: data.length - 1,
          description,
          peaks: [],
          valleys: []
        });
      }
    });

    // 3. Trend analysis using linear regression
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (values[i] - yMean);
      denominator += Math.pow(xValues[i] - xMean, 2);
    }
    
    const slope = numerator / denominator;
    const slopePercent = Math.abs(slope / yMean) * 100;
    
    if (slopePercent > 1) { // Significant trend if > 1% change per hour
      patterns.push({
        id: 'trend_main',
        type: 'trending',
        period: 0,
        strength: Math.min(1, slopePercent / 10),
        confidence: 0.8,
        startIndex: 0,
        endIndex: data.length - 1,
        description: slope > 0 ? 'Восходящий тренд' : 'Нисходящий тренд',
        peaks: [],
        valleys: []
      });
    }

    // 4. Peak/Valley pattern analysis
    const { peaks, valleys } = findPeaksAndValleys(values);
    
    if (peaks.length > 2 && valleys.length > 2) {
      // Analyze spacing between peaks
      const peakSpacings = peaks.slice(1).map((peak, i) => peak - peaks[i]);
      const avgPeakSpacing = peakSpacings.reduce((sum, spacing) => sum + spacing, 0) / peakSpacings.length;
      
      if (avgPeakSpacing > 6 && avgPeakSpacing < 48) { // Between 6 and 48 hours
        patterns.push({
          id: 'peaks_valleys',
          type: 'cyclical',
          period: avgPeakSpacing,
          strength: 0.7,
          confidence: 0.75,
          startIndex: 0,
          endIndex: data.length - 1,
          description: `Циклические пики (каждые ${avgPeakSpacing.toFixed(1)} ч)`,
          peaks,
          valleys
        });
      }
    }

    setIsAnalyzing(false);
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }, [data, minPatternLength, confidenceThreshold]);

  useEffect(() => {
    setDetectedPatterns(detectPatterns);
    
    // Convert to TrendPattern format and notify
    const trendPatterns: TrendPattern[] = detectPatterns.map(pattern => ({
      id: pattern.id,
      type: pattern.type === 'trending' ? (pattern.description.includes('Восходящий') ? 'growth' : 'decline') : pattern.type,
      strength: pattern.strength,
      period: pattern.period > 0 ? `${pattern.period.toFixed(1)} часов` : 'Общий тренд',
      startDate: data[pattern.startIndex]?.timestamp || new Date(),
      endDate: data[pattern.endIndex]?.timestamp || new Date(),
      description: pattern.description,
      statisticalSignificance: pattern.confidence,
      recommendations: generateRecommendations(pattern)
    }));
    
    if (onPatternsDetected) {
      onPatternsDetected(trendPatterns);
    }
  }, [detectPatterns, data, onPatternsDetected]);

  const generateRecommendations = (pattern: DetectedPattern): string[] => {
    const recommendations: string[] = [];
    
    if (pattern.type === 'seasonal' && pattern.period >= 22 && pattern.period <= 26) {
      recommendations.push('Учитывайте дневные пики при планировании смен');
      recommendations.push('Оптимизируйте расписание под суточные колебания');
    }
    
    if (pattern.type === 'seasonal' && pattern.period >= 160 && pattern.period <= 180) {
      recommendations.push('Планируйте недельные ресурсы с учетом выявленного цикла');
      recommendations.push('Адаптируйте рабочие графики под недельную сезонность');
    }
    
    if (pattern.type === 'trending') {
      if (pattern.description.includes('Восходящий')) {
        recommendations.push('Готовьтесь к увеличению нагрузки');
        recommendations.push('Рассмотрите увеличение штата');
      } else {
        recommendations.push('Анализируйте причины снижения активности');
        recommendations.push('Оптимизируйте использование ресурсов');
      }
    }
    
    if (pattern.strength > 0.8) {
      recommendations.push('Высокая предсказуемость - используйте для точного планирования');
    }
    
    return recommendations;
  };

  // Chart data generation
  const getChartData = () => {
    if (!selectedPattern) {
      // Overview chart with all patterns
      const baseData = data.map(d => d.value);
      
      return {
        labels: data.map(d => d.timestamp),
        datasets: [
          {
            label: 'Исходные данные',
            data: baseData,
            borderColor: '#77828C',
            backgroundColor: 'rgba(119, 130, 140, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1
          },
          ...detectedPatterns.slice(0, 3).map((pattern, index) => ({
            label: pattern.description,
            data: generatePatternOverlay(pattern),
            borderColor: ['#DC2911', '#35BA9A', '#8B5CF6'][index],
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.1
          }))
        ]
      };
    }

    const pattern = detectedPatterns.find(p => p.id === selectedPattern);
    if (!pattern) return { labels: [], datasets: [] };

    return {
      labels: data.map(d => d.timestamp),
      datasets: [
        {
          label: 'Данные',
          data: data.map(d => d.value),
          borderColor: '#77828C',
          backgroundColor: 'rgba(119, 130, 140, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1
        },
        {
          label: pattern.description,
          data: generatePatternOverlay(pattern),
          borderColor: '#DC2911',
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.1
        }
      ]
    };
  };

  const generatePatternOverlay = (pattern: DetectedPattern): number[] => {
    const values = data.map(d => d.value);
    
    if (pattern.type === 'trending') {
      // Generate trend line
      const n = values.length;
      const xMean = (n - 1) / 2;
      const yMean = values.reduce((sum, val) => sum + val, 0) / n;
      
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (values[i] - yMean);
        denominator += Math.pow(i - xMean, 2);
      }
      
      const slope = numerator / denominator;
      const intercept = yMean - slope * xMean;
      
      return Array.from({ length: n }, (_, i) => slope * i + intercept);
    }
    
    if (pattern.period > 0) {
      // Generate sinusoidal overlay based on detected period
      const frequency = 2 * Math.PI / pattern.period;
      const amplitude = pattern.strength * (Math.max(...values) - Math.min(...values)) * 0.5;
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      return Array.from({ length: values.length }, (_, i) => 
        mean + amplitude * Math.sin(frequency * i)
      );
    }
    
    return new Array(values.length).fill(0);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#374151'
        }
      }
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'seasonal': return '🔄';
      case 'cyclical': return '🌊';
      case 'trending': return '📈';
      case 'irregular': return '⚡';
      default: return '📊';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600 bg-green-100';
    if (confidence > 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`pattern-recognition bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">🔍 Распознавание паттернов</h3>
          <div className="flex items-center space-x-3">
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm">Анализ...</span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              Найдено: {detectedPatterns.length} паттернов
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Режим:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patterns">Паттерны</option>
              <option value="cycles">Циклы</option>
              <option value="seasonality">Сезонность</option>
              <option value="summary">Сводка</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Паттерн:</label>
            <select
              value={selectedPattern || ''}
              onChange={(e) => setSelectedPattern(e.target.value || null)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все паттерны</option>
              {detectedPatterns.map(pattern => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ height: '350px', padding: '16px' }}>
        <Line data={getChartData()} options={chartOptions} />
      </div>

      {/* Pattern Analysis */}
      <div className="p-4 border-t border-gray-100">
        <h4 className="text-md font-medium text-gray-900 mb-3">Обнаруженные паттерны</h4>
        
        {detectedPatterns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>Значимые паттерны не обнаружены</p>
            <p className="text-sm mt-1">Попробуйте снизить порог доверия или увеличить объем данных</p>
          </div>
        ) : (
          <div className="space-y-3">
            {detectedPatterns.map((pattern, index) => (
              <div
                key={pattern.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPattern === pattern.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{getPatternIcon(pattern.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-medium text-gray-900">{pattern.description}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(pattern.confidence)}`}>
                          {(pattern.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Тип:</span>
                          <div className="font-medium">
                            {pattern.type === 'seasonal' ? 'Сезонный' :
                             pattern.type === 'cyclical' ? 'Циклический' :
                             pattern.type === 'trending' ? 'Трендовый' : 'Нерегулярный'}
                          </div>
                        </div>
                        
                        {pattern.period > 0 && (
                          <div>
                            <span className="text-gray-600">Период:</span>
                            <div className="font-medium">{pattern.period.toFixed(1)} ч</div>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-gray-600">Сила:</span>
                          <div className="font-medium">{(pattern.strength * 100).toFixed(1)}%</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Доверие:</span>
                          <div className="font-medium">{(pattern.confidence * 100).toFixed(1)}%</div>
                        </div>
                      </div>

                      {pattern.peaks.length > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Пики:</span>
                          <span className="ml-2 text-gray-900">{pattern.peaks.length} обнаружено</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">#{index + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternRecognition;