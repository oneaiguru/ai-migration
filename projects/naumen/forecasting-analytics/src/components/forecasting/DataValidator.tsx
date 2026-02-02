// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/DataValidator.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';

// ========================
// TYPE DEFINITIONS
// ========================

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validator: (value: number, context: ValidationContext) => ValidationResult;
}

interface ValidationContext {
  originalValue: number;
  timestamp: string;
  hour: number;
  dayOfWeek: number;
  historicalAverage?: number;
  previousValue?: number;
  nextValue?: number;
  seasonalPattern?: number;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestedValue?: number;
  confidence?: number;
}

interface ValidationError {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedValue?: number;
  confidence?: number;
}

interface DataValidatorProps {
  value: number;
  context: ValidationContext;
  onValidationChange: (isValid: boolean, errors: ValidationError[], suggestedValue?: number) => void;
  rules?: ValidationRule[];
  realTimeValidation?: boolean;
  showSuggestions?: boolean;
  disabled?: boolean;
}

// ========================
// DEFAULT VALIDATION RULES
// ========================

const defaultValidationRules: ValidationRule[] = [
  // Basic Range Validation
  {
    id: 'min_value',
    name: 'Minimum Value',
    description: 'Value cannot be negative',
    severity: 'error',
    validator: (value) => ({
      isValid: value >= 0,
      message: value < 0 ? 'Value cannot be negative' : undefined
    })
  },
  
  // Maximum Reasonable Value
  {
    id: 'max_reasonable',
    name: 'Maximum Reasonable Value',
    description: 'Value seems unreasonably high',
    severity: 'warning',
    validator: (value, context) => {
      const maxReasonable = (context.historicalAverage || context.originalValue) * 5;
      return {
        isValid: value <= maxReasonable,
        message: value > maxReasonable ? `Value ${value} seems very high (>${maxReasonable.toFixed(1)})` : undefined,
        suggestedValue: Math.min(value, maxReasonable)
      };
    }
  },

  // Historical Deviation
  {
    id: 'historical_deviation',
    name: 'Historical Deviation',
    description: 'Significant deviation from historical patterns',
    severity: 'warning',
    validator: (value, context) => {
      if (!context.historicalAverage) return { isValid: true };
      
      const deviation = Math.abs(value - context.historicalAverage) / context.historicalAverage;
      const threshold = 0.5; // 50% deviation threshold
      
      return {
        isValid: deviation <= threshold,
        message: deviation > threshold 
          ? `${(deviation * 100).toFixed(1)}% deviation from historical average (${context.historicalAverage.toFixed(1)})`
          : undefined,
        suggestedValue: context.historicalAverage,
        confidence: Math.max(0, 1 - deviation)
      };
    }
  },

  // Continuity Check
  {
    id: 'continuity',
    name: 'Value Continuity',
    description: 'Abrupt changes from neighboring values',
    severity: 'info',
    validator: (value, context) => {
      const { previousValue, nextValue } = context;
      if (!previousValue && !nextValue) return { isValid: true };
      
      const neighbors = [previousValue, nextValue].filter(v => v !== undefined) as number[];
      if (neighbors.length === 0) return { isValid: true };
      
      const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
      const deviation = Math.abs(value - avgNeighbor) / avgNeighbor;
      const threshold = 0.3; // 30% deviation from neighbors
      
      return {
        isValid: deviation <= threshold,
        message: deviation > threshold 
          ? `Significant jump from neighboring values (avg: ${avgNeighbor.toFixed(1)})`
          : undefined,
        suggestedValue: avgNeighbor
      };
    }
  },

  // Business Hours Logic
  {
    id: 'business_hours',
    name: 'Business Hours Logic',
    description: 'High values during off-hours',
    severity: 'info',
    validator: (value, context) => {
      const { hour, dayOfWeek } = context;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isOffHours = hour < 8 || hour > 18;
      
      if (!isWeekend && !isOffHours) return { isValid: true };
      
      const expectedOffHoursRatio = 0.3; // 30% of normal capacity
      const threshold = (context.historicalAverage || context.originalValue) * expectedOffHoursRatio;
      
      return {
        isValid: value <= threshold * 2, // Allow some flexibility
        message: value > threshold * 2
          ? `High value (${value}) during ${isWeekend ? 'weekend' : 'off-hours'}`
          : undefined,
        suggestedValue: threshold
      };
    }
  },

  // Seasonal Pattern
  {
    id: 'seasonal_pattern',
    name: 'Seasonal Pattern',
    description: 'Deviation from seasonal expectations',
    severity: 'info',
    validator: (value, context) => {
      if (!context.seasonalPattern) return { isValid: true };
      
      const deviation = Math.abs(value - context.seasonalPattern) / context.seasonalPattern;
      const threshold = 0.4; // 40% deviation from seasonal pattern
      
      return {
        isValid: deviation <= threshold,
        message: deviation > threshold
          ? `Deviates from seasonal pattern (expected: ${context.seasonalPattern.toFixed(1)})`
          : undefined,
        suggestedValue: context.seasonalPattern,
        confidence: Math.max(0, 1 - deviation / 2)
      };
    }
  }
];

