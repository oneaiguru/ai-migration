// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/BulkAdjustments.tsx
import React, { useState, useRef } from 'react';
import { Calculator, Plus, Minus, Percent, TrendingUp, TrendingDown, RotateCcw, Check, X } from 'lucide-react';

// ========================
// TYPE DEFINITIONS
// ========================

interface IntervalData {
  timestamp: string;
  originalValue: number;
  adjustedValue: number;
  hour: number;
  dayOfWeek: number;
  isSelected: boolean;
}

interface BulkOperation {
  type: 'add' | 'subtract' | 'multiply' | 'percentage' | 'set' | 'formula';
  value: number;
  formula?: string;
}

interface BulkAdjustmentsProps {
  selectedIntervals: IntervalData[];
  onApplyBulkAdjustment: (operation: BulkOperation, intervals: IntervalData[]) => void;
  onClearSelection: () => void;
  loading?: boolean;
  disabled?: boolean;
}

// ========================
// BULK ADJUSTMENTS COMPONENT
// ========================

const BulkAdjustments: React.FC<BulkAdjustmentsProps> = ({
  selectedIntervals,
  onApplyBulkAdjustment,
  onClearSelection,
  loading = false,
  disabled = false
}) => {
  const [operation, setOperation] = useState<BulkOperation['type']>('add');
  const [value, setValue] = useState<string>('');
  const [formula, setFormula] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // ========================
  // VALIDATION LOGIC
  // ========================

  const validateInput = (type: BulkOperation['type'], inputValue: string, formulaValue: string = ''): string => {
    if (type === 'formula') {
      if (!formulaValue.trim()) return 'Formula is required';
      // Basic formula validation - should contain valid variables
      const validVariables = ['x', 'hour', 'day', 'original'];
      const invalidChars = /[^0-9+\-*/().x\s]/g;
      if (invalidChars.test(formulaValue.replace(/hour|day|original/g, ''))) {
        return 'Formula contains invalid characters';
      }
      return '';
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return 'Please enter a valid number';
    
    if (type === 'percentage' && (numValue < -100 || numValue > 1000)) {
      return 'Percentage must be between -100% and 1000%';
    }
    
    if (type === 'multiply' && numValue <= 0) {
      return 'Multiplier must be greater than 0';
    }

    if (type === 'set' && numValue < 0) {
      return 'Value cannot be negative';
    }

    return '';
  };

  // ========================
  // PREVIEW CALCULATION
  // ========================

  const calculatePreview = (interval: IntervalData, op: BulkOperation): number => {
    const { originalValue } = interval;
    
    switch (op.type) {
      case 'add':
        return Math.max(0, originalValue + op.value);
      case 'subtract':
        return Math.max(0, originalValue - op.value);
      case 'multiply':
        return Math.max(0, originalValue * op.value);
      case 'percentage':
        return Math.max(0, originalValue * (1 + op.value / 100));
      case 'set':
        return op.value;
      case 'formula':
        try {
          // Replace variables in formula
          let formulaStr = op.formula || '';
          formulaStr = formulaStr.replace(/x/g, originalValue.toString());
          formulaStr = formulaStr.replace(/hour/g, interval.hour.toString());
          formulaStr = formulaStr.replace(/day/g, interval.dayOfWeek.toString());
          formulaStr = formulaStr.replace(/original/g, originalValue.toString());
          
          // Basic evaluation (in production, use a safe math evaluator)
          const result = eval(formulaStr);
          return Math.max(0, isNaN(result) ? originalValue : result);
        } catch {
          return originalValue;
        }
      default:
        return originalValue;
    }
  };

  // ========================
  // EVENT HANDLERS
  // ========================

  const handleApply = () => {
    const inputValue = operation === 'formula' ? formula : value;
    const error = validateInput(operation, value, formula);
    
    if (error) {
      setValidationError(error);
      return;
    }

    const bulkOp: BulkOperation = {
      type: operation,
      value: parseFloat(value) || 0,
      formula: operation === 'formula' ? formula : undefined
    };

    onApplyBulkAdjustment(bulkOp, selectedIntervals);
    setValue('');
    setFormula('');
    setValidationError('');
    setPreviewMode(false);
  };

  const handlePreview = () => {
    const error = validateInput(operation, value, formula);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    setPreviewMode(true);
  };

  const getOperationIcon = (type: BulkOperation['type']) => {
    switch (type) {
      case 'add': return <Plus className="w-4 h-4" />;
      case 'subtract': return <Minus className="w-4 h-4" />;
      case 'multiply': return <X className="w-4 h-4" />;
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'set': return <TrendingUp className="w-4 h-4" />;
      case 'formula': return <Calculator className="w-4 h-4" />;
      default: return <Plus className="w-4 h-4" />;
    }
  };

  // ========================
  // RENDER COMPONENT
  // ========================

  if (selectedIntervals.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bulk Adjustments</h3>
          <p className="text-sm text-gray-500">
            Select intervals in the grid to apply bulk adjustments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Bulk Adjustments</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {selectedIntervals.length} selected
          </span>
        </div>
        <button
          onClick={onClearSelection}
          className="text-sm text-gray-500 hover:text-gray-700"
          disabled={disabled}
        >
          Clear Selection
        </button>
      </div>

      {/* Operation Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Operation Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'add' as const, label: 'Add', desc: 'Add value' },
            { type: 'subtract' as const, label: 'Subtract', desc: 'Subtract value' },
            { type: 'multiply' as const, label: 'Multiply', desc: 'Multiply by factor' },
            { type: 'percentage' as const, label: 'Percentage', desc: 'Increase by %' },
            { type: 'set' as const, label: 'Set Value', desc: 'Set absolute value' },
            { type: 'formula' as const, label: 'Formula', desc: 'Custom formula' }
          ].map((op) => (
            <button
              key={op.type}
              onClick={() => setOperation(op.type)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                operation === op.type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={disabled}
            >
              <div className="flex items-center space-x-2">
                {getOperationIcon(op.type)}
                <span className="font-medium text-sm">{op.label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{op.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="mb-6">
        {operation === 'formula' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula (use x, hour, day, original as variables)
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="Example: x * 1.1 + hour * 2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables: x (current value), hour (0-23), day (0-6), original (original value)
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {operation === 'percentage' ? 'Percentage Change' : 'Value'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={operation === 'percentage' ? '10' : '5'}
                step={operation === 'percentage' ? '0.1' : '1'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled}
              />
              {operation === 'percentage' && (
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              )}
            </div>
          </div>
        )}

        {validationError && (
          <p className="text-sm text-red-600 mt-2">{validationError}</p>
        )}
      </div>

      {/* Preview Section */}
      {previewMode && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Preview Changes</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedIntervals.slice(0, 5).map((interval, index) => {
              const previewValue = calculatePreview(interval, {
                type: operation,
                value: parseFloat(value) || 0,
                formula
              });
              const change = previewValue - interval.originalValue;
              
              return (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(interval.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center space-x-2">
                    <span>{interval.originalValue}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{previewValue.toFixed(1)}</span>
                    <span className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({change >= 0 ? '+' : ''}{change.toFixed(1)})
                    </span>
                  </span>
                </div>
              );
            })}
            {selectedIntervals.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                ...and {selectedIntervals.length - 5} more intervals
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handlePreview}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={disabled || loading || (!value && !formula)}
        >
          Preview Changes
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          disabled={disabled || loading || (!value && !formula)}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Apply to {selectedIntervals.length} intervals</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
        <div className="flex space-x-2">
          {[
            { label: '+10%', op: 'percentage', val: 10 },
            { label: '-10%', op: 'percentage', val: -10 },
            { label: '×1.5', op: 'multiply', val: 1.5 },
            { label: 'Reset', op: 'set', val: 0 }
          ].map((quick, index) => (
            <button
              key={index}
              onClick={() => {
                setOperation(quick.op as BulkOperation['type']);
                setValue(quick.val.toString());
                setTimeout(() => handleApply(), 100);
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              disabled={disabled || loading}
            >
              {quick.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BulkAdjustments;