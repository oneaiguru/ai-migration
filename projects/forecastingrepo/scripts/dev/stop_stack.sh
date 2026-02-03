#!/usr/bin/env bash
set -euo pipefail

log_dir=${LOG_DIR:-/tmp}
pid_files=(
  "$log_dir/api_dev.pid"
  "$log_dir/ui_forecast_dev.pid"
  "$log_dir/ui_mytko_dev.pid"
)

stopped_any=0
for pid_file in "${pid_files[@]}"; do
  if [[ -f "$pid_file" ]]; then
    pid=$(cat "$pid_file")
    if ps -p "$pid" >/dev/null 2>&1; then
      echo "[stop] killing $pid (from $pid_file)"
      kill "$pid" || true
      stopped_any=1
    else
      echo "[stop] pid $pid from $pid_file not running"
    fi
    rm -f "$pid_file"
  fi
done

if [[ $stopped_any -eq 0 ]]; then
  echo "[stop] nothing was running (no pid files found)."
else
  echo "[stop] requested termination; check $log_dir for logs."
fi
