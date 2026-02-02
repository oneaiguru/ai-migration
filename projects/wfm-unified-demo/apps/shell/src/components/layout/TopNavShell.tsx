import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getPrimaryNavForRole, getSecondaryNavForPath } from '../../config/navigation'
import PrimaryNav from '../navigation/PrimaryNav'
import SecondaryNav from '../navigation/SecondaryNav'
import HeaderActions from './HeaderActions'
import { useShell } from '../../state/ShellContext'

const TopNavShell = () => {
  const {
    user,
    mobileNavOpen,
    toggleMobileNav,
    setMobileNavOpen,
    openStructureDrawer,
    closeStructureDrawer,
    structureDrawerOpen,
    logout,
  } = useShell()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname, setMobileNavOpen])

  if (!user) {
    return null
  }

  const primaryNav = getPrimaryNavForRole(user.role)
  const secondaryNav = getSecondaryNavForPath(location.pathname, primaryNav, user.role)

  return (
    <div className="min-h-screen bg-shell-surface text-shell-ink">
      <header className="bg-nav-background text-white shadow-shell-header">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-md p-2 text-nav-icon transition hover:bg-nav-hover/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-nav-background focus-visible:ring-white lg:hidden"
              onClick={toggleMobileNav}
              aria-label={mobileNavOpen ? 'Скрыть навигацию' : 'Показать навигацию'}
            >
              <span className="sr-only">Открыть меню</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.12em] text-nav-muted">Naumen</span>
              <span className="text-sm font-semibold">Workforce Management</span>
            </div>
          </div>
          <div className="hidden flex-1 justify-center lg:flex">
            <PrimaryNav items={primaryNav} />
          </div>
          <HeaderActions
            onOpenStructure={openStructureDrawer}
            onLogout={() => {
              logout()
              navigate('/login')
            }}
          />
        </div>
        {mobileNavOpen && (
          <div className="px-4 pb-4 lg:hidden">
            <PrimaryNav items={primaryNav} onNavigate={() => setMobileNavOpen(false)} layout="mobile" />
          </div>
        )}
      </header>

      <SecondaryNav items={secondaryNav} />

      <main className="px-4 py-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <Outlet />
        </div>
      </main>
      {structureDrawerOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm"
          onClick={closeStructureDrawer}
          role="presentation"
        >
          <div
            className="h-full w-full max-w-md bg-shell-panel shadow-shell"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-center justify-between border-b border-shell-divider px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-shell-ink">Рабочая структура</h2>
                <p className="text-sm text-slate-600">Быстрый доступ к оргструктуре появится после подключения HR‑модуля.</p>
              </div>
              <button
                type="button"
                onClick={closeStructureDrawer}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200"
                aria-label="Закрыть панель"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm text-slate-600">
              <p>
                В реальном продукте здесь открывается дерево подразделений и быстрый поиск по сотрудникам. В демо мы
                удерживаем место, чтобы показать ожидаемую точку интеграции.
              </p>
              <p className="rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-500">
                Подсказка: переключите пользователя в правом верхнем углу, чтобы увидеть различия в доступных
                разделах.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopNavShell
