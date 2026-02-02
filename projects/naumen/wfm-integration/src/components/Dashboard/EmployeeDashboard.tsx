import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Calendar, 
  FileText, 
  RefreshCw, 
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react'
import { RootState } from '../../store'

const EmployeeDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  const quickActions = [
    {
      name: 'Мой график',
      description: 'Просмотр персонального расписания работы',
      href: '/employee/schedule',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      name: 'Подать заявку',
      description: 'Отпуск, больничный или изменение графика',
      href: '/employee/requests',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      name: 'Обменять смену',
      description: 'Найти коллегу для обмена сменами',
      href: '/employee/exchange',
      icon: RefreshCw,
      color: 'bg-purple-500'
    },
    {
      name: 'Мой профиль',
      description: 'Обновить личные данные и настройки',
      href: '/employee/profile',
      icon: User,
      color: 'bg-orange-500'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'request',
      title: 'Заявка на отпуск одобрена',
      description: 'Отпуск с 15.06 по 29.06',
      time: '2 часа назад',
      status: 'approved',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'schedule',
      title: 'Обновление графика',
      description: 'График на следующую неделю',
      time: '1 день назад',
      status: 'info',
      icon: CalendarIcon
    },
    {
      id: 3,
      type: 'exchange',
      title: 'Запрос на обмен сменой',
      description: 'От: Петров А.И.',
      time: '2 дня назад',
      status: 'pending',
      icon: AlertCircle
    }
  ]

  const upcomingShifts = [
    { date: 'Пн, 10 июня', time: '09:00 - 18:00', type: 'Рабочий день' },
    { date: 'Вт, 11 июня', time: '09:00 - 18:00', type: 'Рабочий день' },
    { date: 'Ср, 12 июня', time: 'Выходной', type: 'Выходной' },
    { date: 'Чт, 13 июня', time: '09:00 - 18:00', type: 'Рабочий день' },
    { date: 'Пт, 14 июня', time: '09:00 - 18:00', type: 'Рабочий день' }
  ]

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Команда: {user?.team}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Отработано в месяце</p>
                <p className="text-2xl font-semibold text-gray-900">152ч</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активные заявки</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Обмены смен</p>
                <p className="text-2xl font-semibold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Дней до отпуска</p>
                <p className="text-2xl font-semibold text-gray-900">9</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Быстрые действия
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.name}
                      to={action.href}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className={`rounded-lg p-3 ${action.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900">{action.name}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Последние события
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start">
                      <div className={`rounded-full p-2 ${
                        activity.status === 'approved' ? 'bg-green-100' :
                        activity.status === 'pending' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          activity.status === 'approved' ? 'text-green-600' :
                          activity.status === 'pending' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Ближайший график
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {upcomingShifts.map((shift, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{shift.date}</p>
                      <p className="text-xs text-gray-500">{shift.type}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {shift.time}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                to="/employee/schedule"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Посмотреть полный график
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard
