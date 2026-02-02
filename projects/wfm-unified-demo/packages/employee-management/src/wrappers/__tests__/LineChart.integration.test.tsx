// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-chartjs-2', () => ({
  Line: (props: any) => (
    <div data-testid="line-chart-proxy" data-datasets={(props?.data?.datasets?.length ?? 0)} />
  ),
}));

import LineChart from '../../components/charts/LineChart';
import type { Series } from '../../components/charts/types';

describe('LineChart integration', () => {
  it('renders with category labels (day)', () => {
    const labels = ['2024-07-01', '2024-07-02'];
    const series: Series[] = [
      {
        id: 'forecast',
        label: 'Прогноз',
        unit: 'people',
        points: [
          { label: '2024-07-01', value: 10 },
          { label: '2024-07-02', value: 12 },
        ],
      },
    ];
    render(<LineChart labels={labels} series={series} yUnit="people" ariaTitle="t" ariaDesc="d" />);
    expect(screen.getByTestId('line-chart-proxy')).toBeInTheDocument();
  });

  it('renders with time scale and timestamps', () => {
    const series: Series[] = [
      {
        id: 'service',
        label: 'Уровень сервиса',
        unit: 'percent',
        points: [
          { timestamp: '2024-07-01', value: 90 },
          { timestamp: '2024-07-02', value: 92 },
        ],
      },
    ];
    render(<LineChart series={series} yUnit="percent" timeScale="day" ariaTitle="t" ariaDesc="d" />);
    expect(screen.getByTestId('line-chart-proxy')).toBeInTheDocument();
  });
});
