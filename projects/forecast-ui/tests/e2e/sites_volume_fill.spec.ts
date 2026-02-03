import { test, expect } from '@playwright/test';

// Gated acceptance: enable only when BE has volume-first fill% in place
const GATE = process.env.E2E_ASSERT_VOLUME_FILL === '1';
const MIN_CELLS = Number(process.env.E2E_MIN_CELLS ?? 10);
const MIN_PCT = Number(process.env.E2E_MIN_PCT ?? 10);

test.describe('Sites — volume-first fill% acceptance (gated)', () => {
  test.skip(!GATE, 'Enable with E2E_ASSERT_VOLUME_FILL=1 once BE change is live');

  test(`>=${MIN_CELLS} cells at >=${MIN_PCT}% fill on demo date`, async ({ page }) => {
    const base = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
    await page.goto(base);

    // Open Sites (robust: link/button/tab)
    const sitesNav = page.locator('a:has-text("Площадки"), button:has-text("Площадки"), [role=tab]:has-text("Площадки")').first();
    await sitesNav.click();

    // Set date to the demo day
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    await dateInput.fill('2024-08-03');

    // Count rows whose fill text shows >=10%
    // FillBar renders a text like "12%" in the same cell
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();

    const cells = page.locator('table tbody tr td');
    const texts = await cells.allTextContents();
    const hits = texts.filter((t) => {
      const m = t.match(/(\d{1,3})%/);
      if (!m) return false;
      const n = Number(m[1]);
      return Number.isFinite(n) && n >= MIN_PCT;
    }).length;

    expect(hits).toBeGreaterThanOrEqual(MIN_CELLS);
  });
});
