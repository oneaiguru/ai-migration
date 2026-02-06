// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/ForecastHistory.tsx
import React, { useState } from 'react';
import { History, Clock, User, Eye, Download, Trash2, GitBranch, Tag } from 'lucide-react';

interface ForecastVersion {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  description: string;
  accuracy: number;
  algorithm: string;
  parameters: Record<string, any>;
  dataRange: { start: Date; end: Date };
  tags: string[];
  isActive: boolean;
  isFavorite: boolean;
  size: string;
}

interface ForecastHistoryProps {
  onVersionSelect: (version: ForecastVersion) => void;
  onVersionDelete: (versionId: string) => void;
  onVersionExport: (versionId: string) => void;
  className?: string;
}

const mockVersions: ForecastVersion[] = [
  {
    id: '1',
    name: 'Прогноз звонков - итоговый',
    version: 'v2.1',
    createdAt: new Date('2024-06-03T14:30:00'),
    createdBy: 'Иван Петров',
    description: 'Финальная версия прогноза с оптимизированными параметрами ARIMA',
    accuracy: 87.5,
    algorithm: 'ARIMA',
    parameters: { p: 2, d: 1, q: 2, seasonal: true },
    dataRange: { start: new Date('2024-01-01'), end: new Date('2024-05-31') },
    tags: ['production', 'final'],
    isActive: true,
    isFavorite: true,
    size: '2.3 MB'
  },
  {
    id: '2',
    name: 'Прогноз звонков - тестирование',
    version: 'v2.0',
    createdAt: new Date('2024-06-02T10:15:00'),
    createdBy: 'Мария Иванова',
    description: 'Тестовая версия с улучшенной обработкой сезонности',
    accuracy: 85.2,
    algorithm: 'Seasonal Naive',
    parameters: { seasonLength: 7, trend: 'additive' },
    dataRange: { start: new Date('2024-01-01'), end: new Date('2024-05-31') },
    tags: ['testing', 'seasonal'],
    isActive: false,
    isFavorite: false,
    size: '1.8 MB'
  },
  {
    id: '3',
    name: 'Прогноз звонков - базовая модель',
    version: 'v1.5',
    createdAt: new Date('2024-06-01T16:45:00'),
    createdBy: 'Анна Сидорова',
    description: 'Базовая модель с линейной регрессией',
    accuracy: 82.1,
    algorithm: 'Linear Regression',
    parameters: { features: ['time', 'weekday', 'hour'] },
    dataRange: { start: new Date('2024-01-01'), end: new Date('2024-04-30') },
    tags: ['baseline', 'simple'],
    isActive: false,
    isFavorite: false,
    size: '1.2 MB'
  }
];

const ForecastHistory: React.FC<ForecastHistoryProps> = ({
  onVersionSelect,
  onVersionDelete,
  onVersionExport,
  className = ''
}) => {
  const [versions, setVersions] = useState<ForecastVersion[]>(mockVersions);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'accuracy' | 'name'>('date');

  // Get all unique tags
  const allTags = Array.from(new Set(versions.flatMap(v => v.tags)));
  
  // Filter and sort versions
  const filteredVersions = versions
    .filter(v => filterTag === 'all' || v.tags.includes(filterTag))
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleVersionClick = (version: ForecastVersion) => {
    setSelectedVersion(version.id);
    setShowDetails(version.id === showDetails ? null : version.id);
  };

  const handleLoadVersion = (version: ForecastVersion) => {
    onVersionSelect(version);
  };

  const handleDeleteVersion = (versionId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту версию прогноза?')) {
      setVersions(prev => prev.filter(v => v.id !== versionId));
      onVersionDelete(versionId);
    }
  };

  const handleToggleFavorite = (versionId: string) => {
    setVersions(prev => prev.map(v => 
      v.id === versionId ? { ...v, isFavorite: !v.isFavorite } : v
    ));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <History className="w-6 h-6 text-gray-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">История прогнозов</h3>
              <p className="text-sm text-gray-600">
                Управление версиями и история изменений
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredVersions.length} из {versions.length} версий
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Тег:</span>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">Все</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="date">По дате</option>
              <option value="accuracy">По точности</option>
              <option value="name">По названию</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredVersions.map(version => {
          const isSelected = selectedVersion === version.id;
          const showVersionDetails = showDetails === version.id;

          return (
            <div key={version.id} className="p-6 hover:bg-gray-50">
              <div
                className="cursor-pointer"
                onClick={() => handleVersionClick(version)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`
                        w-3 h-3 rounded-full mt-2
                        ${version.isActive ? 'bg-green-500' : 'bg-gray-300'}
                      `} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{version.name}</h4>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {version.version}
                        </span>
                        {version.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Активная
                          </span>
                        )}
                        {version.isFavorite && (
                          <span className="text-yellow-500">★</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(version.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {version.createdBy}
                        </div>
                        <div>
                          Точность: {version.accuracy}%
                        </div>
                        <div>
                          {version.size}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {version.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(version.id);
                      }}
                      className={`p-2 rounded hover:bg-gray-200 ${
                        version.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                      }`}
                      title="Добавить в избранное"
                    >
                      ★
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionExport(version.id);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-200"
                      title="Экспорт"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadVersion(version);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 rounded hover:bg-gray-200"
                      title="Загрузить версию"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!version.isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVersion(version.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-gray-200"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              {showVersionDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Алгоритм и параметры</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Алгоритм:</span>
                          <span className="font-medium">{version.algorithm}</span>
                        </div>
                        {Object.entries(version.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Диапазон данных</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Начало:</span>
                          <span className="font-medium">{version.dataRange.start.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Конец:</span>
                          <span className="font-medium">{version.dataRange.end.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Точность:</span>
                          <span className="font-medium">{version.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-3">
                    <button
                      onClick={() => handleLoadVersion(version)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <GitBranch className="w-4 h-4 mr-2 inline" />
                      Загрузить эту версию
                    </button>
                    <button
                      onClick={() => onVersionExport(version.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2 inline" />
                      Экспорт
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredVersions.length === 0 && (
        <div className="p-12 text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            История версий пуста
          </h4>
          <p className="text-gray-600">
            {filterTag === 'all' 
              ? 'Создайте первый прогноз, чтобы начать историю версий'
              : `Нет версий с тегом "${filterTag}"`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ForecastHistory;
