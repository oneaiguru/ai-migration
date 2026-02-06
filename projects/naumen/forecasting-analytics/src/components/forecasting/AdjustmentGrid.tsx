// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/AdjustmentGrid.tsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface ForecastInterval {
  id: string;
  timestamp: string;
  predicted: number;
  actual?: number;
  confidence: number;
  adjustment: number;
  requiredAgents: number;
  isWeekend: boolean;
  hour: number;
  dayOfWeek: number;
  locked?: boolean;
  validated?: boolean;
}

interface AdjustmentGridProps {
  data: ForecastInterval[];
  onAdjustmentChange: (intervalId: string, adjustment: number) => void;
  onBulkAdjustment?: (intervalIds: string[], adjustment: number) => void;
  height?: number;
  itemHeight?: number;
  enableVirtualization?: boolean;
  enableBulkOperations?: boolean;
  enableValidation?: boolean;
  maxAdjustment?: number;
  minAdjustment?: number;
  loading?: boolean;
  onExport?: (data: ForecastInterval[]) => void;
}

interface VirtualizedRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    intervals: ForecastInterval[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onAdjustmentChange: (id: string, value: number) => void;
    maxAdjustment: number;
    minAdjustment: number;
    enableValidation: boolean;
  };
}

// ========================
// ADJUSTMENT GRID COMPONENT
// ========================

const AdjustmentGrid: React.FC<AdjustmentGridProps> = ({
  data,
  onAdjustmentChange,
  onBulkAdjustment,
  height = 400,
  itemHeight = 48,
  enableVirtualization = true,
  enableBulkOperations = true,
  enableValidation = true,
  maxAdjustment = 100,
  minAdjustment = -100,
  loading = false,
  onExport
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState<number>(0);
  const [sortField, setSortField] = useState<keyof ForecastInterval>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState<string>('');
  const [showOnlyAdjusted, setShowOnlyAdjusted] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(height);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;
    
    // Apply filters
    if (showOnlyAdjusted) {
      filtered = filtered.filter(item => item.adjustment !== 0);
    }
    
    if (filterText) {
      const searchTerm = filterText.toLowerCase();
      filtered = filtered.filter(item => 
        new Date(item.timestamp).toLocaleString('ru').toLowerCase().includes(searchTerm) ||
        item.predicted.toString().includes(searchTerm) ||
        item.adjustment.toString().includes(searchTerm)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [data, showOnlyAdjusted, filterText, sortField, sortDirection]);

  // Virtualization calculations
  const startIndex = enableVirtualization 
    ? Math.floor(scrollTop / itemHeight)
    : 0;
  
  const endIndex = enableVirtualization 
    ? Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, processedData.length)
    : processedData.length;
  
  const visibleItems = processedData.slice(startIndex, endIndex);
  const totalHeight = processedData.length * itemHeight;

  // Handle container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle sort
  const handleSort = useCallback((field: keyof ForecastInterval) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Handle selection
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(processedData.map(item => item.id)));
  }, [processedData]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Handle adjustment change
  const handleAdjustmentChange = useCallback((id: string, value: number) => {
    // Validate adjustment
    const errors = new Map(validationErrors);
    
    if (enableValidation) {
      if (value > maxAdjustment) {
        errors.set(id, `Максимальная корректировка: ${maxAdjustment}`);
      } else if (value < minAdjustment) {
        errors.set(id, `Минимальная корректировка: ${minAdjustment}`);
      } else {
        errors.delete(id);
      }
      setValidationErrors(errors);
    }
    
    // Apply adjustment if valid
    if (!errors.has(id)) {
      onAdjustmentChange(id, value);
    }
  }, [onAdjustmentChange, enableValidation, maxAdjustment, minAdjustment, validationErrors]);

  // Handle bulk adjustment
  const handleBulkAdjustment = useCallback(() => {
    if (onBulkAdjustment && selectedIds.size > 0) {
      onBulkAdjustment(Array.from(selectedIds), bulkAdjustmentValue);
      setSelectedIds(new Set());
      setBulkAdjustmentValue(0);
    }
  }, [onBulkAdjustment, selectedIds, bulkAdjustmentValue]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalAdjustments = processedData.filter(item => item.adjustment !== 0).length;
    const totalPositive = processedData.filter(item => item.adjustment > 0).length;
    const totalNegative = processedData.filter(item => item.adjustment < 0).length;
    const avgAdjustment = processedData.reduce((sum, item) => sum + item.adjustment, 0) / processedData.length;
    const totalAdjustmentValue = processedData.reduce((sum, item) => sum + item.adjustment, 0);
    
    return {
      totalAdjustments,
      totalPositive,
      totalNegative,
      avgAdjustment,
      totalAdjustmentValue
    };
  }, [processedData]);

  // Format date
  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('ru', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get row style
  const getRowStyle = (index: number): React.CSSProperties => {
    if (!enableVirtualization) {
      return {};
    }
    
    return {
      position: 'absolute',
      top: (startIndex + index) * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6" style={{ height }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Загрузка данных таблицы...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ручные корректировки</h3>
          
          <div className="flex items-center gap-2">
            {onExport && (
              <button
                onClick={() => onExport(processedData)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                📤 Экспорт
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Search and filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск по времени, прогнозу или корректировке..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyAdjusted}
                onChange={(e) => setShowOnlyAdjusted(e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              Только с корректировками
            </label>
          </div>

          {/* Bulk operations */}
          {enableBulkOperations && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  Выбрать все
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleClearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  Очистить
                </button>
                <span className="text-sm text-gray-500">
                  ({selectedIds.size} выбрано)
                </span>
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Корректировка:</span>
                  <input
                    type="number"
                    value={bulkAdjustmentValue}
                    onChange={(e) => setBulkAdjustmentValue(parseInt(e.target.value) || 0)}
                    min={minAdjustment}
                    max={maxAdjustment}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleBulkAdjustment}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Применить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-5 gap-4 mt-4 p-3 bg-blue-50 rounded-md text-sm">
          <div>
            <span className="text-blue-800 font-medium">{statistics.totalAdjustments}</span>
            <div className="text-blue-600">корректировок</div>
          </div>
          <div>
            <span className="text-green-600 font-medium">+{statistics.totalPositive}</span>
            <div className="text-green-600">увеличений</div>
          </div>
          <div>
            <span className="text-red-600 font-medium">-{statistics.totalNegative}</span>
            <div className="text-red-600">уменьшений</div>
          </div>
          <div>
            <span className="text-gray-800 font-medium">{statistics.avgAdjustment.toFixed(1)}</span>
            <div className="text-gray-600">средняя</div>
          </div>
          <div>
            <span className="text-purple-800 font-medium">{statistics.totalAdjustmentValue > 0 ? '+' : ''}{statistics.totalAdjustmentValue}</span>
            <div className="text-purple-600">общая</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div 
        ref={containerRef}
        className="relative overflow-auto"
        style={{ height: height - 200 }}
        onScroll={handleScroll}
      >
        {/* Table Header */}
        <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200">
          <div className="flex">
            {enableBulkOperations && (
              <div className="w-12 px-3 py-2 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size === processedData.length && processedData.length > 0}
                  onChange={selectedIds.size === processedData.length ? handleClearSelection : handleSelectAll}
                  className="text-blue-600 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="flex-1 grid grid-cols-6 gap-4">
              <button
                onClick={() => handleSort('timestamp')}
                className="px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Интервал
                {sortField === 'timestamp' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              
              <button
                onClick={() => handleSort('predicted')}
                className="px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Прогноз
                {sortField === 'predicted' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              
              <div className="px-3 py-2 text-left text-sm font-medium text-gray-700">
                Корректировка
              </div>
              
              <div className="px-3 py-2 text-left text-sm font-medium text-gray-700">
                Итого
              </div>
              
              <button
                onClick={() => handleSort('requiredAgents')}
                className="px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Агентов
                {sortField === 'requiredAgents' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              
              <button
                onClick={() => handleSort('confidence')}
                className="px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Уверенность
                {sortField === 'confidence' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div 
          className="relative"
          style={{ height: enableVirtualization ? totalHeight : 'auto' }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                selectedIds.has(item.id) ? 'bg-blue-50' : ''
              } ${validationErrors.has(item.id) ? 'bg-red-50' : ''}`}
              style={getRowStyle(index)}
            >
              {enableBulkOperations && (
                <div className="w-12 px-3 py-2 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    disabled={item.locked}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="flex-1 grid grid-cols-6 gap-4">
                <div className="px-3 py-2 flex items-center text-sm">
                  <div>
                    <div>{formatDate(item.timestamp)}</div>
                    {item.isWeekend && (
                      <div className="text-xs text-orange-600">📅 Выходной</div>
                    )}
                  </div>
                </div>
                
                <div className="px-3 py-2 flex items-center text-sm font-medium">
                  {item.predicted}
                  {item.actual !== undefined && (
                    <span className="ml-2 text-xs text-gray-500">
                      (факт: {item.actual})
                    </span>
                  )}
                </div>
                
                <div className="px-3 py-2 flex items-center">
                  <input
                    type="number"
                    value={item.adjustment}
                    onChange={(e) => handleAdjustmentChange(item.id, parseInt(e.target.value) || 0)}
                    min={minAdjustment}
                    max={maxAdjustment}
                    disabled={item.locked}
                    className={`w-20 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.has(item.id) 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    } ${item.locked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {validationErrors.has(item.id) && (
                    <div className="ml-2 text-xs text-red-600">
                      {validationErrors.get(item.id)}
                    </div>
                  )}
                </div>
                
                <div className="px-3 py-2 flex items-center text-sm font-bold">
                  <span className={item.adjustment !== 0 ? 'text-blue-600' : ''}>
                    {item.predicted + item.adjustment}
                  </span>
                  {item.adjustment !== 0 && (
                    <span className={`ml-1 text-xs ${
                      item.adjustment > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({item.adjustment > 0 ? '+' : ''}{item.adjustment})
                    </span>
                  )}
                </div>
                
                <div className="px-3 py-2 flex items-center text-sm text-blue-600">
                  {Math.ceil((item.predicted + item.adjustment) * 0.15)}
                </div>
                
                <div className="px-3 py-2 flex items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span>{(item.confidence * 100).toFixed(0)}%</span>
                    <div 
                      className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden"
                      title={`Уверенность: ${(item.confidence * 100).toFixed(1)}%`}
                    >
                      <div 
                        className={`h-full transition-all ${
                          item.confidence >= 0.8 ? 'bg-green-500' :
                          item.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No data message */}
        {processedData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-lg font-medium mb-2">Нет данных для отображения</div>
            <div className="text-sm">
              {data.length === 0 
                ? 'Сначала создайте прогноз для отображения интервалов'
                : 'Попробуйте изменить параметры фильтрации'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdjustmentGrid;