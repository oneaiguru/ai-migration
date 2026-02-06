import { useState } from 'react';
import type { ForecastBuildResult } from '@wfm/shared/forecasting';
import { ForecastBuilder } from './ForecastBuilder';
import ExceptionsWorkspace from './ExceptionsWorkspace';
import AbsenteeismWorkspace from './AbsenteeismWorkspace';
import AdjustmentsPanel from './AdjustmentsPanel';

interface ForecastingWorkspaceProps {
  organisation: string;
}

const TABS = [
  { id: 'builder', label: 'Построение прогноза' },
  { id: 'exceptions', label: 'Исключения' },
  { id: 'absenteeism', label: 'Профили абсентеизма' },
  { id: 'adjustments', label: 'Ручные корректировки' },
] as const;

export const ForecastingWorkspace = ({ organisation }: ForecastingWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('builder');
  const [latestForecast, setLatestForecast] = useState<ForecastBuildResult | null>(null);

  return (
    <section className="forecasting-workspace">
      <nav className="sub-nav" aria-label="Подразделы прогноза">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`sub-nav__item${activeTab === tab.id ? ' sub-nav__item--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'builder' ? (
        <ForecastBuilder organisation={organisation} onBuild={(result) => setLatestForecast(result)} />
      ) : null}

      {activeTab === 'exceptions' ? (
        <ExceptionsWorkspace organisation={organisation} forecast={latestForecast} />
      ) : null}

      {activeTab === 'absenteeism' ? <AbsenteeismWorkspace organisation={organisation} /> : null}

      {activeTab === 'adjustments' ? <AdjustmentsPanel organisation={organisation} /> : null}
    </section>
  );
};

export default ForecastingWorkspace;
