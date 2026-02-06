import React, { useState } from 'react';
import { RefreshCcw } from 'lucide-react';

type RequestSection = 'schedule_changes' | 'shift_exchanges';

interface AdminRequestsNavigationProps {
  activeSection?: RequestSection;
  onSectionChange?: (section: RequestSection) => void;
  onRefresh?: () => void;
}

export const AdminRequestsNavigation: React.FC<AdminRequestsNavigationProps> = ({
  activeSection = 'schedule_changes',
  onSectionChange,
  onRefresh
}) => {
  const [currentSection, setCurrentSection] = useState<RequestSection>(activeSection);

  const handleSectionChange = (section: RequestSection) => {
    setCurrentSection(section);
    onSectionChange?.(section);
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-8">
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
          title="Обновить список"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Обновить список
        </button>

        {/* Section Indicators */}
        <div className="flex items-center space-x-8">
          {/* Schedule Changes Section */}
          <button
            onClick={() => handleSectionChange('schedule_changes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentSection === 'schedule_changes'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Изменение расписания
          </button>

          {/* Shift Exchanges Section */}
          <button
            onClick={() => handleSectionChange('shift_exchanges')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentSection === 'shift_exchanges'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Обмен сменами
          </button>
        </div>
      </div>
    </div>
  );
};