import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div data-testid="dashboard" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('Layout work structure drawer', () => {
  it('opens the drawer and shows organisational details', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const trigger = screen.getByRole('button', { name: /Рабочая структура/i });
    await user.click(trigger);

    const drawer = await screen.findByTestId('work-structure');
    expect(drawer).toBeInTheDocument();
    expect(screen.getByText('Контактный центр')).toBeVisible();
    expect(screen.getByText('Руководитель')).toBeVisible();
    expect(screen.getByText('Экстренный контакт')).toBeVisible();
  });
});
