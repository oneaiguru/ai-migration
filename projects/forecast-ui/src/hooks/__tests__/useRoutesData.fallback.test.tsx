import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/render';

import { useRoutesData } from '../../hooks/useRoutesData';

// Mock apiGet to return empty routes and non-empty sites so fallback triggers
vi.mock('../../api/client', () => ({
  apiGet: vi.fn((path: string, _q: any) => {
    if (path.startsWith('/api/routes')) return Promise.resolve([]);
    if (path === '/api/sites') {
      return Promise.resolve([
        { site_id: 'A', address: 'A', fill_pct: 0.85, overflow_prob: 0.3, pred_mass_kg: 5 }, // strict + showcase
        { site_id: 'B', address: 'B', fill_pct: 0.40, overflow_prob: 0.9, pred_mass_kg: 7 }, // strict + showcase
        { site_id: 'C', address: 'C', fill_pct: 0.55, overflow_prob: 0.6, pred_mass_kg: 3 }, // showcase only
      ]);
    }
    return Promise.resolve([]);
  }),
}));

function Probe() {
  const { strict, showcase, loading, error } = useRoutesData('2024-08-03');
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ?? ''}</div>
      <div data-testid="strict-count">{strict.length}</div>
      <div data-testid="show-count">{showcase.length}</div>
    </div>
  );
}

describe('useRoutesData fallback', () => {
  it('derives strict/showcase from /api/sites when /api/routes is empty', async () => {
    renderWithProviders(<Probe />);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    expect(screen.getByTestId('error').textContent).toBe('');
    expect(screen.getByTestId('strict-count').textContent).toBe('2'); // A,B
    expect(screen.getByTestId('show-count').textContent).toBe('3'); // A,B,C
  });
});
