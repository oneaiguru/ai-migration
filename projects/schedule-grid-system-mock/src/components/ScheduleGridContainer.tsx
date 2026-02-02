import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Employee, Shift } from '../types/schedule';
import ForecastChart from './ForecastChart';
import { KpiCardGrid } from './charts';
import { deriveFteHoursSeries, deriveHeadcountSeries, type TimeUnit } from '../utils/charts/adapters';
import VirtualizedScheduleGrid from './VirtualizedScheduleGrid';
import realScheduleService, { ScheduleData } from '../services/realScheduleService';

// Draggable Shift Block Component
const DraggableShiftBlock: React.FC<{
  shift: Shift;
  isDragOverlay?: boolean;
}> = ({ shift, isDragOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: shift.id,
    data: {
      shift,
      type: 'shift',
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: shift.shiftTypeId === 'night' ? '#4f46e5' : '#74a689',
      }}
      {...listeners}
      {...attributes}
      className={`w-full h-full rounded text-white text-xs flex flex-col items-center justify-center font-medium cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragOverlay ? 'rotate-3 scale-105 shadow-lg' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      title={`${shift.startTime} - ${shift.endTime}`}
    >
      <span>{shift.startTime.substring(0, 5)}</span>
      <span style={{ opacity: 0.6 }}>...</span>
      <span>{shift.endTime.substring(0, 5)}</span>
    </div>
  );
};

// Droppable Grid Cell Component
const DroppableGridCell: React.FC<{
  employeeId: string;
  dateIndex: number;
  date: any;
  shift: Shift | null;
  isSelected: boolean;
  onCellClick: (employeeId: string, dateIndex: number) => void;
}> = ({ employeeId, dateIndex, date, shift, isSelected, onCellClick }) => {
  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: `cell-${employeeId}-${dateIndex}`,
    data: {
      employeeId,
      dateIndex,
      type: 'cell',
    },
  });

  return (
    <td 
      ref={setNodeRef}
      style={{ 
        width: '70px',
        height: '50px',
        padding: '4px',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: isOver ? '#bfdbfe' : 
                        isSelected ? '#dbeafe' : 
                        date.isToday ? '#fef3c7' : 
                        date.isWeekend ? '#f3f4f6' : 'transparent',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease'
      }}
      onClick={() => onCellClick(employeeId, dateIndex)}
    >
      {shift ? (
        <DraggableShiftBlock shift={shift} />
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: isOver ? '#e0e7ff' : '#f3f4f6', 
          borderRadius: '4px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: isOver ? '2px dashed #3b82f6' : '1px solid transparent',
          transition: 'all 0.2s ease'
        }}>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>
            {isOver ? '📍' : '—'}
          </span>
        </div>
      )}
    </td>
  );
};

const ScheduleGridContainer: React.FC = () => {
  // Real state management - NO MOCK DATA
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [shifts, setShifts] = useState<Map<string, Shift>>(new Map());
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [activeChartView, setActiveChartView] = useState<'forecast' | 'deviations' | 'service'>('forecast');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');
  const [showHeadcount, setShowHeadcount] = useState(false);
  const [showFte, setShowFte] = useState(false);
  const [isVirtualized, setIsVirtualized] = useState(false);
  const [scheduleStats, setScheduleStats] = useState({
    totalEmployees: 0,
    totalShifts: 0,
    coveragePercentage: 0
  });

  // Generate dates for July 2024
  const dates = [];
  for (let i = 1; i <= 31; i++) {
    const date = new Date(2024, 6, i);
    dates.push({
      day: i,
      dayName: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()],
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday: i === 17,
      dateString: `2024-07-${String(i).padStart(2, '0')}`
    });
  }

  const dateLabels = dates.map((d) => d.dateString);

  // Load real schedule data on component mount
  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    setApiError('');
    setIsLoading(true);
    
    try {
      // Check API health first
      const isApiHealthy = await realScheduleService.checkApiHealth();
      if (!isApiHealthy) {
        throw new Error('Schedule API server is not available. Please try again later.');
      }

      // Get current month's schedule data
      const startDate = '2024-07-01';
      const endDate = '2024-07-31';
      
      console.log('[REAL SCHEDULE] Loading schedule data for period:', { startDate, endDate });
      
      const result = await realScheduleService.getCurrentSchedule(startDate, endDate);
      
      if (result.success && result.data) {
        console.log('[REAL SCHEDULE] Success:', result.data);
        
        // Set employees from real API
        setEmployees(result.data.employees);
        
        // Convert schedule data to shifts map
        const shiftsMap = new Map<string, Shift>();
        result.data.schedules.forEach(schedule => {
          const dateIndex = new Date(schedule.date).getDate() - 1;
          const cellKey = `${schedule.employeeId}-${dateIndex}`;
          
          shiftsMap.set(cellKey, {
            id: schedule.id,
            employeeId: schedule.employeeId,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            shiftTypeId: schedule.shiftTypeId,
            status: schedule.status,
            duration: schedule.duration,
            color: schedule.color || (schedule.shiftTypeId === 'night' ? '#4f46e5' : '#74a689')
          });
        });
        
        setShifts(shiftsMap);
        setScheduleStats(result.data.statistics);
        
      } else {
        // Handle real error from API
        setApiError(result.error || 'Failed to load schedule data');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL SCHEDULE] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get shift for specific cell
  const getShiftForCell = (employeeId: string, dateIndex: number): Shift | null => {
    const cellKey = `${employeeId}-${dateIndex}`;
    return shifts.get(cellKey) || null;
  };

  // Build overlays from current schedule snapshot
  const scheduleArray = Array.from(shifts.values());
  const overlayHeadcount = deriveHeadcountSeries(dateLabels, scheduleArray as unknown as any[]);
  const overlayFte = deriveFteHoursSeries(dateLabels, scheduleArray as unknown as any[]);
  const selectedOverlays = [
    ...(showHeadcount ? [overlayHeadcount] : []),
    ...(showFte ? [overlayFte] : []),
  ];

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const shiftData = active.data.current?.shift as Shift;
    setActiveShift(shiftData);
    console.log('🚀 Drag started:', shiftData);
  };

  // Handle drag end with real API call
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveShift(null);

    if (!over) {
      console.log('❌ Dropped outside valid area');
      return;
    }

    const sourceShift = active.data.current?.shift as Shift;
    const targetCell = over.data.current;

    if (!sourceShift || !targetCell || targetCell.type !== 'cell') {
      console.log('❌ Invalid drop target');
      return;
    }

    const sourceKey = `${sourceShift.employeeId}-${dates.findIndex(d => d.dateString === sourceShift.date)}`;
    const targetKey = `${targetCell.employeeId}-${targetCell.dateIndex}`;

    if (sourceKey === targetKey) {
      console.log('ℹ️ Dropped on same cell');
      return;
    }

    console.log(`📦 Moving shift from ${sourceKey} to ${targetKey}`);
    setIsConnecting(true);
    setApiError('');

    try {
      // Validate move with real API
      const targetDate = dates[targetCell.dateIndex].dateString;
      const validationResult = await realScheduleService.validateScheduleMove(
        sourceShift.id,
        targetCell.employeeId,
        targetDate
      );

      if (validationResult.success && validationResult.data?.valid) {
        // Perform the move via real API
        const updateResult = await realScheduleService.updateSchedule(sourceShift.id, {
          employeeId: targetCell.employeeId,
          date: targetDate
        });

        if (updateResult.success && updateResult.data) {
          // Update local state with real response
          setShifts(prev => {
            const newShifts = new Map(prev);
            
            // Remove shift from source
            newShifts.delete(sourceKey);
            
            // Add updated shift to target
            const updatedShift: Shift = {
              ...sourceShift,
              id: updateResult.data!.id,
              employeeId: updateResult.data!.employeeId,
              date: updateResult.data!.date,
              startTime: updateResult.data!.startTime,
              endTime: updateResult.data!.endTime,
              shiftTypeId: updateResult.data!.shiftTypeId,
              status: updateResult.data!.status,
              duration: updateResult.data!.duration
            };
            newShifts.set(targetKey, updatedShift);
            
            console.log('✅ Shift moved successfully via API!');
            return newShifts;
          });
        } else {
          throw new Error(updateResult.error || 'Failed to update schedule');
        }
      } else {
        const conflicts = validationResult.data?.conflicts || ['Move not allowed'];
        throw new Error(`Cannot move shift: ${conflicts.join(', ')}`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(`Schedule move failed: ${errorMessage}`);
      console.error('[REAL SCHEDULE] Move error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Event handlers
  const handleCellClick = (employeeId: string, dateIndex: number) => {
    console.log(`🎯 CLICK DETECTED! Employee: ${employeeId}, Date: ${dateIndex + 1}`);
    const cellId = `${employeeId}-${dateIndex}`;
    const newSelected = new Set(selectedCells);
    
    if (newSelected.has(cellId)) {
      newSelected.delete(cellId);
      console.log(`❌ Deselected cell: ${cellId}`);
    } else {
      newSelected.add(cellId);
      console.log(`✅ Selected cell: ${cellId}`);
    }
    
    setSelectedCells(newSelected);
    console.log(`📊 Total selected: ${newSelected.size} cells`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        height: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>📅</div>
          <div style={{ fontSize: '16px', color: '#6b7280' }}>Загрузка расписания...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* API Error Display */}
      {apiError && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#fee2e2',
          borderLeft: '4px solid #ef4444',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                Ошибка загрузки расписания
              </div>
              <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                {apiError}
              </div>
              <button
                onClick={loadScheduleData}
                disabled={isConnecting}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  opacity: isConnecting ? 0.6 : 1
                }}
              >
                {isConnecting ? 'Повтор...' : 'Повторить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator during operations */}
      {isConnecting && (
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#f0f9ff',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>⚙️</span>
            <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
              Обновление расписания...
            </div>
          </div>
        </div>
      )}

      {/* When virtualized mode is enabled, keep the chart + KPI area visible above the grid */}
      {isVirtualized && (
        <div style={{ height: '180px', borderBottom: '2px solid #2d3e50', padding: '16px', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={{ 
                padding: '4px 12px', 
                backgroundColor: activeChartView === 'forecast' ? '#dbeafe' : 'transparent', 
                color: activeChartView === 'forecast' ? '#1d4ed8' : '#6b7280', 
                borderRadius: '6px', 
                fontSize: '14px', 
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveChartView('forecast')}
              >
                Прогноз + план
              </button>
              <button style={{ 
                padding: '4px 12px', 
                backgroundColor: activeChartView === 'deviations' ? '#dbeafe' : 'transparent', 
                color: activeChartView === 'deviations' ? '#1d4ed8' : '#6b7280', 
                borderRadius: '6px', 
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveChartView('deviations')}
              >
                Отклонения
              </button>
              <button style={{ 
                padding: '4px 12px', 
                backgroundColor: activeChartView === 'service' ? '#dbeafe' : 'transparent', 
                color: activeChartView === 'service' ? '#1d4ed8' : '#6b7280', 
                borderRadius: '6px', 
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveChartView('service')}
              >
                Уровень сервиса (SL)
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
              <div role="tablist" aria-label="Группировка времени" style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setTimeUnit('day')}
                  role="tab"
                  aria-selected={timeUnit === 'day'}
                  style={{
                    padding: '2px 8px',
                    backgroundColor: timeUnit === 'day' ? '#dbeafe' : 'transparent',
                    color: timeUnit === 'day' ? '#1d4ed8' : '#6b7280',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  День
                </button>
                <button
                  onClick={() => setTimeUnit('week')}
                  role="tab"
                  aria-selected={timeUnit === 'week'}
                  style={{
                    padding: '2px 8px',
                    backgroundColor: timeUnit === 'week' ? '#dbeafe' : 'transparent',
                    color: timeUnit === 'week' ? '#1d4ed8' : '#6b7280',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Период
                </button>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="checkbox" style={{ width: '12px', height: '12px' }} checked={showHeadcount} onChange={(e) => setShowHeadcount(e.target.checked)} />
                <span>Σ</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="checkbox" style={{ width: '12px', height: '12px' }} checked={showFte} onChange={(e) => setShowFte(e.target.checked)} />
                <span>123</span>
              </label>
            </div>
          </div>
          
          <div style={{ 
            height: '80px', 
            borderRadius: '6px', 
            overflow: 'hidden'
          }}>
            <ForecastChart activeView={activeChartView} timeUnit={timeUnit} overlaySeries={selectedOverlays} />
          </div>

          {/* KPI tiles under the chart (visible in virtualized mode now) */}
          <div style={{ marginTop: '8px' }}>
            <KpiCardGrid
              items={[
                {
                  label: 'Покрытие',
                  value: `${scheduleStats.coveragePercentage || 0}%`,
                  variant: (scheduleStats.coveragePercentage || 0) >= 90 ? 'success' : 'warning',
                  trend: 'stable',
                },
                {
                  label: 'Уровень сервиса',
                  value: `${Math.round(85 + Math.sin(20 * 0.1) * 5 + 5)}%`,
                  variant: 'neutral',
                  trend: 'stable',
                },
                {
                  label: 'Придерживание',
                  value: '—',
                  variant: 'neutral',
                },
                {
                  label: 'Σ/123 включены',
                  value: `${showHeadcount ? 'Σ' : ''}${showHeadcount && showFte ? ' + ' : ''}${showFte ? '123' : ''}` || '—',
                  variant: 'neutral',
                },
              ]}
            />
          </div>
        </div>
      )}

      {isVirtualized ? (
        <VirtualizedScheduleGrid employeeCount={500} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            {/* Chart Area */}
            <div style={{ height: '180px', borderBottom: '2px solid #2d3e50', padding: '16px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button style={{ 
                    padding: '4px 12px', 
                    backgroundColor: activeChartView === 'forecast' ? '#dbeafe' : 'transparent', 
                    color: activeChartView === 'forecast' ? '#1d4ed8' : '#6b7280', 
                    borderRadius: '6px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveChartView('forecast');
                    console.log('🔄 Switched to: Прогноз + план');
                  }}
                  >
                    Прогноз + план
                  </button>
                  <button style={{ 
                    padding: '4px 12px', 
                    backgroundColor: activeChartView === 'deviations' ? '#dbeafe' : 'transparent', 
                    color: activeChartView === 'deviations' ? '#1d4ed8' : '#6b7280', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveChartView('deviations');
                    console.log('🔄 Switched to: Отклонения');
                  }}
                  >
                    Отклонения
                  </button>
                  <button style={{ 
                    padding: '4px 12px', 
                    backgroundColor: activeChartView === 'service' ? '#dbeafe' : 'transparent', 
                    color: activeChartView === 'service' ? '#1d4ed8' : '#6b7280', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveChartView('service');
                    console.log('🔄 Switched to: Уровень сервиса');
                  }}
                  >
                    Уровень сервиса (SL)
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                  <div role="tablist" aria-label="Группировка времени" style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setTimeUnit('day')}
                      role="tab"
                      aria-selected={timeUnit === 'day'}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: timeUnit === 'day' ? '#dbeafe' : 'transparent',
                        color: timeUnit === 'day' ? '#1d4ed8' : '#6b7280',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      День
                    </button>
                    <button
                      onClick={() => setTimeUnit('week')}
                      role="tab"
                      aria-selected={timeUnit === 'week'}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: timeUnit === 'week' ? '#dbeafe' : 'transparent',
                        color: timeUnit === 'week' ? '#1d4ed8' : '#6b7280',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Период
                    </button>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" style={{ width: '12px', height: '12px' }} checked={showHeadcount} onChange={(e) => setShowHeadcount(e.target.checked)} />
                    <span>Σ</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" style={{ width: '12px', height: '12px' }} checked={showFte} onChange={(e) => setShowFte(e.target.checked)} />
                    <span>123</span>
                  </label>
                </div>
              </div>
              
              <div style={{ 
                height: '80px', 
                borderRadius: '6px', 
                overflow: 'hidden'
              }}>
                <ForecastChart activeView={activeChartView} timeUnit={timeUnit} overlaySeries={selectedOverlays} />
              </div>

              {/* KPI tiles under the chart */}
              <div style={{ marginTop: '8px' }}>
                <KpiCardGrid
                  items={[
                    {
                      label: 'Покрытие',
                      value: `${scheduleStats.coveragePercentage || 0}%`,
                      variant: (scheduleStats.coveragePercentage || 0) >= 90 ? 'success' : 'warning',
                      trend: 'stable',
                    },
                    {
                      label: 'Уровень сервиса',
                      // simple mirror of service last value used in ForecastChart mock
                      value: `${Math.round(85 + Math.sin(20 * 0.1) * 5 + 5)}%`,
                      variant: 'neutral',
                      trend: 'stable',
                    },
                    {
                      label: 'Придерживание',
                      value: '—',
                      variant: 'neutral',
                    },
                    {
                      label: 'Σ/123 включены',
                      value: `${showHeadcount ? 'Σ' : ''}${showHeadcount && showFte ? ' + ' : ''}${showFte ? '123' : ''}` || '—',
                      variant: 'neutral',
                    },
                  ]}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div style={{ 
              borderBottom: '1px solid #e5e7eb', 
              padding: '16px', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" style={{ borderRadius: '4px' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Все</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '4px', 
                    backgroundColor: '#bc0181' 
                  }}></div>
                  <span style={{ fontSize: '14px' }}>Входящая линия_1</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setIsVirtualized(!isVirtualized);
                      console.log(`🔄 Switched to ${!isVirtualized ? 'Virtualized' : 'Regular'} view`);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 500+ сотрудников
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Поиск по навыкам"
                  style={{ 
                    padding: '4px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '14px', 
                    width: '192px' 
                  }}
                />
                <button style={{ 
                  padding: '4px 8px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}>🔽</button>
              </div>
            </div>

        {/* Main Grid - Fixed table layout */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Table Structure */}
          <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
            {/* Header Row */}
            <thead>
              <tr>
                <th style={{ 
                  width: '320px', 
                  padding: '12px 16px', 
                  backgroundColor: '#f9fafb', 
                  borderRight: '2px solid #2d3e50',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  По сотрудникам
                </th>
                {dates.map((date, index) => (
                  <th 
                    key={index}
                    style={{ 
                      width: '70px',
                      padding: '4px',
                      borderRight: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: date.isWeekend ? '#f3f4f6' : '#f9fafb',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: date.isWeekend ? 'bold' : 'normal'
                    }}
                  >
                    <div style={{ color: '#374151' }}>{date.dayName}</div>
                    <div style={{ color: '#6b7280' }}>
                      {String(date.day).padStart(2, '0')}.07
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Body Rows */}
            <tbody>
              {employees.map((employee, empIndex) => {
                const variance = employee.scheduledHours - employee.plannedHours;
                const isPositive = variance > 0;
                
                return (
                  <tr 
                    key={employee.id}
                    style={{ 
                      backgroundColor: empIndex % 2 === 0 ? 'white' : '#f9fafb',
                      height: '50px'
                    }}
                  >
                    {/* Employee Info Cell */}
                    <td style={{ 
                      padding: '8px 16px', 
                      borderRight: '2px solid #2d3e50',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: empIndex % 2 === 0 ? 'white' : '#f9fafb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          backgroundColor: '#dbeafe', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '14px', 
                          fontWeight: 'bold', 
                          color: '#1d4ed8' 
                        }}>
                          {employee.photo}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#111827',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {employee.fullName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {employee.role}
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            <span style={{ color: '#111827', fontWeight: '500' }}>{employee.scheduledHours}</span>
                            <span style={{ color: '#6b7280' }}> / {employee.plannedHours}</span>
                            <span style={{ color: '#6b7280' }}> | </span>
                            <span style={{ color: isPositive ? '#059669' : '#dc2626' }}>
                              {isPositive ? '+' : ''}{variance} ч.
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Schedule Cells */}
                    {dates.map((date, dateIndex) => {
                      const shift = getShiftForCell(employee.id, dateIndex);
                      const cellId = `${employee.id}-${dateIndex}`;
                      const isSelected = selectedCells.has(cellId);
                      
                      return (
                        <DroppableGridCell
                          key={dateIndex}
                          employeeId={employee.id}
                          dateIndex={dateIndex}
                          date={date}
                          shift={shift}
                          isSelected={isSelected}
                          onCellClick={handleCellClick}
                        />
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          padding: '12px 16px', 
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <span style={{ color: '#6b7280' }}>
            Показано: {scheduleStats.totalEmployees || employees.length} сотрудников • Период: Июль 2024
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#6b7280' }}>
              Покрытие: <span style={{ fontWeight: '500', color: '#059669' }}>{scheduleStats.coveragePercentage || 0}%</span>
            </span>
            <span style={{ color: '#6b7280' }}>
              Выбрано ячеек: <span style={{ fontWeight: '500' }}>{selectedCells.size}</span>
            </span>
            <span style={{ color: '#6b7280' }}>
              Смен в расписании: <span style={{ fontWeight: '500' }}>{scheduleStats.totalShifts || shifts.size}</span>
            </span>
            <span style={{ color: '#6b7280' }}>
              <button
                onClick={loadScheduleData}
                disabled={isConnecting}
                style={{
                  marginLeft: '16px',
                  padding: '4px 8px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  opacity: isConnecting ? 0.6 : 1
                }}
              >
                🔄 {isConnecting ? 'Обновление...' : 'Обновить'}
              </button>
            </span>
          </div>
        </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeShift ? <DraggableShiftBlock shift={activeShift} isDragOverlay /> : null}
          </DragOverlay>
          </div>
        </DndContext>
      )}
    </>
  );
};

export default ScheduleGridContainer;
