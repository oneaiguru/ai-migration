import React from 'react';

interface SidebarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onNavigate }) => {
  // Menu IDs must match actual tabs for demo navigation
  const menuItems = [
    { id: 'overview', label: 'Обзор' },
    { id: 'districts', label: 'Районы' },
    { id: 'sites', label: 'Площадки' },
    { id: 'routes', label: 'Маршруты' },
    { id: 'routes2', label: 'Маршруты 2.0' },
    // Non-tab sections kept after the demo
    { id: 'plans', label: 'План-задания' },
    { id: 'registry', label: 'Реестр КП' },
  ];

  return (
    <div className="w-64 bg-mytko-dark text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-lg font-semibold">Чистая логистика</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
              currentSection === item.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
