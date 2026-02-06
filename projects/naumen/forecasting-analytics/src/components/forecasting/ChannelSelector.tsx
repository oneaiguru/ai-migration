// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/ChannelSelector.tsx
import React, { useState, useEffect, useRef } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'inbound' | 'outbound' | 'chat' | 'email' | 'other';
  status: 'active' | 'inactive' | 'maintenance';
  avgVolume?: number;
  lastUpdate?: Date;
  color?: string;
}

interface ChannelGroup {
  id: string;
  name: string;
  channels: Channel[];
  expanded?: boolean;
}

interface ChannelSelectorProps {
  selectedChannels: string[];
  onChannelsChange: (channelIds: string[]) => void;
  channels?: Channel[];
  groups?: ChannelGroup[];
  maxSelection?: number;
  showGrouping?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

// ========================
// CHANNEL SELECTOR COMPONENT
// ========================

const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  selectedChannels,
  onChannelsChange,
  channels: propChannels,
  groups: propGroups,
  maxSelection = 10,
  showGrouping = true,
  showSearch = true,
  showStats = true,
  disabled = false,
  loading = false,
  onValidationChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default channels if not provided
  const defaultChannels: Channel[] = propChannels || [
    {
      id: 'main',
      name: 'Инвентаризация-2',
      description: 'Основной канал обслуживания клиентов',
      type: 'inbound',
      status: 'active',
      avgVolume: 1200,
      color: '#3B82F6'
    },
    {
      id: 'support',
      name: 'Техподдержка',
      description: 'Техническая поддержка пользователей',
      type: 'inbound',
      status: 'active',
      avgVolume: 800,
      color: '#10B981'
    },
    {
      id: 'sales',
      name: 'Продажи',
      description: 'Отдел продаж и консультаций',
      type: 'outbound',
      status: 'active',
      avgVolume: 600,
      color: '#F59E0B'
    },
    {
      id: 'billing',
      name: 'Биллинг',
      description: 'Вопросы по оплате и тарифам',
      type: 'inbound',
      status: 'active',
      avgVolume: 400,
      color: '#8B5CF6'
    },
    {
      id: 'complaints',
      name: 'Жалобы',
      description: 'Обработка жалоб клиентов',
      type: 'inbound',
      status: 'active',
      avgVolume: 150,
      color: '#EF4444'
    },
    {
      id: 'chat',
      name: 'Онлайн чат',
      description: 'Чат на сайте компании',
      type: 'chat',
      status: 'active',
      avgVolume: 900,
      color: '#06B6D4'
    },
    {
      id: 'email',
      name: 'Email поддержка',
      description: 'Обработка электронных обращений',
      type: 'email',
      status: 'active',
      avgVolume: 300,
      color: '#84CC16'
    },
    {
      id: 'premium',
      name: 'Премиум поддержка',
      description: 'VIP клиенты и корпоративные клиенты',
      type: 'inbound',
      status: 'active',
      avgVolume: 100,
      color: '#F97316'
    },
    {
      id: 'callback',
      name: 'Обратный звонок',
      description: 'Исходящие звонки по заявкам',
      type: 'outbound',
      status: 'maintenance',
      avgVolume: 200,
      color: '#6B7280'
    }
  ];

  // Default groups if not provided
  const defaultGroups: ChannelGroup[] = propGroups || [
    {
      id: 'voice',
      name: 'Голосовые каналы',
      channels: defaultChannels.filter(c => c.type === 'inbound' || c.type === 'outbound'),
      expanded: true
    },
    {
      id: 'digital',
      name: 'Цифровые каналы',
      channels: defaultChannels.filter(c => c.type === 'chat' || c.type === 'email'),
      expanded: true
    }
  ];

