import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Sites tab renders a card', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  // Click center tabs “Площадки” (top bar)
  await page.locator('div.bg-white.border-b').getByRole('button', { name: 'Площадки', exact: true }).click();
  await expect(page.locator('div.card').first()).toBeVisible({ timeout: 12000 });
  await expect(page.getByTestId('site-accuracy-card')).toBeVisible();
  if (process.env.E2E_TAKE_SHOTS) {
    fs.mkdirSync('tests/e2e/shots', { recursive: true });
    await page.screenshot({ path: 'tests/e2e/shots/sites.png', fullPage: true });
  }
});
