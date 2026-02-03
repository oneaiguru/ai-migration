// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/ChartLegend.tsx
import React, { useState } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface LegendItem {
  id: string;
  label: string;
  color: string;
  borderColor?: string;
  style: 'solid' | 'dashed' | 'dotted' | 'area';
  visible: boolean;
  datasetIndex: number;
  stats?: {
    min?: number;
    max?: number;
    avg?: number;
    total?: number;
    count?: number;
  };
  description?: string;
  icon?: string;
}

interface ChartLegendProps {
  items: LegendItem[];
  onToggleItem: (itemId: string, visible: boolean) => void;
  onToggleAll?: (visible: boolean) => void;
  layout?: 'horizontal' | 'vertical';
  showStats?: boolean;
  showToggleAll?: boolean;
  compactMode?: boolean;
  className?: string;
}

// ========================
// CHART LEGEND COMPONENT
// ========================

const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  onToggleItem,
  onToggleAll,
  layout = 'horizontal',
  showStats = true,
  showToggleAll = true,
  compactMode = false,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const visibleItems = items.filter(item => item.visible);
  const allVisible = visibleItems.length === items.length;
  const someVisible = visibleItems.length > 0;

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    const newVisibility = !allVisible;
    onToggleAll?.(newVisibility);
  };

  const getStyleElement = (item: LegendItem) => {
    const baseClass = "inline-block";
    
    switch (item.style) {
      case 'solid':
        return (
          <div 
            className={`${baseClass} w-4 h-0.5 rounded`}
            style={{ backgroundColor: item.color }}
          />
        );
      case 'dashed':
        return (
          <svg className={`${baseClass} w-4 h-2`} viewBox="0 0 16 8">
            <line
              x1="0" y1="4" x2="16" y2="4"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray="2,2"
            />
          </svg>
        );
      case 'dotted':
        return (
          <svg className={`${baseClass} w-4 h-2`} viewBox="0 0 16 8">
            <line
              x1="0" y1="4" x2="16" y2="4"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray="1,1"
            />
          </svg>
        );
      case 'area':
        return (
          <div 
            className={`${baseClass} w-4 h-3 rounded border`}
            style={{ 
              backgroundColor: item.color + '30',
              borderColor: item.borderColor || item.color 
            }}
          />
        );
      default:
        return (
          <div 
            className={`${baseClass} w-3 h-3 rounded-full border-2 border-white shadow-sm`}
            style={{ backgroundColor: item.color }}
          />
        );
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toLocaleString('ru');
  };

  const renderLegendItem = (item: LegendItem) => {
    const isExpanded = expandedItems.has(item.id);
    const isHovered = hoveredItem === item.id;
    const hasStats = item.stats && showStats && !compactMode;

    return (
      <div
        key={item.id}
        className={`legend-item ${
          layout === 'vertical' ? 'mb-2' : 'mr-4 mb-2'
        } ${!item.visible ? 'opacity-50' : ''} transition-all duration-200`}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex items-center gap-2">
          {/* Toggle checkbox */}
          <button
            onClick={() => onToggleItem(item.id, !item.visible)}
            className={`flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1 transition-colors ${
              isHovered ? 'bg-gray-50' : ''
            }`}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={item.visible}
                onChange={() => {}} // Handled by button click
                className="sr-only"
              />
              <div className={`w-4 h-4 border rounded transition-colors ${
                item.visible 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-300 bg-white'
              }`}>
                {item.visible && (
                  <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Style indicator */}
            <div className="flex items-center">
              {getStyleElement(item)}
            </div>

            {/* Label */}
            <span className={`text-sm font-medium ${
              item.visible ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </span>
          </button>

          {/* Expand/collapse stats */}
          {hasStats && (
            <button
              onClick={() => toggleItemExpansion(item.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg 
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Expanded stats */}
        {hasStats && isExpanded && (
          <div className="mt-2 ml-8 p-2 bg-gray-50 rounded text-xs">
            <div className="grid grid-cols-2 gap-2">
              {item.stats?.min !== undefined && (
                <div>
                  <span className="text-gray-600">Мин:</span>
                  <span className="ml-1 font-medium">{formatNumber(item.stats.min)}</span>
                </div>
              )}
              {item.stats?.max !== undefined && (
                <div>
                  <span className="text-gray-600">Макс:</span>
                  <span className="ml-1 font-medium">{formatNumber(item.stats.max)}</span>
                </div>
              )}
              {item.stats?.avg !== undefined && (
                <div>
                  <span className="text-gray-600">Среднее:</span>
                  <span className="ml-1 font-medium">{formatNumber(item.stats.avg)}</span>
                </div>
              )}
              {item.stats?.total !== undefined && (
                <div>
                  <span className="text-gray-600">Сумма:</span>
                  <span className="ml-1 font-medium">{formatNumber(item.stats.total)}</span>
                </div>
              )}
            </div>
            {item.description && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-gray-600">
                {item.description}
              </div>
            )}
          </div>
        )}

        {/* Compact stats inline */}
        {compactMode && item.stats && item.visible && (
          <div className="ml-2 text-xs text-gray-500">
            {item.stats.avg !== undefined && `Ср: ${formatNumber(item.stats.avg)}`}
            {item.stats.max !== undefined && ` Макс: ${formatNumber(item.stats.max)}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`chart-legend ${className}`}>
      {/* Header with toggle all */}
      {showToggleAll && items.length > 1 && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Легенда</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {visibleItems.length} из {items.length} видимы
            </span>
            <button
              onClick={handleToggleAll}
              className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {allVisible ? 'Скрыть все' : 'Показать все'}
            </button>
          </div>
        </div>
      )}

      {/* Legend items */}
      <div className={`legend-items ${
        layout === 'vertical' ? 'space-y-1' : 'flex flex-wrap'
      }`}>
        {items.map(renderLegendItem)}
      </div>

      {/* Summary stats */}
      {showStats && !compactMode && visibleItems.length > 1 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Сводка по видимым данным</h5>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="font-medium text-blue-600">
                {formatNumber(
                  visibleItems.reduce((sum, item) => sum + (item.stats?.total || 0), 0)
                )}
              </div>
              <div className="text-gray-600">Общий объем</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">
                {formatNumber(
                  visibleItems.reduce((sum, item) => sum + (item.stats?.avg || 0), 0) / visibleItems.length
                )}
              </div>
              <div className="text-gray-600">Среднее</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600">
                {Math.max(...visibleItems.map(item => item.stats?.max || 0))}
              </div>
              <div className="text-gray-600">Пик</div>
            </div>
          </div>
        </div>
      )}

      {/* No visible items warning */}
      {!someVisible && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Все серии данных скрыты. Выберите хотя бы одну для отображения.
        </div>
      )}
    </div>
  );
};

