# HOWTO — UI E2E Smoke (Playwright)

Tiny end‑to‑end smoke tests to verify the demo against the live Vercel deployment or a local preview. These tests are intentionally lightweight and non‑blocking for the demo. See also docs/SOP/TEST_RUN_SOP.md for serial runs, timeouts, background execution, and expected timings.

## Prerequisites
- Node 18+
- Internet access (to hit the deployed UI)

## Install
```bash
cd forecast-ui
npm i -D @playwright/test
npx playwright install --with-deps
```

## Run
```bash
# Use the stable URL by default
PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test --workers=1 --reporter=line

# Or rely on the default configured in playwright.config.ts
npx playwright test
```

## What the smokes cover
- overview.spec.ts — Overview tab renders quantiles
- routes_table.spec.ts — Switch to “Маршруты → Таблица”, comparison block visible
- plan_assignments.spec.ts — План‑задания shows badges; critical‑only toggle works

## Screenshot capture (optional)
You can add `await page.screenshot({ path: 'overview.png', fullPage: true })` in each spec after the key assertion, or capture manually from the stable URL:
- Overview
- Маршруты 2.0 → Таблица (sorted by risk)
- План‑задания with “только критичные (≥80%)” enabled

## Troubleshooting
- Ensure `E2E_BASE_URL` resolves and loads in a browser
- If running locally, start the dev server: `npm run dev` and set `E2E_BASE_URL=http://localhost:5173`
- If selectors change, update specs minimally; keep them smoke‑level only

## Files
- Config: `playwright.config.ts`
- Tests: `tests/e2e/*.spec.ts`
- Quick readme: `tests/e2e/README.md`
