import type { ReactNode } from 'react'

interface ModulePlaceholderProps {
  title: string
  description: string
  actionCopy?: string
  children?: ReactNode
}

const ModulePlaceholder = ({ title, description, actionCopy, children }: ModulePlaceholderProps) => (
  <section className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-shell-divider bg-shell-panel px-10 py-16 text-center shadow-shell">
    <h1 className="text-2xl font-semibold text-shell-ink">{title}</h1>
    <p className="max-w-2xl text-base text-slate-600">{description}</p>
    {actionCopy && <p className="text-sm font-medium text-primary-500">{actionCopy}</p>}
    {children}
  </section>
)

export default ModulePlaceholder
