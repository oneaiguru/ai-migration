import React, { useState } from 'react';

// Header Component for Employee Portal
// Professional top navigation with user info, notifications, and quick actions

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: {
    id: string;
    name: string;
    position: string;
    avatar?: string;
  };
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onUserMenuClick?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'schedule' | 'request' | 'exchange' | 'system';
  read: boolean;
  actionRequired?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  user,
  notifications = [],
  onNotificationClick,
  onUserMenuClick
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      schedule: '📅',
      request: '📝',
      exchange: '🔄',
      system: '⚙️'
    };
    return icons[type] || '📢';
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotificationsOpen(false);
    onNotificationClick?.(notification);
  };

  const handleUserAction = (action: string) => {
    setUserMenuOpen(false);
    
    switch (action) {
      case 'profile':
        console.log('Open profile');
        break;
      case 'settings':
        console.log('Open settings');
        break;
      case 'logout':
        if (window.confirm('Вы уверены, что хотите выйти?')) {
          console.log('Logout');
        }
        break;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-10">
      <div className="flex items-center justify-between">
        
        {/* Page Title & Breadcrumbs */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Экспорт"
            >
              <span className="text-lg">📤</span>
            </button>
            
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Печать"
            >
              <span className="text-lg">🖨️</span>
            </button>
            
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Настройки"
            >
              <span className="text-lg">⚙️</span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300"></div>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Уведомления"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Уведомления</h3>
                    {unreadCount > 0 && (
                      <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                        Прочитать все
                      </button>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-4xl mb-2">📬</div>
                        <p className="text-gray-500 font-medium">Нет уведомлений</p>
                        <p className="text-sm text-gray-400 mt-1">Все уведомления будут отображаться здесь</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              
                              {/* Icon */}
                              <div className="text-lg flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className={`text-sm ${
                                    !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-500">{notification.time}</span>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                                
                                <p className={`text-sm mt-1 ${
                                  !notification.read ? 'text-gray-700' : 'text-gray-500'
                                }`}>
                                  {notification.message}
                                </p>
                                
                                {notification.actionRequired && (
                                  <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                      Требуется действие
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-t border-gray-200 p-3">
                      <button className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors text-center">
                        Показать все уведомления
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.position}</p>
              </div>
              
              <span className="text-gray-400">▼</span>
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                  
                  {/* User Info */}
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.position}</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => handleUserAction('profile')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>👤</span>
                      <span>Мой профиль</span>
                    </button>
                    
                    <button
                      onClick={() => handleUserAction('settings')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>⚙️</span>
                      <span>Настройки</span>
                    </button>
                    
                    <hr className="my-2 border-gray-200" />
                    
                    <button
                      onClick={() => handleUserAction('logout')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Выйти</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;