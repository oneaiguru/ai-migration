import React, { useState } from 'react';

const EmployeeLayout = () => {
  const [currentModule, setCurrentModule] = useState('schedule');

  const menuItems = [
    { id: 'schedule', label: 'График', icon: '📅' },
    { id: 'requests', label: 'Заявки', icon: '📝' },
    { id: 'profile', label: 'Профиль', icon: '👤' },
    { id: 'reports', label: 'Отчеты', icon: '📊' },
  ];

  const notifications = [
    { id: 1, text: 'Изменение графика на завтра', time: '10:30', type: 'schedule' },
    { id: 2, text: 'Заявка на отпуск одобрена', time: '09:15', type: 'request' },
    { id: 3, text: 'Новая смена доступна для обмена', time: '08:45', type: 'exchange' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Company */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">WFM Система</h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">ИИ</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Иванов Иван</div>
                  <div className="text-gray-500">Оператор</div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <span>🚪</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentModule(item.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentModule === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Quick Stats Card */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Быстрая статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Отработано в месяце</span>
                  <span className="text-sm font-medium">147 ч</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Оставшихся отпускных</span>
                  <span className="text-sm font-medium text-green-600">12 дн</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Активных заявок</span>
                  <span className="text-sm font-medium text-orange-600">2</span>
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Уведомления</h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="text-sm">
                    <div className="text-gray-900">{notification.text}</div>
                    <div className="text-gray-500 text-xs mt-1">{notification.time}</div>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                Показать все
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {currentModule === 'schedule' && <ScheduleModule />}
            {currentModule === 'requests' && <RequestsModule />}
            {currentModule === 'profile' && <ProfileModule />}
            {currentModule === 'reports' && <ReportsModule />}
          </main>
        </div>
      </div>
    </div>
  );
};

// Schedule Module Component
const ScheduleModule = () => {
  const [viewMode, setViewMode] = useState('week');
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Module Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Мой график</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Месяц
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {viewMode === 'week' ? <WeekView /> : <MonthView />}
      </div>
    </div>
  );
};

const WeekView = () => {
  const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  const dates = ['01.07', '02.07', '03.07', '04.07', '05.07', '06.07', '07.07'];
  
  return (
    <div>
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button className="p-2 hover:bg-gray-100 rounded">‹</button>
        <h3 className="text-lg font-medium">1 - 7 июля 2024</h3>
        <button className="p-2 hover:bg-gray-100 rounded">›</button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">{day}</div>
            <div className="text-sm text-gray-500 mb-3">{dates[index]}</div>
            
            {/* Shift Block */}
            {index < 5 ? (
              <div className="bg-green-500 text-white rounded p-2 text-xs">
                <div>08:00</div>
                <div>17:00</div>
                <div className="mt-1 text-green-100">8 ч</div>
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-400 rounded p-2 text-xs">
                Выходной
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Week Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Итого за неделю:</span>
          <span className="text-sm font-medium">40 часов</span>
        </div>
      </div>
    </div>
  );
};

const MonthView = () => {
  return (
    <div className="text-center text-gray-500 py-8">
      Месячный вид календаря
    </div>
  );
};

// Other Module Placeholders
const RequestsModule = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Мои заявки</h2>
    <div className="text-gray-500">Модуль заявок</div>
  </div>
);

const ProfileModule = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Профиль</h2>
    <div className="text-gray-500">Модуль профиля</div>
  </div>
);

const ReportsModule = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Отчеты</h2>
    <div className="text-gray-500">Модуль отчетов</div>
  </div>
);

export default EmployeeLayout;