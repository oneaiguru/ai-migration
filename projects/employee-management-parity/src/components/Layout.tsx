import { NavLink, Outlet } from 'react-router-dom';
import WorkStructureDrawer from './WorkStructureDrawer';
import { mockEmployee } from '../data/mockData';

const MODULE_TABS = [
  { id: 'forecasts', label: 'Прогнозы', href: '#', disabled: true },
  { id: 'schedule', label: 'Расписание', href: '#', disabled: true },
  { id: 'employees', label: 'Сотрудники', href: '#', disabled: true },
  { id: 'reports', label: 'Отчеты', href: '#', disabled: true },
];

const PAGE_TABS = [
  { to: '/', label: 'Главная' },
  { to: '/vacation-requests', label: 'Мои заявки' },
  { to: '/profile', label: 'Профиль' },
];

const Layout = () => {
  const employee = mockEmployee;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-blue-600">Naumen WFM</span>
              <h1 className="text-xl font-semibold text-slate-900">Личный кабинет сотрудника</h1>
            </div>
            <div className="flex items-center gap-4">
              <WorkStructureDrawer
                employee={employee}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    Рабочая структура
                  </button>
                }
              />
              <button
                type="button"
                aria-label="Уведомления"
                className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span aria-hidden>🔔</span>
                <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  3
                </span>
              </button>
              <a
                href="https://docs.naumen.ru"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                ? Справка
              </a>
              <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-500 text-white">
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold">
                    {employee.personalInfo.firstName[0]}
                    {employee.personalInfo.lastName[0]}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">
                    {employee.personalInfo.lastName} {employee.personalInfo.firstName}
                  </span>
                  <NavLink to="/profile" className="text-xs text-blue-600 hover:underline">
                    Профиль
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Модули системы">
            {MODULE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:border-slate-200 disabled:text-slate-300"
                disabled={tab.disabled}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <nav className="flex gap-2" aria-label="Навигация по личному кабинету">
            {PAGE_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-white text-slate-600 shadow-sm hover:text-blue-600'
                  }`
                }
                end={tab.to === '/'}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Naumen WFM • Все права защищены</span>
          <span>Поддержка: support@naumen.ru • +7 (495) 123-45-67</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
