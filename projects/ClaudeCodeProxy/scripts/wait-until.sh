#!/usr/bin/env bash
set -euo pipefail

# Usage: wait-until.sh HH:MM (24h local time)
# Sleeps until the next occurrence of HH:MM local time.

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 HH:MM" >&2
  exit 1
fi

TARGET="$1"
NOW_EPOCH=$(date +%s)
TODAY=$(date +%F)
TARGET_EPOCH=$(date -j -f "%Y-%m-%d %H:%M" "$TODAY $TARGET" +%s 2>/dev/null || date -d "$TODAY $TARGET" +%s)

if [[ "$TARGET_EPOCH" -le "$NOW_EPOCH" ]]; then
  # add one day
  TARGET_EPOCH=$((TARGET_EPOCH + 86400))
fi

SLEEP_SECS=$((TARGET_EPOCH - NOW_EPOCH))
echo "Sleeping $SLEEP_SECS seconds until $TARGET local time…"
sleep "$SLEEP_SECS"
echo "Reached $TARGET."

