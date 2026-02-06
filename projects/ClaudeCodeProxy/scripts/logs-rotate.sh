#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}" )/.." && pwd)"
LOG_DIR="${CCP_LOGS_DIR:-$ROOT/logs}"
LOG_FILE="$LOG_DIR/usage.jsonl"
MAX_FILES=${MAX_LOG_FILES:-5}

if [[ ! -f "$LOG_FILE" ]]; then
  echo "[logs-rotate] no usage.jsonl present"
  exit 0
fi

mkdir -p "$LOG_DIR"

PYTHON_BIN=${PYTHON_BIN:-python3}
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  PYTHON_BIN=python
fi

should_rotate=$("$PYTHON_BIN" - "$LOG_FILE" <<'PY_CHECK'
import os, sys, time
path = sys.argv[1]
max_bytes = int(os.environ.get("MAX_LOG_BYTES", "0") or 0)
age_env = os.environ.get("CCP_LOG_MAX_AGE", "")
units = {"s": 1, "m": 60, "h": 3600, "d": 86400}
max_age = 0.0
if age_env:
    try:
        max_age = float(age_env)
    except ValueError:
        unit = age_env[-1].lower()
        try:
            max_age = float(age_env[:-1]) * units.get(unit, 0)
        except ValueError:
            max_age = 0.0
size = os.path.getsize(path)
age = time.time() - os.path.getmtime(path)
rotate = True
if max_bytes > 0 and size < max_bytes:
    rotate = False
if max_age > 0 and age < max_age:
    rotate = False
print("1" if rotate else "0")
PY_CHECK
)

if [[ "$should_rotate" != "1" ]]; then
  echo "[logs-rotate] thresholds not met; skipping"
  exit 0
fi

for ((i=MAX_FILES; i>=1; i--)); do
  SRC="$LOG_FILE.$((i-1))"
  DST="$LOG_FILE.$i"
  if (( i == 1 )); then
    SRC="$LOG_FILE"
  fi
  if [[ -f "$SRC" ]]; then
    mv "$SRC" "$DST"
  fi
done

: > "$LOG_FILE"
echo "[logs-rotate] rotated usage.jsonl (kept last $MAX_FILES copies)"
