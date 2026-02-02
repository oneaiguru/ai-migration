import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getPrimaryNavForRole } from '../config/navigation'
import { useShell } from '../state/ShellContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children: ReactNode
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const location = useLocation()
  const { user, isAuthenticated } = useShell()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackItem = getPrimaryNavForRole(user.role)[0]
    if (!fallbackItem) {
      return (
        <Navigate
          to="/login"
          replace
          state={{
            notice: 'Для выбранной роли используется отдельный портал. Выберите аккаунт администратора или менеджера.',
            from: location,
          }}
        />
      )
    }

    return <Navigate to={fallbackItem.path} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
