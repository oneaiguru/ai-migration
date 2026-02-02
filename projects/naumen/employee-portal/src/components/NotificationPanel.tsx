import React, { useState, useEffect } from 'react';

// NotificationPanel Component for Employee Portal
// Comprehensive notification management with filtering and actions

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
}

interface Notification {
  id: string;
  type: 'schedule_change' | 'request_update' | 'exchange_offer' | 'system' | 'reminder' | 'approval';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
}

interface NotificationFilter {
  type?: string;
  read?: boolean;
  priority?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  onNotificationClick,
  onMarkAllAsRead
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<NotificationFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'schedule_change',
        title: 'Изменение графика',
        message: 'Ваша смена на завтра (15 июня) перенесена с 08:00 на 09:00 из-за изменений в планировании',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        read: false,
        actionRequired: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'request_update',
        title: 'Заявка одобрена',
        message: 'Ваша заявка на отпуск с 15-19 июля одобрена менеджером. Необходимо подтвердить получение',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        actionRequired: true,
        actionUrl: '/employee/requests/view/123',
        priority: 'normal'
      },
      {
        id: '3',
        type: 'exchange_offer',
        title: 'Предложение обмена сменами',
        message: 'Иванов И. предлагает обменяться сменами на 20 июля. Рассмотрите предложение',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false,
        actionRequired: true,
        actionUrl: '/employee/shift-exchange/offers/456',
        priority: 'normal'
      },
      {
        id: '4',
        type: 'reminder',
        title: 'Напоминание о смене',
        message: 'Не забудьте: завтра у вас утренняя смена в 08:00',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: true,
        actionRequired: false,
        priority: 'low'
      },
      {
        id: '5',
        type: 'system',
        title: 'Техническое обслуживание',
        message: 'Запланировано техническое обслуживание системы на выходные (21-22 июня)',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        actionRequired: false,
        priority: 'low'
      },
      {
        id: '6',
        type: 'approval',
        title: 'Требуется подтверждение',
        message: 'Подтвердите получение нового графика работы на следующую неделю',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: false,
        actionRequired: true,
        actionUrl: '/employee/schedule/confirm',
        priority: 'urgent'
      }
    ];

    // Simulate API loading
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, [userId]);

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      schedule_change: '📅',
      request_update: '📝',
      exchange_offer: '🔄',
      system: '⚙️',
      reminder: '⏰',
      approval: '✅'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (priority: Notification['priority'], read: boolean) => {
    if (read) return 'bg-gray-50 text-gray-600';
    
    const colors = {
      urgent: 'bg-red-50 text-red-900 border-l-4 border-red-500',
      high: 'bg-orange-50 text-orange-900 border-l-4 border-orange-400',
      normal: 'bg-blue-50 text-blue-900 border-l-4 border-blue-400',
      low: 'bg-gray-50 text-gray-700 border-l-4 border-gray-300'
    };
    return colors[priority];
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      urgent: 'Срочно',
      high: 'Высокий',
      normal: 'Обычный',
      low: 'Низкий'
    };
    
    if (priority === 'normal') return null; // Don't show normal priority
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return 'только что';
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(prev => new Set(prev).add(notificationId));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    setMarkingAsRead(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = filteredNotifications.filter(n => !n.read).map(n => n.id);
    setMarkingAsRead(new Set(unreadIds));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setNotifications(prev => 
      prev.map(notification => 
        unreadIds.includes(notification.id) 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    setMarkingAsRead(new Set());
    onMarkAllAsRead?.();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    onClose();
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter.type && notification.type !== filter.type) return false;
    if (filter.read !== undefined && notification.read !== filter.read) return false;
    if (filter.priority && notification.priority !== filter.priority) return false;
    return true;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;
  const actionRequiredCount = filteredNotifications.filter(n => n.actionRequired && !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[32rem] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Уведомления</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
            {actionRequiredCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {actionRequiredCount} действий
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors p-1"
              title="Фильтры"
            >
              🔍
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                disabled={markingAsRead.size > 0}
              >
                Прочитать все
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <select
                value={filter.type || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Все типы</option>
                <option value="schedule_change">График</option>
                <option value="request_update">Заявки</option>
                <option value="exchange_offer">Обмены</option>
                <option value="system">Система</option>
              </select>
              
              <select
                value={filter.read === undefined ? '' : filter.read.toString()}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  read: e.target.value === '' ? undefined : e.target.value === 'true' 
                }))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Все</option>
                <option value="false">Непрочитанные</option>
                <option value="true">Прочитанные</option>
              </select>
              
              <select
                value={filter.priority || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value || undefined }))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Все приоритеты</option>
                <option value="urgent">Срочные</option>
                <option value="high">Высокие</option>
                <option value="normal">Обычные</option>
                <option value="low">Низкие</option>
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {/* Loading skeleton */}
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📬</div>
              <div className="font-medium">Нет уведомлений</div>
              <div className="text-sm">Все уведомления будут отображаться здесь</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 transition-colors hover:bg-gray-50 cursor-pointer ${
                    getNotificationColor(notification.priority, notification.read)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-xl flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium text-sm ${
                          notification.read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              disabled={markingAsRead.has(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {markingAsRead.has(notification.id) ? (
                                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                '✓'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(notification.priority)}
                          
                          {notification.actionRequired && (
                            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                              Требуется действие
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="border-t border-gray-200 p-3">
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Показать все уведомления
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;