// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/ChartTooltip.tsx
import React, { useState, useEffect, useRef } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface TooltipDataPoint {
  label: string;
  value: number;
  color: string;
  dataset: string;
  confidence?: number;
  actual?: number;
  predicted?: number;
  adjustment?: number;
  requiredAgents?: number;
  isWeekend?: boolean;
  hour?: number;
}

interface TooltipPosition {
  x: number;
  y: number;
}

interface ChartTooltipProps {
  visible: boolean;
  position: TooltipPosition;
  dataPoints: TooltipDataPoint[];
  timestamp?: string;
  onClose?: () => void;
  showDetails?: boolean;
  theme?: 'light' | 'dark';
}

// ========================
// CHART TOOLTIP COMPONENT
// ========================

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  visible,
  position,
  dataPoints,
  timestamp,
  onClose,
  showDetails = true,
  theme = 'light'
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust tooltip position to stay within viewport
  useEffect(() => {
    if (!visible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    // Adjust horizontal position
    if (position.x + rect.width > viewportWidth - 20) {
      newX = position.x - rect.width - 10;
    }

    // Adjust vertical position  
    if (position.y + rect.height > viewportHeight - 20) {
      newY = position.y - rect.height - 10;
    }

    // Ensure tooltip doesn't go off-screen
    newX = Math.max(10, newX);
    newY = Math.max(10, newY);

    setAdjustedPosition({ x: newX, y: newY });
  }, [visible, position, dataPoints]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    });
  };

  const formatValue = (value: number): string => {
    return Math.round(value).toLocaleString('ru');
  };

  const getVarianceColor = (actual: number, predicted: number): string => {
    const variance = ((actual - predicted) / predicted) * 100;
    if (Math.abs(variance) <= 5) return 'text-green-600';
    if (Math.abs(variance) <= 15) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVarianceText = (actual: number, predicted: number): string => {
    const variance = ((actual - predicted) / predicted) * 100;
    const sign = variance >= 0 ? '+' : '';
    return `${sign}${variance.toFixed(1)}%`;
  };

  if (!visible || dataPoints.length === 0) return null;

  const primaryDataPoint = dataPoints[0];
  const hasMultipleDatasets = dataPoints.length > 1;

  return (
    <>
      {/* Backdrop for mobile */}
      {visible && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-20" 
          onClick={onClose}
        />
      )}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 max-w-sm rounded-lg shadow-xl border transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-600 text-white'
            : 'bg-white border-gray-200 text-gray-900'
        } ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          transform: 'translate(10px, -50%)'
        }}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {timestamp ? formatTimestamp(timestamp) : primaryDataPoint.label}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className={`text-gray-400 hover:text-gray-600 transition-colors ${
                  theme === 'dark' ? 'hover:text-gray-300' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {primaryDataPoint.isWeekend && (
            <div className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
            }`}>
              📅 Выходной день
            </div>
          )}
        </div>

        {/* Data Points */}
        <div className="px-4 py-3 space-y-3">
          {dataPoints.map((point, index) => (
            <div key={index} className="space-y-2">
              {/* Dataset name and value */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: point.color }}
                  />
                  <span className="text-sm font-medium">{point.dataset}</span>
                </div>
                <span className="text-lg font-bold" style={{ color: point.color }}>
                  {formatValue(point.value)}
                </span>
              </div>

              {/* Additional details */}
              {showDetails && (
                <div className={`text-xs space-y-1 pl-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {point.confidence !== undefined && (
                    <div className="flex justify-between">
                      <span>Уверенность:</span>
                      <span className="font-medium">{(point.confidence * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  
                  {point.actual !== undefined && point.predicted !== undefined && (
                    <div className="flex justify-between">
                      <span>Отклонение:</span>
                      <span className={`font-medium ${getVarianceColor(point.actual, point.predicted)}`}>
                        {getVarianceText(point.actual, point.predicted)}
                      </span>
                    </div>
                  )}
                  
                  {point.adjustment !== undefined && point.adjustment !== 0 && (
                    <div className="flex justify-between">
                      <span>Корректировка:</span>
                      <span className={`font-medium ${
                        point.adjustment > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {point.adjustment > 0 ? '+' : ''}{formatValue(point.adjustment)}
                      </span>
                    </div>
                  )}
                  
                  {point.requiredAgents !== undefined && (
                    <div className="flex justify-between">
                      <span>Требуется агентов:</span>
                      <span className="font-medium text-blue-600">{formatValue(point.requiredAgents)}</span>
                    </div>
                  )}

                  {point.hour !== undefined && (
                    <div className="flex justify-between">
                      <span>Час:</span>
                      <span className="font-medium">{point.hour}:00</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary for multiple datasets */}
        {hasMultipleDatasets && showDetails && (
          <div className={`px-4 py-3 border-t ${
            theme === 'dark' ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Общий объем:
                </span>
                <span className="font-medium">
                  {formatValue(dataPoints.reduce((sum, point) => sum + point.value, 0))}
                </span>
              </div>
              
              {dataPoints.some(p => p.requiredAgents) && (
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Всего агентов:
                  </span>
                  <span className="font-medium text-blue-600">
                    {formatValue(dataPoints.reduce((sum, point) => sum + (point.requiredAgents || 0), 0))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {showDetails && (
          <div className={`px-4 py-3 border-t ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className="flex gap-2">
              <button className={`px-2 py-1 text-xs rounded transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}>
                📋 Детали
              </button>
              <button className={`px-2 py-1 text-xs rounded transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-700 hover:bg-blue-600 text-white'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }`}>
                ✏️ Изменить
              </button>
            </div>
          </div>
        )}

        {/* Arrow pointer */}
        <div 
          className={`absolute w-3 h-3 transform rotate-45 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          } border-l border-t`}
          style={{
            left: '-6px',
            top: '50%',
            marginTop: '-6px'
          }}
        />
      </div>
    </>
  );
};

// ========================
// HOOK FOR TOOLTIP MANAGEMENT
// ========================

export const useChartTooltip = () => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    position: TooltipPosition;
    dataPoints: TooltipDataPoint[];
    timestamp?: string;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    dataPoints: [],
    timestamp: undefined
  });

  const showTooltip = (
    position: TooltipPosition,
    dataPoints: TooltipDataPoint[],
    timestamp?: string
  ) => {
    setTooltip({
      visible: true,
      position,
      dataPoints,
      timestamp
    });
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const updateTooltipPosition = (position: TooltipPosition) => {
    setTooltip(prev => ({ ...prev, position }));
  };

  return {
    tooltip,
    showTooltip,
    hideTooltip,
    updateTooltipPosition
  };
};

export default ChartTooltip;