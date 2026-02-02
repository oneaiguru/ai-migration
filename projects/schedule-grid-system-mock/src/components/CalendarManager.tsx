import React, { useState, useEffect } from 'react';
import realCalendarService, { CalendarEvent, CalendarView } from '../services/realCalendarService';

const CalendarManager: React.FC = () => {
  // Real state management - NO MOCK DATA
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentView, setCurrentView] = useState<CalendarView>({
    id: 'default',
    name: 'Monthly View',
    type: 'month',
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    showWeekends: true
  });
  const [calendarStats, setCalendarStats] = useState({
    totalEvents: 0,
    confirmedEvents: 0,
    pendingEvents: 0,
    conflicts: 0
  });
  const [selectedDate, setSelectedDate] = useState<string>('2024-07-17');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventFormData, setEventFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'shift',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:00',
    isAllDay: false,
    isRecurring: false,
    status: 'pending'
  });

  // Load calendar data on component mount
  useEffect(() => {
    loadCalendarData();
  }, [currentView]);

  const loadCalendarData = async () => {
    setApiError('');
    setIsLoading(true);
    
    try {
      // Check API health first
      const isApiHealthy = await realCalendarService.checkApiHealth();
      if (!isApiHealthy) {
        throw new Error('Calendar API server is not available. Please try again later.');
      }

      console.log('[REAL CALENDAR] Loading calendar data for view:', currentView);
      
      const result = await realCalendarService.getCalendarEvents(currentView);
      
      if (result.success && result.data) {
        console.log('[REAL CALENDAR] Success:', result.data);
        
        setEvents(result.data.events);
        setCalendarStats(result.data.statistics);
        
      } else {
        // Handle real error from API
        setApiError(result.error || 'Failed to load calendar data');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL CALENDAR] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventFormData.title || !eventFormData.startDate || !eventFormData.endDate) {
      setApiError('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    setApiError('');
    
    try {
      // Check for conflicts first
      const conflictCheck = await realCalendarService.checkConflicts(eventFormData);
      if (conflictCheck.success && conflictCheck.data?.hasConflicts) {
        const confirmCreate = window.confirm(
          `This event has conflicts: ${conflictCheck.data.conflicts.join(', ')}. Continue anyway?`
        );
        if (!confirmCreate) return;
      }

      const eventData = {
        ...eventFormData,
        employeeId: 'current-user', // Would come from auth context
      } as Omit<CalendarEvent, 'id'>;

      console.log('[REAL CALENDAR] Creating event:', eventData);
      
      const result = await realCalendarService.createEvent(eventData);
      
      if (result.success && result.data) {
        console.log('[REAL CALENDAR] Event created:', result.data);
        
        // Add to local state
        setEvents(prev => [...prev, result.data!]);
        
        // Refresh calendar data
        loadCalendarData();
        handleCancelModal();
      } else {
        setApiError(result.error || 'Failed to create event');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL CALENDAR] Create event error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    setIsConnecting(true);
    setApiError('');
    
    try {
      console.log('[REAL CALENDAR] Updating event:', editingEvent.id, eventFormData);
      
      const result = await realCalendarService.updateEvent(editingEvent.id, eventFormData);
      
      if (result.success && result.data) {
        console.log('[REAL CALENDAR] Event updated:', result.data);
        
        // Update local state
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? result.data! : e));
        
        // Refresh calendar data
        loadCalendarData();
        handleCancelModal();
      } else {
        setApiError(result.error || 'Failed to update event');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL CALENDAR] Update event error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;

    setIsConnecting(true);
    setApiError('');
    
    try {
      console.log('[REAL CALENDAR] Deleting event:', eventId);
      
      const result = await realCalendarService.deleteEvent(eventId);
      
      if (result.success) {
        console.log('[REAL CALENDAR] Event deleted:', eventId);
        
        // Remove from local state
        setEvents(prev => prev.filter(e => e.id !== eventId));
        
        // Refresh calendar data
        loadCalendarData();
      } else {
        setApiError(result.error || 'Failed to delete event');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL CALENDAR] Delete event error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfirmEvent = async (eventId: string) => {
    setIsConnecting(true);
    setApiError('');
    
    try {
      console.log('[REAL CALENDAR] Confirming event:', eventId);
      
      const result = await realCalendarService.confirmEvent(eventId);
      
      if (result.success && result.data) {
        console.log('[REAL CALENDAR] Event confirmed:', result.data);
        
        // Update local state
        setEvents(prev => prev.map(e => e.id === eventId ? result.data! : e));
        
        // Refresh stats
        loadCalendarData();
      } else {
        setApiError(result.error || 'Failed to confirm event');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL CALENDAR] Confirm event error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      isAllDay: event.isAllDay,
      isRecurring: event.isRecurring,
      status: event.status
    });
    setShowEventModal(true);
  };

  const handleCancelModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventFormData({
      title: '',
      type: 'shift',
      startDate: '',
      endDate: '',
      startTime: '08:00',
      endTime: '17:00',
      isAllDay: false,
      isRecurring: false,
      status: 'pending'
    });
  };

  const changeView = (viewType: 'month' | 'week' | 'day') => {
    const newView: CalendarView = {
      ...currentView,
      type: viewType,
      name: `${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View`
    };
    setCurrentView(newView);
  };

  // Generate calendar grid for month view
  const generateCalendarGrid = () => {
    const startDate = new Date(currentView.startDate);
    const endDate = new Date(currentView.endDate);
    const days = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEvents = events.filter(e => 
        e.startDate <= dateStr && e.endDate >= dateStr
      );
      
      days.push({
        date: dateStr,
        day: d.getDate(),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        events: dayEvents
      });
    }
    
    return days;
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
          <div style={{ fontSize: '16px', color: '#6b7280' }}>Загрузка календаря...</div>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarGrid();

  return (
    <div style={{ 
      height: 'calc(100vh - 180px)', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white',
      padding: '24px'
    }}>
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
                Ошибка календаря
              </div>
              <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                {apiError}
              </div>
              <button
                onClick={loadCalendarData}
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
            📅 Календарь событий
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: '4px 0 0 0' 
          }}>
            Управление событиями и расписанием
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
            {(['month', 'week', 'day'] as const).map(view => (
              <button
                key={view}
                onClick={() => changeView(view)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentView.type === view ? '#dbeafe' : '#f3f4f6',
                  color: currentView.type === view ? '#1d4ed8' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {view === 'month' ? 'Месяц' : view === 'week' ? 'Неделя' : 'День'}
              </button>
            ))}
          </div>

          <button
            onClick={loadCalendarData}
            disabled={isConnecting}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              opacity: isConnecting ? 0.6 : 1
            }}
          >
            🔄 {isConnecting ? 'Обновление...' : 'Обновить'}
          </button>
          
          <button
            onClick={() => setShowEventModal(true)}
            disabled={isConnecting}
            style={{
              padding: '12px 24px',
              backgroundColor: isConnecting ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
            }}
          >
            ➕ Создать событие
          </button>
        </div>
      </div>

      {/* Calendar Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>
            📊 Всего событий
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
            {calendarStats.totalEvents}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #93c5fd',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>
            ✅ Подтверждено
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
            {calendarStats.confirmedEvents}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>
            ⏳ В ожидании
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
            {calendarStats.pendingEvents}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
            ⚠️ Конфликты
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
            {calendarStats.conflicts}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#e5e7eb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Day Headers */}
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
            <div
              key={day}
              style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map(day => (
            <div
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              style={{
                minHeight: '100px',
                padding: '8px',
                backgroundColor: day.isToday ? '#fef3c7' : 
                               day.isSelected ? '#dbeafe' : 
                               day.isWeekend ? '#f9fafb' : 'white',
                cursor: 'pointer',
                position: 'relative',
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: day.isToday ? 'bold' : 'normal',
                color: day.isWeekend ? '#6b7280' : '#111827',
                marginBottom: '4px'
              }}>
                {day.day}
              </div>

              {/* Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {day.events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: event.color || 
                        (event.type === 'shift' ? '#dbeafe' :
                         event.type === 'vacation' ? '#dcfce7' :
                         event.type === 'meeting' ? '#fef3c7' : '#f3f4f6'),
                      borderRadius: '3px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    +{day.events.length - 3} еще
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#111827'
            }}>
              {editingEvent ? 'Редактирование события' : 'Создание нового события'}
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingEvent ? handleUpdateEvent() : handleCreateEvent();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Название события *
                </label>
                <input
                  type="text"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название события"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Дата начала *
                  </label>
                  <input
                    type="date"
                    value={eventFormData.startDate}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Дата окончания *
                  </label>
                  <input
                    type="date"
                    value={eventFormData.endDate}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Тип события
                  </label>
                  <select
                    value={eventFormData.type}
                    onChange={(e) => setEventFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as CalendarEvent['type']
                    }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="shift">🏢 Смена</option>
                    <option value="vacation">🏖️ Отпуск</option>
                    <option value="sick_leave">🤒 Больничный</option>
                    <option value="training">📚 Обучение</option>
                    <option value="meeting">🤝 Встреча</option>
                    <option value="personal">👤 Личное</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Статус
                  </label>
                  <select
                    value={eventFormData.status}
                    onChange={(e) => setEventFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as CalendarEvent['status']
                    }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="pending">⏳ В ожидании</option>
                    <option value="confirmed">✅ Подтверждено</option>
                    <option value="cancelled">❌ Отменено</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Описание
                </label>
                <textarea
                  value={eventFormData.description || ''}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Дополнительная информация о событии"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {editingEvent && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    disabled={isConnecting}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: isConnecting ? 'not-allowed' : 'pointer',
                      opacity: isConnecting ? 0.6 : 1
                    }}
                  >
                    🗑️ Удалить
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleCancelModal}
                  disabled={isConnecting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    opacity: isConnecting ? 0.6 : 1
                  }}
                >
                  Отмена
                </button>
                
                <button
                  type="submit"
                  disabled={isConnecting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isConnecting ? '#9ca3af' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isConnecting ? 'Сохранение...' : 
                   editingEvent ? 'Сохранить изменения' : 'Создать событие'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManager;