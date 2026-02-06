import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/render';

// SUT
import { Routes } from '../../components/Routes';

// Mock hooks and API to isolate component behaviour
vi.mock('../../hooks/useRoutesData', () => ({
  useRoutesData: () => ({
    strict: [
      { site_id: 'S1', address: 'Addr 1', overflow_prob: 0.9, pred_mass_kg: 10 },
    ],
    showcase: [
      { site_id: 'S2', address: 'Addr 2', overflow_prob: 0.6, pred_mass_kg: 8 },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock('../../api/client', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    apiGetCsv: vi.fn().mockRejectedValue(new Error('network down')), // force failure path
  };
});

describe('Routes CSV UX (cards view)', () => {
  it('shows error message and re-enables button when CSV download fails (strict)', async () => {
    renderWithProviders(<Routes />);

    const btn = await screen.findByRole('button', { name: 'Скачать CSV (строгая)' });
    expect(btn).toBeEnabled();

    fireEvent.click(btn);

    // During download: label may change to «Скачивание…» and button disabled
    await waitFor(() => expect(btn).toBeDisabled());

    // After failure: error status should appear and button becomes enabled again
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Ошибка скачивания CSV');

    await waitFor(() => expect(btn).toBeEnabled());
  });
});
