import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  BarChart3,
  Activity,
  Clock,
  UserCheck,
  AlertTriangle
} from 'lucide-react'
import { RootState } from '../../store'

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  const moduleCards = [
    {
      name: 'Прогнозирование нагрузки',
      description: 'Анализ и прогнозирование нагрузки контакт-центра с использованием алгоритмов ARIMA',
      href: '/admin/forecasting',
      icon: TrendingUp,
      color: 'bg-blue-500',
      features: ['Chart.js графики', 'ARIMA алгоритмы', 'Точность прогнозов'],
      available: user?.role === 'administrator'
    },
    {
      name: 'Планирование смен',
      description: 'Создание и управление графиками работы с drag-drop интерфейсом',
      href: '/admin/schedule',
      icon: Calendar,
      color: 'bg-green-500',
      features: ['Drag-drop планирование', 'Шаблоны смен', 'Схемы работы'],
      available: true
    },
    {
      name: 'Управление персоналом',
      description: 'Полное управление сотрудниками, навыками и показателями эффективности',
      href: '/admin/employees',
      icon: Users,
      color: 'bg-purple-500',
      features: ['Список сотрудников', 'Фото галерея', 'Управление навыками'],
      available: true
    },
    {
      name: 'Отчеты и аналитика',
      description: 'Конструктор отчетов и панель KPI для анализа эффективности',
      href: '/admin/reports',
      icon: BarChart3,
      color: 'bg-orange-500',
      features: ['KPI панель', 'Конструктор отчетов', 'Экспорт PDF/Excel'],
      available: true
    }
  ]

  const kpiData = [
    {
      title: 'Активные сотрудники',
      value: '234',
      change: '+12',
      changeType: 'increase',
      icon: UserCheck
    },
    {
      title: 'Среднее время обработки',
      value: '3:45',
      change: '-15с',
      changeType: 'decrease',
      icon: Clock
    },
    {
      title: 'Загрузка системы',
      value: '87%',
      change: '+5%',
      changeType: 'increase',
      icon: Activity
    },
    {
      title: 'Открытые заявки',
      value: '23',
      change: '-8',
      changeType: 'decrease',
      icon: AlertTriangle
    }
  ]

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Панель управления WFM System
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Добро пожаловать, {user?.name}. Выберите модуль для работы.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div key={kpi.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {kpi.title}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {kpi.value}
                      </dd>
                    </dl>
                  </div>
                  <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    kpi.changeType === 'increase' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {kpi.change}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moduleCards.map((module) => {
            const Icon = module.icon
            return (
              <div
                key={module.name}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                  !module.available ? 'opacity-50' : ''
                }`}
              >
                {module.available ? (
                  <Link to={module.href} className="block p-6">
                    <div className="flex items-center mb-4">
                      <div className={`rounded-lg p-3 ${module.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="ml-4 text-lg font-semibold text-gray-900">
                        {module.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {module.description}
                    </p>
                    <div className="space-y-2">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </Link>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`rounded-lg p-3 ${module.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="ml-4 text-lg font-semibold text-gray-900">
                        {module.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {module.description}
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                      Недоступно для вашей роли
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Быстрые действия
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900">Создать новую смену</h4>
              <p className="text-sm text-gray-600 mt-1">Быстрое создание шаблона смены</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900">Добавить сотрудника</h4>
              <p className="text-sm text-gray-600 mt-1">Регистрация нового сотрудника</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900">Сгенерировать отчет</h4>
              <p className="text-sm text-gray-600 mt-1">Создать новый аналитический отчет</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
