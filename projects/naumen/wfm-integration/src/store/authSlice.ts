import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name: string
  role: 'administrator' | 'manager' | 'employee'
  avatar: string
  team?: string
  permissions: string[]
  modules: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Demo users configuration
export const demoUsers: Record<string, Omit<User, 'id'> & { password: string }> = {
  'admin@naumen.ru': {
    email: 'admin@naumen.ru',
    password: 'admin123',
    role: 'administrator',
    name: 'Системный Администратор',
    avatar: '👨‍💼',
    permissions: ['all'],
    modules: ['forecasting', 'schedule', 'employees', 'reports']
  },
  'manager@naumen.ru': {
    email: 'manager@naumen.ru', 
    password: 'manager123',
    role: 'manager',
    name: 'Анна Петрова',
    avatar: '👩‍💼',
    permissions: ['schedule', 'employees', 'reports'],
    modules: ['schedule', 'employees', 'reports']
  },
  'ivan@naumen.ru': {
    email: 'ivan@naumen.ru',
    password: 'emp123', 
    role: 'employee',
    name: 'Иван Иванов',
    avatar: '👤',
    team: 'Контакт-центр 1010',
    permissions: ['employee-portal'],
    modules: ['employee-portal']
  },
  'anna@naumen.ru': {
    email: 'anna@naumen.ru',
    password: 'emp123',
    role: 'employee', 
    name: 'Анна Сидорова',
    avatar: '👩',
    team: 'Техподдержка',
    permissions: ['employee-portal'],
    modules: ['employee-portal']
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions
export default authSlice.reducer

// Auth helper functions
export const validateLogin = (email: string, password: string): User | null => {
  const userData = demoUsers[email]
  if (userData && userData.password === password) {
    return {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      team: userData.team,
      permissions: userData.permissions,
      modules: userData.modules
    }
  }
  return null
}

export const getModuleAccess = (role: string): string[] => {
  switch (role) {
    case 'administrator':
      return ['/admin/dashboard', '/admin/forecasting', '/admin/schedule', '/admin/employees', '/admin/reports']
    case 'manager':
      return ['/admin/dashboard', '/admin/schedule', '/admin/employees', '/admin/reports']
    case 'employee':
      return ['/employee/dashboard', '/employee/schedule', '/employee/requests', '/employee/exchange', '/employee/profile']
    default:
      return []
  }
}
