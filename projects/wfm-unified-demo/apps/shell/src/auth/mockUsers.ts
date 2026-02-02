import type { ShellUser } from '../types'

export const demoUsers: ShellUser[] = [
  {
    id: 'admin',
    email: 'admin@naumen.ru',
    name: 'Системный администратор',
    role: 'administrator',
    avatar: '👨\u200d💼',
    modules: ['forecasts', 'schedule', 'employees', 'reports'],
  },
  {
    id: 'manager',
    email: 'manager@naumen.ru',
    name: 'Анна Петрова',
    role: 'manager',
    avatar: '👩\u200d💼',
    modules: ['schedule', 'employees', 'reports'],
  },
  {
    id: 'ivan',
    email: 'ivan@naumen.ru',
    name: 'Иван Иванов',
    role: 'employee',
    avatar: '👤',
    modules: [],
    team: 'Контакт-центр 1010',
  },
]

export const defaultUser = demoUsers[0]

export const getUserById = (id: string): ShellUser | undefined =>
  demoUsers.find((user) => user.id === id)
