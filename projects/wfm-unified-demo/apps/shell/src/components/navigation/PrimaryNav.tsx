import { NavLink } from 'react-router-dom'
import type { TopNavItem } from '../../types'

interface PrimaryNavProps {
  items: TopNavItem[]
  onNavigate?: () => void
  layout?: 'desktop' | 'mobile'
}

const PrimaryNav = ({ items, onNavigate, layout = 'desktop' }: PrimaryNavProps) => (
  <nav
    aria-label={layout === 'desktop' ? 'Основные разделы' : 'Основные разделы (мобильные)'}
    className={
      layout === 'desktop'
        ? 'flex items-center gap-1'
        : 'flex flex-col gap-2 rounded-lg border border-nav-border bg-nav-surface px-3 py-3'
    }
  >
    {items.map((item) => (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) =>
          [
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            layout === 'desktop'
              ? 'text-nav-foreground'
              : 'text-nav-foreground/90 hover:bg-nav-hover/70',
            isActive
              ? 'bg-nav-active text-white'
              : layout === 'desktop'
                ? 'hover:bg-nav-hover hover:text-white'
                : 'hover:bg-nav-hover/60',
          ].join(' ')
        }
        onClick={onNavigate}
      >
        {item.label}
      </NavLink>
    ))}
  </nav>
)

export default PrimaryNav
