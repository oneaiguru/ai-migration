import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import TopNavShell from './components/layout/TopNavShell'
import ForecastsPage from './pages/ForecastsPage'
import SchedulePage from './pages/SchedulePage'
import EmployeesPage from './pages/EmployeesPage'
import ReportsPage from './pages/ReportsPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ScheduleStubPage from './pages/ScheduleStubPage'
import { ShellProvider } from './state/ShellContext'
import ProtectedRoute from './routes/ProtectedRoute'
import './App.css'

const App = () => (
  <BrowserRouter>
    <ShellProvider>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <TopNavShell />
            </ProtectedRoute>
          }
        >
          <Route
            path="/forecasts"
            element={
              <ProtectedRoute allowedRoles={['administrator']}>
                <ForecastsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/schedule" element={<Navigate to="/schedule/graph" replace />} />
          <Route
            path="/schedule/graph"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/shifts"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ScheduleStubPage
                  title="Смены"
                  description="Раздел готовится: импорт смен и подбор оптимальных графиков появятся позднее."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/schemes"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ScheduleStubPage
                  title="Схемы"
                  description="Шаблоны расписаний и смен появятся в следующем обновлении единой оболочки."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/requests"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ScheduleStubPage
                  title="Заявки"
                  description="Согласование заявок на смены будет добавлено, как только подключим операционный модуль."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/monitoring"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ScheduleStubPage
                  title="Мониторинг"
                  description="Мониторинг смен и статусные панели находятся в разработке."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/tasks"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ScheduleStubPage
                  title="Задачи"
                  description="Управление задачами расписания подключим позднее."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/events"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ScheduleStubPage
                  title="События"
                  description="Создание событий расписания появится после интеграции соответствующего сервиса."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/leave"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ScheduleStubPage
                  title="Отпуска"
                  description="График отпусков подключим после миграции HR‑модуля."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'manager']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/schedule" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ShellProvider>
  </BrowserRouter>
)

export default App
