import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Districts tab renders a card or table', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  // Click center tabs “Районы” (top bar)
  await page.locator('div.bg-white.border-b').getByRole('button', { name: 'Районы', exact: true }).click();
  // Accept either metric cards or inline error/empty card
  const anyCard = page.locator('div.card');
  await expect(anyCard.first()).toBeVisible({ timeout: 12000 });

  const select = page.locator('#district-quarter-select');
  await expect(select).toBeVisible();
  const table = page.locator('[data-testid="district-accuracy-table"]');
  await expect(table).toBeVisible();
  await expect(table.locator('tbody tr').first()).toContainText('%');

  if (process.env.E2E_TAKE_SHOTS) {
    fs.mkdirSync('tests/e2e/shots', { recursive: true });
    await page.screenshot({ path: 'tests/e2e/shots/districts.png', fullPage: true });
  }
});
