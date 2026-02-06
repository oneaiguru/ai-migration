import React from 'react';
import { AdminRequest, ScheduleChangeRequest, ShiftExchangeRequest } from '../../types';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  ArrowRightLeft,
  Settings
} from 'lucide-react';

interface RequestDetailsModalProps {
  request: AdminRequest;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (requestId: string, status: 'approved' | 'rejected', notes?: string) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  onStatusChange
}) => {
  const [managerNotes, setManagerNotes] = React.useState(request.managerNotes || '');
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen) return null;

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
    onStatusChange?.(request.id, status, managerNotes);
    setIsProcessing(false);
    onClose();
  };

  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (request.status) {
      case 'pending':
        return 'На рассмотрении';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
    }
  };

  const getPriorityColor = () => {
    switch (request.priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
    }
  };

  const getPriorityText = () => {
    switch (request.priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderScheduleChangeDetails = (req: ScheduleChangeRequest) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Текущая смена
          </h4>
          <p className="text-sm text-gray-600">
            {req.originalShift.start} - {req.originalShift.end}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Запрашиваемая смена
          </h4>
          <p className="text-sm text-gray-600">
            {req.requestedShift.start} - {req.requestedShift.end}
          </p>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Причина изменения
        </h4>
        <p className="text-sm text-gray-600">{req.reason}</p>
      </div>
    </div>
  );

  const renderShiftExchangeDetails = (req: ShiftExchangeRequest) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Инициатор обмена</h4>
          <p className="text-sm text-gray-600">{req.initiatingEmployee}</p>
          <p className="text-xs text-gray-500 mt-1">
            Смена: {req.originalShift.start} - {req.originalShift.end}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Целевой сотрудник</h4>
          <p className="text-sm text-gray-600">{req.targetEmployee}</p>
          <p className="text-xs text-gray-500 mt-1">
            Смена: {req.targetShift.start} - {req.targetShift.end}
          </p>
        </div>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Дата обмена
        </h4>
        <p className="text-sm text-gray-600">{formatDateTime(req.exchangeDate)}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {request.type === 'schedule_change' ? 'Изменение расписания' : 'Обмен сменами'}
              </h2>
              <p className="text-sm text-gray-500">Заявка #{request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Сотрудник
              </h3>
              <p className="text-sm text-gray-900 font-medium">{request.employeeName}</p>
              <p className="text-xs text-gray-500">ID: {request.employeeId}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Дата подачи
              </h3>
              <p className="text-sm text-gray-600">{formatDateTime(request.submissionDate)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Приоритет</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor()}`}>
                {getPriorityText()}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Статус
            </h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Описание заявки
            </h3>
            <p className="text-sm text-gray-600">{request.description}</p>
          </div>

          {/* Request Type Specific Details */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Детали заявки</h3>
            {request.type === 'schedule_change' 
              ? renderScheduleChangeDetails(request as ScheduleChangeRequest)
              : renderShiftExchangeDetails(request as ShiftExchangeRequest)
            }
          </div>

          {/* Manager Notes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Комментарии менеджера
            </h3>
            {request.status === 'pending' && onStatusChange ? (
              <textarea
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder="Добавьте комментарий к решению..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-600">
                {request.managerNotes || 'Комментарии отсутствуют'}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {request.status === 'pending' && onStatusChange && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Отменить
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isProcessing ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>Отклонить</span>
            </button>
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isProcessing ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Одобрить</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};