import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setMobileMenuOpen } from '../store/uiSlice'
import EmployeeNavigation from '../components/Navigation/EmployeeNavigation'
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard'
import ModuleWrapper from '../components/Common/ModuleWrapper'
import { Menu, X } from 'lucide-react'

const employeeModuleConfig = {
  portal: {
    url: 'http://localhost:3001',
    title: 'Личный кабинет сотрудника',
    description: 'Персональные данные, график работы и заявки'
  }
}

const EmployeeLayout: React.FC = () => {
  const dispatch = useDispatch()
  const { mobileMenuOpen } = useSelector((state: RootState) => state.ui)
  const { user } = useSelector((state: RootState) => state.auth)

  const toggleMobileMenu = () => {
    dispatch(setMobileMenuOpen(!mobileMenuOpen))
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => dispatch(setMobileMenuOpen(false))}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <EmployeeNavigation />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <h1 className="ml-4 text-lg font-semibold text-gray-900">
                Личный кабинет сотрудника
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{user?.avatar}</span>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-gray-500">{user?.team}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route 
              path="/schedule" 
              element={<ModuleWrapper config={employeeModuleConfig.portal} />} 
            />
            <Route 
              path="/requests" 
              element={<ModuleWrapper config={employeeModuleConfig.portal} />} 
            />
            <Route 
              path="/exchange" 
              element={<ModuleWrapper config={employeeModuleConfig.portal} />} 
            />
            <Route 
              path="/profile" 
              element={<ModuleWrapper config={employeeModuleConfig.portal} />} 
            />
            <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default EmployeeLayout
