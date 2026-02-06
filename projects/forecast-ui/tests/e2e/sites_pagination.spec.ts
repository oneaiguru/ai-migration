import { test, expect } from '@playwright/test';

test.skip(!process.env.E2E_NIGHTLY, 'nightly only');

test('Sites page shows pagination controls', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:4173';
  await page.goto(base);

  await page.getByRole('tab', { name: 'Площадки' }).click();
  await expect(page.getByText('Прогноз заполнения площадок')).toBeVisible();

  // Pager controls presence
  await expect(page.getByRole('button', { name: 'Предыдущая страница' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Следующая страница' })).toBeVisible();
  await expect(page.getByLabel('Количество строк на странице')).toBeVisible();
});

