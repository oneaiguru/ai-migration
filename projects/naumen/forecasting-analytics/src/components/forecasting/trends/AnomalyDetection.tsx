// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/AnomalyDetection.tsx
// AnomalyDetection.tsx - Smart anomaly identification with alerts

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import { AnomalyEvent, TrendDataPoint, TrendAnalysisConfig } from '../../../types/trends';

interface AnomalyDetectionProps {
  data: TrendDataPoint[];
  config: TrendAnalysisConfig;
  onAnomalyDetected?: (anomaly: AnomalyEvent) => void;
  className?: string;
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  data,
  config,
  onAnomalyDetected,
  className = ''
}) => {
  const [detectedAnomalies, setDetectedAnomalies] = useState<AnomalyEvent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnomalyType, setSelectedAnomalyType] = useState<string>('all');
  const [sensitivityLevel, setSensitivityLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Statistical thresholds based on sensitivity
  const getThresholds = (sensitivity: 'low' | 'medium' | 'high') => {
    const thresholds = {
      low: { zscore: 2.5, iqr: 2.0, percentile: 0.05 },
      medium: { zscore: 2.0, iqr: 1.5, percentile: 0.1 },
      high: { zscore: 1.5, iqr: 1.0, percentile: 0.15 }
    };
    return thresholds[sensitivity];
  };

  // Calculate statistical measures
  const calculateStatistics = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    return { mean, stdDev, q1, q3, iqr, sorted };
  };

  // Z-Score based anomaly detection
  const detectZScoreAnomalies = (data: TrendDataPoint[]): AnomalyEvent[] => {
    const values = data.map(d => d.value);
    const { mean, stdDev } = calculateStatistics(values);
    const threshold = getThresholds(sensitivityLevel).zscore;
    const anomalies: AnomalyEvent[] = [];

    data.forEach((point, index) => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      
      if (zScore > threshold) {
        const severity = zScore > 3 ? 'critical' : zScore > 2.5 ? 'high' : 'medium';
        const type = point.value > mean ? 'spike' : 'drop';
        
        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          expectedValue: mean,
          severity,
          type,
          explanation: `Z-Score: ${zScore.toFixed(2)} (threshold: ${threshold})`,
          confidence: Math.min(0.99, zScore / 3),
          impact: type === 'spike' ? 'positive' : 'negative',
          actionRequired: severity === 'critical'
        });
      }
    });

    return anomalies;
  };

  // IQR (Interquartile Range) based anomaly detection
  const detectIQRAnomalies = (data: TrendDataPoint[]): AnomalyEvent[] => {
    const values = data.map(d => d.value);
    const { q1, q3, iqr } = calculateStatistics(values);
    const multiplier = getThresholds(sensitivityLevel).iqr;
    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;
    const anomalies: AnomalyEvent[] = [];

    data.forEach(point => {
      if (point.value < lowerBound || point.value > upperBound) {
        const severity = point.value < q1 - 3 * iqr || point.value > q3 + 3 * iqr ? 'critical' : 'medium';
        const type = point.value > upperBound ? 'spike' : 'drop';
        
        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          expectedValue: (q1 + q3) / 2,
          severity,
          type,
          explanation: `IQR outlier: ${point.value.toFixed(1)} (bounds: ${lowerBound.toFixed(1)} - ${upperBound.toFixed(1)})`,
          confidence: 0.85,
          impact: type === 'spike' ? 'positive' : 'negative',
          actionRequired: severity === 'critical'
        });
      }
    });

    return anomalies;
  };

  // Trend shift detection using moving averages
  const detectTrendShifts = (data: TrendDataPoint[]): AnomalyEvent[] => {
    const anomalies: AnomalyEvent[] = [];
    const windowSize = 12; // 12-hour window
    
    if (data.length < windowSize * 2) return anomalies;

    for (let i = windowSize; i < data.length - windowSize; i++) {
      const beforeWindow = data.slice(i - windowSize, i).map(d => d.value);
      const afterWindow = data.slice(i, i + windowSize).map(d => d.value);
      
      const beforeMean = beforeWindow.reduce((sum, val) => sum + val, 0) / beforeWindow.length;
      const afterMean = afterWindow.reduce((sum, val) => sum + val, 0) / afterWindow.length;
      
      const percentChange = Math.abs((afterMean - beforeMean) / beforeMean) * 100;
      
      if (percentChange > 25) { // 25% threshold for trend shift
        const severity = percentChange > 50 ? 'critical' : 'high';
        
        anomalies.push({
          timestamp: data[i].timestamp,
          value: afterMean,
          expectedValue: beforeMean,
          severity,
          type: 'shift',
          explanation: `Trend shift detected: ${percentChange.toFixed(1)}% change in moving average`,
          confidence: Math.min(0.95, percentChange / 100),
          impact: afterMean > beforeMean ? 'positive' : 'negative',
          actionRequired: severity === 'critical'
        });
      }
    }

    return anomalies;
  };

  // Main anomaly detection function
  const detectAnomalies = useMemo(() => {
    if (data.length < 10) return []; // Need minimum data points

    setIsAnalyzing(true);
    
    const allAnomalies: AnomalyEvent[] = [];
    
    // Apply different detection algorithms
    if (config.algorithms.anomaly === 'statistical') {
      allAnomalies.push(...detectZScoreAnomalies(data));
      allAnomalies.push(...detectIQRAnomalies(data));
    }
    
    allAnomalies.push(...detectTrendShifts(data));
    
    // Remove duplicates and sort by timestamp
    const uniqueAnomalies = allAnomalies.filter((anomaly, index, self) =>
      index === self.findIndex(a => 
        Math.abs(a.timestamp.getTime() - anomaly.timestamp.getTime()) < 3600000 // 1 hour window
      )
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    setIsAnalyzing(false);
    return uniqueAnomalies;
  }, [data, config, sensitivityLevel]);

  useEffect(() => {
    setDetectedAnomalies(detectAnomalies);
    
    // Notify about new critical anomalies
    const criticalAnomalies = detectAnomalies.filter(a => a.severity === 'critical');
    criticalAnomalies.forEach(anomaly => {
      if (onAnomalyDetected) {
        onAnomalyDetected(anomaly);
      }
    });
  }, [detectAnomalies, onAnomalyDetected]);

  // Filter anomalies by selected type
  const filteredAnomalies = useMemo(() => {
    if (selectedAnomalyType === 'all') return detectedAnomalies;
    return detectedAnomalies.filter(a => a.type === selectedAnomalyType);
  }, [detectedAnomalies, selectedAnomalyType]);

  // Chart data with anomalies highlighted
  const chartData = {
    labels: data.map(d => d.timestamp),
    datasets: [
      {
        label: 'Данные',
        data: data.map(d => d.value),
        borderColor: '#77828C',
        backgroundColor: '#77828C',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1
      },
      {
        label: 'Аномалии',
        data: data.map(d => {
          const anomaly = filteredAnomalies.find(a => 
            Math.abs(a.timestamp.getTime() - d.timestamp.getTime()) < 1800000 // 30 min window
          );
          return anomaly ? d.value : null;
        }),
        borderColor: '#DC2911',
        backgroundColor: '#DC2911',
        borderWidth: 0,
        pointRadius: filteredAnomalies.map((_, i) => 6),
        pointHoverRadius: 8,
        showLine: false,
        pointStyle: 'triangle'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 1) {
              const anomaly = filteredAnomalies[context.dataIndex];
              if (anomaly) {
                return [
                  `Аномалия: ${anomaly.type}`,
                  `Значение: ${anomaly.value}`,
                  `Ожидаемое: ${anomaly.expectedValue.toFixed(1)}`,
                  `Серьезность: ${anomaly.severity}`,
                  anomaly.explanation
                ];
              }
            }
            return `Значение: ${context.parsed.y}`;
          }
        }
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike': return '📈';
      case 'drop': return '📉';
      case 'shift': return '🔄';
      case 'outlier': return '⚠️';
      default: return '🔍';
    }
  };

  return (
    <div className={`anomaly-detection bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">🚨 Обнаружение аномалий</h3>
          <div className="flex items-center space-x-3">
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm">Анализ...</span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              Найдено: {filteredAnomalies.length} аномалий
            </span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Тип:</label>
            <select
              value={selectedAnomalyType}
              onChange={(e) => setSelectedAnomalyType(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все</option>
              <option value="spike">Всплески</option>
              <option value="drop">Провалы</option>
              <option value="shift">Сдвиги</option>
              <option value="outlier">Выбросы</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Чувствительность:</label>
            <select
              value={sensitivityLevel}
              onChange={(e) => setSensitivityLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Низкая</option>
              <option value="medium">Средняя</option>
              <option value="high">Высокая</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomaly Chart */}
      <div className="chart-container" style={{ height: '300px', padding: '16px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Anomaly List */}
      <div className="anomaly-list p-4 border-t border-gray-100">
        <h4 className="text-md font-medium text-gray-900 mb-3">Обнаруженные аномалии</h4>
        
        {filteredAnomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>Аномалии не обнаружены</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filteredAnomalies.map((anomaly, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getTypeIcon(anomaly.type)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {anomaly.type === 'spike' ? 'Всплеск' :
                           anomaly.type === 'drop' ? 'Провал' :
                           anomaly.type === 'shift' ? 'Сдвиг тренда' : 'Выброс'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity === 'critical' ? 'Критично' :
                           anomaly.severity === 'high' ? 'Высокий' :
                           anomaly.severity === 'medium' ? 'Средний' : 'Низкий'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {anomaly.timestamp.toLocaleString('ru-RU')}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Значение: {anomaly.value} (ожидалось: {anomaly.expectedValue.toFixed(1)})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {anomaly.explanation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {(anomaly.confidence * 100).toFixed(0)}%
                    </span>
                    {anomaly.actionRequired && (
                      <button className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                        Действие
                      </button>
                    )}
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

export default AnomalyDetection;