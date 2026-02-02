import React, { useState } from 'react';

const AdminLayout = () => {
  const [currentModule, setCurrentModule] = useState('schedule');
  const [currentSubModule, setCurrentSubModule] = useState('graph');

  const menuItems = [
    { id: 'forecast', label: 'Прогнозы', icon: '📈' },
    { id: 'schedule', label: 'Расписание', icon: '📅' },
    { id: 'employees', label: 'Сотрудники', icon: '👥' },
    { id: 'reports', label: 'Отчеты', icon: '📊' },
  ];

  const subMenuItems = {
    schedule: [
      { id: 'shifts', label: 'Смены' },
      { id: 'schemas', label: 'Схемы' },
      { id: 'graph', label: 'График' },
      { id: 'requests', label: 'Заявки' },
    ]
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Navigation Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        {/* Logo/Company Section */}
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white">
            Контакт-центр 1010
          </h1>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg text-left transition-colors ${
                currentModule === item.id 
                  ? 'bg-slate-700 bg-opacity-50' 
                  : 'hover:bg-slate-700 hover:bg-opacity-30'
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
              <span className="text-white font-bold">А</span>
            </div>
            <div>
              <div className="text-sm font-medium">Администратор</div>
            </div>
          </div>
          <button className="text-slate-300 hover:text-white">
            <span className="mr-2">🚪</span>
            Выйти
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top App Bar with Sub-navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            {/* Sub-navigation for current module */}
            {subMenuItems[currentModule] && (
              <div className="flex gap-6">
                {subMenuItems[currentModule].map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => setCurrentSubModule(subItem.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      currentSubModule === subItem.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center gap-4 mt-3">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <span className="text-xl">⚙️</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Control Panel */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">График</h2>
            
            <div className="flex items-center gap-3">
              {/* Date Range Picker */}
              <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-1">
                <input 
                  type="text" 
                  value="01.07.2024"
                  className="text-sm border-none outline-none w-20"
                  readOnly 
                />
                <span className="mx-2 text-gray-400">–</span>
                <input 
                  type="text" 
                  value="31.07.2024"
                  className="text-sm border-none outline-none w-20"
                  readOnly 
                />
              </div>
              
              {/* Action Buttons */}
              <button 
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1"
                title="Обновить"
              >
                <span>🔄</span>
                Обновить
              </button>
              
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-2">
                <span>➕</span>
                Построить
              </button>
              
              <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                FTE
              </button>
              
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm">
                📤 Есть неопубликованные изменения
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-white overflow-hidden">
          {/* Chart Area (Top Section) */}
          <div className="mb-6 h-32 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-4">
                <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  Прогноз + план
                </button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm">
                  Отклонения
                </button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm">
                  Уровень сервиса (SL)
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <label className="flex items-center gap-1">
                  <input type="checkbox" />
                  Σ
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" />
                  123
                </label>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-16 bg-white border border-gray-300 rounded flex items-center justify-center text-gray-500">
              📊 Chart Area - Forecast vs Plan Visualization
            </div>
          </div>

          {/* Schedule Grid Area */}
          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
            {/* Grid Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" />
                    <span className="text-sm font-medium">Все</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Поиск по навыкам"
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">🔍</button>
                  <button className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">📅</button>
                </div>
              </div>
            </div>

            {/* Grid Content Placeholder */}
            <div className="h-96 flex">
              {/* Employee Names Column */}
              <div className="w-72 bg-white border-r border-gray-200">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <button className="text-sm">🔽</button>
                    <span className="text-sm font-medium">По сотрудникам</span>
                  </div>
                </div>
                
                {/* Employee List */}
                <div className="overflow-y-auto h-full">
                  {['Абдуллаева Д.', 'Азикова М.', 'Акашева Д.', 'Акашева О.', 'Акунова Л.'].map((name, index) => (
                    <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{name}</div>
                          <div className="text-xs text-gray-500">Оператор</div>
                          <div className="text-xs text-green-600">187 / 168 | 19 ч. 1 мин.</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Grid */}
              <div className="flex-1 overflow-x-auto">
                {/* Date Headers */}
                <div className="bg-gray-50 border-b border-gray-200 p-2 min-w-max">
                  <div className="flex">
                    {['Пн.\n01.07', 'Вт.\n02.07', 'Ср.\n03.07', 'Чт.\n04.07', 'Пт.\n05.07', 'Сб.\n06.07', 'Вс.\n07.07'].map((date, index) => (
                      <div key={index} className={`w-20 text-center text-xs ${index >= 5 ? 'font-bold' : ''}`}>
                        {date.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shift Blocks */}
                <div className="p-2 min-w-max">
                  {[0, 1, 2, 3, 4].map((row) => (
                    <div key={row} className="flex mb-1">
                      {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                        <div key={col} className="w-20 h-12 mx-0.5">
                          {col < 5 ? (
                            <div className="w-full h-full bg-green-500 rounded text-white text-xs flex flex-col items-center justify-center">
                              <span>08:00</span>
                              <span>17:00</span>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">—</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;