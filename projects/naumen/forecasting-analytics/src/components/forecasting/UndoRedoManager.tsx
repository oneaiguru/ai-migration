// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/UndoRedoManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Undo2, Redo2, RotateCcw, History, Clock, User, Save, Download } from 'lucide-react';

// ========================
// TYPE DEFINITIONS
// ========================

interface ChangeOperation {
  id: string;
  type: 'single_edit' | 'bulk_adjustment' | 'formula_application' | 'import' | 'reset';
  timestamp: Date;
  description: string;
  affectedIntervals: string[]; // Array of interval timestamps
  changes: ChangeRecord[];
  metadata?: {
    user?: string;
    source?: string;
    algorithm?: string;
    formula?: string;
  };
}

interface ChangeRecord {
  timestamp: string;
  oldValue: number;
  newValue: number;
  reason?: string;
}

interface UndoRedoState {
  operations: ChangeOperation[];
  currentIndex: number; // Points to the last applied operation
  maxHistorySize: number;
}

interface UndoRedoManagerProps {
  onUndo: (operation: ChangeOperation) => void;
  onRedo: (operation: ChangeOperation) => void;
  onReset: (toOperationId?: string) => void;
  maxHistorySize?: number;
  showDetailedHistory?: boolean;
  allowExport?: boolean;
  disabled?: boolean;
}

interface HistoryExport {
  exportDate: string;
  totalOperations: number;
  operations: ChangeOperation[];
  summary: {
    totalChanges: number;
    affectedIntervals: number;
    operationTypes: Record<string, number>;
  };
}

// ========================
// UNDO REDO MANAGER COMPONENT
// ========================

