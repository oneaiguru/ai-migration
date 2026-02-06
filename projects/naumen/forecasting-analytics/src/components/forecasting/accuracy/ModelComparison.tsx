// ModelComparison.tsx - Side-by-side Algorithm Performance Comparison

import React, { useState } from 'react';
import { BarChart3, Table, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ModelComparison as ModelComparisonType, AlgorithmType } from '../../../types/accuracy';
import { formatMetricValue } from '../../../utils/accuracyCalculations';
import { ReportTable } from '../../charts';
import { buildModelComparisonTable } from '../../../adapters/forecasting';

interface ModelComparisonProps {
  comparisons: ModelComparisonType[];
  currentAlgorithm?: AlgorithmType;
  onAlgorithmSelect?: (algorithmId: AlgorithmType) => void;
  viewMode?: 'table' | 'cards';
  className?: string;
}

const ModelComparison: React.FC<ModelComparisonProps> = ({
  comparisons,
  currentAlgorithm,
  onAlgorithmSelect,
  viewMode: initialViewMode = 'table',
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(initialViewMode);
  const [sortBy, setSortBy] = useState<'mape' | 'mae' | 'rmse' | 'processingTime'>('mape');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort comparisons
  const sortedComparisons = [...comparisons].sort((a, b) => {
    let aValue: number, bValue: number;
    
    if (sortBy === 'processingTime') {
      aValue = a.processingTime;
      bValue = b.processingTime;
    } else {
      aValue = a.metrics[sortBy];
      bValue = b.metrics[sortBy];
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Get performance ranking
  const getPerformanceRank = (algorithmId: AlgorithmType): number => {
    const sorted = [...comparisons].sort((a, b) => a.metrics.mape - b.metrics.mape);
    return sorted.findIndex(c => c.algorithmId === algorithmId) + 1;
  };

  // Get status based on performance
  const getPerformanceStatus = (mape: number) => {
    if (mape <= 10) return 'excellent';
    if (mape <= 20) return 'good';
    if (mape <= 30) return 'fair';
    return 'poor';
  };

  // Get status colors
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-100';
      case 'good': return 'text-blue-700 bg-blue-100';
      case 'fair': return 'text-orange-700 bg-orange-100';
      case 'poor': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Handle sort
  const handleSort = (key: 'mape' | 'mae' | 'rmse' | 'processingTime') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  // Render table view
  const renderTableView = () => {
    const table = buildModelComparisonTable(sortedComparisons);
    const rows = table.rows.map((row, index) => {
      const comparison = sortedComparisons[index];
      const status = getPerformanceStatus(comparison.metrics.mape);
      const rank = getPerformanceRank(comparison.algorithmId);
      const isActive = comparison.algorithmId === currentAlgorithm;

      return {
        ...row,
        algorithm: (
          <div className="flex items-center gap-3">
            {isActive && <div className="h-2 w-2 rounded-full bg-blue-500" />}
            <div>
              <div className="font-medium text-gray-900">{comparison.algorithmName}</div>
              <div className="text-xs text-gray-500">Ранг: #{rank}</div>
            </div>
          </div>
        ),
        status: (
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColors(status)}`}>
            {status === 'excellent' ? 'Отлично'
              : status === 'good' ? 'Хорошо'
              : status === 'fair' ? 'Удовлетв.'
              : 'Плохо'}
          </span>
        ),
        action: (
          isActive ? (
            <span className="text-xs text-blue-600 font-medium">Текущий</span>
          ) : (
            <button
              onClick={() => onAlgorithmSelect?.(comparison.algorithmId)}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
            >
              Выбрать
            </button>
          )
        ),
      };
    });

    const columns = [
      ...table.columns,
      { id: 'action', label: 'Действие' },
    ];

    return (
      <ReportTable
        columns={columns}
        rows={rows}
        ariaTitle="Сравнение алгоритмов"
        ariaDesc="Отчётная таблица с метриками точности по алгоритмам"
      />
    );
  };

  // Render cards view
  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedComparisons.map((comparison) => {
        const isActive = comparison.algorithmId === currentAlgorithm;
        const status = getPerformanceStatus(comparison.metrics.mape);
        const rank = getPerformanceRank(comparison.algorithmId);
        
        return (
          <div
            key={comparison.algorithmId}
            className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${
              isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:border-gray-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                ) : (
                  <Activity className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{comparison.algorithmName}</h4>
                  <p className="text-xs text-gray-500">Ранг: #{rank}</p>
                </div>
              </div>
              
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColors(status)}`}>
                {status === 'excellent' ? 'Отлично' :
                 status === 'good' ? 'Хорошо' :
                 status === 'fair' ? 'Удовлетв.' : 'Плохо'}
              </span>
            </div>

            {/* Metrics */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">MAPE</span>
                <span className={`font-medium ${
                  comparison.metrics.mape <= 15 ? 'text-green-600' : 
                  comparison.metrics.mape <= 25 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {formatMetricValue(comparison.metrics.mape, 'mape')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">MAE</span>
                <span className="text-sm text-gray-900">
                  {formatMetricValue(comparison.metrics.mae, 'mae')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">RMSE</span>
                <span className="text-sm text-gray-900">
                  {formatMetricValue(comparison.metrics.rmse, 'rmse')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Время
                </span>
                <span className="text-sm text-gray-900">
                  {comparison.processingTime}с
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-gray-200">
              {!isActive ? (
                <button
                  onClick={() => onAlgorithmSelect?.(comparison.algorithmId)}
                  className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Выбрать алгоритм
                </button>
              ) : (
                <div className="text-center text-sm text-blue-600 font-medium py-2">
                  ✓ Текущий алгоритм
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Сравнение алгоритмов</h3>
              <p className="text-sm text-gray-600">{comparisons.length} алгоритмов</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Table className="w-4 h-4" />
              Таблица
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              Карточки
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {comparisons.length > 0 ? (
          viewMode === 'table' ? renderTableView() : renderCardsView()
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-lg font-medium">Нет данных для сравнения</p>
            <p className="text-sm">Данные алгоритмов будут отображены здесь</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelComparison;
