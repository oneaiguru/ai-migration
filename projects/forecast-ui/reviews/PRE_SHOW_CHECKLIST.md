# UI Pre‑Show Checklist (20–30 min)

Use this as the first screen for UI verification before sending reviewer bundles.

- E2E serial (prod alias)
  - Command: `PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test --workers=1 --reporter=line`
  - Expect: 5 passed; routes spec ≤45s; HTML report saved to `playwright-report/`.
  - Timings: `tests/e2e/TIMINGS.md` created/updated.

- Screenshots present (in bundle)
  - `tests/e2e/shots/overview.png`
  - `tests/e2e/shots/routes_table.png` (Routes table sorted by risk)
  - `tests/e2e/shots/plan_assignments.png` (critical‑only filter)

- CSV UX visible (Routes)
  - Loading label and disabled button while downloading.
  - Error message appears near the CSV button on failure.

- Build & bundle UI
  - Command: `npm run bundle:review`
  - Bundle includes: `dist/`, `playwright-report/`, `screenshots/`, `TIMINGS.md`, `ENDPOINTS.txt`.

- Drop the ZIP into reviewer folders
  - `/Users/m/Downloads/review_flat_20251105_134628/UI_{Reviewer,Components_Reviewer,Config_Reviewer,Supporting_Reviewer}`

- Optional re‑run after BE curls
  - If BE refreshes demo data, re‑run the serial E2E to refresh timings and screenshots.

