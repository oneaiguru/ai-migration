// ConfidenceIndicator.tsx - Statistical Confidence Visualization

import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AccuracyMetrics } from '../../../types/accuracy';

interface ConfidenceIndicatorProps {
  metrics: AccuracyMetrics;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  metrics,
  showDetails = true,
  size = 'md',
  className = ''
}) => {
  // Calculate confidence level status
  const getConfidenceStatus = (level: number) => {
    if (level >= 95) return 'high';
    if (level >= 85) return 'medium';
    return 'low';
  };

  // Get confidence colors
  const getConfidenceColors = (status: string) => {
    switch (status) {
      case 'high': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600'
      };
      case 'medium': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600'
      };
      case 'low': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600'
      };
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600'
      };
    }
  };

  // Get size classes
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return {
        container: 'p-3',
        text: 'text-sm',
        value: 'text-lg',
        icon: 'w-4 h-4'
      };
      case 'lg': return {
        container: 'p-6',
        text: 'text-base',
        value: 'text-3xl',
        icon: 'w-6 h-6'
      };
      default: return {
        container: 'p-4',
        text: 'text-sm',
        value: 'text-2xl',
        icon: 'w-5 h-5'
      };
    }
  };

  const confidenceLevel = metrics.confidenceInterval.level;
  const status = getConfidenceStatus(confidenceLevel);
  const colors = getConfidenceColors(status);
  const sizes = getSizeClasses(size);

  // Get status icon
  const getStatusIcon = (status: string) => {
    const iconProps = { className: `${sizes.icon} ${colors.icon}` };
    
    switch (status) {
      case 'high': return <CheckCircle {...iconProps} />;
      case 'medium': return <Shield {...iconProps} />;
      case 'low': return <AlertTriangle {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'high': return 'Высокая надежность';
      case 'medium': return 'Средняя надежность';
      case 'low': return 'Низкая надежность';
      default: return 'Неопределенная надежность';
    }
  };

  // Calculate margin of error
  const marginOfError = (metrics.confidenceInterval.upper - metrics.confidenceInterval.lower) / 2;
  const relativeMargin = (marginOfError / Math.abs(metrics.mape)) * 100;

  return (
    <div className={`rounded-lg border ${colors.bg} ${colors.border} ${sizes.container} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <div>
            <div className={`font-medium ${colors.text} ${sizes.text}`}>
              Доверительный интервал
            </div>
            <div className={`text-xs ${colors.text} opacity-80`}>
              {getStatusLabel(status)}
            </div>
          </div>
        </div>
        
        <div className={`${sizes.value} font-bold ${colors.text}`}>
          {confidenceLevel}%
        </div>
      </div>

      {/* Confidence Interval Visualization */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Нижняя граница</span>
          <span>Текущее значение</span>
          <span>Верхняя граница</span>
        </div>
        
        <div className="relative bg-gray-200 rounded-full h-2">
          {/* Confidence band */}
          <div
            className="absolute bg-blue-300 rounded-full h-2"
            style={{
              left: '10%',
              width: '80%'
            }}
          ></div>
          
          {/* Current value indicator */}
          <div
            className="absolute w-3 h-3 bg-blue-600 rounded-full border-2 border-white transform -translate-y-0.5"
            style={{ left: '50%', marginLeft: '-6px' }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
          <span>{metrics.confidenceInterval.lower.toFixed(2)}</span>
          <span className="font-medium">{metrics.mape.toFixed(2)}</span>
          <span>{metrics.confidenceInterval.upper.toFixed(2)}</span>
        </div>
      </div>

      {/* Statistical Details */}
      {showDetails && (
        <div className="space-y-2 pt-3 border-t border-current border-opacity-20">
          <div className="flex justify-between items-center text-xs">
            <span className={colors.text}>Погрешность:</span>
            <span className={`font-medium ${colors.text}`}>
              ±{marginOfError.toFixed(2)} ({relativeMargin.toFixed(1)}%)
            </span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className={colors.text}>p-значение:</span>
            <span className={`font-medium ${colors.text}`}>
              {metrics.pValue.toFixed(4)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className={colors.text}>Размер выборки:</span>
            <span className={`font-medium ${colors.text}`}>
              {metrics.sampleSize} точек
            </span>
          </div>
          
          {/* Significance indicator */}
          <div className="flex justify-between items-center text-xs">
            <span className={colors.text}>Значимость:</span>
            <span className={`font-medium ${
              metrics.pValue < 0.05 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.pValue < 0.05 ? '✓ Значимо' : '✗ Не значимо'}
            </span>
          </div>
        </div>
      )}

      {/* Quick interpretation */}
      {showDetails && (
        <div className={`mt-3 p-2 rounded text-xs ${colors.bg} ${colors.text} opacity-90`}>
          {status === 'high' && 
            "Высокая статистическая надежность. Результаты можно считать достоверными."
          }
          {status === 'medium' && 
            "Умеренная надежность. Рекомендуется увеличить объем данных."
          }
          {status === 'low' && 
            "Низкая надежность. Необходимо больше данных для точной оценки."
          }
        </div>
      )}
    </div>
  );
};

export default ConfidenceIndicator;
