import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  CalendarIcon, 
  PlusIcon, 
  XIcon,
  PlayIcon,
  StopIcon,
  SettingsIcon
} from 'lucide-react';

interface AbsenteeismException {
  id: string;
  type: 'periodic' | 'oneTime';
  name: string;
  dateRange: { start: Date; end: Date };
  skills: string[];
  description: string;
}

interface ForecastProfile {
  id: string;
  buildDate: string;
  skill: string;
  description: string;
  horizon: { start: string; end: string };
  interval: string;
  status: 'completed' | 'building' | 'failed';
}

export const NaumenAbsenteeismCalculator: React.FC = () => {
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [periodicExpanded, setPeriodicExpanded] = useState(false);
  const [oneTimeExpanded, setOneTimeExpanded] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(true);
  
  const [exceptions, setExceptions] = useState<AbsenteeismException[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  // Mock forecast profiles data
  const [forecastProfiles] = useState<ForecastProfile[]>([
    {
      id: '1',
      buildDate: '26.10.2023',
      skill: 'ВХ_Линия_гр1',
      description: 'Навык: ВХ_Линия_гр1, активности абсентеизма: Отпуск, Больничный, горизонт факта 01.09.2023 - 14.09.2023, шаг - "день".',
      horizon: { start: '17.07.2023', end: '17.07.2024' },
      interval: 'День',
      status: 'completed'
    }
  ]);

  const handleBuildForecast = () => {
    setIsBuilding(true);
    // Simulate building process
    setTimeout(() => {
      setIsBuilding(false);
    }, 3000);
  };

  const ExpandableSection: React.FC<{
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children?: React.ReactNode;
  }> = ({ title, expanded, onToggle, children }) => (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-6 text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {expanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expanded && children && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );

  const ForecastSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Горизонт прогноза
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              defaultValue="2023-07-17"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="self-center text-gray-500">–</span>
            <input
              type="date"
              defaultValue="2024-07-17"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Размерность интервала
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Навыки для расчета
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['ВХ_Линия_гр1', 'ВХ_Линия_гр2', 'Техподдержка', 'Продажи'].map((skill) => (
            <label key={skill} className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={skill === 'ВХ_Линия_гр1'}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Активности абсентеизма
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Отпуск', 'Больничный', 'Прогул', 'Командировка', 'Обучение'].map((activity) => (
            <label key={activity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={['Отпуск', 'Больничный'].includes(activity)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{activity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const ExceptionsManager = ({ type }: { type: 'periodic' | 'oneTime' }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {type === 'periodic' 
            ? 'Настройте периодические исключения (праздники, сезонные колебания)'
            : 'Добавьте разовые исключения для конкретных дат'
          }
        </p>
        <button className="btn-secondary inline-flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Добавить</span>
        </button>
      </div>
      
      {exceptions.filter(e => e.type === type).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Исключения не заданы</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exceptions.filter(e => e.type === type).map((exception) => (
            <div key={exception.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{exception.name}</p>
                <p className="text-sm text-gray-500">{exception.description}</p>
              </div>
              <button className="text-red-600 hover:text-red-800">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ResultsPanel = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Что получилось</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>Строим прогноз абсентеизма с горизонтом <strong>17.07.2023 – 17.07.2024</strong>.</p>
            <p>С размерностью интервала <strong>"День"</strong>.</p>
            <p>Для навыков: <strong>ВХ_Линия_гр1</strong></p>
            <p>Активности: <strong>Отпуск, Больничный</strong></p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-800">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const ForecastTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата построения
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Навык факта абсентеизма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание профиля прогноза
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forecastProfiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {profile.buildDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {profile.skill}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-lg">
                  <div className="truncate" title={profile.description}>
                    {profile.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">Просмотр</button>
                    <button className="text-green-600 hover:text-green-900">Экспорт</button>
                    <button className="text-red-600 hover:text-red-900">Удалить</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ExpandableSection
          title="Настройки прогноза абсентеизма"
          expanded={settingsExpanded}
          onToggle={() => setSettingsExpanded(!settingsExpanded)}
        >
          <ForecastSettings />
        </ExpandableSection>

        <div style={{ height: '1px', backgroundColor: '#d9d9d9', margin: '0 20px' }}></div>

        <div className="py-4 px-6">
          <h4 className="font-medium text-gray-900 mb-4">Задать исключения для построения</h4>
        </div>

        <ExpandableSection
          title="Периодические исключения"
          expanded={periodicExpanded}
          onToggle={() => setPeriodicExpanded(!periodicExpanded)}
        >
          <ExceptionsManager type="periodic" />
        </ExpandableSection>

        <ExpandableSection
          title="Разовые исключения"
          expanded={oneTimeExpanded}
          onToggle={() => setOneTimeExpanded(!oneTimeExpanded)}
        >
          <ExceptionsManager type="oneTime" />
        </ExpandableSection>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex space-x-3">
          <button
            onClick={handleBuildForecast}
            disabled={isBuilding}
            className={`btn-primary inline-flex items-center space-x-2 ${
              isBuilding ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isBuilding ? (
              <>
                <SettingsIcon className="w-4 h-4 animate-spin" />
                <span>Построение...</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Построить прогноз</span>
              </>
            )}
          </button>
          <button
            disabled={!isBuilding}
            className={`btn-secondary inline-flex items-center space-x-2 ${
              !isBuilding ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <StopIcon className="w-4 h-4" />
            <span>Отменить</span>
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {forecastProfiles.length > 0 && <ResultsPanel />}

      {/* Forecast Results Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">История построенных прогнозов</h3>
        <ForecastTable />
      </div>
    </div>
  );
};