// ========================
// PRESET LEGEND CONFIGS
// ========================

export const createForecastLegend = (
  forecastVisible: boolean = true,
  actualVisible: boolean = true,
  confidenceVisible: boolean = true,
  agentsVisible: boolean = false
): LegendItem[] => [
  {
    id: 'actual',
    label: 'Факт',
    color: '#3B82F6',
    style: 'solid',
    visible: actualVisible,
    datasetIndex: 0,
    icon: '📊',
    description: 'Фактическое количество звонков'
  },
  {
    id: 'forecast',
    label: 'Прогноз',
    color: '#10B981',
    style: 'dashed',
    visible: forecastVisible,
    datasetIndex: 1,
    icon: '🔮',
    description: 'Прогнозируемое количество звонков'
  },
  {
    id: 'confidence',
    label: 'Доверительный интервал',
    color: '#10B981',
    borderColor: '#10B981',
    style: 'area',
    visible: confidenceVisible,
    datasetIndex: 2,
    icon: '📏',
    description: 'Диапазон возможных значений прогноза'
  },
  {
    id: 'agents',
    label: 'Требуется агентов',
    color: '#F59E0B',
    style: 'dotted',
    visible: agentsVisible,
    datasetIndex: 3,
    icon: '👥',
    description: 'Рекомендуемое количество агентов'
  }
];

export default ChartLegend;