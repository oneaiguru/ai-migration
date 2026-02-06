import { test, expect } from '@playwright/test';

test.describe('Mobile sheet demo', () => {
  test('opens Radix sheet and returns focus', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-mobile').click();

    const trigger = page.getByRole('button', { name: 'Фильтры смен' });
    await trigger.click();

    const sheet = page.getByRole('dialog', { name: 'Подбор смен' });
    await expect(sheet).toHaveAttribute('data-state', 'open');
    const box = await sheet.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThan(0);

    await page.keyboard.press('Tab');
    const focusInside = await page.evaluate(() => {
      const sheetContent = document.querySelector('[data-testid="mobile-sheet"]');
      return sheetContent ? sheetContent.contains(document.activeElement) : false;
    });
    expect(focusInside).toBe(true);

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
