# SOP — Test Execution (UI)

Purpose: keep Playwright smokes fast, deterministic, and non-blocking. Run sequentially with a strict timeout and record timings. If an agent hangs, background the run and inspect logs.

Key defaults
- Base URL: `E2E_BASE_URL=https://mytko-forecast-ui.vercel.app`
- Timeout: `PW_TIMEOUT_MS=30000` (per-test)
- Expect timeout: `PW_EXPECT_TIMEOUT_MS=3000`
- Workers: serial (`--workers=1`) for smokes
- Reporters: line + HTML (saved under `playwright-report/`)

Ports & envs
- Dev server (Vite): `port=3000` (see `vite.config.ts:server.port`). If 3000 is taken, Vite will choose the next available port because `strictPort=false`.
- Preview server: `port=4173` (`vite preview`).
- E2E runs never depend on local ports; always pass `E2E_BASE_URL` (defaults to prod alias in `playwright.config.ts`).

Typical durations (observed)
- Total: ~40–50s
- routes_table.spec.ts: ~30.0s
- districts_table.spec.ts: ~5.2s
- overview.spec.ts: ~3–5s
- plan_assignments.spec.ts: ~2–3s
- sites_table.spec.ts: ~3–4s

Run one-by-one (serial) and record timings
```
cd forecast-ui
PW_TIMEOUT_MS=30000 E2E_BASE_URL=$E2E_BASE_URL node scripts/run_e2e_serial.mjs
cat tests/e2e/TIMINGS.md
```

Generate HTML report (without opening)
```
E2E_BASE_URL=$E2E_BASE_URL npx playwright test --workers=1 --reporter=line
# HTML saved to forecast-ui/playwright-report/index.html
```

Background runs (avoid blocking terminals)
```
nohup env E2E_BASE_URL=$E2E_BASE_URL PW_TIMEOUT_MS=30000 \
  node scripts/run_e2e_serial.mjs > logs/e2e_serial.log 2>&1 & disown
tail -f logs/e2e_serial.log
```

If stuck
- Kill playwright: `pkill -f playwright || true`
- Re-run spec in isolation: `npx playwright test tests/e2e/routes_table.spec.ts --workers=1`
- Check base URL health: `curl -fsS $E2E_BASE_URL | head -n1`

CI
- PR smoke: serial, 30s timeout, uploads HTML report
- Nightly: full suite with screenshots artifact

Nightly run (downloads + registry spec)
```
cd forecast-ui
PW_TIMEOUT_MS=60000 E2E_TAKE_SHOTS=1 E2E_ALLOW_DOWNLOAD=1 E2E_NIGHTLY=1 \
  npx playwright test --workers=1 --reporter=line
```
