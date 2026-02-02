import ModulePlaceholder from './ModulePlaceholder'

interface ScheduleStubPageProps {
  title: string
  description: string
}

const ScheduleStubPage = ({ title, description }: ScheduleStubPageProps) => (
  <ModulePlaceholder title={title} description={description} actionCopy="Раздел появится после подключения модуля" />
)

export default ScheduleStubPage
