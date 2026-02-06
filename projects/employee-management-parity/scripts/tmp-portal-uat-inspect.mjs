import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://wfm-employee-portal.vercel.app/', { waitUntil: 'networkidle' });
const statCardCount = await page.locator('[data-testid="stat-card"]').count();
console.log('Stat card count:', statCardCount);
for (let i = 0; i < statCardCount; i++) {
  const title = await page.locator('[data-testid="stat-card"] h3').nth(i).innerText();
  const value = await page.locator('[data-testid="stat-card"] p').nth(i).innerText();
  console.log(`Card ${i}: ${title} -> ${value}`);
}
await browser.close();
