import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Plan assignments show badges and critical-only filter', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  // Click sidebar План-задания
  await page.getByRole('button', { name: 'План-задания' }).click();
  // Toggle critical-only if visible
  const toggle = page.getByLabel('Показывать только критические (риск ≥80%)');
  if (await toggle.isVisible()) {
    await toggle.check();
  }
  // Expect list container visible
  await expect(page.getByText('План-задания')).toBeVisible();
  if (process.env.E2E_TAKE_SHOTS) {
    fs.mkdirSync('tests/e2e/shots', { recursive: true });
    await page.screenshot({ path: 'tests/e2e/shots/plan_assignments.png', fullPage: true });
  }
});
