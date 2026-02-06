// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/App.tsx

import React, { useMemo } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AccuracyDashboard from './components/forecasting/AccuracyDashboard';
import TrendAnalysisDashboard from './components/forecasting/trends/TrendAnalysisDashboard';
import ManualAdjustmentSystem from './components/forecasting/ManualAdjustmentSystem';
import BuildForecastWorkspace from './components/forecasting/build/BuildForecastWorkspace';
import ExceptionsWorkspace from './components/forecasting/exceptions/ExceptionsWorkspace';
import AbsenteeismWorkspace from './components/forecasting/absenteeism/AbsenteeismWorkspace';
import { TimezoneProvider } from './components/forecasting/common/TimezoneContext';
import TimezoneSelector from './components/forecasting/common/TimezoneSelector';
import { NotificationCenterProvider } from './components/forecasting/common/NotificationCenter';
import NotificationBell from './components/forecasting/common/NotificationBell';
import { forecastSeries, queueTree } from './data/forecastingFixtures';
import './App.css';

type RouteId = 'build' | 'exceptions' | 'trends' | 'absenteeism' | 'accuracy' | 'adjustments';

type RouteConfig = {
  id: RouteId;
  path: string;
  label: string;
  icon: string;
  description: string;
};

const ROUTES: RouteConfig[] = [
  {
    id: 'build',
    path: '/build',
    label: 'Построить прогноз',
    icon: '🛠️',
    description: 'Выбор очередей, горизонтов и запуск расчёта',
  },
  {
    id: 'exceptions',
    path: '/exceptions',
    label: 'Задать исключения',
    icon: '🗓️',
    description: 'Нетипичные периоды и шаблоны праздников',
  },
  {
    id: 'trends',
    path: '/trends',
    label: 'Анализ трендов',
    icon: '📈',
    description: 'Стратегический, тактический и оперативный срезы',
  },
  {
    id: 'absenteeism',
    path: '/absenteeism',
    label: 'Расчёт абсентеизма',
    icon: '⏱️',
    description: 'Профили отсутствий и применение шаблонов',
  },
  {
    id: 'accuracy',
    path: '/accuracy',
    label: 'Аналитика моделей',
    icon: '🎯',
    description: 'Сравнение алгоритмов и точность прогноза',
  },
  {
    id: 'adjustments',
    path: '/adjustments',
    label: 'Ручные корректировки',
    icon: '🔧',
    description: 'Управление отклонениями и статусами',
  },
];

const DEFAULT_QUEUE_IDS = queueTree.flatMap((node) => [node.name, ...(node.children?.map((child) => child.name) ?? [])]);

const createDefaultDateRange = () => {
  if (forecastSeries.length) {
    const start = new Date(forecastSeries[0].timestamp);
    const end = new Date(forecastSeries[forecastSeries.length - 1].timestamp);
    return { start, end };
  }
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
};

const AccuracyRoute: React.FC = () => {
  const data = useMemo(
    () =>
      forecastSeries.map((point) => ({
        timestamp: point.timestamp,
        predicted: point.forecast,
        actual: point.actual,
        confidence: point.actual ? 0.9 : 0.82,
        adjustments: 0,
      })),
    [],
  );
  return <AccuracyDashboard currentAlgorithm="arima" forecastData={data} autoRefresh />;
};

const TrendsRoute: React.FC = () => {
  const queueIds = DEFAULT_QUEUE_IDS;
  const dateRange = useMemo(() => createDefaultDateRange(), []);

  return (
    <TrendAnalysisDashboard
      organizationId="support-1010"
      queueIds={queueIds}
      dateRange={dateRange}
    />
  );
};

const AdjustmentsRoute: React.FC = () => <ManualAdjustmentSystem />;

const ROUTE_COMPONENTS: Record<RouteId, React.FC> = {
  build: BuildForecastWorkspace,
  exceptions: ExceptionsWorkspace,
  trends: TrendsRoute,
  absenteeism: AbsenteeismWorkspace,
  accuracy: AccuracyRoute,
  adjustments: AdjustmentsRoute,
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const currentRoute = ROUTES.find((route) => location.pathname.startsWith(route.path)) ?? ROUTES[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
              <span className="text-sm font-bold text-white">WFM</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Прогнозирование и аналитика - 1010.ru</h1>
          </div>
          <div className="flex items-center gap-3">
            <TimezoneSelector />
            <NotificationBell />
            <span className="hidden text-xs text-gray-400 sm:inline">Обновляем ключевые показатели каждые 5 минут</span>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            {ROUTES.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                end
                className={({ isActive }) =>
                  `group px-6 py-4 text-sm font-medium transition-all ${
                    isActive
                      ? 'border-b-2 border-purple-500 bg-purple-50 text-purple-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                <div className="flex flex-col items-center">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg">{route.icon}</span>
                    <span>{route.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-600">{route.description}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto flex items-center px-4 py-3 text-sm sm:px-6 lg:px-8">
          <span className="text-gray-500">Контакт-центр 1010.ru</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">Отдел поддержки</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="font-medium text-purple-600">{currentRoute.label}</span>
        </div>
      </div>

      <div className="border-b border-purple-200 bg-purple-50">
        <div className="mx-auto px-4 py-2 text-sm text-purple-800 sm:px-6 lg:px-8">
          <span className="font-medium">Текущий раздел:</span> {currentRoute.description}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/build" replace />} />
          {ROUTES.map((route) => {
            const Component = ROUTE_COMPONENTS[route.id];
            return <Route key={route.id} path={route.path} element={<Component />} />;
          })}
          <Route path="*" element={<Navigate to="/build" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <NotificationCenterProvider>
    <TimezoneProvider>
      <AppShell />
    </TimezoneProvider>
  </NotificationCenterProvider>
);

export default App;
