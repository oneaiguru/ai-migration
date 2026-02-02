import React, { useState } from 'react';

interface PreferencesProps {
  preferences: UserPreferences;
  onChange: (data: Partial<UserPreferences>) => void;
}

interface UserPreferences {
  notifications: {
    scheduleChanges: boolean;
    shiftReminders: boolean;
    exchangeOffers: boolean;
    requestUpdates: boolean;
    emailDigest: boolean;
    pushNotifications: boolean;
  };
  shiftPreferences: {
    preferredShifts: string[];
    avoidShifts: string[];
    maxConsecutiveDays: number;
    minRestHours: number;
  };
  language: 'ru' | 'en' | 'ky';
  timezone: string;
  autoAcceptExchanges: {
    enabled: boolean;
    sameShiftType: boolean;
    sameDuration: boolean;
    preferredTeams: boolean;
  };
}

const Preferences: React.FC<PreferencesProps> = ({ preferences, onChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const shiftTypes = [
    { id: 'morning', label: 'Утренние смены (08:00-17:00)', icon: '🌅' },
    { id: 'day', label: 'Дневные смены (09:00-18:00)', icon: '☀️' },
    { id: 'evening', label: 'Вечерние смены (14:00-23:00)', icon: '🌆' },
    { id: 'night', label: 'Ночные смены (23:00-08:00)', icon: '🌙' },
    { id: 'training', label: 'Обучение/тренинги', icon: '📚' },
    { id: 'overtime', label: 'Сверхурочные', icon: '⏰' }
  ];

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' }
  ];

  const timezones = [
    { value: 'Asia/Bishkek', label: 'Бишкек (GMT+6)' },
    { value: 'Asia/Almaty', label: 'Алматы (GMT+6)' },
    { value: 'Asia/Tashkent', label: 'Ташкент (GMT+5)' },
    { value: 'Europe/Moscow', label: 'Москва (GMT+3)' }
  ];

  const handleNotificationChange = (key: keyof UserPreferences['notifications'], value: boolean) => {
    onChange({
      notifications: {
        ...preferences.notifications,
        [key]: value
      }
    });
  };

  const handleShiftPreferenceChange = (type: 'preferred' | 'avoid', shiftId: string) => {
    const currentPreferred = [...preferences.shiftPreferences.preferredShifts];
    const currentAvoid = [...preferences.shiftPreferences.avoidShifts];

    if (type === 'preferred') {
      // Remove from avoid list if exists
      const avoidIndex = currentAvoid.indexOf(shiftId);
      if (avoidIndex > -1) {
        currentAvoid.splice(avoidIndex, 1);
      }

      // Toggle in preferred list
      const preferredIndex = currentPreferred.indexOf(shiftId);
      if (preferredIndex > -1) {
        currentPreferred.splice(preferredIndex, 1);
      } else {
        currentPreferred.push(shiftId);
      }
    } else {
      // Remove from preferred list if exists
      const preferredIndex = currentPreferred.indexOf(shiftId);
      if (preferredIndex > -1) {
        currentPreferred.splice(preferredIndex, 1);
      }

      // Toggle in avoid list
      const avoidIndex = currentAvoid.indexOf(shiftId);
      if (avoidIndex > -1) {
        currentAvoid.splice(avoidIndex, 1);
      } else {
        currentAvoid.push(shiftId);
      }
    }

    onChange({
      shiftPreferences: {
        ...preferences.shiftPreferences,
        preferredShifts: currentPreferred,
        avoidShifts: currentAvoid
      }
    });
  };

  const handleAutoAcceptChange = (key: keyof UserPreferences['autoAcceptExchanges'], value: boolean) => {
    onChange({
      autoAcceptExchanges: {
        ...preferences.autoAcceptExchanges,
        [key]: value
      }
    });
  };

  const getShiftPreferenceStatus = (shiftId: string) => {
    if (preferences.shiftPreferences.preferredShifts.includes(shiftId)) return 'preferred';
    if (preferences.shiftPreferences.avoidShifts.includes(shiftId)) return 'avoid';
    return 'neutral';
  };

  const getShiftPreferenceColor = (status: string) => {
    switch (status) {
      case 'preferred': return 'border-green-300 bg-green-50 text-green-800';
      case 'avoid': return 'border-red-300 bg-red-50 text-red-800';
      default: return 'border-gray-200 bg-white text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Notification Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Уведомления</h3>
        <p className="text-sm text-gray-600 mb-4">
          Настройте, как и когда вы хотите получать уведомления
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Изменения графика</div>
                <div className="text-sm text-gray-600">Уведомления об изменении смен</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.scheduleChanges}
                onChange={(e) => handleNotificationChange('scheduleChanges', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Напоминания о сменах</div>
                <div className="text-sm text-gray-600">Напоминания перед началом смены</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.shiftReminders}
                onChange={(e) => handleNotificationChange('shiftReminders', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Предложения обмена</div>
                <div className="text-sm text-gray-600">Новые предложения обмена сменами</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.exchangeOffers}
                onChange={(e) => handleNotificationChange('exchangeOffers', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Статус заявок</div>
                <div className="text-sm text-gray-600">Обновления по вашим заявкам</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.requestUpdates}
                onChange={(e) => handleNotificationChange('requestUpdates', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Email дайджест</div>
                <div className="text-sm text-gray-600">Еженедельная сводка на email</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.emailDigest}
                onChange={(e) => handleNotificationChange('emailDigest', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium text-gray-900">Push-уведомления</div>
                <div className="text-sm text-gray-600">Мгновенные уведомления в браузере</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.pushNotifications}
                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Shift Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Предпочтения по сменам</h3>
        <p className="text-sm text-gray-600 mb-4">
          Укажите ваши предпочтения по типам смен. Это поможет при автоматическом планировании.
        </p>
        
        <div className="space-y-6">
          {/* Shift Type Preferences */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Типы смен</h4>
            <p className="text-sm text-gray-600 mb-3">
              Выберите предпочитаемые типы смен (зеленые) или нежелательные (красные)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shiftTypes.map((shift) => {
                const status = getShiftPreferenceStatus(shift.id);
                return (
                  <div key={shift.id} className={`border-2 rounded-lg p-3 transition-colors ${getShiftPreferenceColor(status)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{shift.icon}</span>
                      <span className="font-medium text-sm">{shift.label}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShiftPreferenceChange('preferred', shift.id)}
                        className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                          status === 'preferred'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {status === 'preferred' ? '✓ Предпочитаю' : 'Предпочитаю'}
                      </button>
                      
                      <button
                        onClick={() => handleShiftPreferenceChange('avoid', shift.id)}
                        className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                          status === 'avoid'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {status === 'avoid' ? '✓ Избегаю' : 'Избегаю'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work Load Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Максимум дней подряд
              </label>
              <select
                value={preferences.shiftPreferences.maxConsecutiveDays}
                onChange={(e) => onChange({
                  shiftPreferences: {
                    ...preferences.shiftPreferences,
                    maxConsecutiveDays: parseInt(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[3, 4, 5, 6, 7].map(days => (
                  <option key={days} value={days}>{days} дней</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Максимальное количество рабочих дней подряд
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Минимум часов отдыха
              </label>
              <select
                value={preferences.shiftPreferences.minRestHours}
                onChange={(e) => onChange({
                  shiftPreferences: {
                    ...preferences.shiftPreferences,
                    minRestHours: parseInt(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[8, 10, 11, 12, 16, 24].map(hours => (
                  <option key={hours} value={hours}>{hours} часов</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Минимальный отдых между сменами
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language and Timezone */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Язык и регион</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Язык интерфейса
            </label>
            <select
              value={preferences.language}
              onChange={(e) => onChange({ language: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Часовой пояс
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Accept Exchange Rules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Автопринятие обменов</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Скрыть настройки' : 'Расширенные настройки'}
          </button>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <div className="font-medium text-gray-900">Включить автоматическое принятие</div>
              <div className="text-sm text-gray-600">
                Автоматически принимать подходящие предложения обмена
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoAcceptExchanges.enabled}
              onChange={(e) => handleAutoAcceptChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          {showAdvanced && preferences.autoAcceptExchanges.enabled && (
            <div className="ml-4 space-y-3 border-l-2 border-blue-200 pl-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Только тот же тип смены</span>
                <input
                  type="checkbox"
                  checked={preferences.autoAcceptExchanges.sameShiftType}
                  onChange={(e) => handleAutoAcceptChange('sameShiftType', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Только такая же продолжительность</span>
                <input
                  type="checkbox"
                  checked={preferences.autoAcceptExchanges.sameDuration}
                  onChange={(e) => handleAutoAcceptChange('sameDuration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Только из предпочитаемых команд</span>
                <input
                  type="checkbox"
                  checked={preferences.autoAcceptExchanges.preferredTeams}
                  onChange={(e) => handleAutoAcceptChange('preferredTeams', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Privacy and Data */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-lg">⚠️</span>
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Конфиденциальность настроек</h4>
            <p className="text-sm text-yellow-800">
              Ваши предпочтения используются только для улучшения планирования смен. 
              Руководители видят только общие предпочтения (например, "предпочитает утренние смены"), 
              но не имеют доступа к детальным настройкам уведомлений.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;