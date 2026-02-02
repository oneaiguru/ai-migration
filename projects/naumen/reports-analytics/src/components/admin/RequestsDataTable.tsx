import React from 'react';
import { AdminRequest } from '../../types';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface RequestsDataTableProps {
  requests: AdminRequest[];
  loading?: boolean;
  selectedIds?: string[];
  onRequestSelect?: (request: AdminRequest) => void;
  onStatusChange?: (requestId: string, status: 'approved' | 'rejected') => void;
  onSelectRequest?: (requestId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export const RequestsDataTable: React.FC<RequestsDataTableProps> = ({
  requests,
  loading = false,
  selectedIds = [],
  onRequestSelect,
  onStatusChange,
  onSelectRequest,
  onSelectAll
}) => {
  const getStatusIcon = (status: AdminRequest['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: AdminRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
    }
  };

  const getStatusBadgeClass = (status: AdminRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityBadgeClass = (priority: AdminRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const getPriorityText = (priority: AdminRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getRequestTypeText = (type: AdminRequest['type']) => {
    return type === 'schedule_change' ? 'Изменение расписания' : 'Обмен сменами';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Загрузка заявок...</span>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Calendar className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Заявки не найдены</h3>
        <p className="text-gray-500">
          В данный момент нет заявок, соответствующих выбранным фильтрам.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-1">
            <input 
              type="checkbox" 
              className="rounded border-gray-300"
              checked={requests.length > 0 && selectedIds.length === requests.length}
              onChange={(e) => onSelectAll?.(e.target.checked)}
            />
          </div>
          <div className="col-span-3">Сотрудник</div>
          <div className="col-span-2">Тип заявки</div>
          <div className="col-span-2">Дата подачи</div>
          <div className="col-span-1">Приоритет</div>
          <div className="col-span-2">Статус</div>
          <div className="col-span-1">Действия</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {requests.map((request) => (
          <div
            key={request.id}
            className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onRequestSelect?.(request)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox */}
              <div className="col-span-1">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedIds.includes(request.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelectRequest?.(request.id, e.target.checked);
                  }}
                />
              </div>

              {/* Employee */}
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{request.employeeName}</div>
                    <div className="text-sm text-gray-500">ID: {request.employeeId}</div>
                  </div>
                </div>
              </div>

              {/* Request Type */}
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-900">
                  {getRequestTypeText(request.type)}
                </div>
                <div className="text-sm text-gray-500 truncate" title={request.description}>
                  {request.description}
                </div>
              </div>

              {/* Submission Date */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2 text-sm text-gray-900">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(request.submissionDate)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Период: {formatDateShort(request.startDate)}
                  {request.endDate && ` - ${formatDateShort(request.endDate)}`}
                </div>
              </div>

              {/* Priority */}
              <div className="col-span-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(request.priority)}`}>
                  {getPriorityText(request.priority)}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                {request.status === 'pending' && onStatusChange && (
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(request.id, 'approved');
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Одобрить"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(request.id, 'rejected');
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Отклонить"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};