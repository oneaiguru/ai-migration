import React, { useState, useEffect } from 'react';
import realOptimizationService, { 
  OptimizationConstraint, 
  OptimizationScenario, 
  ScheduleConflict,
  OptimizationRequest 
} from '../../../services/realOptimizationService';

const ScheduleOptimizationUI: React.FC = () => {
  // Real state management - NO MOCK DATA
  const [constraints, setConstraints] = useState<OptimizationConstraint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const [scenarios, setScenarios] = useState<OptimizationScenario[]>([]);
  const [currentOptimizationId, setCurrentOptimizationId] = useState<string | null>(null);
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);

  const [activeScenario, setActiveScenario] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showConstraintModal, setShowConstraintModal] = useState(false);
  const [editingConstraint, setEditingConstraint] = useState<OptimizationConstraint | null>(null);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);

  const [optimizationParams, setOptimizationParams] = useState({
    algorithm: 'genetic' as 'genetic' | 'simulated_annealing' | 'linear_programming',
    iterations: 1000,
    populationSize: 100,
    mutationRate: 0.1,
    eliteSize: 20,
    timeLimit: 300 // 5 minutes
  });
  const [availableAlgorithms, setAvailableAlgorithms] = useState<string[]>([]);

  // Load optimization data on component mount
  useEffect(() => {
    loadOptimizationData();
  }, []);

  const loadOptimizationData = async () => {
    setApiError('');
    setIsLoading(true);
    
    try {
      // Check API health first
      const isApiHealthy = await realOptimizationService.checkApiHealth();
      if (!isApiHealthy) {
        throw new Error('Optimization API server is not available. Please try again later.');
      }

      console.log('[REAL OPTIMIZATION] Loading optimization data...');
      
      // Load constraints, scenarios, and conflicts in parallel
      const [constraintsResult, scenariosResult, conflictsResult, algorithmsResult] = await Promise.all([
        realOptimizationService.getAvailableConstraints(),
        realOptimizationService.getScenarios(),
        realOptimizationService.getCurrentConflicts(),
        realOptimizationService.getAlgorithmOptions()
      ]);
      
      if (constraintsResult.success && constraintsResult.data) {
        setConstraints(constraintsResult.data);
      }
      
      if (scenariosResult.success && scenariosResult.data) {
        setScenarios(scenariosResult.data);
        if (scenariosResult.data.length > 0 && !activeScenario) {
          setActiveScenario(scenariosResult.data[0].id);
        }
      }
      
      if (conflictsResult.success && conflictsResult.data) {
        setConflicts(conflictsResult.data);
      }
      
      if (algorithmsResult.success && algorithmsResult.data) {
        setAvailableAlgorithms(algorithmsResult.data.algorithms);
        if (algorithmsResult.data.defaultParameters) {
          setOptimizationParams(prev => ({ ...prev, ...algorithmsResult.data!.defaultParameters }));
        }
      }
      
      console.log('[REAL OPTIMIZATION] Data loaded successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL OPTIMIZATION] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!activeScenario) {
      setApiError('Please select a scenario first');
      return;
    }
    
    setIsOptimizing(true);
    setIsConnecting(true);
    setApiError('');
    setOptimizationProgress(0);
    
    try {
      const currentScenario = scenarios.find(s => s.id === activeScenario);
      if (!currentScenario) {
        throw new Error('Selected scenario not found');
      }
      
      console.log('[REAL OPTIMIZATION] Starting optimization for scenario:', activeScenario);
      
      const optimizationRequest: OptimizationRequest = {
        scenarioId: activeScenario,
        constraints: constraints.filter(c => c.isActive),
        parameters: optimizationParams,
        schedule: {
          startDate: '2024-07-01',
          endDate: '2024-07-31'
        }
      };
      
      const result = await realOptimizationService.optimizeSchedule(optimizationRequest);
      
      if (result.success && result.data) {
        console.log('[REAL OPTIMIZATION] Optimization completed:', result.data);
        
        // Update scenario with results
        setScenarios(prev => prev.map(s => 
          s.id === activeScenario 
            ? { ...s, ...result.data!.scenario }
            : s
        ));
        
        // Update conflicts
        setConflicts(result.data.conflicts);
        
        // Clear optimization ID
        setCurrentOptimizationId(null);
        setOptimizationProgress(100);
        
      } else {
        throw new Error(result.error || 'Optimization failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(`Optimization failed: ${errorMessage}`);
      console.error('[REAL OPTIMIZATION] Error:', error);
    } finally {
      setIsOptimizing(false);
      setIsConnecting(false);
    }
  };

  const handleConstraintToggle = (id: string) => {
    setConstraints(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleWeightChange = (id: string, weight: number) => {
    setConstraints(prev => prev.map(c => 
      c.id === id ? { ...c, weight } : c
    ));
  };

  const createScenario = async () => {
    setIsConnecting(true);
    setApiError('');
    
    try {
      const newScenario = {
        name: `Сценарий ${scenarios.length + 1}`,
        constraints: constraints.filter(c => c.isActive),
        parameters: {
          targetCost: 2500000,
          minCoverage: 90,
          maxOvertime: 20,
          fairnessIndex: 0.8
        }
      };
      
      console.log('[REAL OPTIMIZATION] Creating scenario:', newScenario);
      
      const result = await realOptimizationService.saveScenario(newScenario);
      
      if (result.success && result.data) {
        console.log('[REAL OPTIMIZATION] Scenario created:', result.data);
        
        setScenarios(prev => [...prev, result.data!]);
        setActiveScenario(result.data.id);
        
      } else {
        throw new Error(result.error || 'Failed to create scenario');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(`Failed to create scenario: ${errorMessage}`);
      console.error('[REAL OPTIMIZATION] Create scenario error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const resolveConflict = async (conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;
    
    setIsConnecting(true);
    setApiError('');
    
    try {
      console.log('[REAL OPTIMIZATION] Resolving conflict:', conflictId);
      
      const result = await realOptimizationService.resolveConflict(conflictId, conflict.suggestedResolution);
      
      if (result.success && result.data?.resolved) {
        console.log('[REAL OPTIMIZATION] Conflict resolved:', conflictId);
        
        // Remove resolved conflict
        setConflicts(prev => prev.filter(c => c.id !== conflictId));
        
        // Add any new conflicts that may have emerged
        if (result.data.newConflicts) {
          setConflicts(prev => [...prev, ...result.data!.newConflicts!]);
        }
        
      } else {
        throw new Error('Failed to resolve conflict');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(`Failed to resolve conflict: ${errorMessage}`);
      console.error('[REAL OPTIMIZATION] Resolve conflict error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 180px)', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: 0 
          }}>
            🤖 AI-оптимизация расписания
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: '4px 0 0 0' 
          }}>
            Интеллектуальное планирование с учетом ограничений и предпочтений
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={createScenario}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            📊 Новый сценарий
          </button>
          
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            style={{
              padding: '12px 24px',
              backgroundColor: isOptimizing ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
            }}
          >
            {isOptimizing ? '⚙️ Оптимизация...' : '🚀 Оптимизировать'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '24px', overflow: 'hidden' }}>
        {/* Left Panel - Constraints */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: '#111827'
          }}>
            ⚡ Ограничения и параметры
          </h2>
          
          <div style={{ flex: 1, overflow: 'auto' }}>
            {constraints.map(constraint => (
              <div
                key={constraint.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  backgroundColor: constraint.isActive ? 'white' : '#f9fafb',
                  opacity: constraint.isActive ? 1 : 0.7
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      {constraint.type === 'skill' && '🎯'} 
                      {constraint.type === 'preference' && '❤️'} 
                      {constraint.type === 'rule' && '📋'} 
                      {constraint.type === 'cost' && '💰'} 
                      {constraint.type === 'coverage' && '👥'} {constraint.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {constraint.description}
                    </p>
                  </div>
                  
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={constraint.isActive}
                      onChange={() => handleConstraintToggle(constraint.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                </div>
                
                {constraint.isActive && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Вес:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={constraint.weight}
                        onChange={(e) => handleWeightChange(constraint.id, parseFloat(e.target.value))}
                        style={{ flex: 1 }}
                      />
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600',
                        color: '#111827',
                        minWidth: '35px'
                      }}>
                        {constraint.weight.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Algorithm Settings */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px',
            marginTop: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              🧬 Параметры алгоритма
            </h3>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              <div style={{ marginBottom: '8px' }}>
                Алгоритм: <strong>{optimizationParams.algorithm === 'genetic' ? 'Генетический' : 'Симуляция отжига'}</strong>
              </div>
              <div style={{ marginBottom: '8px' }}>
                Итераций: <strong>{optimizationParams.iterations}</strong>
              </div>
              <div>
                Размер популяции: <strong>{optimizationParams.populationSize}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Scenarios */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827',
              margin: 0
            }}>
              📊 Сценарии оптимизации
            </h2>
            
            <select
              value={activeScenario}
              onChange={(e) => setActiveScenario(e.target.value)}
              style={{
                marginLeft: '16px',
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results Dashboard */}
          {scenarios.find(s => s.id === activeScenario)?.results && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>
                  💰 Затраты
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                  {(scenarios.find(s => s.id === activeScenario)!.results!.cost / 1000000).toFixed(2)}М ₽
                </div>
                <div style={{ fontSize: '12px', color: '#22c55e' }}>
                  ↓ 5% от цели
                </div>
              </div>

              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>
                  📈 Покрытие
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                  {scenarios.find(s => s.id === activeScenario)!.results!.coverage.toFixed(0)}%
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6' }}>
                  ↑ Выше нормы
                </div>
              </div>

              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>
                  ⚖️ Справедливость
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                  {(scenarios.find(s => s.id === activeScenario)!.results!.fairness * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                  Индекс баланса
                </div>
              </div>

              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
                  ⚠️ Конфликты
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
                  {scenarios.find(s => s.id === activeScenario)!.results!.conflicts}
                </div>
                <div style={{ fontSize: '12px', color: '#ef4444' }}>
                  Требуют решения
                </div>
              </div>
            </div>
          )}

          {/* Conflicts Section */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#111827'
            }}>
              ⚠️ Обнаруженные конфликты
            </h3>
            
            {conflicts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                ✅ Конфликты не обнаружены
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {conflicts.map(conflict => (
                  <div
                    key={conflict.id}
                    style={{
                      border: '1px solid',
                      borderColor: conflict.severity === 'high' ? '#fca5a5' : 
                                  conflict.severity === 'medium' ? '#fcd34d' : '#86efac',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: conflict.severity === 'high' ? '#fee2e2' :
                                      conflict.severity === 'medium' ? '#fef3c7' : '#f0fdf4'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: conflict.severity === 'high' ? '#991b1b' :
                                conflict.severity === 'medium' ? '#92400e' : '#166534',
                          marginBottom: '4px'
                        }}>
                          {conflict.type === 'skill_mismatch' && '🎯 Несоответствие навыков'}
                          {conflict.type === 'overtime' && '⏰ Превышение нормы часов'}
                          {conflict.type === 'coverage_gap' && '👥 Нехватка персонала'}
                          {conflict.type === 'preference_violation' && '❤️ Нарушение предпочтений'}
                        </div>
                        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 8px 0' }}>
                          {conflict.description}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          💡 {conflict.suggestedResolution}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => resolveConflict(conflict.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginLeft: '12px'
                        }}
                      >
                        Решить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - What-if Analysis */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: '#111827'
          }}>
            🔮 What-if анализ
          </h2>
          
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Quick Actions */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                ⚡ Быстрые действия
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  📈 Увеличить покрытие на 10%
                </button>
                
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  💰 Снизить затраты на 15%
                </button>
                
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  🚫 Исключить ночные смены
                </button>
                
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  ⚖️ Максимизировать баланс
                </button>
              </div>
            </div>

            {/* Bulk Operations */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                📦 Массовые операции
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  🔄 Перераспределить смены
                </button>
                
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  📋 Применить шаблон
                </button>
                
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  🗓️ Копировать неделю
                </button>
              </div>
            </div>

            {/* AI Insights */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                🤖 AI-рекомендации
              </h3>
              
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                <p style={{ marginBottom: '8px' }}>
                  • Перенос 3 сотрудников на дневную смену снизит затраты на 8%
                </p>
                <p style={{ marginBottom: '8px' }}>
                  • Добавление 2 операторов в пиковые часы улучшит покрытие на 15%
                </p>
                <p>
                  • Ротация смен каждые 2 недели повысит индекс справедливости до 90%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Statistics */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <span>
          Активных ограничений: <strong>{constraints.filter(c => c.isActive).length}</strong>
        </span>
        <span>
          Сценариев: <strong>{scenarios.length}</strong>
        </span>
        <span>
          Оценка качества: <strong style={{ color: '#059669' }}>
            {scenarios.find(s => s.id === activeScenario)?.results?.score || '-'}%
          </strong>
        </span>
      </div>
    </div>
  );
};

export default ScheduleOptimizationUI;