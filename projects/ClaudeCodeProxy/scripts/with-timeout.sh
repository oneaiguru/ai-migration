#!/usr/bin/env bash
# with-timeout.sh <seconds> <command...>
# Tries gtimeout/timeout; falls back to Python subprocess timeout.
set -euo pipefail

SECS=${1:?seconds}
shift

if command -v gtimeout >/dev/null 2>&1; then
  exec gtimeout "$SECS" "$@"
elif command -v timeout >/dev/null 2>&1; then
  exec timeout "$SECS" "$@"
else
  # Python fallback
  PY=$(command -v python3 || command -v python)
  exec "$PY" - "$SECS" "$@" <<'PY'
import os, sys, subprocess, shlex
secs = int(sys.argv[1])
cmd = sys.argv[2:]
try:
    p = subprocess.run(cmd, timeout=secs)
    sys.exit(p.returncode)
except subprocess.TimeoutExpired:
    sys.exit(124)
PY
fi

