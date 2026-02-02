import { Link } from 'react-router-dom'
import ModulePlaceholder from './ModulePlaceholder'

const NotFoundPage = () => (
  <ModulePlaceholder
    title="Страница не найдена"
    description="Похоже, что указан неправильный маршрут. Вернитесь в раздел Расписание, чтобы продолжить работу."
  >
    <Link
      to="/schedule"
      className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
    >
      К расписанию
    </Link>
  </ModulePlaceholder>
)

export default NotFoundPage
