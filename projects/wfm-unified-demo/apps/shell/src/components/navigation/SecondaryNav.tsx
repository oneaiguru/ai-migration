import { NavLink } from 'react-router-dom'
import type { SecondaryNavItem } from '../../types'

interface SecondaryNavProps {
  items: SecondaryNavItem[]
  onNavigate?: () => void
}

const SecondaryNav = ({ items, onNavigate }: SecondaryNavProps) => {
  if (items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="Дополнительные вкладки модуля"
      className="border-b border-secondary-border bg-secondary-surface"
    >
      <div className="mx-auto flex max-w-[1600px] items-center overflow-x-auto px-4 lg:px-8">
        <ul className="flex min-w-full gap-1 py-2 text-sm font-medium text-secondary-foreground">
          {items.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  [
                    'block rounded-md px-3 py-2 transition-colors',
                    isActive
                      ? 'bg-secondary-active text-secondary-active-foreground shadow-secondary'
                      : 'hover:bg-secondary-hover hover:text-secondary-hover-foreground',
                  ].join(' ')
                }
                onClick={onNavigate}
                end
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default SecondaryNav
