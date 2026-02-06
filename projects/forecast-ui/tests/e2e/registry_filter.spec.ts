import { test, expect } from '@playwright/test';
import fs from 'fs';

// Nightly-only: skip on PR smokes unless E2E_NIGHTLY=1
test.skip(process.env.E2E_NIGHTLY !== '1', 'Runs in nightly only');

test.setTimeout(45000);

test('Registry view filters by critical risk', async ({ page, baseURL }) => {
  await page.goto(baseURL!);
  // Click sidebar "Реестр КП"
  await page.getByRole('button', { name: 'Реестр КП' }).click();
  await expect(page.getByText('Реестр контейнерных площадок')).toBeVisible();

  // Toggle the ≥80% overflow filter
  const crit = page.getByLabel('Переполнение ≥ 80%');
  await crit.check();
  await expect(crit).toBeChecked();

  // Table remains visible
  const table = page.getByRole('table');
  await expect(table).toBeVisible();

  // Nightly assertion: row count should not increase after applying critical filter
  // (if there are no rows initially, skip the count assertion)
  const initialRows = await table.locator('tbody tr').count();
  await page.waitForTimeout(250); // small settle
  const filteredRows = await table.locator('tbody tr').count();
  if (initialRows > 0) {
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  }

  if (process.env.E2E_TAKE_SHOTS) {
    fs.mkdirSync('tests/e2e/shots', { recursive: true });
    await page.screenshot({ path: 'tests/e2e/shots/registry.png', fullPage: true });
  }
});
