import React, { useState } from 'react';
import './index.css';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
}

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  status: 'active' | 'inactive' | 'maintenance';
  url: string;
  description: string;
}

const App: React.FC = () => {
  const [currentUser] = useState<User>({
    id: '1',
    name: 'Администратор',
    role: 'admin',
    department: 'IT'
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');

  const modules: ModuleConfig[] = [
    {
      id: 'employee-portal',
      name: 'Портал сотрудника',
      icon: '👤',
      status: 'active',
      url: 'https://wfm-employee-portal.vercel.app',
      description: 'Персональный кабинет сотрудника'
    },
    {
      id: 'schedule-grid',
      name: 'Управление расписаниями',
      icon: '📅',
      status: 'active',
      url: 'https://naumen-schedule-grid-system.vercel.app',
      description: 'Сетка расписаний для всех сотрудников'
    },
    {
      id: 'forecasting',
      name: 'Прогнозная аналитика',
      icon: '📊',
      status: 'active',
      url: 'https://wfm-forecasting-analytics.vercel.app',
      description: 'Прогнозирование нагрузки и планирование'
    },
    {
      id: 'reports',
      name: 'Отчёты и аналитика',
      icon: '📈',
      status: 'active',
      url: 'https://wfm-reports-analytics.vercel.app',
      description: 'Конструктор отчётов и аналитические панели'
    },
    {
      id: 'employee-mgmt',
      name: 'Управление персоналом',
      icon: '👥',
      status: 'active',
      url: 'https://employee-management-sigma-eight.vercel.app',
      description: 'База данных сотрудников и HR-процессы'
    }
  ];

  const views = [
    { id: 'dashboard', label: 'Главная панель', icon: '🏠' },
    { id: 'modules', label: 'Модули системы', icon: '⚙️' },
    { id: 'users', label: 'Пользователи', icon: '👥' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
    { id: 'logs', label: 'Логи системы', icon: '📝' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold mb-4">Добро пожаловать в WFM Enterprise</h3>
        <p className="text-gray-600 mb-6">
          Комплексная система управления трудовыми ресурсами для контакт-центров
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">500+</div>
            <div className="text-sm text-blue-800">Активных агентов</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-green-800">Точность прогнозов</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-purple-800">Мониторинг</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">99.9%</div>
            <div className="text-sm text-orange-800">Uptime</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-medium mb-4">Быстрый доступ к модулям</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(module => (
            <div key={module.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{module.icon}</span>
                <h5 className="font-medium">{module.name}</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">{module.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  module.status === 'active' ? 'bg-green-100 text-green-800' :
                  module.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {module.status === 'active' ? 'Активен' : 
                   module.status === 'maintenance' ? 'Обслуживание' : 'Неактивен'}
                </span>
                <a 
                  href={module.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Открыть →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModules = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium mb-6">Управление модулями системы</h3>
      <div className="space-y-4">
        {modules.map(module => (
          <div key={module.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{module.icon}</span>
                <div>
                  <h4 className="font-medium">{module.name}</h4>
                  <p className="text-sm text-gray-600">{module.description}</p>
                  <p className="text-xs text-gray-500">URL: {module.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  module.status === 'active' ? 'bg-green-100 text-green-800' :
                  module.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {module.status === 'active' ? 'Активен' : 
                   module.status === 'maintenance' ? 'Обслуживание' : 'Неактивен'}
                </span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Настроить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComponent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'modules': return renderModules();
      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium mb-4">Управление пользователями</h3>
            <p className="text-gray-600">Система управления ролями и правами доступа пользователей.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium mb-4">Настройки системы</h3>
            <p className="text-gray-600">Глобальные настройки WFM системы и интеграций.</p>
          </div>
        );
      case 'logs':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium mb-4">Системные логи</h3>
            <p className="text-gray-600">Мониторинг и анализ системных событий.</p>
          </div>
        );
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">WFM</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  WFM Enterprise System
                </h1>
                <p className="text-sm text-gray-500">Корпоративная система управления персоналом</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Пользователь: <span className="font-medium">{currentUser.name}</span>
              </div>
              <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {currentUser.role === 'admin' ? 'Администратор' :
                 currentUser.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            {views.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderComponent()}
      </main>
    </div>
  );
};

export default App;