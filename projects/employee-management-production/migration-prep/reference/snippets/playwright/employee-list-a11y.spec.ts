import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Employee list parity", () => {
  test("toolbar and bulk edit drawer have no a11y violations", async ({ page }) => {
    await page.goto("http://localhost:4174");

    await page.getByRole("button", { name: "Массовое редактирование" }).click();

    const axe = new AxeBuilder({ page })
      .withRules(["color-contrast", "aria-allowed-attr", "aria-valid-attr"])
      .exclude("[data-test='demo-module']");

    const results = await axe.analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

    await page.keyboard.press("Escape");
  });
});
