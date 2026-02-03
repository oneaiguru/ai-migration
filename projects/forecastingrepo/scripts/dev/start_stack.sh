#!/usr/bin/env bash
# Bring up API + both UIs (forecast-ui and mytko demo) in background.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FORECAST_UI_ROOT="${FORECAST_UI_ROOT:-$REPO_ROOT/../ui/forecast-ui}"
MYTKO_UI_ROOT="${MYTKO_UI_ROOT:-$REPO_ROOT/../ui/mytko-forecast-demo}"
API_PORT="${API_PORT:-8000}"
FORECAST_UI_PORT="${FORECAST_UI_PORT:-4173}"
MYTKO_UI_PORT="${MYTKO_UI_PORT:-5174}"

log_dir=${LOG_DIR:-/tmp}
mkdir -p "$log_dir"

kill_port_if_needed() {
  local port="$1"
  if pids=$(lsof -ti ":${port}" 2>/dev/null); then
    for pid in $pids; do
      echo "[stack] Port ${port} already in use by pid ${pid}; terminating"
      kill "$pid" || true
      sleep 1
    done
  fi
}

start_process() {
  local cmd="$1"
  local log_file="$2"
  local pid_file="$3"
  nohup bash -c "$cmd" >"$log_file" 2>&1 &
  local pid=$!
  echo "$pid" >"$pid_file"
  echo "[start] $cmd  (pid $pid)"
}

wait_for_http() {
  local url="$1"
  local pid_file="$2"
  for _ in {1..30}; do
    if curl -s -o /dev/null "$url"; then
      return 0
    fi
    if [[ -f "$pid_file" ]]; then
      local pid
      pid=$(cat "$pid_file")
      if ! ps -p "$pid" >/dev/null 2>&1; then
        echo "[stack][ERR] process (pid $pid) exited; see logs."
        return 1
      fi
    fi
    sleep 1
  done
  return 1
}

kill_port_if_needed "$API_PORT"
kill_port_if_needed "$FORECAST_UI_PORT"
kill_port_if_needed "$MYTKO_UI_PORT"

echo "[stack] Starting API on port $API_PORT"
start_process "cd \"$REPO_ROOT\" && PORT=${API_PORT} bash \"$SCRIPT_DIR/start_api.sh\"" \
  "$log_dir/api_dev.log" "$log_dir/api_dev.pid"
if ! wait_for_http "http://127.0.0.1:${API_PORT}/api/metrics" "$log_dir/api_dev.pid"; then
  echo "[stack][ERR] API did not start; see $log_dir/api_dev.log"
  exit 1
fi

echo "[stack] Starting forecast-ui dev server on port $FORECAST_UI_PORT"
start_process "cd \"$FORECAST_UI_ROOT\" && VITE_API_URL=\"http://127.0.0.1:${API_PORT}\" npm run dev -- --host 127.0.0.1 --port ${FORECAST_UI_PORT}" \
  "$log_dir/ui_forecast_dev.log" "$log_dir/ui_forecast_dev.pid"
if ! wait_for_http "http://127.0.0.1:${FORECAST_UI_PORT}" "$log_dir/ui_forecast_dev.pid"; then
  echo "[stack][ERR] forecast-ui did not start; see $log_dir/ui_forecast_dev.log"
  exit 1
fi

echo "[stack] Starting mytko-forecast-demo dev server on port $MYTKO_UI_PORT"
start_process "cd \"$MYTKO_UI_ROOT\" && VITE_API_BASE=\"http://127.0.0.1:${API_PORT}\" npm run dev -- --host 127.0.0.1 --port ${MYTKO_UI_PORT}" \
  "$log_dir/ui_mytko_dev.log" "$log_dir/ui_mytko_dev.pid"
if ! wait_for_http "http://127.0.0.1:${MYTKO_UI_PORT}" "$log_dir/ui_mytko_dev.pid"; then
  echo "[stack][ERR] mytko demo did not start; see $log_dir/ui_mytko_dev.log"
  exit 1
fi

echo
echo "API running @ http://127.0.0.1:${API_PORT}"
echo "forecast-ui running @ http://127.0.0.1:${FORECAST_UI_PORT}"
echo "mytko demo running @ http://127.0.0.1:${MYTKO_UI_PORT}"
echo "Logs: $log_dir/(api|ui_forecast|ui_mytko)_dev.log"
echo "Stop with scripts/dev/stop_stack.sh"
