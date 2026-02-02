import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  RefreshCw, 
  User, 
  LogOut,
  Building2
} from 'lucide-react'
import { RootState } from '../../store'
import { logout } from '../../store/authSlice'
import { setMobileMenuOpen } from '../../store/uiSlice'

const EmployeeNavigation: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(setMobileMenuOpen(false))
    navigate('/login')
  }

  const navigationItems = [
    {
      name: 'Главная',
      href: '/employee/dashboard',
      icon: LayoutDashboard,
      description: 'Обзор личного кабинета'
    },
    {
      name: 'Мой график',
      href: '/employee/schedule',
      icon: Calendar,
      description: 'Персональное расписание'
    },
    {
      name: 'Мои заявки',
      href: '/employee/requests',
      icon: FileText,
      description: 'Отпуска и больничные'
    },
    {
      name: 'Обмен сменами',
      href: '/employee/exchange',
      icon: RefreshCw,
      description: 'Торговая площадка смен'
    },
    {
      name: 'Профиль',
      href: '/employee/profile',
      icon: User,
      description: 'Личные данные'
    }
  ]

  return (
    <div className="h-full flex flex-col bg-white shadow-lg">
      {/* Logo and Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-green-600 rounded flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">WFM Portal</h1>
            <p className="text-xs text-gray-500">Личный кабинет</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-2xl">{user?.avatar}</span>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.team}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => dispatch(setMobileMenuOpen(false))}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="h-5 w-5 mr-3" />
              <div className="flex-1">
                <span className="text-sm font-medium">{item.name}</span>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  )
}

export default EmployeeNavigation
