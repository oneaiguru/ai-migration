import React from 'react';
import { AdminRequestsNavigation } from './AdminRequestsNavigation';

interface AdminRequestsLayoutProps {
  children: React.ReactNode;
  activeSection?: 'schedule_changes' | 'shift_exchanges';
  onSectionChange?: (section: 'schedule_changes' | 'shift_exchanges') => void;
  showNavigation?: boolean;
}

export const AdminRequestsLayout: React.FC<AdminRequestsLayoutProps> = ({ 
  children, 
  activeSection = 'schedule_changes',
  onSectionChange,
  showNavigation = true
}) => {
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
                <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                  Расписание
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Сотрудники
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Отчеты
                </a>
              </nav>
            </div>
            
            {/* Right side - User panel */}
            <div className="flex items-center space-x-4">
              {/* Context Selector */}
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md">
                <span className="text-sm text-gray-600">Контакт-центр 1010</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {/* User Avatar */}
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              {/* Logout */}
              <button className="text-gray-400 hover:text-gray-600 p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub Navigation for Schedule sections */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-8 py-4">
            <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
              Смены
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
              Схемы
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
              График
            </a>
            <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
              Заявки
            </a>
          </div>
        </div>
      </div>

      {/* Requests Section Navigation */}
      {showNavigation && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <AdminRequestsNavigation 
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};