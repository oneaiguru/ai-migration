import React, { useState } from 'react';

interface RequestCardProps {
  request: RequestItem;
  onAction: (action: string, requestId: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

interface RequestItem {
  id: string;
  type: 'vacation' | 'sick_leave' | 'time_off' | 'shift_change' | 'overtime';
  title: string;
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  startDate: Date;
  endDate?: Date;
  reason: string;
  submittedAt: Date;
  approver?: {
    name: string;
    comments?: string;
  };
  daysRequested?: number;
  actionRequired?: boolean;
  estimatedDecision?: Date;
  employee?: {
    name: string;
    position: string;
  };
}

const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  onAction, 
  compact = false, 
  showActions = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getStatusColor = (status: RequestItem['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      submitted: 'bg-blue-100 text-blue-800 border-blue-300',
      pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colors[status];
  };

  const getStatusText = (status: RequestItem['status']) => {
    const texts = {
      draft: 'Черновик',
      submitted: 'Подана',
      pending_approval: 'На рассмотрении',
      approved: 'Одобрена',
      rejected: 'Отклонена',
      cancelled: 'Отменена'
    };
    return texts[status];
  };

  const getTypeText = (type: RequestItem['type']) => {
    const types = {
      vacation: 'Отпуск',
      sick_leave: 'Больничный',
      time_off: 'Отгул',
      shift_change: 'Изменение смены',
      overtime: 'Сверхурочные'
    };
    return types[type];
  };

  const getTypeIcon = (type: RequestItem['type']) => {
    const icons = {
      vacation: '🏖️',
      sick_leave: '🏥',
      time_off: '🕐',
      shift_change: '🔄',
      overtime: '⏰'
    };
    return icons[type];
  };

  const getPriorityColor = (priority: RequestItem['priority']) => {
    const colors = {
      low: 'border-gray-300',
      normal: 'border-blue-300',
      high: 'border-orange-300',
      urgent: 'border-red-400'
    };
    return colors[priority];
  };

  const getPriorityBadge = (priority: RequestItem['priority']) => {
    if (priority === 'normal') return null;
    
    const badges = {
      low: 'bg-gray-100 text-gray-600',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    
    const labels = {
      low: 'Низкий',
      high: 'Высокий',
      urgent: 'Срочно'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateRange = (start: Date, end?: Date) => {
    if (!end) return formatDate(start);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'завтра';
    if (diffDays > 0) return `через ${diffDays} дн.`;
    if (diffDays === -1) return 'вчера';
    return `${Math.abs(diffDays)} дн. назад`;
  };

  const getAvailableActions = () => {
    const actions: { id: string; label: string; color?: string }[] = [
      { id: 'view', label: 'Открыть' }
    ];

    switch (request.status) {
      case 'draft':
        actions.push(
          { id: 'edit', label: 'Редактировать', color: 'text-blue-600' },
          { id: 'submit', label: 'Подать', color: 'text-green-600' },
          { id: 'delete', label: 'Удалить', color: 'text-red-600' }
        );
        break;
      case 'submitted':
      case 'pending_approval':
        actions.push({ id: 'cancel', label: 'Отменить', color: 'text-red-600' });
        break;
      case 'approved':
        if (request.startDate > new Date()) {
          actions.push({ id: 'cancel', label: 'Отменить', color: 'text-red-600' });
        }
        break;
    }

    return actions;
  };

  const handleAction = (actionId: string) => {
    setShowDropdown(false);
    onAction(actionId, request.id);
  };

  const handleQuickAction = (actionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onAction(actionId, request.id);
  };

  return (
    <div
      className={`bg-white border rounded-lg transition-all duration-200 hover:shadow-md ${
        getPriorityColor(request.priority)
      } ${
        request.actionRequired ? 'ring-2 ring-orange-200 bg-orange-50' : ''
      } ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          
          {/* Header */}
          <div className="flex items-start gap-3 mb-2">
            <span className="text-xl flex-shrink-0">{getTypeIcon(request.type)}</span>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'} truncate`}>
                {request.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
                {getPriorityBadge(request.priority)}
                {request.actionRequired && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                    Требует действий
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className={`text-sm text-gray-600 space-y-1 ${compact ? 'text-xs' : ''}`}>
            <div className="flex items-center gap-4">
              <span><strong>Тип:</strong> {getTypeText(request.type)}</span>
              <span><strong>Период:</strong> {formatDateRange(request.startDate, request.endDate)}</span>
              {request.daysRequested && (
                <span><strong>Дней:</strong> {request.daysRequested}</span>
              )}
            </div>
            
            {!compact && (
              <div className="mt-2">
                <strong>Причина:</strong> {request.reason.length > 100 && !isExpanded 
                  ? `${request.reason.substring(0, 100)}...` 
                  : request.reason
                }
                {request.reason.length > 100 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    {isExpanded ? 'Свернуть' : 'Показать полностью'}
                  </button>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>Подана: {formatDate(request.submittedAt)}</span>
              {request.estimatedDecision && request.status === 'pending_approval' && (
                <span className="text-blue-600">
                  Решение ожидается {formatRelativeDate(request.estimatedDecision)}
                </span>
              )}
            </div>

            {/* Approver info */}
            {request.approver && (
              <div className="text-xs text-gray-500">
                Рассматривает: {request.approver.name}
              </div>
            )}

            {/* Comments */}
            {request.approver?.comments && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <strong>Комментарий:</strong> {request.approver.comments}
              </div>
            )}

            {/* Employee info (for manager view) */}
            {request.employee && (
              <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                <strong>{request.employee.name}</strong> - {request.employee.position}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 ml-4">
            {/* Quick actions for common statuses */}
            {request.status === 'draft' && (
              <>
                <button
                  onClick={(e) => handleQuickAction('edit', e)}
                  className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                >
                  Редактировать
                </button>
                <button
                  onClick={(e) => handleQuickAction('submit', e)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Подать
                </button>
              </>
            )}

            {['submitted', 'pending_approval'].includes(request.status) && (
              <button
                onClick={(e) => handleQuickAction('cancel', e)}
                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
              >
                Отменить
              </button>
            )}

            {/* More actions dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Действия"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1">
                    {getAvailableActions().map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleAction(action.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          action.color || 'text-gray-700'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator for pending requests */}
      {request.status === 'pending_approval' && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Ход рассмотрения</span>
            <span>
              {request.estimatedDecision 
                ? `Ожидается ${formatRelativeDate(request.estimatedDecision)}`
                : 'Рассматривается'
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Time-sensitive indicator */}
      {request.startDate && (
        <div className="mt-2">
          {(() => {
            const daysUntilStart = Math.ceil((request.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilStart <= 7 && daysUntilStart >= 0 && ['submitted', 'pending_approval'].includes(request.status)) {
              return (
                <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  <span>⚠️</span>
                  <span>
                    {daysUntilStart === 0 
                      ? 'Начинается сегодня' 
                      : `Осталось ${daysUntilStart} дн. до начала`
                    }
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default RequestCard;