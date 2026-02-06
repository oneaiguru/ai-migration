// TrendAlert.tsx - Smart notifications for significant trend changes

import React, { useState, useMemo } from 'react';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, X, Check, Clock } from 'lucide-react';
import { TrendAlert as TrendAlertType } from '../../../types/anomalies';
import { TimeSeriesData } from '../../../types/trends';

interface TrendAlertProps {
  data: TimeSeriesData[];
  onAlertAcknowledge?: (alertId: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  enableRealTime?: boolean;
  alertThresholds?: {
    trendChange: number;     // percentage change to trigger alert
    anomalyDeviation: number; // standard deviations
    patternBreak: number;    // confidence threshold
  };
  className?: string;
}

const TrendAlert: React.FC<TrendAlertProps> = ({
  data,
  onAlertAcknowledge,
  onAlertDismiss,
  enableRealTime = true,
  alertThresholds = {
    trendChange: 15,      // 15% change
    anomalyDeviation: 2,  // 2 standard deviations
    patternBreak: 0.7     // 70% confidence
  },
  className = ''
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  // Generate trend alerts based on data analysis
  const alerts = useMemo((): TrendAlertType[] => {
    if (data.length < 10) return [];
    
    const alerts: TrendAlertType[] = [];
    const values = data.map(d => d.value);
    const recentValues = values.slice(-7); // Last 7 points
    const earlierValues = values.slice(-14, -7); // Previous 7 points
    
    if (recentValues.length === 0 || earlierValues.length === 0) return [];
    
    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const earlierAvg = earlierValues.reduce((sum, val) => sum + val, 0) / earlierValues.length;
    const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    // Trend change alert
    if (Math.abs(changePercent) > alertThresholds.trendChange) {
      alerts.push({
        id: 'trend-change-' + Date.now(),
        type: 'trend_change',
        severity: Math.abs(changePercent) > 30 ? 'critical' : 
                 Math.abs(changePercent) > 20 ? 'high' : 'medium',
        message: `Значительное изменение тренда: ${changePercent > 0 ? 'рост' : 'снижение'} на ${Math.abs(changePercent).toFixed(1)}%`,
        timestamp: new Date(),
        affectedMetric: 'volume',
        currentValue: recentAvg,
        expectedValue: earlierAvg,
        actionRequired: Math.abs(changePercent) > 25,
        recommendations: changePercent > 0 ? [
          'Проверить причины роста нагрузки',
          'Подготовить дополнительные ресурсы',
          'Уведомить руководство'
        ] : [
          'Исследовать причины снижения',
          'Проверить качество обслуживания',
          'Рассмотреть корректирующие меры'
        ],
        acknowledged: false
      });
    }
    
    // Anomaly detection alert
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const latestValue = values[values.length - 1];
    const deviations = Math.abs(latestValue - mean) / stdDev;
    
    if (deviations > alertThresholds.anomalyDeviation) {
      alerts.push({
        id: 'anomaly-' + Date.now(),
        type: 'anomaly_detected',
        severity: deviations > 4 ? 'critical' : 
                 deviations > 3 ? 'high' : 'medium',
        message: `Обнаружена аномалия: значение ${latestValue.toFixed(2)} отклоняется на ${deviations.toFixed(1)} стандартных отклонений`,
        timestamp: new Date(),
        affectedMetric: 'volume',
        currentValue: latestValue,
        expectedValue: mean,
        actionRequired: deviations > 3,
        recommendations: [
          'Проверить качество данных',
          'Исследовать внешние факторы',
          'Рассмотреть корректировку прогноза'
        ],
        acknowledged: false
      });
    }
    
    // Pattern break alert (simplified)
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    if (!isWeekend && latestValue < mean * 0.7) {
      alerts.push({
        id: 'pattern-break-' + Date.now(),
        type: 'pattern_break',
        severity: 'medium',
        message: 'Нарушение обычного паттерна: низкая активность в рабочий день',
        timestamp: new Date(),
        affectedMetric: 'volume',
        currentValue: latestValue,
        expectedValue: mean,
        actionRequired: true,
        recommendations: [
          'Проверить работу системы',
          'Убедиться в отсутствии технических проблем',
          'Связаться с операционной командой'
        ],
        acknowledged: false
      });
    }
    
    return alerts.filter(alert => !dismissedAlerts.has(alert.id));
  }, [data, alertThresholds, dismissedAlerts]);

  // Get alert display properties
  const getAlertDisplay = (alert: TrendAlertType) => {
    const base = {
      trend_change: {
        icon: alert.currentValue > (alert.expectedValue || 0) ? TrendingUp : TrendingDown,
        color: alert.currentValue > (alert.expectedValue || 0) ? 'text-green-600' : 'text-red-600',
        bgColor: alert.currentValue > (alert.expectedValue || 0) ? 'bg-green-50' : 'bg-red-50',
        borderColor: alert.currentValue > (alert.expectedValue || 0) ? 'border-green-200' : 'border-red-200',
        title: 'Изменение тренда'
      },
      anomaly_detected: {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: 'Аномалия'
      },
      pattern_break: {
        icon: AlertTriangle,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        title: 'Нарушение паттерна'
      },
      seasonal_shift: {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Сезонный сдвиг'
      }
    };
    
    return base[alert.type] || base.anomaly_detected;
  };

  // Get severity display
  const getSeverityDisplay = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { label: 'Критический', color: 'text-red-600 bg-red-100' };
      case 'high':
        return { label: 'Высокий', color: 'text-orange-600 bg-orange-100' };
      case 'medium':
        return { label: 'Средний', color: 'text-yellow-600 bg-yellow-100' };
      case 'low':
        return { label: 'Низкий', color: 'text-blue-600 bg-blue-100' };
      default:
        return { label: severity, color: 'text-gray-600 bg-gray-100' };
    }
  };

  // Handle alert actions
  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    onAlertAcknowledge?.(alertId);
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    onAlertDismiss?.(alertId);
  };

  // Filter alerts by acknowledgment status
  const unacknowledgedAlerts = alerts.filter(alert => !acknowledgedAlerts.has(alert.id));
  const acknowledgedAlertsList = alerts.filter(alert => acknowledgedAlerts.has(alert.id));

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Уведомления о трендах</h3>
              <p className="text-sm text-gray-600">
                {unacknowledgedAlerts.length} активных уведомлений
              </p>
            </div>
          </div>

          {enableRealTime && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Реальное время
            </div>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="p-4">
        {unacknowledgedAlerts.length > 0 ? (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-gray-900">Активные уведомления</h4>
            {unacknowledgedAlerts.map((alert) => {
              const display = getAlertDisplay(alert);
              const severity = getSeverityDisplay(alert.severity);
              const IconComponent = display.icon;
              
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${display.bgColor} ${display.borderColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${display.color}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{display.title}</span>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${severity.color}`}>
                            {severity.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString('ru-RU')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">
                          {alert.message}
                        </p>
                        
                        {alert.recommendations.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Рекомендации:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {alert.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Текущее: <strong>{alert.currentValue.toFixed(2)}</strong></span>
                          {alert.expectedValue && (
                            <span>Ожидалось: <strong>{alert.expectedValue.toFixed(2)}</strong></span>
                          )}
                          {alert.actionRequired && (
                            <span className="text-red-600 font-medium">⚠️ Требуется действие</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                        title="Подтвердить"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                        title="Отклонить"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-lg font-medium">Нет активных уведомлений</p>
            <p className="text-sm">Все тренды в пределах нормы</p>
          </div>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedAlertsList.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Подтвержденные уведомления</h4>
            {acknowledgedAlertsList.slice(0, 3).map((alert) => {
              const display = getAlertDisplay(alert);
              const severity = getSeverityDisplay(alert.severity);
              const IconComponent = display.icon;
              
              return (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{display.title}</span>
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString('ru-RU')}
                          </span>
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {acknowledgedAlertsList.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                Показано 3 из {acknowledgedAlertsList.length} подтвержденных уведомлений
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendAlert;
