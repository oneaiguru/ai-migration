import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = process.env.SNAP_BASE_URL || 'http://localhost:3000';

const routes = [
  '/',
  '/stats/time/',
  '/stats/days/',
  '/admin/email-notify/',
  '/admin/privacy/',
  '/admin/crm-pull/',
  '/admin/crm-tasks/',
  '/admin/filters/',
  '/admin/filters/managers/',
  '/admin/filters/sources/',
  '/company/',
  '/rules/',
  '/llm-tags/',
  '/groups/',
  '/reports/managers/',
  '/reports/calls/filter/',
  '/reports/calls/list/',
  '/reports/call/1/',
  '/reports/lagging/',
  '/reports/trends/',
  '/bitrix/transcript/',
  '/bitrix/score/'
];

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  console.log('🎬 Starting screenshot capture...');

  // Ensure output directory exists before writing PNGs.
  fs.mkdirSync(path.resolve('shots'), { recursive: true });

  for (const route of routes) {
    try {
      const url = `${baseUrl}${route}`;
      await page.goto(url, { waitUntil: 'networkidle' });

      const safeRoute =
        route === '/'
          ? 'home'
          : route.replace(/\/+/g, '_').replace(/^_/, '').replace(/_$/, '');
      const filename = `shots/${safeRoute}.png`;
      await page.screenshot({ path: filename, fullPage: true });

      console.log(`✓ ${route} → ${filename}`);
    } catch (error) {
      console.error(`✗ ${route} failed:`, error.message);
    }
  }

  await browser.close();
  console.log('✅ Screenshots complete!');
}

captureScreenshots().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