  // Validate selection
  useEffect(() => {
    let error = '';
    
    if (selectedChannels.length === 0) {
      error = 'Необходимо выбрать хотя бы один канал';
    } else if (selectedChannels.length > maxSelection) {
      error = `Максимальное количество каналов: ${maxSelection}`;
    } else {
      // Check if selected channels exist
      const allChannels = showGrouping 
        ? defaultGroups.flatMap(group => group.channels)
        : defaultChannels;
      
      const invalidChannels = selectedChannels.filter(
        id => !allChannels.some(channel => channel.id === id)
      );
      
      if (invalidChannels.length > 0) {
        error = 'Некоторые выбранные каналы недоступны';
      }
    }
    
    setValidationError(error);
    
    if (onValidationChange) {
      onValidationChange(error === '', error);
    }
  }, [selectedChannels, maxSelection, showGrouping, defaultGroups, defaultChannels, onValidationChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAllChannels = (): Channel[] => {
    return showGrouping 
      ? defaultGroups.flatMap(group => group.channels)
      : defaultChannels;
  };

  const getFilteredChannels = (): Channel[] => {
    const allChannels = getAllChannels();
    
    if (!searchTerm) return allChannels;
    
    return allChannels.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredGroups = (): ChannelGroup[] => {
    if (!showGrouping) return [];
    
    return defaultGroups.map(group => ({
      ...group,
      channels: group.channels.filter(channel =>
        !searchTerm || 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.channels.length > 0);
  };

  const handleChannelToggle = (channelId: string) => {
    if (disabled || loading) return;
    
    const isSelected = selectedChannels.includes(channelId);
    
    if (isSelected) {
      onChannelsChange(selectedChannels.filter(id => id !== channelId));
    } else {
      if (selectedChannels.length < maxSelection) {
        onChannelsChange([...selectedChannels, channelId]);
      }
    }
  };

  const handleSelectAll = () => {
    if (disabled || loading) return;
    
    const filteredChannels = getFilteredChannels();
    const availableChannels = filteredChannels
      .filter(channel => channel.status === 'active')
      .slice(0, maxSelection);
    
    onChannelsChange(availableChannels.map(channel => channel.id));
  };

  const handleClearAll = () => {
    if (disabled || loading) return;
    onChannelsChange([]);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'inbound': return '📞';
      case 'outbound': return '📱';
      case 'chat': return '💬';
      case 'email': return '📧';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'maintenance': return 'Тех. работы';
      default: return 'Неизвестно';
    }
  };

  const getSelectedChannelsInfo = () => {
    const allChannels = getAllChannels();
    const selected = allChannels.filter(channel => selectedChannels.includes(channel.id));
    const totalVolume = selected.reduce((sum, channel) => sum + (channel.avgVolume || 0), 0);
    
    return {
      count: selected.length,
      totalVolume,
      channels: selected
    };
  };

  const selectedInfo = getSelectedChannelsInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Каналы данных</h3>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Загрузка...
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Выбрано: <span className="font-medium text-gray-900">{selectedInfo.count}</span> из {maxSelection}
          </div>
          {showStats && selectedInfo.totalVolume > 0 && (
            <div className="text-sm text-blue-600">
              📊 ~{selectedInfo.totalVolume.toLocaleString()} звонков/день
            </div>
          )}
        </div>
        
        {selectedInfo.channels.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {selectedInfo.channels.map(channel => (
                <span
                  key={channel.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {getChannelTypeIcon(channel.type)}
                  {channel.name}
                  <button
                    onClick={() => handleChannelToggle(channel.id)}
                    disabled={disabled || loading}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search and Controls */}
      <div className="mb-4 space-y-3">
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск каналов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={disabled || loading}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            disabled={disabled || loading || getFilteredChannels().filter(c => c.status === 'active').length === 0}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Выбрать все
          </button>
          <button
            onClick={handleClearAll}
            disabled={disabled || loading || selectedChannels.length === 0}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Очистить
          </button>
        </div>
      </div>

      {/* Channel List */}
      <div className="space-y-2 max-h-64 overflow-y-auto" ref={dropdownRef}>
        {showGrouping ? (
          getFilteredGroups().map(group => (
            <div key={group.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{group.name}</span>
                  <span className="text-sm text-gray-500">({group.channels.length})</span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedGroups.has(group.id) ? 'rotate-180' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {expandedGroups.has(group.id) && (
                <div className="border-t border-gray-200 p-2 space-y-1">
                  {group.channels.map(channel => (
                    <ChannelItem
                      key={channel.id}
                      channel={channel}
                      isSelected={selectedChannels.includes(channel.id)}
                      onToggle={handleChannelToggle}
                      disabled={disabled || loading || (selectedChannels.length >= maxSelection && !selectedChannels.includes(channel.id))}
                      showStats={showStats}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          getFilteredChannels().map(channel => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isSelected={selectedChannels.includes(channel.id)}
              onToggle={handleChannelToggle}
              disabled={disabled || loading || (selectedChannels.length >= maxSelection && !selectedChannels.includes(channel.id))}
              showStats={showStats}
            />
          ))
        )}
      </div>

      {/* No Results */}
      {getFilteredChannels().length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <div>Каналы не найдены</div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Очистить поиск
            </button>
          )}
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </div>
        </div>
      )}
    </div>
  );
};

// Channel Item Component
interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onToggle: (channelId: string) => void;
  disabled: boolean;
  showStats: boolean;
}

const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  isSelected,
  onToggle,
  disabled,
  showStats
}) => {
  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'inbound': return '📞';
      case 'outbound': return '📱';
      case 'chat': return '💬';
      case 'email': return '📧';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'maintenance': return 'Тех. работы';
      default: return 'Неизвестно';
    }
  };

  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(channel.id)}
        disabled={disabled || channel.status !== 'active'}
        className="text-blue-600 focus:ring-blue-500"
      />
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getChannelTypeIcon(channel.type)}</span>
          <span className="font-medium text-gray-900">{channel.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(channel.status)}`}>
            {getStatusText(channel.status)}
          </span>
        </div>
        
        {channel.description && (
          <div className="text-sm text-gray-600 mt-1">{channel.description}</div>
        )}
        
        {showStats && channel.avgVolume && (
          <div className="text-xs text-blue-600 mt-1">
            📊 ~{channel.avgVolume.toLocaleString()} звонков/день
          </div>
        )}
      </div>
      
      {channel.color && (
        <div
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: channel.color }}
        />
      )}
    </label>
  );
};

export default ChannelSelector;