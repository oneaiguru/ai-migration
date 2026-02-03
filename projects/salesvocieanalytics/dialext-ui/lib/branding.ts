/**
 * Branding configuration for the application.
 * Update these values to customize the brand name and other localized strings.
 */

export const branding = {
  // Brand name
  productName: 'Voice Analytics',
  companyName: 'Voice Analytics',

  // Alternative names (for different markets/white-labels)
  alternativeNames: {
    en: 'Voice Analytics',
    ru: 'Голосовая аналитика',
  },

  // UI strings
  strings: {
    ru: {
      // Page titles and headers
      dashboard: 'Главная',
      stats: 'Статистика',
      reports: 'Отчёты',
      admin: 'Администрирование',
      settings: 'Настройки',

      // Common actions
      apply: 'Применить',
      reset: 'Сброс',
      save: 'Сохранить',
      cancel: 'Отмена',
      search: 'Поиск',
      export: 'Экспорт',

      // Status messages
      noData: 'Нет данных для отображения',
      loading: 'Загрузка...',
      error: 'Произошла ошибка',
      success: 'Успешно сохранено',

      // Calls and scoring
      calls: 'Звонки',
      call: 'Звонок',
      score: 'Оценка',
      transcript: 'Расшифровка',
      criteria: 'Критерии',
      managers: 'Менеджеры',
      manager: 'Менеджер',

      // Time periods
      today: 'Сегодня',
      yesterday: 'Вчера',
      thisWeek: 'Эта неделя',
      thisMonth: 'Этот месяц',
      custom: 'Выборочный период',
    },

    en: {
      // Page titles and headers
      dashboard: 'Dashboard',
      stats: 'Statistics',
      reports: 'Reports',
      admin: 'Administration',
      settings: 'Settings',

      // Common actions
      apply: 'Apply',
      reset: 'Reset',
      save: 'Save',
      cancel: 'Cancel',
      search: 'Search',
      export: 'Export',

      // Status messages
      noData: 'No data to display',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Successfully saved',

      // Calls and scoring
      calls: 'Calls',
      call: 'Call',
      score: 'Score',
      transcript: 'Transcript',
      criteria: 'Criteria',
      managers: 'Managers',
      manager: 'Manager',

      // Time periods
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      thisMonth: 'This month',
      custom: 'Custom period',
    },
  },
};

/**
 * Get a localized string
 * @param key The key to look up
 * @param locale The locale (default: 'ru')
 * @returns The localized string
 */
export function t(key: keyof typeof branding.strings.ru, locale: 'ru' | 'en' = 'ru'): string {
  return branding.strings[locale][key] || key;
}

/**
 * Get the current brand name
 * @param locale The locale (default: 'ru')
 * @returns The brand name
 */
export function getBrandName(locale?: 'ru' | 'en'): string {
  if (locale && locale !== 'ru') {
    return branding.alternativeNames[locale] || branding.productName;
  }
  return branding.productName;
}