const UndoRedoManager: React.FC<UndoRedoManagerProps> = ({
  onUndo,
  onRedo,
  onReset,
  maxHistorySize = 50,
  showDetailedHistory = true,
  allowExport = true,
  disabled = false
}) => {
  const [state, setState] = useState<UndoRedoState>({
    operations: [],
    currentIndex: -1,
    maxHistorySize
  });
  
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  // ========================
  // HISTORY MANAGEMENT
  // ========================

  const addOperation = useCallback((operation: ChangeOperation) => {
    setState(prevState => {
      const newOperations = [
        ...prevState.operations.slice(0, prevState.currentIndex + 1),
        operation
      ];

      // Limit history size
      if (newOperations.length > maxHistorySize) {
        newOperations.shift();
      }

      return {
        ...prevState,
        operations: newOperations,
        currentIndex: newOperations.length - 1
      };
    });
  }, [maxHistorySize]);

  const canUndo = state.currentIndex >= 0;
  const canRedo = state.currentIndex < state.operations.length - 1;

  // ========================
  // UNDO/REDO OPERATIONS
  // ========================

  const handleUndo = () => {
    if (!canUndo || disabled) return;

    const operation = state.operations[state.currentIndex];
    onUndo(operation);
    
    setState(prevState => ({
      ...prevState,
      currentIndex: prevState.currentIndex - 1
    }));
  };

  const handleRedo = () => {
    if (!canRedo || disabled) return;

    const operation = state.operations[state.currentIndex + 1];
    onRedo(operation);
    
    setState(prevState => ({
      ...prevState,
      currentIndex: prevState.currentIndex + 1
    }));
  };

  const handleResetToOperation = (operationId: string) => {
    const operationIndex = state.operations.findIndex(op => op.id === operationId);
    if (operationIndex === -1) return;

    onReset(operationId);
    
    setState(prevState => ({
      ...prevState,
      currentIndex: operationIndex
    }));
  };

  const handleResetAll = () => {
    onReset();
    setState(prevState => ({
      ...prevState,
      operations: [],
      currentIndex: -1
    }));
  };

  // ========================
  // EXPORT/IMPORT
  // ========================

  const exportHistory = () => {
    const historyExport: HistoryExport = {
      exportDate: new Date().toISOString(),
      totalOperations: state.operations.length,
      operations: state.operations,
      summary: {
        totalChanges: state.operations.reduce((sum, op) => sum + op.changes.length, 0),
        affectedIntervals: new Set(
          state.operations.flatMap(op => op.affectedIntervals)
        ).size,
        operationTypes: state.operations.reduce((types, op) => {
          types[op.type] = (types[op.type] || 0) + 1;
          return types;
        }, {} as Record<string, number>)
      }
    };

    const blob = new Blob([JSON.stringify(historyExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ========================
  // RENDER HELPERS
  // ========================

  const getOperationIcon = (type: ChangeOperation['type']) => {
    switch (type) {
      case 'single_edit': return '✏️';
      case 'bulk_adjustment': return '📊';
      case 'formula_application': return '🧮';
      case 'import': return '📥';
      case 'reset': return '🔄';
      default: return '📝';
    }
  };

  const getOperationDescription = (operation: ChangeOperation) => {
    const changeCount = operation.changes.length;
    const intervalCount = operation.affectedIntervals.length;
    
    switch (operation.type) {
      case 'single_edit':
        return `Edited ${changeCount} value${changeCount > 1 ? 's' : ''}`;
      case 'bulk_adjustment':
        return `Bulk adjustment to ${intervalCount} interval${intervalCount > 1 ? 's' : ''}`;
      case 'formula_application':
        return `Applied formula to ${intervalCount} interval${intervalCount > 1 ? 's' : ''}`;
      case 'import':
        return `Imported ${changeCount} value${changeCount > 1 ? 's' : ''}`;
      case 'reset':
        return `Reset ${intervalCount} interval${intervalCount > 1 ? 's' : ''}`;
      default:
        return operation.description;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // ========================
  // KEYBOARD SHORTCUTS
  // ========================

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;
      
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [disabled, canUndo, canRedo]);

  // Expose addOperation method to parent component
  useEffect(() => {
    // This would typically be passed up through a ref or context
    (window as any).addHistoryOperation = addOperation;
    
    return () => {
      delete (window as any).addHistoryOperation;
    };
  }, [addOperation]);

  // ========================
  // RENDER COMPONENT
  // ========================

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Change History</h3>
          {state.operations.length > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded">
              {state.operations.length} operation{state.operations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {allowExport && state.operations.length > 0 && (
            <button
              onClick={exportHistory}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Export History"
              disabled={disabled}
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Toggle Detailed History"
            disabled={disabled}
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={handleUndo}
          disabled={!canUndo || disabled}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="w-4 h-4" />
          <span>Undo</span>
          <span className="text-xs opacity-75">(Ctrl+Z)</span>
        </button>
        
        <button
          onClick={handleRedo}
          disabled={!canRedo || disabled}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 className="w-4 h-4" />
          <span>Redo</span>
          <span className="text-xs opacity-75">(Ctrl+Y)</span>
        </button>
        
        <button
          onClick={handleResetAll}
          disabled={state.operations.length === 0 || disabled}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Current State */}
      {state.operations.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Current position:</span> {state.currentIndex + 1} of {state.operations.length}
            {canUndo && (
              <span className="ml-2">
                • Can undo: <span className="font-medium">{getOperationDescription(state.operations[state.currentIndex])}</span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Detailed History */}
      {showDetailedHistory && showHistory && state.operations.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Operation History</h4>
          
          {state.operations.map((operation, index) => {
            const isActive = index <= state.currentIndex;
            const isCurrent = index === state.currentIndex;
            
            return (
              <div
                key={operation.id}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  isActive
                    ? isCurrent
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                } ${selectedOperation === operation.id ? 'ring-2 ring-blue-300' : ''}`}
                onClick={() => setSelectedOperation(
                  selectedOperation === operation.id ? null : operation.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getOperationIcon(operation.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getOperationDescription(operation)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(operation.timestamp)}
                        {operation.metadata?.user && (
                          <span className="ml-2">• by {operation.metadata.user}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetToOperation(operation.id);
                        }}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                        disabled={disabled}
                      >
                        Reset to here
                      </button>
                    )}
                    
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {selectedOperation === operation.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-gray-700">Details</p>
                        <p>Type: {operation.type}</p>
                        <p>Changes: {operation.changes.length}</p>
                        <p>Intervals: {operation.affectedIntervals.length}</p>
                      </div>
                      
                      {operation.metadata && (
                        <div>
                          <p className="font-medium text-gray-700">Metadata</p>
                          {operation.metadata.algorithm && (
                            <p>Algorithm: {operation.metadata.algorithm}</p>
                          )}
                          {operation.metadata.formula && (
                            <p>Formula: {operation.metadata.formula}</p>
                          )}
                          {operation.metadata.source && (
                            <p>Source: {operation.metadata.source}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Sample Changes */}
                    {operation.changes.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-700 text-xs">Sample Changes:</p>
                        <div className="space-y-1">
                          {operation.changes.slice(0, 3).map((change, changeIndex) => (
                            <div key={changeIndex} className="flex justify-between text-xs">
                              <span>{new Date(change.timestamp).toLocaleTimeString()}</span>
                              <span>
                                {change.oldValue.toFixed(1)} → {change.newValue.toFixed(1)}
                              </span>
                            </div>
                          ))}
                          {operation.changes.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              ...and {operation.changes.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {state.operations.length === 0 && (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Yet</h3>
          <p className="text-sm text-gray-500">
            Start making adjustments to see your change history here
          </p>
        </div>
      )}
    </div>
  );
};

export default UndoRedoManager;