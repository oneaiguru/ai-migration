import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Building2, Users, BarChart3 } from 'lucide-react'
import { RootState } from '../store'
import { loginStart, loginSuccess, loginFailure, validateLogin, clearError } from '../store/authSlice'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginStart())

    // Simulate API call delay
    setTimeout(() => {
      const user = validateLogin(email, password)
      if (user) {
        dispatch(loginSuccess(user))
      } else {
        dispatch(loginFailure('Неверный email или пароль'))
      }
    }, 1000)
  }

  const fillDemoCredentials = (userType: 'admin' | 'manager' | 'employee') => {
    dispatch(clearError())
    switch (userType) {
      case 'admin':
        setEmail('admin@naumen.ru')
        setPassword('admin123')
        break
      case 'manager':
        setEmail('manager@naumen.ru')
        setPassword('manager123')
        break
      case 'employee':
        setEmail('ivan@naumen.ru')
        setPassword('emp123')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            WFM Enterprise System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Войдите в систему для доступа к модулям
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Демо аккаунты:</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => fillDemoCredentials('admin')}
              className="flex items-center justify-between p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded border transition-colors"
            >
              <span className="flex items-center">
                <BarChart3 className="w-3 h-3 mr-2 text-blue-600" />
                Администратор
              </span>
              <span className="text-gray-500">admin@naumen.ru</span>
            </button>
            <button
              onClick={() => fillDemoCredentials('manager')}
              className="flex items-center justify-between p-2 text-xs bg-green-50 hover:bg-green-100 rounded border transition-colors"
            >
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-2 text-green-600" />
                Менеджер
              </span>
              <span className="text-gray-500">manager@naumen.ru</span>
            </button>
            <button
              onClick={() => fillDemoCredentials('employee')}
              className="flex items-center justify-between p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
            >
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-2 text-gray-600" />
                Сотрудник
              </span>
              <span className="text-gray-500">ivan@naumen.ru</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Введите email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Войти в систему'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>WFM Enterprise System v1.0</p>
          <p className="mt-1">Интеграция 5 модулей управления персоналом</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
