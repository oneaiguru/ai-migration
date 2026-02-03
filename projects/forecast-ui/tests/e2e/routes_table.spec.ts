import { test, expect } from '@playwright/test';
test.setTimeout(45000);
import fs from 'fs';

test('Routes screen renders (smoke)', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  // Click center tabs “Маршруты” (scope to the top bar to avoid sidebar duplicate)
  await page.locator('div.bg-white.border-b').getByRole('button', { name: 'Маршруты', exact: true }).click();
  await expect(page.locator('div.card').first()).toBeVisible({ timeout: 12000 });
  if (process.env.E2E_TAKE_SHOTS) {
    fs.mkdirSync('tests/e2e/shots', { recursive: true });
    await page.screenshot({ path: 'tests/e2e/shots/routes_table.png', fullPage: true });
  }
});
