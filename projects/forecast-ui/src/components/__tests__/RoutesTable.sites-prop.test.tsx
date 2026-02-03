import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoutesTable } from '../../components/RoutesTable';

vi.mock('../../api/client', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    apiGet: vi.fn().mockRejectedValue(new Error('should not be called when sites prop provided')),
    apiGetCsv: vi.fn().mockRejectedValue(new Error('csv fail')), // exercise status path
  };
});

describe('RoutesTable sites prop cohesion', () => {
  it('does not fetch /api/sites when sites prop is provided and exposes a11y status', async () => {
    const sites = [
      { site_id: 'S1', address: 'Addr 1', fill_pct: 0.9, overflow_prob: 0.9, last_service: '2024-08-01', pred_mass_kg: 10 },
    ];
    const recs = [
      { site_id: 'S1', address: 'Addr 1', fill_pct: 0.9, overflow_prob: 0.9, pred_mass_kg: 10, policy: 'strict' },
    ];

    render(<RoutesTable date="2024-08-03" policy="strict" recs={recs} sites={sites as any} />);

    // Button exists and on click shows status via role=status and aria-live="polite"
    const btn = await screen.findByRole('button', { name: 'Скачать CSV для таблицы маршрутов' });
    fireEvent.click(btn);
    const status = await screen.findByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');

    // Ensure at least one row rendered from provided sites
    expect(await screen.findByText('S1')).toBeInTheDocument();
  });
});
