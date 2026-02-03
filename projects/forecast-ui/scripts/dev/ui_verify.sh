#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
BASE_URL=${1:-https://mytko-forecast-ui.vercel.app}
PW_TIMEOUT_MS=30000 PW_EXPECT_TIMEOUT_MS=12000 E2E_BASE_URL="$BASE_URL" npx playwright test --workers=1 --reporter=line
