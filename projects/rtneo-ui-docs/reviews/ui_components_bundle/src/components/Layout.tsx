import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange,
  currentSection,
  onSectionChange 
}) => {
  const tabs = [
    { id: 'overview', label: 'Обзор' },
    { id: 'districts', label: 'Районы' },
    { id: 'sites', label: 'Площадки' },
    { id: 'routes', label: 'Маршруты' },
    { id: 'routes2', label: 'Маршруты 2.0' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentSection={currentSection} onNavigate={onSectionChange} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar: breadcrumb + tabs + action */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: breadcrumb */}
            <div className="text-sm text-gray-600">Контроль → Прогноз</div>

            {/* Center: tabs (keep existing) */}
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: action button */}
            <button className="btn-primary">Создать отчет</button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
