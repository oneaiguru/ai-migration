// ModelValidation.tsx - Cross-validation and Holdout Testing Results

import React, { useMemo, useState } from 'react';
import { Target, BarChart3, Users, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { ValidationResult } from '../../../types/accuracy';
import { formatMetricValue } from '../../../utils/accuracyCalculations';
import { ReportTable } from '../../charts';
import { buildValidationTable } from '../../../adapters/forecasting';

interface ModelValidationProps {
  validationResults: ValidationResult[];
  onValidationRun?: (method: 'holdout' | 'crossValidation' | 'timeSeries') => void;
  isValidating?: boolean;
  className?: string;
}

const ModelValidation: React.FC<ModelValidationProps> = ({
  validationResults,
  onValidationRun,
  isValidating = false,
  className = ''
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'holdout' | 'crossValidation' | 'timeSeries'>('crossValidation');

  // Get validation method info
  const getMethodInfo = (method: string) => {
    switch (method) {
      case 'holdout':
        return {
          name: 'Разделение данных',
          description: 'Разделение на обучающую и тестовую выборки',
          icon: <Target className="w-4 h-4" />,
          color: 'blue'
        };
      case 'crossValidation':
        return {
          name: 'Кросс-валидация',
          description: 'K-fold перекрестная проверка',
          icon: <BarChart3 className="w-4 h-4" />,
          color: 'green'
        };
      case 'timeSeries':
        return {
          name: 'Временные ряды',
          description: 'Валидация по временным периодам',
          icon: <Calendar className="w-4 h-4" />,
          color: 'purple'
        };
      default:
        return {
          name: method,
          description: '',
          icon: <Users className="w-4 h-4" />,
          color: 'gray'
        };
    }
  };

  // Get validation status
  const getValidationStatus = (result: ValidationResult) => {
    const mape = result.metrics.mape;
    if (mape <= 15) return { status: 'excellent', color: 'green', label: 'Отлично' };
    if (mape <= 25) return { status: 'good', color: 'blue', label: 'Хорошо' };
    if (mape <= 35) return { status: 'fair', color: 'orange', label: 'Удовлетв.' };
    return { status: 'poor', color: 'red', label: 'Плохо' };
  };

  // Calculate validation reliability
  const calculateReliability = (results: ValidationResult[]) => {
    if (results.length === 0) return 0;
    
    const mapeValues = results.map(r => r.metrics.mape);
    const mean = mapeValues.reduce((sum, val) => sum + val, 0) / mapeValues.length;
    const variance = mapeValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / mapeValues.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher reliability
    const reliability = Math.max(0, 100 - (standardDeviation / mean) * 100);
    return Math.min(100, reliability);
  };

  const reliability = calculateReliability(validationResults);
  const validationTable = useMemo(() => buildValidationTable(validationResults), [validationResults]);

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Валидация модели</h3>
              <p className="text-sm text-gray-600">
                {validationResults.length} результатов валидации
              </p>
            </div>
          </div>

          {/* Reliability Score */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              reliability >= 80 ? 'text-green-600' :
              reliability >= 60 ? 'text-blue-600' :
              reliability >= 40 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {reliability.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Надежность</div>
          </div>
        </div>
      </div>

      {/* Validation Methods */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Методы валидации:</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {(['holdout', 'crossValidation', 'timeSeries'] as const).map((method) => {
            const info = getMethodInfo(method);
            const isSelected = selectedMethod === method;
            
            return (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                disabled={isValidating}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${isValidating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {info.icon}
                  <span className="text-sm font-medium">{info.name}</span>
                </div>
                <p className="text-xs text-gray-600">{info.description}</p>
              </button>
            );
          })}
        </div>

        {/* Run Validation Button */}
        <div className="mt-3">
          <button
            onClick={() => onValidationRun?.(selectedMethod)}
            disabled={isValidating}
            className={`w-full px-4 py-2 text-sm rounded-md transition-colors ${
              isValidating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isValidating ? 'Выполняется валидация...' : 'Запустить валидацию'}
          </button>
        </div>
      </div>

      {/* Validation Results */}
      <div className="p-4">
        {validationResults.length > 0 ? (
          <div className="space-y-4">
            {validationResults.map((result, index) => {
              const info = getMethodInfo(result.method);
              const status = getValidationStatus(result);
              
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  {/* Result Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {info.icon}
                      <div>
                        <div className="font-medium text-gray-900">{info.name}</div>
                        <div className="text-xs text-gray-600">
                          {result.method === 'crossValidation' && result.folds && 
                            `${result.folds}-fold, `}
                          Тест: {result.testSize}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full bg-${status.color}-100 text-${status.color}-700`}>
                        {status.label}
                      </span>
                      {status.status === 'excellent' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                  </div>

                  {/* Metrics Comparison */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatMetricValue(result.metrics.mape, 'mape')}
                      </div>
                      <div className="text-xs text-gray-500">MAPE</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatMetricValue(result.metrics.mae, 'mae')}
                      </div>
                      <div className="text-xs text-gray-500">MAE</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatMetricValue(result.metrics.rmse, 'rmse')}
                      </div>
                      <div className="text-xs text-gray-500">RMSE</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatMetricValue(result.metrics.rSquared, 'rsquared')}
                      </div>
                      <div className="text-xs text-gray-500">R²</div>
                    </div>
                  </div>

                  {/* Training vs Validation Split */}
                  {result.trainingMetrics && result.validationMetrics && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="font-medium text-gray-700 mb-1">Обучение</div>
                          <div className="flex justify-between">
                            <span>MAPE:</span>
                            <span>{formatMetricValue(result.trainingMetrics.mape, 'mape')}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium text-gray-700 mb-1">Валидация</div>
                          <div className="flex justify-between">
                            <span>MAPE:</span>
                            <span>{formatMetricValue(result.validationMetrics.mape, 'mape')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <ReportTable
              columns={validationTable.columns}
              rows={validationTable.rows}
              ariaTitle="Сводная таблица валидации"
              ariaDesc="Табличный обзор показателей MAPE/MAE/RMSE и значимости тестов"
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-lg font-medium">Нет результатов валидации</p>
            <p className="text-sm">Запустите валидацию для оценки качества модели</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelValidation;
