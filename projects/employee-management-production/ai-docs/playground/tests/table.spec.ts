import { test, expect } from '@playwright/test';

test.describe('Data table wrapper', () => {
  test('virtualises rows and exposes labelled headers', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-table').click();

    const tableContainer = page.getByTestId('table-demo');
    await expect(tableContainer).toBeVisible();

    const table = tableContainer.getByRole('table', { name: 'Виртуализованный список сотрудников' });
    await expect(table).toBeVisible();

    const virtualRows = page.locator('[data-testid="table-demo"] tbody tr');
    const renderedRowCount = await virtualRows.count();
    expect(renderedRowCount).toBeLessThan(120);

    const firstRow = virtualRows.first();
    await firstRow.focus();
    await expect(firstRow).toBeFocused();

    await page.keyboard.press('ArrowDown');
    const secondRow = virtualRows.nth(1);
    await expect(secondRow).toBeFocused();
    await page.keyboard.press('ArrowDown');
    const thirdRow = virtualRows.nth(2);
    await expect(thirdRow).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(secondRow).toBeFocused();

    const scrollPane = tableContainer.locator('[role="presentation"]');
    await scrollPane.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });

    await page.keyboard.press('End');
    await expect(page.getByRole('cell', { name: 'Сотрудник 5000' })).toBeVisible();
  });
});
