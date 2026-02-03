import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: Number(process.env.PW_TIMEOUT_MS || 30000),
  expect: {
    timeout: Number(process.env.PW_EXPECT_TIMEOUT_MS || 3000),
  },
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : undefined,
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://mytko-forecast-ui.vercel.app',
    headless: true,
  },
});
