#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: claude_monitor.sh --window <id> [--fixture FILE] [--data-dir DIR] \
  [--notes TEXT]

Capture Claude usage via claude-monitor output and ingest into tracker.

Options:
  --window          Window identifier (e.g., W0-21). Required.
  --fixture         Read claude-monitor output from a fixture file.
  --data-dir        Tracker data directory (defaults to TRACKER_DATA_DIR or repo data/week0/live).
  --notes           Optional note stored with the record (default automation:claude-monitor).
  --help            Show this message.
USAGE
}

window=""
fixture=""
data_dir="${TRACKER_DATA_DIR:-}"
notes=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --window)
      window="$2"
      shift 2
      ;;
    --fixture)
      fixture="$2"
      shift 2
      ;;
    --data-dir)
      data_dir="$2"
      shift 2
      ;;
    --notes)
      notes="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ -z "$window" ]]; then
  echo "--window is required" >&2
  usage
  exit 2
fi

if [[ -z "$data_dir" ]]; then
  data_dir="$(pwd)/data/week0/live"
fi
mkdir -p "$data_dir"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
pythonpath_entry="$repo_root/tracker/src"
if [[ -z "${PYTHONPATH:-}" ]]; then
  export PYTHONPATH="$pythonpath_entry"
elif [[ ":$PYTHONPATH:" != *":$pythonpath_entry:"* ]]; then
  export PYTHONPATH="$PYTHONPATH:$pythonpath_entry"
fi

payload=""
if [[ -n "$fixture" ]]; then
  if [[ ! -f "$fixture" ]]; then
    echo "fixture not found: $fixture" >&2
    exit 1
  fi
  payload="$(cat "$fixture")"
else
  if [[ -t 0 ]]; then
    echo "Provide claude-monitor output via --fixture or pipe stdin" >&2
    exit 2
  fi
  payload="$(cat)"
fi

printf '%s
' "$payload"

note_value="$notes"
if [[ -z "$note_value" ]]; then
  note_value="automation:claude-monitor"
fi

tracker_cmd=(
  python -m tracker.cli
  --data-dir "$data_dir"
  ingest
  claude-monitor
  --window "$window"
  --stdin
  --notes "$note_value"
)

output="$(printf '%s
' "$payload" | "${tracker_cmd[@]}")"
exit_code=$?
printf '%s
' "$output"
exit $exit_code
