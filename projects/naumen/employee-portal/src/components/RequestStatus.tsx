import React, { useState, useEffect } from 'react';

interface RequestStatusProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  onAction?: (action: string, data?: any) => void;
}

interface TimelineEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  description: string;
  comments?: string;
  status: 'completed' | 'current' | 'pending' | 'cancelled';
  type: 'system' | 'user' | 'approver';
}

interface RequestDetails {
  id: string;
  type: string;
  title: string;
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: Date;
  startDate: Date;
  endDate?: Date;
  reason: string;
  employee: {
    name: string;
    position: string;
    department: string;
  };
  approver?: {
    name: string;
    position: string;
    comments?: string;
  };
  timeline: TimelineEntry[];
  canCancel: boolean;
  canModify: boolean;
  estimatedDecision?: Date;
}

const RequestStatus: React.FC<RequestStatusProps> = ({ isOpen, onClose, requestId, onAction }) => {
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Load request details
  useEffect(() => {
    if (isOpen && requestId) {
      loadRequestDetails();
    }
  }, [isOpen, requestId]);

  const loadRequestDetails = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock request data
    const mockRequest: RequestDetails = {
      id: requestId,
      type: 'vacation',
      title: 'Ежегодный отпуск - семейные обстоятельства',
      status: 'pending_approval',
      priority: 'normal',
      submittedAt: new Date('2025-06-01T10:30:00'),
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-07-19'),
      reason: 'Семейные обстоятельства, необходимо присутствие на важном семейном мероприятии. Планируется поездка к родственникам в другой город.',
      employee: {
        name: 'Иванов Иван Иванович',
        position: 'Оператор',
        department: 'Поддержка клиентов'
      },
      approver: {
        name: 'Петрова Елена Сергеевна',
        position: 'Руководитель отдела'
      },
      timeline: [
        {
          id: '1',
          timestamp: new Date('2025-06-01T10:30:00'),
          action: 'Создание заявки',
          actor: 'Иванов И.И.',
          description: 'Заявка создана и сохранена как черновик',
          status: 'completed',
          type: 'user'
        },
        {
          id: '2',
          timestamp: new Date('2025-06-01T10:45:00'),
          action: 'Подача заявки',
          actor: 'Иванов И.И.',
          description: 'Заявка подана на рассмотрение',
          status: 'completed',
          type: 'user'
        },
        {
          id: '3',
          timestamp: new Date('2025-06-01T11:00:00'),
          action: 'Автоматическая проверка',
          actor: 'Система',
          description: 'Проверка баланса отпускных дней и корректности данных',
          status: 'completed',
          type: 'system'
        },
        {
          id: '4',
          timestamp: new Date('2025-06-01T14:20:00'),
          action: 'Направлено на рассмотрение',
          actor: 'Система',
          description: 'Заявка направлена руководителю для принятия решения',
          status: 'completed',
          type: 'system'
        },
        {
          id: '5',
          timestamp: new Date('2025-06-02T09:00:00'),
          action: 'Рассмотрение руководителем',
          actor: 'Петрова Е.С.',
          description: 'Заявка находится на рассмотрении у руководителя отдела',
          status: 'current',
          type: 'approver'
        },
        {
          id: '6',
          timestamp: new Date('2025-06-04T17:00:00'),
          action: 'Принятие решения',
          actor: 'Петрова Е.С.',
          description: 'Ожидается принятие решения по заявке',
          status: 'pending',
          type: 'approver'
        },
        {
          id: '7',
          timestamp: new Date('2025-06-04T17:30:00'),
          action: 'Уведомление сотрудника',
          actor: 'Система',
          description: 'Отправка уведомления о принятом решении',
          status: 'pending',
          type: 'system'
        }
      ],
      canCancel: true,
      canModify: false,
      estimatedDecision: new Date('2025-06-04T17:00:00')
    };
    
    setRequest(mockRequest);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return colors[status as keyof typeof colors] || colors.submitted;
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Черновик',
      submitted: 'Подана',
      pending_approval: 'На рассмотрении',
      approved: 'Одобрена',
      rejected: 'Отклонена',
      cancelled: 'Отменена'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600',
      normal: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      low: 'Низкий',
      normal: 'Обычный',
      high: 'Высокий',
      urgent: 'Срочный'
    };
    return texts[priority as keyof typeof texts] || priority;
  };

  const getTimelineIcon = (entry: TimelineEntry) => {
    switch (entry.type) {
      case 'user':
        return '👤';
      case 'approver':
        return '👨‍💼';
      case 'system':
        return '⚙️';
      default:
        return '📋';
    }
  };

  const getTimelineStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'current':
        return '🔄';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '⏳';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Укажите причину отмены заявки');
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAction?.('cancel', { reason: cancelReason });
      setShowCancelModal(false);
      onClose();
    } catch (error) {
      console.error('Ошибка при отмене заявки:', error);
    }
  };

  const handleAction = (action: string) => {
    onAction?.(action);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Статус заявки</h2>
                <p className="text-sm text-gray-600">Отслеживание хода рассмотрения</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка информации о заявке...</p>
            </div>
          ) : !request ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Заявка не найдена</p>
            </div>
          ) : (
            <div className="flex max-h-[70vh]">
              
              {/* Request Details Sidebar */}
              <div className="w-96 bg-gray-50 border-r p-6 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Детали заявки</h3>
                
                {/* Basic Info */}
                <div className="bg-white rounded-lg p-4 mb-4 border">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Название:</span>
                      <div className="font-medium">{request.title}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Статус:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Приоритет:</span>
                      <span className={`font-medium ${getPriorityColor(request.priority)}`}>
                        {getPriorityText(request.priority)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Период:</span>
                      <div className="font-medium">
                        {formatDate(request.startDate)}
                        {request.endDate && ` - ${formatDate(request.endDate)}`}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Подана:</span>
                      <div className="font-medium">{formatDateTime(request.submittedAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Employee Info */}
                <div className="bg-white rounded-lg p-4 mb-4 border">
                  <h4 className="font-medium mb-2">Сотрудник</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>{request.employee.name}</strong></div>
                    <div>{request.employee.position}</div>
                    <div className="text-gray-600">{request.employee.department}</div>
                  </div>
                </div>

                {/* Approver Info */}
                {request.approver && (
                  <div className="bg-white rounded-lg p-4 mb-4 border">
                    <h4 className="font-medium mb-2">Рассматривает</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>{request.approver.name}</strong></div>
                      <div>{request.approver.position}</div>
                    </div>
                    {request.approver.comments && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        <strong>Комментарий:</strong> {request.approver.comments}
                      </div>
                    )}
                  </div>
                )}

                {/* Expected Decision */}
                {request.estimatedDecision && request.status === 'pending_approval' && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Ожидаемое решение</h4>
                    <div className="text-sm text-blue-800">
                      {formatDateTime(request.estimatedDecision)}
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">Причина</h4>
                  <div className="text-sm text-gray-700">{request.reason}</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-6">Хронология рассмотрения</h3>
                
                <div className="space-y-6">
                  {request.timeline.map((entry, index) => (
                    <div key={entry.id} className="relative">
                      {/* Timeline line */}
                      {index < request.timeline.length - 1 && (
                        <div className="absolute left-6 top-12 w-px h-12 bg-gray-200"></div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        {/* Status icon */}
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg ${
                          entry.status === 'completed' 
                            ? 'border-green-200 bg-green-50' 
                            : entry.status === 'current'
                            ? 'border-blue-200 bg-blue-50'
                            : entry.status === 'cancelled'
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          {getTimelineStatusIcon(entry.status)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className={`rounded-lg border p-4 ${
                            entry.status === 'current' 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200 bg-white'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{entry.action}</h4>
                              <div className="text-xs text-gray-500">
                                {formatDateTime(entry.timestamp)}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm">{getTimelineIcon(entry)}</span>
                              <span className="text-sm font-medium text-gray-700">{entry.actor}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600">{entry.description}</p>
                            
                            {entry.comments && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                                <strong>Комментарий:</strong> {entry.comments}
                              </div>
                            )}
                            
                            {entry.status === 'current' && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                В процессе
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {request && (
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                ID заявки: <span className="font-mono">{request.id}</span>
              </div>
              <div className="flex gap-3">
                {request.canCancel && ['submitted', 'pending_approval'].includes(request.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Отменить заявку
                  </button>
                )}
                
                {request.canModify && request.status === 'draft' && (
                  <button
                    onClick={() => handleAction('edit')}
                    className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Редактировать
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Отмена заявки</h3>
            <p className="text-gray-600 mb-4">
              Вы уверены, что хотите отменить заявку? Это действие нельзя отменить.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Причина отмены
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Укажите причину отмены заявки..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Не отменять
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Отменить заявку
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestStatus;