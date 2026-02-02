import { Bell, DownloadCloud, HelpCircle, LogOut, Search } from 'lucide-react'
import { useShell } from '../../state/ShellContext'

interface HeaderActionsProps {
  onOpenStructure: () => void
  onLogout: () => void
}

const HeaderActions = ({ onOpenStructure, onLogout }: HeaderActionsProps) => {
  const { user } = useShell()

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onOpenStructure}
        className="hidden items-center gap-2 rounded-lg border border-nav-border bg-nav-surface px-3 py-2 text-sm font-semibold text-white transition hover:bg-nav-hover/70 lg:inline-flex"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span>Рабочая структура</span>
      </button>
      <button
        type="button"
        className="rounded-full p-2 text-nav-icon transition hover:bg-nav-hover/70"
        aria-label="Скачать"
      >
        <DownloadCloud className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        className="rounded-full p-2 text-nav-icon transition hover:bg-nav-hover/70"
        aria-label="Уведомления"
      >
        <Bell className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        className="hidden rounded-full p-2 text-nav-icon transition hover:bg-nav-hover/70 lg:inline-flex"
        aria-label="Помощь"
      >
        <HelpCircle className="h-5 w-5" aria-hidden />
      </button>
      <div className="flex items-center gap-2 rounded-full bg-nav-user px-3 py-1 text-sm font-medium text-white">
        <span className="hidden sm:inline">{user.name}</span>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full p-1 text-white transition hover:bg-white/20"
          aria-label="Выйти"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default HeaderActions
