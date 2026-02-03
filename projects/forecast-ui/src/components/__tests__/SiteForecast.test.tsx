import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Polyfill ResizeObserver for Recharts' ResponsiveContainer in JSDOM
class ROPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = ROPolyfill as any;

vi.mock('../../hooks/useSiteForecast', () => ({
  useSiteForecast: (_siteId: string) => ({
    rows: [
      { date: '2024-08-01', pred_mass_kg: 1.2 },
      { date: '2024-08-02', pred_mass_kg: 1.3 },
    ],
    loading: false,
    error: null,
  }),
}));

import { SiteForecast } from '../SiteForecast';

describe('SiteForecast component', () => {
  it('renders an accessible region and chart container', () => {
    render(<SiteForecast siteId="S1" window="2024-08-01:2024-08-07" />);
    const region = screen.getByRole('region', { name: /прогноз по площадке/i });
    expect(region).toBeTruthy();
    const chart = screen.getByTestId('site-forecast-chart');
    expect(chart).toBeTruthy();
  });
});
