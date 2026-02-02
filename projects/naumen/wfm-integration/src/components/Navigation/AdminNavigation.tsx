import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Calendar, 
  Users, 
  BarChart3, 
  LogOut,
  Building2
} from 'lucide-react'
import { RootState } from '../../store'
import { logout } from '../../store/authSlice'
import { setMobileMenuOpen } from '../../store/uiSlice'

const AdminNavigation: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(setMobileMenuOpen(false))
    navigate('/login')
  }

  const navigationItems = [
    {
      name: 'Панель управления',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Обзор системы и KPI'
    },
    {
      name: 'Прогнозирование',
      href: '/admin/forecasting',
      icon: TrendingUp,
      description: 'Анализ нагрузки и алгоритмы прогнозов'
    },
    {
      name: 'Планирование смен',
      href: '/admin/schedule',
      icon: Calendar,
      description: 'График работы и шаблоны смен'
    },
    {
      name: 'Управление персоналом',
      href: '/admin/employees',
      icon: Users,
      description: 'Сотрудники, навыки и показатели'
    },
    {
      name: 'Отчеты и аналитика',
      href: '/admin/reports',
      icon: BarChart3,
      description: 'Конструктор отчетов и панель KPI'
    }
  ]

  // Filter navigation based on user permissions
  const allowedNavigation = navigationItems.filter(item => {
    if (user?.role === 'administrator') return true
    if (user?.role === 'manager') {
      return !item.href.includes('forecasting') // Managers can't access forecasting
    }
    return false
  })

  return (
    <div className="h-full flex flex-col bg-white shadow-lg">
      {/* Logo and Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">WFM System</h1>
              <p className="text-xs text-gray-500">Админ панель</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-2xl">{user?.avatar}</span>
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {allowedNavigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center' : ''}`
              }
            >
              <Icon className={`h-5 w-5 ${!sidebarOpen ? '' : 'mr-3'}`} />
              {sidebarOpen && (
                <div className="flex-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`sidebar-nav-item w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          <LogOut className={`h-5 w-5 ${!sidebarOpen ? '' : 'mr-3'}`} />
          {sidebarOpen && <span>Выйти</span>}
        </button>
      </div>
    </div>
  )
}

export default AdminNavigation
