import React from 'react';
import { ReportsNavigation } from './ReportsNavigation';
import { ReportsHeader } from './ReportsHeader';

interface ReportsLayoutProps {
  children: React.ReactNode;
}

export const ReportsLayout: React.FC<ReportsLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-8">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WFM</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Workforce Management</span>
              </div>
              
              {/* Main Navigation */}
              <nav className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Прогнозы
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Расписание
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Сотрудники
                </a>
                <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                  Отчеты
                </a>
              </nav>
            </div>
            
            {/* Right side - User panel */}
            <div className="flex items-center space-x-4">
              <ReportsHeader />
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <ReportsNavigation />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};