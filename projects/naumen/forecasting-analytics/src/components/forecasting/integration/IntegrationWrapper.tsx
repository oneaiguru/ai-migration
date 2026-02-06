// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/IntegrationWrapper.tsx
import React, { useState, useCallback } from 'react';
import { Play, Settings, Download, History, AlertCircle, CheckCircle } from 'lucide-react';

// Import all integration components
import ErrorBoundary from './ErrorBoundary';
import { LoadingSpinner, ForecastLoadingState } from './LoadingStates';
import ForecastExport from './ForecastExport';
import ForecastTemplates from './ForecastTemplates';
import DataImport from './DataImport';
import ForecastHistory from './ForecastHistory';
import PerformanceMonitor from './PerformanceMonitor';
import AccessibilityHelper from './AccessibilityHelper';
import MobileOptimizer from './MobileOptimizer';
import KeyboardShortcuts from './KeyboardShortcuts';
import SystemHealthCheck from './SystemHealthCheck';

// Import existing forecasting components
import AccuracyDashboard from '../AccuracyDashboard';
import TrendAnalysisDashboard from '../trends/TrendAnalysisDashboard';
import ForecastingLayout from '../ForecastingLayout';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  completed: boolean;
  optional?: boolean;
}

interface IntegrationState {
  currentStep: number;
  completedSteps: Set<string>;
  forecastData: any;
  settings: any;
  isDemo: boolean;
}

const IntegrationWrapper: React.FC = () => {
  const [state, setState] = useState<IntegrationState>({
    currentStep: 0,
    completedSteps: new Set(),
    forecastData: null,
    settings: {},
    isDemo: true
  });

  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Define the complete workflow
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'data-import',
      name: 'Импорт данных',
      description: 'Загрузите исторические данные или выберите шаблон',
      component: DataImport,
      completed: false
    },
    {
      id: 'template-selection',
      name: 'Выбор шаблона',
      description: 'Выберите готовый шаблон прогнозирования',
      component: ForecastTemplates,
      completed: false,
      optional: true
    },
    {
      id: 'forecast-building',
      name: 'Построение прогноза',
      description: 'Создайте прогноз с настройкой параметров',
      component: ForecastingLayout,
      completed: false
    },
    {
      id: 'accuracy-analysis',
      name: 'Анализ точности',
      description: 'Оцените качество прогноза',
      component: AccuracyDashboard,
      completed: false
    },
    {
      id: 'trend-analysis',
      name: 'Анализ трендов',
      description: 'Изучите тренды и паттерны в данных',
      component: TrendAnalysisDashboard,
      completed: false
    },
    {
      id: 'export',
      name: 'Экспорт результатов',
      description: 'Сохраните прогноз в нужном формате',
      component: ForecastExport,
      completed: false
    }
  ];

  const completeStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, stepId])
    }));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStep: stepIndex
    }));
  }, []);

  const handleDataImported = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      forecastData: data
    }));
    completeStep('data-import');
    goToStep(1);
  }, [completeStep, goToStep]);

  const handleTemplateSelected = useCallback((template: any) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, template }
    }));
    completeStep('template-selection');
    goToStep(2);
  }, [completeStep, goToStep]);

  const currentStepData = workflowSteps[state.currentStep];

  // Generate mock data for demonstration
  const generateMockData = () => {
    const mockData = [];
    const now = new Date();
    
    for (let i = 0; i < 168; i++) { // 7 days of hourly data
      const timestamp = new Date(now.getTime() - (168 - i) * 60 * 60 * 1000);
      const baseValue = 45 + Math.sin(i / 24 * Math.PI * 2) * 15;
      const noise = (Math.random() - 0.5) * 10;
      
      mockData.push({
        timestamp: timestamp.toISOString(),
        value: Math.max(5, baseValue + noise),
        predicted: Math.max(5, baseValue + noise + (Math.random() - 0.5) * 8),
        confidence: 0.75 + Math.random() * 0.2
      });
    }
    
    return mockData;
  };

  // Keyboard shortcuts for the integration demo
  const integrationShortcuts = [
    {
      id: 'next-step',
      keys: ['Ctrl', 'ArrowRight'],
      description: 'Следующий шаг',
      category: 'Навигация',
      action: () => {
        if (state.currentStep < workflowSteps.length - 1) {
          goToStep(state.currentStep + 1);
        }
      },
      enabled: true
    },
    {
      id: 'prev-step',
      keys: ['Ctrl', 'ArrowLeft'],
      description: 'Предыдущий шаг',
      category: 'Навигация',
      action: () => {
        if (state.currentStep > 0) {
          goToStep(state.currentStep - 1);
        }
      },
      enabled: true
    },
    {
      id: 'complete-step',
      keys: ['Ctrl', 'Enter'],
      description: 'Завершить текущий шаг',
      category: 'Навигация',
      action: () => {
        completeStep(currentStepData.id);
        if (state.currentStep < workflowSteps.length - 1) {
          goToStep(state.currentStep + 1);
        }
      },
      enabled: true
    }
  ];

  return (
    <ErrorBoundary level="global" showDetails={true}>
      <MobileOptimizer enableTouchOptimizations enablePerformanceMode>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    WFM Интегрированная система прогнозирования
                  </h1>
                  {state.isDemo && (
                    <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      ДЕМО
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Производительность
                  </button>
                  
                  <button
                    onClick={() => setShowSystemHealth(!showSystemHealth)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Состояние системы
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Progress */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Шаг {state.currentStep + 1} из {workflowSteps.length}: {currentStepData.name}
                </h2>
                <div className="text-sm text-gray-600">
                  Завершено: {state.completedSteps.size} / {workflowSteps.length}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex-1">
                      <button
                        onClick={() => goToStep(index)}
                        className={`
                          w-full h-2 rounded transition-colors
                          ${index === state.currentStep 
                            ? 'bg-blue-600' 
                            : state.completedSteps.has(step.id)
                              ? 'bg-green-600'
                              : 'bg-gray-200'
                          }
                        `}
                        title={step.name}
                      />
                      <div className="mt-1 text-xs text-center">
                        {state.completedSteps.has(step.id) ? (
                          <CheckCircle className="w-3 h-3 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-500">{index + 1}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ErrorBoundary level="module">
              <div className="mb-6">
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>

              {/* Render Current Step Component */}
              {state.currentStep === 0 && (
                <DataImport
                  onDataImported={handleDataImported}
                  className="mb-6"
                />
              )}

              {state.currentStep === 1 && (
                <ForecastTemplates
                  onTemplateSelect={handleTemplateSelected}
                  onCreateCustom={() => goToStep(2)}
                  className="mb-6"
                />
              )}

              {state.currentStep === 2 && (
                <ErrorBoundary level="component">
                  <ForecastingLayout />
                </ErrorBoundary>
              )}

              {state.currentStep === 3 && (
                <ErrorBoundary level="component">
                  <AccuracyDashboard
                    currentAlgorithm="arima"
                    forecastData={generateMockData()}
                    historicalData={[]}
                    onAlgorithmChange={() => {}}
                    autoRefresh={false}
                  />
                </ErrorBoundary>
              )}

              {state.currentStep === 4 && (
                <ErrorBoundary level="component">
                  <TrendAnalysisDashboard
                    organizationId="1010"
                    queueIds={["Контакт-центр 1010"]}
                    dateRange={{
                      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      end: new Date()
                    }}
                    onAlert={() => {}}
                  />
                </ErrorBoundary>
              )}

              {state.currentStep === 5 && (
                <ForecastExport
                  data={generateMockData()}
                  organizationName="Контакт-центр 1010"
                  dateRange={{
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    end: new Date()
                  }}
                  onExport={(format, options) => {
                    console.log('Export:', format, options);
                    completeStep('export');
                  }}
                  className="mb-6"
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={() => goToStep(Math.max(0, state.currentStep - 1))}
                  disabled={state.currentStep === 0}
                  className={`
                    px-4 py-2 border rounded-md font-medium
                    ${state.currentStep === 0
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  Назад
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => completeStep(currentStepData.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Завершить шаг
                  </button>

                  <button
                    onClick={() => goToStep(Math.min(workflowSteps.length - 1, state.currentStep + 1))}
                    disabled={state.currentStep === workflowSteps.length - 1}
                    className={`
                      px-4 py-2 rounded-md font-medium
                      ${state.currentStep === workflowSteps.length - 1
                        ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                      }
                    `}
                  >
                    Далее
                  </button>
                </div>
              </div>
            </ErrorBoundary>
          </div>

          {/* Side Panels */}
          {showPerformanceMonitor && (
            <div className="fixed right-4 top-20 w-80 z-30">
              <PerformanceMonitor 
                onAlert={(alert) => console.log('Performance alert:', alert)}
              />
            </div>
          )}

          {showSystemHealth && (
            <div className="fixed right-4 bottom-20 w-80 z-30">
              <SystemHealthCheck 
                onHealthChange={(health) => console.log('Health changed:', health)}
              />
            </div>
          )}

          {/* Integration Helpers */}
          <AccessibilityHelper 
            onSettingsChange={(settings) => console.log('Accessibility settings:', settings)}
          />
          
          <KeyboardShortcuts 
            actions={integrationShortcuts}
            onShortcutExecuted={(id) => console.log('Shortcut executed:', id)}
          />

          {/* Demo Completion */}
          {state.completedSteps.size === workflowSteps.length && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Демонстрация завершена!
                </h3>
                <p className="text-gray-600 mb-6">
                  Вы успешно прошли все этапы интегрированного процесса прогнозирования.
                  Система готова к использованию в продакшене.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Начать заново
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, completedSteps: new Set() }))}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Сбросить прогресс
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MobileOptimizer>
    </ErrorBoundary>
  );
};

export default IntegrationWrapper;
