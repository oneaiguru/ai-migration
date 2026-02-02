import React, { useState } from 'react';

// Navigation Header Component for Forecasting System
// Replicates the exact two-tier navigation structure from Naumen HTML reference

interface NavigationHeaderProps {
  currentPage?: string;
  currentSubPage?: string;
  departmentName?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  onNavigate?: (page: string, subPage?: string) => void;
  onLogout?: () => void;
}

interface MainMenuItem {
  id: string;
  label: string;
  href: string;
  active: boolean;
}

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  active: boolean;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentPage = 'forecast',
  currentSubPage = 'build',
  departmentName = 'ИНВ-2',
  user = { name: 'Администратор' },
  onNavigate,
  onLogout
}) => {
  const [departmentMenuOpen, setDepartmentMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Main navigation items (top tier)
  const mainMenuItems: MainMenuItem[] = [
    { id: 'forecast', label: 'Прогнозы', href: '/forecast', active: currentPage === 'forecast' },
    { id: 'schedule', label: 'Расписание', href: '/schedule', active: currentPage === 'schedule' },
    { id: 'employee', label: 'Сотрудники', href: '/employee', active: currentPage === 'employee' },
    { id: 'reports', label: 'Отчеты', href: '/reports', active: currentPage === 'reports' }
  ];

  // Sub navigation items (second tier) - only shown when in forecast section
  const subMenuItems: SubMenuItem[] = [
    { id: 'build', label: 'Построить прогноз', href: '/forecast/build', active: currentSubPage === 'build' },
    { id: 'exceptions', label: 'Задать исключения', href: '/forecast/set-untypical', active: currentSubPage === 'exceptions' },
    { id: 'trends', label: 'Анализ трендов', href: '/forecast/analysis-trends', active: currentSubPage === 'trends' },
    { id: 'absenteeism', label: 'Расчёт абсентеизма', href: '/forecast/absenteeism-calc', active: currentSubPage === 'absenteeism' }
  ];

  const handleMainNavClick = (item: MainMenuItem) => {
    onNavigate?.(item.id);
  };

  const handleSubNavClick = (item: SubMenuItem) => {
    onNavigate?.(currentPage, item.id);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    onLogout?.();
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      
      {/* Main Navigation Bar */}
      <div className="bg-slate-700 text-white">
        <div className="flex items-center justify-between px-6 py-3">
          
          {/* Main Menu Items */}
          <nav className="flex items-center space-x-8">
            {mainMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMainNavClick(item)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side - Department Selector + User Menu */}
          <div className="flex items-center gap-4">
            
            {/* Department Selector */}
            <div className="relative">
              <button
                onClick={() => setDepartmentMenuOpen(!departmentMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-xs font-bold">
                  🏢
                </div>
                <span className="font-medium">{departmentName}</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Department Dropdown */}
              {departmentMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDepartmentMenuOpen(false)} />
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <span className="font-medium">Выберите подразделение:</span>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 bg-blue-50 text-blue-700">
                        ИНВ-2 (текущее)
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Контакт-центр 1010
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Техподдержка
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">Администратор</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        title="Выйти"
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
      </div>

      {/* Sub Navigation Bar - Only shown for forecast section */}
      {currentPage === 'forecast' && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="px-6 py-3">
            <nav className="flex items-center space-x-6">
              {subMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSubNavClick(item)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationHeader;