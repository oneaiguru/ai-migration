#!/usr/bin/env bash
set -euo pipefail
# End-to-end demo bring-up, deploy UI, and verify.
# Optional env:
#  UI_DIR   (default: /Users/m/git/clients/rtneo/ui/forecast-ui)
#  ORIGIN   (default: https://mytko-forecast-ui.vercel.app)
UI_DIR=${UI_DIR:-/Users/m/git/clients/rtneo/ui/forecast-ui}
ORIGIN=${ORIGIN:-https://mytko-forecast-ui.vercel.app}
cd "$(dirname "$0")/../.."
echo "[1/5] Starting API + tunnel..."
out=$(bash scripts/dev/demo_up.sh)
echo "$out"
BASE=$(echo "$out" | awk -F= '/^BASE=/{print $2; exit}')
if [ -z "$BASE" ]; then
  echo "[error] BASE not detected" >&2
  exit 1
fi

echo "[2/5] Verifying backend at $BASE ..."
scripts/dev/verify_backend.sh "$BASE" "$ORIGIN"

echo "[3/5] Deploying UI with BASE=$BASE ..."
if [ ! -x "$UI_DIR/scripts/dev/ui_deploy_with_base.sh" ]; then
  echo "[error] Missing UI script: $UI_DIR/scripts/dev/ui_deploy_with_base.sh" >&2
  exit 2
fi
"$UI_DIR/scripts/dev/ui_deploy_with_base.sh" "$BASE"

echo "[4/5] Verifying UI smokes (serial) at $ORIGIN ..."
if [ ! -x "$UI_DIR/scripts/dev/ui_verify.sh" ]; then
  echo "[error] Missing UI script: $UI_DIR/scripts/dev/ui_verify.sh" >&2
  exit 2
fi
"$UI_DIR/scripts/dev/ui_verify.sh" "$ORIGIN"

echo "[5/5] Done. Open $ORIGIN in a fresh browser tab."
