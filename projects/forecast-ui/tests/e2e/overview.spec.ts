import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Overview renders without error', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  // Accept either metric cards or an inline error/empty card — smoke level
  const anyCard = page.locator('div.card');
  await expect(anyCard.first()).toBeVisible({ timeout: 12000 });

  const quarterSelect = page.getByTestId('accuracy-quarter-select');
  await expect(quarterSelect).toBeVisible();
  const selectedQuarter = await quarterSelect.inputValue();
  await expect(page.getByTestId('accuracy-quarter-label')).toContainText(selectedQuarter);

  if (process.env.E2E_TAKE_SHOTS) {
    fs.mkdirSync('tests/e2e/shots', { recursive: true });
    await page.screenshot({ path: 'tests/e2e/shots/overview.png', fullPage: true });
  }
});
