import React, { useState, useEffect } from 'react';
import realTimeOffService, { TimeOffRequest, TimeOffBalance } from '../services/realTimeOffService';

const TimeOffCalendar: React.FC = () => {
  // Real state management - NO MOCK DATA
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [timeOffBalances, setTimeOffBalances] = useState<TimeOffBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [calendarStats, setCalendarStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    averageApprovalTime: 0
  });
  const [selectedDate, setSelectedDate] = useState<string>('2024-07-17');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TimeOffRequest | null>(null);
  const [requestFormData, setRequestFormData] = useState<Partial<TimeOffRequest>>({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
    isEmergency: false
  });
  const [viewPeriod, setViewPeriod] = useState({
    startDate: '2024-07-01',
    endDate: '2024-07-31'
  });

  // Load time off data on component mount
  useEffect(() => {
    loadTimeOffData();
  }, [viewPeriod]);

  const loadTimeOffData = async () => {
    setApiError('');
    setIsLoading(true);
    
    try {
      // Check API health first
      const isApiHealthy = await realTimeOffService.checkApiHealth();
      if (!isApiHealthy) {
        throw new Error('Time Off API server is not available. Please try again later.');
      }

      console.log('[REAL TIME OFF] Loading time off data for period:', viewPeriod);
      
      const result = await realTimeOffService.getTimeOffCalendar(
        viewPeriod.startDate, 
        viewPeriod.endDate
      );
      
      if (result.success && result.data) {
        console.log('[REAL TIME OFF] Success:', result.data);
        
        setTimeOffRequests(result.data.requests);
        setTimeOffBalances(result.data.balances);
        setCalendarStats(result.data.statistics);
        
      } else {
        // Handle real error from API
        setApiError(result.error || 'Failed to load time off data');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL TIME OFF] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestFormData.type || !requestFormData.startDate || !requestFormData.endDate) {
      setApiError('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    setApiError('');
    
    try {
      // Validate request first
      const validationResult = await realTimeOffService.validateTimeOffRequest(requestFormData);
      if (validationResult.success && validationResult.data) {
        if (!validationResult.data.valid) {
          setApiError(`Request validation failed: ${validationResult.data.errors.join(', ')}`);
          return;
        }
        
        // Show warnings if any
        if (validationResult.data.warnings.length > 0) {
          const continueWithWarnings = window.confirm(
            `Warnings: ${validationResult.data.warnings.join(', ')}. Continue anyway?`
          );
          if (!continueWithWarnings) return;
        }
      }

      const requestData = {
        ...requestFormData,
        employeeId: 'current-user', // Would come from auth context
        employeeName: 'Current User', // Would come from auth context
        totalDays: calculateDaysBetween(requestFormData.startDate!, requestFormData.endDate!)
      } as Omit<TimeOffRequest, 'id' | 'submittedAt' | 'status'>;

      console.log('[REAL TIME OFF] Submitting request:', requestData);
      
      const result = await realTimeOffService.submitTimeOffRequest(requestData);
      
      if (result.success && result.data) {
        console.log('[REAL TIME OFF] Request submitted:', result.data);
        
        // Add to local state
        setTimeOffRequests(prev => [...prev, result.data!]);
        
        // Refresh data
        loadTimeOffData();
        handleCancelModal();
      } else {
        setApiError(result.error || 'Failed to submit request');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL TIME OFF] Submit request error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!editingRequest) return;

    setIsConnecting(true);
    setApiError('');
    
    try {
      console.log('[REAL TIME OFF] Updating request:', editingRequest.id, requestFormData);
      
      const result = await realTimeOffService.updateTimeOffRequest(editingRequest.id, requestFormData);
      
      if (result.success && result.data) {
        console.log('[REAL TIME OFF] Request updated:', result.data);
        
        // Update local state
        setTimeOffRequests(prev => prev.map(r => r.id === editingRequest.id ? result.data! : r));
        
        // Refresh data
        loadTimeOffData();
        handleCancelModal();
      } else {
        setApiError(result.error || 'Failed to update request');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL TIME OFF] Update request error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this time off request?');
    if (!confirmCancel) return;

    setIsConnecting(true);
    setApiError('');
    
    try {
      console.log('[REAL TIME OFF] Cancelling request:', requestId);
      
      const result = await realTimeOffService.cancelTimeOffRequest(requestId, 'Cancelled by user');
      
      if (result.success) {
        console.log('[REAL TIME OFF] Request cancelled:', requestId);
        
        // Update local state
        setTimeOffRequests(prev => prev.map(r => 
          r.id === requestId ? { ...r, status: 'cancelled' as const } : r
        ));
        
        // Refresh data
        loadTimeOffData();
      } else {
        setApiError(result.error || 'Failed to cancel request');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL TIME OFF] Cancel request error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setIsConnecting(true);
    setApiError('');
    
    try {
      console.log('[REAL TIME OFF] Approving request:', requestId);
      
      const result = await realTimeOffService.approveTimeOffRequest(requestId);
      
      if (result.success && result.data) {
        console.log('[REAL TIME OFF] Request approved:', result.data);
        
        // Update local state
        setTimeOffRequests(prev => prev.map(r => r.id === requestId ? result.data! : r));
        
        // Refresh data
        loadTimeOffData();
      } else {
        setApiError(result.error || 'Failed to approve request');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL TIME OFF] Approve request error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEditRequest = (request: TimeOffRequest) => {
    setEditingRequest(request);
    setRequestFormData({
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
      isEmergency: request.isEmergency
    });
    setShowRequestModal(true);
  };

  const handleCancelModal = () => {
    setShowRequestModal(false);
    setEditingRequest(null);
    setRequestFormData({
      type: 'vacation',
      startDate: '',
      endDate: '',
      reason: '',
      isEmergency: false
    });
  };

  const calculateDaysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getRequestsByDate = (date: string): TimeOffRequest[] => {
    return timeOffRequests.filter(request => 
      date >= request.startDate && date <= request.endDate
    );
  };

  const generateCalendarDays = () => {
    const start = new Date(viewPeriod.startDate);
    const end = new Date(viewPeriod.endDate);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayRequests = getRequestsByDate(dateStr);
      
      days.push({
        date: dateStr,
        day: d.getDate(),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        requests: dayRequests
      });
    }
    
    return days;
  };

  const getTypeIcon = (type: TimeOffRequest['type']) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'sick_leave': return '🤒';
      case 'personal': return '👤';
      case 'unpaid': return '💸';
      case 'maternity': return '👶';
      case 'bereavement': return '🕊️';
      default: return '📅';
    }
  };

  const getStatusColor = (status: TimeOffRequest['status']) => {
    switch (status) {
      case 'approved': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'pending': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'cancelled': return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    }
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
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🏖️</div>
          <div style={{ fontSize: '16px', color: '#6b7280' }}>Загрузка календаря отпусков...</div>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

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
                Ошибка календаря отпусков
              </div>
              <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                {apiError}
              </div>
              <button
                onClick={loadTimeOffData}
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
            🏖️ Календарь отпусков
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: '4px 0 0 0' 
          }}>
            Управление заявками на отпуск и отгулы
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={loadTimeOffData}
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
            onClick={() => setShowRequestModal(true)}
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
            ➕ Подать заявку
          </button>
        </div>
      </div>

      {/* Statistics */}
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
            📊 Всего заявок
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
            {calendarStats.totalRequests}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>
            ⏳ На рассмотрении
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
            {calendarStats.pendingRequests}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #93c5fd',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>
            ✅ Одобрено
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
            {calendarStats.approvedRequests}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
            ❌ Отклонено
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
            {calendarStats.rejectedRequests}
          </div>
        </div>
      </div>

      {/* Time Off Balance */}
      {timeOffBalances.length > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
            💼 Баланс отпусков
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {timeOffBalances[0] && (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    🏖️ Отпуск
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {timeOffBalances[0].vacation.available} из {timeOffBalances[0].vacation.total} дней
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Использовано: {timeOffBalances[0].vacation.used}, В ожидании: {timeOffBalances[0].vacation.pending}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    🤒 Больничный
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {timeOffBalances[0].sickLeave.available} из {timeOffBalances[0].sickLeave.total} дней
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Использовано: {timeOffBalances[0].sickLeave.used}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    👤 Личные дни
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {timeOffBalances[0].personal.available} из {timeOffBalances[0].personal.total} дней
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Использовано: {timeOffBalances[0].personal.used}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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

              {/* Time Off Requests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {day.requests.slice(0, 2).map(request => {
                  const statusColor = getStatusColor(request.status);
                  return (
                    <div
                      key={request.id}
                      onClick={(e) => { e.stopPropagation(); handleEditRequest(request); }}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: statusColor.bg,
                        border: `1px solid ${statusColor.border}`,
                        borderRadius: '3px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: statusColor.text
                      }}
                      title={`${request.employeeName} - ${request.type} (${request.status})`}
                    >
                      {getTypeIcon(request.type)} {request.employeeName}
                    </div>
                  );
                })}
                {day.requests.length > 2 && (
                  <div style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    +{day.requests.length - 2} еще
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
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
              {editingRequest ? 'Редактирование заявки' : 'Подача заявки на отпуск'}
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingRequest ? handleUpdateRequest() : handleSubmitRequest();
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Тип отпуска *
                </label>
                <select
                  value={requestFormData.type}
                  onChange={(e) => setRequestFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value as TimeOffRequest['type']
                  }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="vacation">🏖️ Отпуск</option>
                  <option value="sick_leave">🤒 Больничный</option>
                  <option value="personal">👤 Личные дела</option>
                  <option value="unpaid">💸 Неоплачиваемый</option>
                  <option value="maternity">👶 Декретный</option>
                  <option value="bereavement">🕊️ По семейным обстоятельствам</option>
                </select>
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
                    value={requestFormData.startDate}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                    value={requestFormData.endDate}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, endDate: e.target.value }))}
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

              {requestFormData.startDate && requestFormData.endDate && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #93c5fd',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '14px', color: '#1e40af' }}>
                    📅 Продолжительность: {calculateDaysBetween(requestFormData.startDate, requestFormData.endDate)} дней
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Причина/Комментарий
                </label>
                <textarea
                  value={requestFormData.reason || ''}
                  onChange={(e) => setRequestFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Укажите причину или дополнительную информацию"
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={requestFormData.isEmergency}
                    onChange={(e) => setRequestFormData(prev => ({ ...prev, isEmergency: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  🚨 Экстренная заявка (требует немедленного рассмотрения)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {editingRequest && editingRequest.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleCancelRequest(editingRequest.id)}
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
                    ❌ Отменить заявку
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
                  Закрыть
                </button>
                
                {(!editingRequest || editingRequest.status === 'pending') && (
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
                     editingRequest ? 'Сохранить изменения' : 'Подать заявку'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOffCalendar;