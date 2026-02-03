# PR Smoke (serial)
PW_TIMEOUT_MS=30000 PW_EXPECT_TIMEOUT_MS=12000 \
E2E_BASE_URL=https://mytko-forecast-ui.vercel.app \
npx playwright test --workers=1 --reporter=line
