import React, { useState } from 'react';

type ReportSection = 'main' | 'custom';

interface ReportsNavigationProps {
  activeSection?: ReportSection;
  onSectionChange?: (section: ReportSection) => void;
}

export const ReportsNavigation: React.FC<ReportsNavigationProps> = ({
  activeSection = 'main',
  onSectionChange
}) => {
  const [currentSection, setCurrentSection] = useState<ReportSection>(activeSection);

  const handleSectionChange = (section: ReportSection) => {
    setCurrentSection(section);
    onSectionChange?.(section);
  };

  return (
    <div className="flex items-center space-x-8 py-4">
      {/* Main Reports Tab */}
      <button
        onClick={() => handleSectionChange('main')}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          currentSection === 'main'
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Основные
      </button>

      {/* Custom Reports Tab */}
      <button
        onClick={() => handleSectionChange('custom')}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          currentSection === 'custom'
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        Пользовательские
      </button>
    </div>
  );
};