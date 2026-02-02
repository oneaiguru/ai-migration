import React, { useState } from 'react';
import './App.css';

interface Report {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'standard' | 'analytics' | 'custom';
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const reports: Report[] = [
    { id: 'worktime', name: 'Рабочее время', description: 'Отчет по отработанному времени', icon: '⏰', category: 'standard' },
    { id: 'attendance', name: 'Посещаемость', description: 'Анализ посещаемости сотрудников', icon: '📊', category: 'standard' },
    { id: 'punctuality', name: 'Пунктуальность', description: 'Отчет по соблюдению расписания', icon: '🎯', category: 'standard' },
    { id: 'schedule', name: 'Расписание сотрудников', description: 'Детальное расписание по сотрудникам', icon: '📅', category: 'standard' },
    { id: 'forecast', name: 'Точность прогнозов', description: 'Анализ точности прогнозирования', icon: '📈', category: 'analytics' },
    { id: 'payroll', name: 'Расчет зарплаты', description: 'Расчет заработной платы', icon: '💰', category: 'standard' },
    { id: 'timesheet', name: 'Табель Т-13', description: 'Унифицированный табель учета времени', icon: '📋', category: 'standard' },
    { id: 'absenteeism', name: 'Абсентеизм', description: 'Анализ отсутствия на рабочем месте', icon: '🔍', category: 'analytics' }
  ];

  const views = [
    { id: 'dashboard', label: 'Панель отчетов', icon: '🏠' },
    { id: 'standard', label: 'Стандартные отчеты', icon: '📊' },
    { id: 'analytics', label: 'Аналитика', icon: '📈' },
    { id: 'custom', label: 'Пользовательские', icon: '⚙️' },
    { id: 'builder', label: 'Конструктор', icon: '🔧' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold mb-4">Система отчетов WFM</h3>
        <p className="text-gray-600 mb-6">
          Комплексная система формирования отчетов и аналитики для workforce management
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reports.filter(r => r.category === 'standard').length}</div>
            <div className="text-sm text-blue-800">Стандартных отчетов</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{reports.filter(r => r.category === 'analytics').length}</div>
            <div className="text-sm text-green-800">Аналитических отчетов</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-purple-800">Обновление данных</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">Excel</div>
            <div className="text-sm text-orange-800">Экспорт форматов</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-medium mb-4">Быстрый доступ к отчетам</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.slice(0, 6).map(report => (
            <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => setSelectedReport(report)}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{report.icon}</span>
                <h5 className="font-medium">{report.name}</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">{report.description}</p>
              <span className={`px-2 py-1 rounded-full text-xs ${
                report.category === 'standard' ? 'bg-blue-100 text-blue-800' :
                report.category === 'analytics' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {report.category === 'standard' ? 'Стандартный' : 
                 report.category === 'analytics' ? 'Аналитика' : 'Пользовательский'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const renderReportsList = (category: 'standard' | 'analytics' | 'custom') => {
    const filteredReports = reports.filter(r => r.category === category);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium mb-6">
          {category === 'standard' ? 'Стандартные отчеты' :
           category === 'analytics' ? 'Аналитические отчеты' : 'Пользовательские отчеты'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => setSelectedReport(report)}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{report.icon}</span>
                <h5 className="font-medium">{report.name}</h5>
              </div>
              <p className="text-sm text-gray-600">{report.description}</p>
              <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                Создать отчет →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReportBuilder = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium mb-6">Конструктор отчетов</h3>
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Создать новый отчет</h4>
          <p className="text-sm text-gray-600 mb-4">
            Используйте конструктор для создания пользовательских отчетов с гибкими настройками
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Начать создание
          </button>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Шаблоны отчетов</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Еженедельный отчет по посещаемости</li>
            <li>• Месячный анализ производительности</li>
            <li>• Сводка по отработанному времени</li>
            <li>• Отчет по сверхурочным часам</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSelectedReport = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedReport.icon}</span>
              <div>
                <h3 className="text-lg font-medium">{selectedReport.name}</h3>
                <p className="text-sm text-gray-600">{selectedReport.description}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedReport(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Параметры отчета</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Период
                </label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Текущий месяц</option>
                  <option>Предыдущий месяц</option>
                  <option>Квартал</option>
                  <option>Пользовательский период</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Департмент
                </label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Все департменты</option>
                  <option>Поддержка</option>
                  <option>Продажи</option>
                  <option>Качество</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Сформировать отчет
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Экспорт в Excel
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Сохранить как шаблон
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-medium mb-4">Предварительный просмотр данных</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Сотрудник</th>
                  <th className="text-left py-2">Департмент</th>
                  <th className="text-left py-2">Отработано часов</th>
                  <th className="text-left py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Алексей Иванов</td>
                  <td className="py-2">Поддержка</td>
                  <td className="py-2">168</td>
                  <td className="py-2"><span className="text-green-600">✓ Норма</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Мария Петрова</td>
                  <td className="py-2">Продажи</td>
                  <td className="py-2">172</td>
                  <td className="py-2"><span className="text-blue-600">↗ Сверхурочно</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Дмитрий Сидоров</td>
                  <td className="py-2">Поддержка</td>
                  <td className="py-2">160</td>
                  <td className="py-2"><span className="text-orange-600">⚠ Недоработка</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  const renderComponent = () => {
    if (selectedReport) {
      return renderSelectedReport();
    }

    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'standard': return renderReportsList('standard');
      case 'analytics': return renderReportsList('analytics'); 
      case 'custom': return renderReportsList('custom');
      case 'builder': return renderReportBuilder();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WFM</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Система отчетов и аналитики
              </h1>
            </div>
            <div className="text-sm text-gray-600 bg-green-100 px-3 py-1 rounded-full">
              22+ отчетов ✅
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
                onClick={() => {
                  setCurrentView(tab.id);
                  setSelectedReport(null);
                }}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentView === tab.id && !selectedReport
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

      {selectedReport && (
        <div className="bg-blue-50 border-b border-blue-200 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => setSelectedReport(null)}
              className="text-sm text-blue-800 hover:text-blue-900"
            >
              ← Вернуться к списку отчетов
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderComponent()}
      </main>
    </div>
  );
};

export default App;