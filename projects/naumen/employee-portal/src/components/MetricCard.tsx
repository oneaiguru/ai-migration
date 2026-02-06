import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  target?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  target,
  trend,
  trendValue,
  icon,
  color = 'blue',
  subtitle,
  onClick,
  className = '',
  size = 'medium'
}) => {
  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    } else if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val % 1 === 0 ? val.toString() : val.toFixed(1);
  };

  const formatTrendValue = (val: number): string => {
    const formatted = Math.abs(val).toFixed(1);
    return trend === 'up' ? `+${formatted}` : trend === 'down' ? `-${formatted}` : formatted;
  };

  const getColorClasses = (colorType: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        text: 'text-blue-900',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        text: 'text-green-900',
        progress: 'bg-green-500'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        text: 'text-orange-900',
        progress: 'bg-orange-500'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        text: 'text-purple-900',
        progress: 'bg-purple-500'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        text: 'text-red-900',
        progress: 'bg-red-500'
      },
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        text: 'text-gray-900',
        progress: 'bg-gray-500'
      }
    };
    return colors[colorType as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          card: 'p-4',
          value: 'text-2xl',
          title: 'text-sm',
          subtitle: 'text-xs',
          icon: 'text-xl'
        };
      case 'large':
        return {
          card: 'p-8',
          value: 'text-4xl',
          title: 'text-lg',
          subtitle: 'text-sm',
          icon: 'text-3xl'
        };
      default: // medium
        return {
          card: 'p-6',
          value: 'text-3xl',
          title: 'text-base',
          subtitle: 'text-sm',
          icon: 'text-2xl'
        };
    }
  };

  const calculateProgress = () => {
    if (!target) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses();
  const progress = calculateProgress();

  return (
    <div
      className={`
        bg-white border rounded-lg shadow-sm transition-all duration-200 
        ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className={sizeClasses.card}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`${colorClasses.icon} ${sizeClasses.icon}`}>
                {icon}
              </div>
            )}
            <h3 className={`font-medium text-gray-700 ${sizeClasses.title}`}>
              {title}
            </h3>
          </div>
          
          {trend && trendValue !== undefined && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              <span className="text-sm">{getTrendIcon()}</span>
              <span className="text-sm font-medium">
                {formatTrendValue(trendValue)}{unit && unit !== '%' ? unit : '%'}
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className={`font-bold ${colorClasses.text} ${sizeClasses.value} leading-none`}>
            {formatValue(value)}
            {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
          </div>
          
          {subtitle && (
            <p className={`text-gray-500 mt-1 ${sizeClasses.subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Progress Bar (if target is provided) */}
        {target && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Цель: {formatValue(target)}{unit}</span>
              <span className={`font-medium ${progress >= 100 ? 'text-green-600' : colorClasses.text}`}>
                {progress.toFixed(0)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress >= 100 ? 'bg-green-500' : colorClasses.progress
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {progress < 50 && (
              <div className="text-xs text-gray-500">
                Осталось: {formatValue(target - value)}{unit}
              </div>
            )}
          </div>
        )}

        {/* Additional Status Indicators */}
        {progress >= 100 && target && (
          <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
            <span>✅</span>
            <span className="font-medium">Цель достигнута!</span>
          </div>
        )}
        
        {progress < 30 && target && (
          <div className="mt-3 flex items-center gap-2 text-orange-600 text-sm">
            <span>⚠️</span>
            <span className="font-medium">Нужно улучшить</span>
          </div>
        )}
      </div>

      {/* Click indicator */}
      {onClick && (
        <div className="px-6 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <span>Кликните для подробностей</span>
            <span className="ml-1">→</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;