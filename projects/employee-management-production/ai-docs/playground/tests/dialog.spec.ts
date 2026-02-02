import { test, expect } from '@playwright/test';

test.describe('Dialog wrapper accessibility', () => {
  test('manages focus, labelling, and escape handling', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', { name: 'Уволить сотрудника' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Подтверждение увольнения' });
    await expect(dialog).toBeVisible();

    const description = page.locator('[data-testid="dialog-demo"] [id$="-desc"]');
    await expect(description).toContainText('Доступ будет отключён немедленно');

    // Ensure focus stays inside the dialog while tabbing
    await page.keyboard.press('Tab');
    const focusIsInside = await page.evaluate(() => {
      const content = document.querySelector('[data-testid="dialog-demo"]');
      return content ? content.contains(document.activeElement) : false;
    });
    expect(focusIsInside).toBe(true);

    // Close with Escape and verify focus returns to trigger
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
