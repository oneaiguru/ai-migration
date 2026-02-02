import React, { useState, useEffect } from 'react';

interface RequestListProps {
  employeeId: string;
}

interface Request {
  id: string;
  type: 'time_off' | 'shift_change' | 'overtime' | 'vacation' | 'sick_leave';
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
}

interface RequestFilters {
  status?: string;
  type?: string;
  dateRange?: 'all' | 'last_month' | 'last_3_months' | 'this_year';
  search?: string;
}

const RequestList: React.FC<RequestListProps> = ({ employeeId }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active');
  const [filters, setFilters] = useState<RequestFilters>({});
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  // Mock data
  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockRequests: Request[] = [
        {
          id: '1',
          type: 'vacation',
          title: 'Отпуск - семейные обстоятельства',
          status: 'pending_approval',
          priority: 'normal',
          startDate: new Date('2025-07-15'),
          endDate: new Date('2025-07-19'),
          reason: 'Семейные обстоятельства, необходимо присутствие на важном семейном мероприятии',
          submittedAt: new Date('2025-06-01'),
          daysRequested: 5,
          actionRequired: false
        },
        {
          id: '2',
          type: 'shift_change',
          title: 'Изменение смены на 10 июня',
          status: 'approved',
          priority: 'normal',
          startDate: new Date('2025-06-10'),
          reason: 'Медицинский прием, невозможно перенести',
          submittedAt: new Date('2025-05-25'),
          approver: {
            name: 'Петров П.П.',
            comments: 'Одобрено. Смена перенесена с утренней на вечернюю.'
          }
        },
        {
          id: '3',
          type: 'sick_leave',
          title: 'Больничный лист',
          status: 'submitted',
          priority: 'high',
          startDate: new Date('2025-06-03'),
          endDate: new Date('2025-06-05'),
          reason: 'ОРВИ, справка от врача приложена',
          submittedAt: new Date('2025-06-03'),
          daysRequested: 3,
          actionRequired: true
        },
        {
          id: '4',
          type: 'overtime',
          title: 'Сверхурочная работа - 15 мая',
          status: 'rejected',
          priority: 'low',
          startDate: new Date('2025-05-15'),
          reason: 'Необходимо покрыть смену коллеги',
          submittedAt: new Date('2025-05-10'),
          approver: {
            name: 'Иванова А.С.',
            comments: 'Отклонено. Превышен лимит сверхурочных часов в месяце.'
          }
        },
        {
          id: '5',
          type: 'time_off',
          title: 'Отгул за переработку',
          status: 'draft',
          priority: 'normal',
          startDate: new Date('2025-06-20'),
          reason: 'Компенсация за сверхурочную работу в мае',
          submittedAt: new Date('2025-06-01'),
          actionRequired: true
        }
      ];
      
      setRequests(mockRequests);
      setLoading(false);
    };
    
    loadRequests();
  }, [employeeId]);

  // Filter and sort requests
  useEffect(() => {
    let filtered = [...requests];
    
    // Tab filtering
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(r => 
          ['draft', 'submitted', 'pending_approval'].includes(r.status)
        );
        break;
      case 'pending':
        filtered = filtered.filter(r => 
          ['submitted', 'pending_approval'].includes(r.status)
        );
        break;
      case 'history':
        filtered = filtered.filter(r => 
          ['approved', 'rejected', 'cancelled'].includes(r.status)
        );
        break;
    }
    
    // Additional filters
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(search) ||
        r.reason.toLowerCase().includes(search)
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.submittedAt.getTime() - b.submittedAt.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    setFilteredRequests(filtered);
  }, [requests, activeTab, filters, sortBy, sortOrder]);

  const getStatusColor = (status: Request['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return colors[status];
  };

  const getStatusText = (status: Request['status']) => {
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

  const getTypeText = (type: Request['type']) => {
    const types = {
      time_off: 'Отгул',
      shift_change: 'Изменение смены',
      overtime: 'Сверхурочные',
      vacation: 'Отпуск',
      sick_leave: 'Больничный'
    };
    return types[type];
  };

  const getTypeIcon = (type: Request['type']) => {
    const icons = {
      time_off: '🕐',
      shift_change: '🔄',
      overtime: '⏰',
      vacation: '🏖️',
      sick_leave: '🏥'
    };
    return icons[type];
  };

  const getPriorityColor = (priority: Request['priority']) => {
    const colors = {
      low: 'border-gray-300',
      normal: 'border-blue-300',
      high: 'border-orange-300',
      urgent: 'border-red-400'
    };
    return colors[priority];
  };

  const handleRequestAction = (requestId: string, action: 'view' | 'edit' | 'cancel' | 'submit') => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    
    switch (action) {
      case 'view':
        console.log('Открыть заявку:', requestId);
        break;
      case 'edit':
        console.log('Редактировать заявку:', requestId);
        break;
      case 'cancel':
        if (window.confirm('Вы уверены, что хотите отменить заявку?')) {
          setRequests(prev => 
            prev.map(r => 
              r.id === requestId 
                ? { ...r, status: 'cancelled' as const }
                : r
            )
          );
        }
        break;
      case 'submit':
        setRequests(prev => 
          prev.map(r => 
            r.id === requestId 
              ? { ...r, status: 'submitted' as const, submittedAt: new Date() }
              : r
          )
        );
        break;
    }
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Мои заявки</h2>
            <p className="text-sm text-gray-500 mt-1">
              Управление заявками на отпуск, изменение графика и другими запросами
            </p>
          </div>
          
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Новая заявка
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 bg-gray-100 rounded-lg p-1">
          {(['active', 'pending', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'active' && 'Активные'}
              {tab === 'pending' && 'На рассмотрении'}
              {tab === 'history' && 'История'}
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                {filteredRequests.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Поиск по названию или причине..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            <option value="vacation">Отпуск</option>
            <option value="sick_leave">Больничный</option>
            <option value="time_off">Отгул</option>
            <option value="shift_change">Изменение смены</option>
            <option value="overtime">Сверхурочные</option>
          </select>
          
          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as 'date' | 'type' | 'status');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Дата (новые)</option>
            <option value="date-asc">Дата (старые)</option>
            <option value="type-asc">Тип (А-Я)</option>
            <option value="status-asc">Статус (А-Я)</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заявок</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'active' 
                ? 'У вас нет активных заявок'
                : activeTab === 'pending'
                ? 'Нет заявок на рассмотрении'
                : 'История заявок пуста'
              }
            </p>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Создать заявку
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                  getPriorityColor(request.priority)
                } ${request.actionRequired ? 'bg-orange-50' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getTypeIcon(request.type)}</span>
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                      {request.actionRequired && (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          Требует действий
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-4 mb-1">
                        <span><strong>Тип:</strong> {getTypeText(request.type)}</span>
                        <span><strong>Период:</strong> {formatDateRange(request.startDate, request.endDate)}</span>
                        {request.daysRequested && (
                          <span><strong>Дней:</strong> {request.daysRequested}</span>
                        )}
                      </div>
                      <div className="mb-2">
                        <strong>Причина:</strong> {request.reason}
                      </div>
                      <div className="text-xs text-gray-500">
                        Подана: {formatDate(request.submittedAt)}
                        {request.approver && (
                          <span className="ml-4">
                            Рассматривал: {request.approver.name}
                          </span>
                        )}
                      </div>
                      {request.approver?.comments && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                          <strong>Комментарий:</strong> {request.approver.comments}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleRequestAction(request.id, 'view')}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Открыть
                    </button>
                    
                    {request.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleRequestAction(request.id, 'edit')}
                          className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'submit')}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Подать
                        </button>
                      </>
                    )}
                    
                    {['submitted', 'pending_approval'].includes(request.status) && (
                      <button
                        onClick={() => handleRequestAction(request.id, 'cancel')}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Request Modal Placeholder */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Создание новой заявки</h3>
            <p className="text-gray-600 mb-4">
              Здесь будет форма создания новой заявки (компонент RequestForm)
            </p>
            <button
              onClick={() => setShowNewRequestModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;