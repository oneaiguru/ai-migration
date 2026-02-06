#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTDIR="$HOME/Downloads/ui_review_bundle_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTDIR"

pushd "$ROOT" >/dev/null
echo "Building UI..."
npm run build -s

echo "Running E2E serial with shots..."
mkdir -p tests/e2e/shots logs || true
E2E_BASE_URL="${E2E_BASE_URL:-https://mytko-forecast-ui.vercel.app}" E2E_TAKE_SHOTS=1 PW_TIMEOUT_MS=30000 \
  node scripts/run_e2e_serial.mjs | tee logs/e2e_serial.log || true

echo "Copying artifacts..."
cp -R dist "$OUTDIR/dist"
cp -R tests/e2e/shots "$OUTDIR/screenshots" || true
cp tests/e2e/TIMINGS.md "$OUTDIR/TIMINGS.md" || true
if [ -d playwright-report ]; then cp -R playwright-report "$OUTDIR/playwright-report"; fi
# Optional bundle README and endpoints summary
if [ -f reviews/WORK_DONE_OVERVIEW.md ]; then
  cp reviews/WORK_DONE_OVERVIEW.md "$OUTDIR/README_UI_BUNDLE.md"
fi
if [ -f reviews/PRE_SHOW_CHECKLIST.md ]; then
  cp reviews/PRE_SHOW_CHECKLIST.md "$OUTDIR/PRE_SHOW_CHECKLIST.md"
fi
if [ -f reviews/COORDINATOR_DROP_UI.md ]; then
  cp reviews/COORDINATOR_DROP_UI.md "$OUTDIR/COORDINATOR_DROP_UI.md"
fi
# Routes implementation and supporting bundle docs
if [ -f reviews/ROUTES_IMPLEMENTATION.md ]; then
  cp reviews/ROUTES_IMPLEMENTATION.md "$OUTDIR/ROUTES_IMPLEMENTATION.md"
fi
if [ -d reviews/ui_supporting_bundle ]; then
  cp -R reviews/ui_supporting_bundle "$OUTDIR/ui_supporting_bundle"
fi
{
  echo "UI Prod: https://mytko-forecast-ui.vercel.app"
  echo "API Base (Vercel env): ${VITE_API_URL:-<unset>}"
  echo "Demo default date: 2024-08-03"
} > "$OUTDIR/ENDPOINTS.txt"

echo "Zipping..."
pushd "$OUTDIR/.." >/dev/null
ZIP="${OUTDIR##*/}.zip"
zip -qr "$ZIP" "${OUTDIR##*/}"
echo "Bundle: $OUTDIR/../$ZIP"
popd >/dev/null
popd >/dev/null
