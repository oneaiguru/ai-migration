#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const defaultPort = process.env.SMOKE_PORT ?? '4175';
const baseUrlOverride = process.env.SMOKE_BASE_URL?.trim();
let serverUrl = baseUrlOverride;

const shouldLaunchPreview = !baseUrlOverride;

const preview = shouldLaunchPreview
  ? spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', defaultPort], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  : null;

const waitForPreview = async () => {
  if (!shouldLaunchPreview) {
    return;
  }
  let resolved = false;
  await Promise.race([
    new Promise((_, reject) => setTimeout(() => {
      if (!resolved) {
        reject(new Error('Vite preview did not start within 20s'));
      }
    }, 20000)),
    new Promise((resolve, reject) => {
      preview.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        process.stdout.write(text);
        if (!serverUrl) {
          const match = text.match(/http:\/\/[^\s]+/i);
          if (match) {
            serverUrl = match[0].replace(/\s/g, '');
          }
        }
        if (!resolved && text.toLowerCase().includes('local')) {
          resolved = true;
          resolve(undefined);
        }
      });
      preview.stderr.on('data', (chunk) => {
        process.stderr.write(chunk);
      });
      preview.on('exit', (code) => {
        if (!resolved) {
          reject(new Error(`Vite preview exited before ready (code ${code})`));
        }
      });
    }),
  ]);
};

const routes = [
  {
    path: '/build',
    expectSelector: 'text=Построить прогноз',
    screenshot: 'playwright-forecasting-build.png',
  },
  {
    path: '/exceptions',
    expectSelector: 'text=Задать исключения',
    screenshot: 'playwright-forecasting-exceptions.png',
  },
  {
    path: '/trends',
    expectSelector: 'text=Анализ трендов',
    screenshot: 'playwright-forecasting-trend.png',
  },
  {
    path: '/absenteeism',
    expectSelector: 'text=Расчёт абсентеизма',
    screenshot: 'playwright-forecasting-absenteeism.png',
  },
  {
    path: '/adjustments',
    expectSelector: 'text=Ручные корректировки',
    screenshot: 'playwright-forecasting-adjustments.png',
  },
  {
    path: '/accuracy',
    expectSelector: 'text=Аналитика моделей',
    screenshot: 'playwright-forecasting-accuracy.png',
  },
];

const run = async () => {
  const resultsDir = resolve('test-results');
  mkdirSync(resultsDir, { recursive: true });

  await waitForPreview();
  await delay(1000);

  const baseUrl = serverUrl ?? `http://127.0.0.1:${defaultPort}`;
  const browser = await chromium.launch();
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });

      try {
        const response = await page.goto(`${baseUrl.replace(/\/$/, '')}${route.path}`, {
          waitUntil: 'networkidle',
        });
        if (!response || !response.ok()) {
          throw new Error(`Route ${route.path} responded with status ${response?.status()}`);
        }

        await page.waitForTimeout(2000);
        await page.waitForSelector(route.expectSelector, { timeout: 5000 });

        if (consoleErrors.length) {
          throw new Error(`Console errors detected on ${route.path}: ${consoleErrors.join('; ')}`);
        }

        await page.screenshot({ path: resolve(resultsDir, route.screenshot), fullPage: true });
      } catch (error) {
        if (consoleErrors.length) {
          console.error(`Console errors for ${route.path}:`, consoleErrors.join('\n'));
        }
        try {
          const snapshot = await page.content();
          console.error(`DOM snapshot for ${route.path}:\n${snapshot}`);
        } catch (snapshotError) {
          console.error(`Failed to capture DOM for ${route.path}:`, snapshotError);
        }
        throw error;
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
};

run()
  .then(() => {
    console.log('Smoke routes check passed.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (!preview) {
      return;
    }
    preview.kill('SIGINT');
    try {
      await once(preview, 'close');
    } catch (error) {
      if (error) {
        console.error('Failed to close preview cleanly:', error);
      }
    }
  });
