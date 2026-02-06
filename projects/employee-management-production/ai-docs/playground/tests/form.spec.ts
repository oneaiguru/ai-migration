import { test, expect } from '@playwright/test';

test.describe('Employee form wrapper', () => {
  test('validates inputs and exposes aria metadata', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('nav-form').click();

    const form = page.getByTestId('employee-form-demo');
    await expect(form).toBeVisible();

    const loginInput = page.getByLabel('Логин');
    const emailInput = page.getByLabel('Email');
    const statusSelect = page.getByLabel('Статус');

    await loginInput.fill('ab');
    await emailInput.fill('invalid-email');
    await form.getByRole('button', { name: 'Сохранить' }).click();
    await expect(page.getByText('Минимум 4 символа')).toBeVisible();
    await expect(page.getByText('Некорректный email')).toBeVisible();

    await expect(loginInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    await loginInput.fill('agent-test');
    await emailInput.fill('agent@example.com');
    await statusSelect.selectOption('trial');

    await form.getByRole('button', { name: 'Сохранить' }).click();

    await expect(loginInput).not.toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
  });
});