// ========================
// DATA VALIDATOR COMPONENT
// ========================

const DataValidator: React.FC<DataValidatorProps> = ({
  value,
  context,
  onValidationChange,
  rules = defaultValidationRules,
  realTimeValidation = true,
  showSuggestions = true,
  disabled = false
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [bestSuggestion, setBestSuggestion] = useState<number | undefined>();

  // ========================
  // VALIDATION LOGIC
  // ========================

  const runValidation = (inputValue: number) => {
    const errors: ValidationError[] = [];
    let hasErrors = false;
    
    rules.forEach(rule => {
      const result = rule.validator(inputValue, context);
      
      if (!result.isValid && result.message) {
        errors.push({
          ruleId: rule.id,
          ruleName: rule.name,
          message: result.message,
          severity: rule.severity,
          suggestedValue: result.suggestedValue,
          confidence: result.confidence
        });
        
        if (rule.severity === 'error') {
          hasErrors = true;
        }
      }
    });

    // Find best suggestion (highest confidence, or prefer error fixes over warnings)
    const suggestions = errors
      .filter(e => e.suggestedValue !== undefined)
      .sort((a, b) => {
        // Prioritize error fixes over warnings
        if (a.severity === 'error' && b.severity !== 'error') return -1;
        if (b.severity === 'error' && a.severity !== 'error') return 1;
        
        // Then by confidence
        return (b.confidence || 0) - (a.confidence || 0);
      });

    const suggestion = suggestions.length > 0 ? suggestions[0].suggestedValue : undefined;

    setValidationErrors(errors);
    setIsValid(!hasErrors);
    setBestSuggestion(suggestion);
    
    onValidationChange(!hasErrors, errors, suggestion);
  };

  // ========================
  // EFFECTS
  // ========================

  useEffect(() => {
    if (realTimeValidation && !disabled) {
      runValidation(value);
    }
  }, [value, context, realTimeValidation, disabled]);

  // ========================
  // RENDER HELPERS
  // ========================

  const getIconForSeverity = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50 text-red-700';
      case 'warning': return 'border-orange-200 bg-orange-50 text-orange-700';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const handleApplySuggestion = (suggestedValue: number) => {
    onValidationChange(true, [], suggestedValue);
  };

  // ========================
  // RENDER COMPONENT
  // ========================

  if (disabled || (!realTimeValidation && validationErrors.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((error, index) => (
            <div
              key={`${error.ruleId}-${index}`}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getSeverityColor(error.severity)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIconForSeverity(error.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{error.ruleName}</p>
                  {error.confidence && (
                    <span className="text-xs font-medium">
                      {(error.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1">{error.message}</p>
                
                {showSuggestions && error.suggestedValue !== undefined && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs">
                      Suggested: <strong>{error.suggestedValue.toFixed(1)}</strong>
                    </span>
                    <button
                      onClick={() => handleApplySuggestion(error.suggestedValue!)}
                      className="text-xs bg-white border border-current rounded px-2 py-1 hover:bg-opacity-10 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Status */}
      {realTimeValidation && (
        <div className={`flex items-center space-x-2 p-2 rounded-md ${
          isValid 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {isValid ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isValid 
              ? 'Value passes all validation rules' 
              : `Found ${validationErrors.filter(e => e.severity === 'error').length} error(s)`
            }
          </span>
        </div>
      )}

      {/* Quick Stats */}
      {context.historicalAverage && (
        <div className="flex items-center justify-between text-xs text-gray-500 p-2 bg-gray-50 rounded">
          <span>Historical Avg: {context.historicalAverage.toFixed(1)}</span>
          <span className={`flex items-center space-x-1 ${
            value > context.historicalAverage ? 'text-green-600' : 'text-red-600'
          }`}>
            {value > context.historicalAverage ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {((value - context.historicalAverage) / context.historicalAverage * 100).toFixed(1)}%
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default DataValidator;