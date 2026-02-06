# UI E2E (Playwright) — Smoke Suite

Minimal smoke tests for demo verification. Requires Node 18+.

## Setup
```bash
cd forecast-ui
npm i -D @playwright/test
npx playwright install --with-deps
```

## Run
```bash
npx playwright test
```

By default, tests open `process.env.E2E_BASE_URL` or `https://mytko-forecast-ui.vercel.app`.

