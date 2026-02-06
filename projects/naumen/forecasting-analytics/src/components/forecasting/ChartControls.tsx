// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/ChartControls.tsx
import React, { useState } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface ChartControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onPanToggle?: (enabled: boolean) => void;
  onExportPNG?: () => void;
  onExportPDF?: () => void;
  onExportData?: () => void;
  onTimeRangeChange?: (range: '1h' | '6h' | '1d' | '3d' | '7d' | 'all') => void;
  onRefresh?: () => void;
  disabled?: boolean;
  loading?: boolean;
  currentTimeRange?: string;
  zoomLevel?: number;
  maxZoom?: number;
  minZoom?: number;
  panEnabled?: boolean;
}

// ========================
// CHART CONTROLS COMPONENT
// ========================

const ChartControls: React.FC<ChartControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPanToggle,
  onExportPNG,
  onExportPDF,
  onExportData,
  onTimeRangeChange,
  onRefresh,
  disabled = false,
  loading = false,
  currentTimeRange = '7d',
  zoomLevel = 1,
  maxZoom = 10,
  minZoom = 0.1,
  panEnabled = false
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeRanges = [
    { value: '1h', label: '1 час' },
    { value: '6h', label: '6 часов' },
    { value: '1d', label: '1 день' },
    { value: '3d', label: '3 дня' },
    { value: '7d', label: '7 дней' },
    { value: 'all', label: 'Весь период' }
  ];

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleExport = (type: 'png' | 'pdf' | 'data') => {
    setShowExportMenu(false);
    switch (type) {
      case 'png':
        onExportPNG?.();
        break;
      case 'pdf':
        onExportPDF?.();
        break;
      case 'data':
        onExportData?.();
        break;
    }
  };

  const canZoomIn = zoomLevel < maxZoom;
  const canZoomOut = zoomLevel > minZoom;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
      {/* Left side - Navigation hints */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>🔍</span>
        <span>Колесо мыши - масштабирование</span>
        <span>•</span>
        <span>Перетаскивание - панорамирование</span>
        {panEnabled && (
          <>
            <span>•</span>
            <span className="text-blue-600 font-medium">Панорамирование включено</span>
          </>
        )}
      </div>
      
      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 mr-4">
          <span className="text-sm text-gray-600 mr-2">Период:</span>
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onTimeRangeChange?.(range.value as any)}
              disabled={disabled || loading}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                currentTimeRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={onZoomOut}
            disabled={disabled || loading || !canZoomOut}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Уменьшить масштаб"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <span className="text-xs text-gray-500 px-2 min-w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          
          <button
            onClick={onZoomIn}
            disabled={disabled || loading || !canZoomIn}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Увеличить масштаб"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>

        {/* Pan Toggle */}
        <button
          onClick={() => onPanToggle?.(!panEnabled)}
          disabled={disabled || loading}
          className={`p-1 transition-colors ${
            panEnabled 
              ? 'text-blue-600 hover:text-blue-700' 
              : 'text-gray-600 hover:text-gray-900'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={panEnabled ? 'Отключить панорамирование' : 'Включить панорамирование'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
        </button>

        {/* Reset Zoom */}
        <button
          onClick={onResetZoom}
          disabled={disabled || loading || zoomLevel === 1}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Сбросить масштаб"
        >
          🔄 Сбросить масштаб
        </button>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={disabled || loading || isRefreshing}
          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Обновить данные"
        >
          <svg 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={disabled || loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            📸 Экспорт
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => handleExport('png')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                🖼️ Экспорт PNG
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                📄 Экспорт PDF
              </button>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={() => handleExport('data')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                📊 Экспорт данных
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default ChartControls;