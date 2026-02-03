#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-}
if [ -z "$BASE" ]; then
  echo "Usage: $0 <BASE>" >&2
  exit 2
fi
cd "$(dirname "$0")/../.."
echo "[vercel] Setting VITE_API_URL (Production) -> $BASE"
vercel env rm VITE_API_URL production --yes || true
printf "%s" "$BASE" | vercel env add VITE_API_URL production

echo "[vercel] Deploying Production..."
vercel --prod --yes

echo "[vercel] Aliasing mytko-forecast-ui.vercel.app to latest..."
LATEST=$(vercel ls | awk '/Ready/{print $2; exit}')
if [ -n "$LATEST" ]; then
  vercel alias set "$LATEST" mytko-forecast-ui.vercel.app || true
fi

echo "[done] UI deployed and aliased."
