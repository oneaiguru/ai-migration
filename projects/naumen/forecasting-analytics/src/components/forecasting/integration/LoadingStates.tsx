// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/LoadingStates.tsx
import React from 'react';
import { Loader2, BarChart3, TrendingUp, Database } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
  className?: string;
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: boolean;
}

interface ChartSkeletonProps {
  type?: 'line' | 'bar' | 'area';
  className?: string;
}

// Basic loading spinner
export const LoadingSpinner: React.FC<LoadingProps> = ({ 
  message = 'Загрузка...', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mb-2`} />
      <p className={`${textSizeClasses[size]} text-gray-600`}>{message}</p>
    </div>
  );
};

// Skeleton component for placeholder content
export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px',
  className = '',
  rounded = false 
}) => {
  return (
    <div 
      className={`
        bg-gray-200 animate-pulse
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

// Dots loading animation
export const LoadingDots: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
};

// Chart skeleton for data visualizations
export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  type = 'line',
  className = '' 
}) => {
  const renderLineChart = () => (
    <div className="space-y-2">
      {/* Y-axis labels */}
      <div className="flex items-end space-x-2 h-32">
        <div className="space-y-2 w-8">
          <Skeleton height="8px" width="30px" />
          <Skeleton height="8px" width="25px" />
          <Skeleton height="8px" width="30px" />
          <Skeleton height="8px" width="20px" />
        </div>
        {/* Chart area */}
        <div className="flex-1 relative">
          <svg viewBox="0 0 300 120" className="w-full h-32">
            {/* Grid lines */}
            {[20, 40, 60, 80, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="300"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            {/* Animated line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points="0,80 50,60 100,40 150,55 200,30 250,45 300,25"
              className="animate-pulse"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} height="8px" width="20px" />
        ))}
      </div>
    </div>
  );

  const renderBarChart = () => (
    <div className="space-y-2">
      <div className="flex items-end space-x-2 h-32">
        <div className="space-y-2 w-8">
          <Skeleton height="8px" width="30px" />
          <Skeleton height="8px" width="25px" />
          <Skeleton height="8px" width="30px" />
          <Skeleton height="8px" width="20px" />
        </div>
        <div className="flex-1 flex items-end justify-between space-x-1">
          {[60, 80, 45, 90, 30, 70, 85, 40].map((height, i) => (
            <div key={i} className="flex-1">
              <Skeleton 
                height={`${height}%`} 
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} height="8px" width="15px" />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`p-4 bg-white rounded-lg border ${className}`}>
      <div className="mb-4">
        <Skeleton height="16px" width="40%" className="mb-2" />
        <Skeleton height="12px" width="60%" />
      </div>
      {type === 'line' ? renderLineChart() : renderBarChart()}
    </div>
  );
};

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  cols?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  cols = 4, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height="16px" width="20%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height="14px" 
              width="20%" 
              className="animate-pulse"
              style={{ animationDelay: `${(rowIndex * cols + colIndex) * 0.05}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-6 bg-white rounded-lg border space-y-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton width="40px" height="40px" rounded />
        <div className="flex-1 space-y-2">
          <Skeleton height="16px" width="60%" />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <Skeleton height="80px" />
      <div className="flex justify-between">
        <Skeleton height="12px" width="30%" />
        <Skeleton height="12px" width="20%" />
      </div>
    </div>
  );
};

// Full page loading
export const FullPageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Загрузка системы прогнозирования...' 
}) => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
          <BarChart3 className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          WFM Система прогнозирования
        </h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <LoadingDots />
      </div>
    </div>
  );
};

// Progress bar component
export const ProgressBar: React.FC<{
  progress: number;
  message?: string;
  className?: string;
}> = ({ progress, message, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">
        {Math.round(progress)}%
      </p>
    </div>
  );
};

// Feature-specific loading states
export const ForecastLoadingState: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600 animate-pulse" />
        <div>
          <Skeleton height="20px" width="200px" className="mb-1" />
          <Skeleton height="14px" width="300px" />
        </div>
      </div>
      
      <ChartSkeleton type="line" />
      
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
};

export const DataImportLoadingState: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="w-6 h-6 text-green-600 animate-pulse" />
        <div>
          <Skeleton height="20px" width="180px" className="mb-1" />
          <Skeleton height="14px" width="250px" />
        </div>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center space-y-4">
          <Skeleton width="80px" height="80px" rounded className="mx-auto" />
          <Skeleton height="16px" width="200px" className="mx-auto" />
          <Skeleton height="12px" width="300px" className="mx-auto" />
        </div>
      </div>
      
      <ProgressBar progress={65} message="Обработка данных..." />
    </div>
  );
};

export default {
  LoadingSpinner,
  Skeleton,
  LoadingDots,
  ChartSkeleton,
  TableSkeleton,
  CardSkeleton,
  FullPageLoading,
  ProgressBar,
  ForecastLoadingState,
  DataImportLoadingState
};
