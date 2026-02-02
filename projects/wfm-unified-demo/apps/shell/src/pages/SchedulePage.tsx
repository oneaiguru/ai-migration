import { Root as ScheduleRoot } from 'schedule'

const SchedulePage = () => (
  <div className="overflow-hidden rounded-xl border border-shell-divider bg-shell-panel shadow-shell">
    <ScheduleRoot basename="/schedule" />
  </div>
)

export default SchedulePage
