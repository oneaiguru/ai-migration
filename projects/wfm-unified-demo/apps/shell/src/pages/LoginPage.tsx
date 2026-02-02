import { Building2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPrimaryNavForRole } from '../config/navigation'
import { useShell } from '../state/ShellContext'
import type { ModuleKey } from '../types'

type LocationState = {
  from?: { pathname?: string }
  notice?: string
}

const modulesCopy: Record<ModuleKey, string> = {
  forecasts: 'Прогнозы',
  schedule: 'Расписание',
  employees: 'Сотрудники',
  reports: 'Отчёты',
}

const LoginPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { availableUsers, login } = useShell()
  const [notice, setNotice] = useState<string | null>(() => {
    const initialNotice = (location.state as LocationState | undefined)?.notice
    return initialNotice ?? null
  })

  const { from } = (location.state as LocationState) || {}

  const handleLogin = (id: string) => {
    const user = login(id)
    const fallback = getPrimaryNavForRole(user.role)[0]?.path

    if (!fallback) {
      setNotice('Для сотрудника доступен отдельный портал самообслуживания. Используйте ссылку из UAT чек-листа.')
      return
    }

    const target = from?.pathname ?? fallback
    navigate(target, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 px-4 py-16">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Naumen Workforce</h1>
          <p className="mt-2 text-sm text-slate-600">
            Выберите демонстрационный аккаунт, чтобы увидеть роль-ориентированную навигацию.
          </p>
        </div>

        {notice && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {notice}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {availableUsers.map((user) => (
            <article
              key={user.id}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="text-3xl">{user.avatar}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs capitalize text-slate-500">{user.role}</p>
                  </div>
                </div>
                <dl className="space-y-1 text-xs text-slate-500">
                  <div>
                    <dt className="font-medium text-slate-600">Email</dt>
                    <dd>{user.email}</dd>
                  </div>
                  {user.team && (
                    <div>
                      <dt className="font-medium text-slate-600">Команда</dt>
                      <dd>{user.team}</dd>
                    </div>
                  )}
                </dl>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Доступные разделы
                  </p>
                  {user.modules.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      {user.modules.map((module) => (
                        <li key={module}>{modulesCopy[module]}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      Использует портал сотрудников (недоступно в единой оболочке).
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLogin(user.id)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                Войти
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
