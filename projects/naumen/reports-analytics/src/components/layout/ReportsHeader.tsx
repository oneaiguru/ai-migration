import React, { useState } from 'react';
import { ChevronDownIcon, UserIcon } from 'lucide-react';

export const ReportsHeader: React.FC = () => {
  const [selectedContactCenter, setSelectedContactCenter] = useState('Контакт-центр 1010');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const contactCenters = [
    'Контакт-центр 1010',
    'Контакт-центр 1020',
    'Контакт-центр 1030'
  ];

  return (
    <>
      {/* Contact Center Selector */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span>{selectedContactCenter}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
            <div className="py-1">
              {contactCenters.map((center) => (
                <button
                  key={center}
                  onClick={() => {
                    setSelectedContactCenter(center);
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {center}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-600" />
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Выйти
        </button>
      </div>
    </>
  );
};