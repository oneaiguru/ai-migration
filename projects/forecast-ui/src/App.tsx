import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Overview } from './components/Overview';
import { Districts } from './components/Districts';
import { Sites } from './components/Sites';
import { Routes } from './components/Routes';
import { RoutesPrototype } from './components/RoutesPrototype';
import { RegistryView } from './components/RegistryView';
import { PlanAssignments } from './components/PlanAssignments';
import { apiGet } from './api/client';
import type { ApiMetricsResponse } from './types/api';
import { parseMetrics } from './types/validators';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { AccuracyQuarterProvider } from './hooks/useAccuracyQuarter';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentSection, setCurrentSection] = useState('forecast');

  // Seed default demo date from API metrics when present; fallback remains env/today.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await apiGet<ApiMetricsResponse>('/api/metrics');
        const parsed = parseMetrics(m);
        const dd = parsed?.demo_default_date || (m as any)?.demo_default_date;
        if (mounted && typeof dd === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dd)) {
          window.sessionStorage.setItem('DEMO_DEFAULT_DATE', dd);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'districts':
        return <Districts />;
      case 'sites':
        return <Sites />;
      case 'routes':
        return <Routes />;
      case 'routes2':
        return <RoutesPrototype />;
      default:
        return <Overview />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AccuracyQuarterProvider>
        <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
        {currentSection === 'forecast' && renderContent()}
        {currentSection === 'plans' && <PlanAssignments />}
        {currentSection === 'registry' && <RegistryView />}
        {currentSection !== 'forecast' && currentSection !== 'plans' && (
          <div className="card">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-semibold mb-2">Раздел в разработке</h2>
              <p className="text-gray-600">Выбран раздел: <strong>{currentSection}</strong></p>
              <button onClick={() => setCurrentSection('forecast')} className="btn-primary mt-4">Вернуться к прогнозу</button>
            </div>
          </div>
        )}
        </Layout>
      </AccuracyQuarterProvider>
    </QueryClientProvider>
  );
}

export default App;
