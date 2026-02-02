export type ModuleKey = 'forecasts' | 'schedule' | 'employees' | 'reports'

export type UserRole = 'administrator' | 'manager' | 'employee'

export interface ShellUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar: string
  team?: string
  modules: ModuleKey[]
}

export interface SecondaryNavItem {
  id: string
  label: string
  path: string
  allowedRoles?: UserRole[]
}

export interface TopNavItem {
  id: ModuleKey
  label: string
  path: `/${ModuleKey}`
  allowedRoles: UserRole[]
  secondary?: SecondaryNavItem[]
}

export interface ShellState {
  user: ShellUser | null
  mobileNavOpen: boolean
  structureDrawerOpen: boolean
}

export interface ShellContextValue extends ShellState {
  isAuthenticated: boolean
  availableUsers: ShellUser[]
  login: (id: string) => ShellUser
  logout: () => void
  toggleMobileNav: () => void
  setMobileNavOpen: (open: boolean) => void
  openStructureDrawer: () => void
  closeStructureDrawer: () => void
}
