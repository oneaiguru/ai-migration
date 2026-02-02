import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { defaultUser, demoUsers, getUserById } from '../auth/mockUsers'
import type { ShellContextValue, ShellUser } from '../types'

const ShellContext = createContext<ShellContextValue | undefined>(undefined)

interface ShellProviderProps {
  children: ReactNode
}

export const ShellProvider = ({ children }: ShellProviderProps) => {
  const [user, setUser] = useState<ShellUser | null>(defaultUser)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [structureDrawerOpen, setStructureDrawerOpen] = useState(false)

  const login = useCallback((id: string) => {
    const nextUser = getUserById(id) ?? defaultUser
    setUser(nextUser)
    setMobileNavOpen(false)
    setStructureDrawerOpen(false)
    return nextUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setMobileNavOpen(false)
    setStructureDrawerOpen(false)
  }, [])

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev)
  }, [])

  const openStructureDrawer = useCallback(() => {
    setStructureDrawerOpen(true)
  }, [])

  const closeStructureDrawer = useCallback(() => {
    setStructureDrawerOpen(false)
  }, [])

  const value = useMemo<ShellContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      mobileNavOpen,
      structureDrawerOpen,
      availableUsers: demoUsers,
      login,
      logout,
      toggleMobileNav,
      setMobileNavOpen,
      openStructureDrawer,
      closeStructureDrawer,
    }),
    [
      user,
      mobileNavOpen,
      structureDrawerOpen,
      login,
      logout,
      toggleMobileNav,
      openStructureDrawer,
      closeStructureDrawer,
    ],
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export const useShell = () => {
  const context = useContext(ShellContext)
  if (!context) {
    throw new Error('useShell must be used within ShellProvider')
  }
  return context
}
