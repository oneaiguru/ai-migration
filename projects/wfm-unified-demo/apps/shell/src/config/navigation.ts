import type { SecondaryNavItem, TopNavItem, UserRole } from '../types'

export const TOP_NAV_ITEMS: TopNavItem[] = [
  {
    id: 'forecasts',
    path: '/forecasts',
    label: 'Прогнозы',
    allowedRoles: ['administrator'],
  },
  {
    id: 'schedule',
    path: '/schedule',
    label: 'Расписание',
    allowedRoles: ['administrator', 'manager'],
    secondary: [
      { id: 'schedule-shifts', label: 'Смены', path: '/schedule/shifts' },
      { id: 'schedule-schemes', label: 'Схемы', path: '/schedule/schemes' },
      { id: 'schedule-board', label: 'График', path: '/schedule/graph' },
      { id: 'schedule-requests', label: 'Заявки', path: '/schedule/requests' },
      { id: 'schedule-monitoring', label: 'Мониторинг', path: '/schedule/monitoring' },
      { id: 'schedule-tasks', label: 'Задачи', path: '/schedule/tasks' },
      { id: 'schedule-events', label: 'События', path: '/schedule/events' },
      { id: 'schedule-leave', label: 'Отпуска', path: '/schedule/leave' },
    ],
  },
  {
    id: 'employees',
    path: '/employees',
    label: 'Сотрудники',
    allowedRoles: ['administrator', 'manager'],
  },
  {
    id: 'reports',
    path: '/reports',
    label: 'Отчёты',
    allowedRoles: ['administrator', 'manager'],
  },
]

export const getPrimaryNavForRole = (role: UserRole): TopNavItem[] =>
  TOP_NAV_ITEMS.filter((item) => item.allowedRoles.includes(role))

export const getSecondaryNavForPath = (
  currentPath: string,
  items: TopNavItem[],
  role: UserRole,
): SecondaryNavItem[] => {
  const primary = items.find((item) => currentPath.startsWith(item.path))
  if (!primary?.secondary) {
    return []
  }
  return primary.secondary.filter(
    (navItem) => !navItem.allowedRoles || navItem.allowedRoles.includes(role),
  )
}
