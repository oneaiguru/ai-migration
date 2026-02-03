import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/render';
import { useSiteForecast } from '../useSiteForecast';

// Capture calls
const apiGetMock = vi.fn();
vi.mock('../../api/client', () => ({
  apiGet: (...args: any[]) => apiGetMock(...args),
}));

function Probe({ siteId, window, days }: { siteId: string; window?: string; days?: number }) {
  const { rows, loading, error } = useSiteForecast(siteId, window, days);
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ?? ''}</div>
      <div data-testid="count">{rows.length}</div>
    </div>
  );
}

describe('useSiteForecast', () => {
  it('uses window param when provided', async () => {
    apiGetMock.mockImplementation((path: string, params: any) => {
      expect(path).toContain('/api/sites/S1/forecast');
      expect(params).toEqual({ window: '2024-08-01:2024-08-07' });
      return Promise.resolve([{ date: '2024-08-01', pred_mass_kg: 1.2 }]);
    });

    renderWithProviders(<Probe siteId="S1" window="2024-08-01:2024-08-07" />);

    await waitFor(() => expect((screen.getAllByTestId('loading')[0] as HTMLElement).textContent).toBe('false'));
    expect((screen.getAllByTestId('error')[0] as HTMLElement).textContent).toBe('');
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('falls back to days when window is missing', async () => {
    apiGetMock.mockImplementation((path: string, params: any) => {
      expect(path).toContain('/api/sites/S2/forecast');
      expect(params).toEqual({ days: 7 });
      return Promise.resolve([
        { date: '2024-08-01', pred_mass_kg: 1.2 },
        { date: '2024-08-02', pred_mass_kg: 1.3 },
      ]);
    });

    renderWithProviders(<Probe siteId="S2" />);

    await waitFor(() => expect((screen.getAllByTestId('loading')[0] as HTMLElement).textContent).toBe('false'));
    expect((screen.getAllByTestId('error')[0] as HTMLElement).textContent).toBe('');
    const cnt = Number((screen.getAllByTestId('count')[0] as HTMLElement).textContent || '0');
    expect(cnt).toBeGreaterThanOrEqual(1);
  });
});
