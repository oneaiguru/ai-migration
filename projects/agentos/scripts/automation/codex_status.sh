#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: codex_status.sh --phase {before,after,cross} --window <id> \
  --pipe-alias <alias> [--fixture FILE] [--data-dir DIR] [--state-dir DIR]
  [--buffer-seconds N] [--notes TEXT]

Options:
  --phase           Snapshot phase (before, after, or cross).
  --window          Window identifier (e.g., W0-01).
  --pipe-alias      Tracker alias shorthand (os, oe, ox).
  --fixture         Read Codex /status output from fixture file instead of Codex CLI.
  --data-dir        Tracker data directory (defaults to TRACKER_DATA_DIR or repo data/week0/live).
  --state-dir       Directory for alias state (defaults to TRACKER_ALIAS_STATE_DIR or <data-dir>/state).
  --buffer-seconds  Seconds to wait before capturing "after" snapshots (default 300; ignored for fixtures).
  --notes           Optional note stored with snapshot (default automation:<phase>).
  --help            Show this message.
USAGE
}

phase=""
window=""
alias_name=""
fixture=""
data_dir="${TRACKER_DATA_DIR:-}"
state_dir="${TRACKER_ALIAS_STATE_DIR:-}"
buffer_seconds=300
notes=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --phase)
      phase="$2"
      shift 2
      ;;
    --window)
      window="$2"
      shift 2
      ;;
    --pipe-alias)
      alias_name="$2"
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
    --state-dir)
      state_dir="$2"
      shift 2
      ;;
    --buffer-seconds)
      buffer_seconds="$2"
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

if [[ -z "$phase" || -z "$window" || -z "$alias_name" ]]; then
  echo "phase, window, and pipe-alias are required" >&2
  usage
  exit 2
fi

case "$phase" in
  before|after|cross) ;;
  *)
    echo "unsupported phase: $phase" >&2
    exit 2
    ;;
esac

if [[ -z "$data_dir" ]]; then
  data_dir="$(pwd)/data/week0/live"
fi
mkdir -p "$data_dir"

if [[ -z "$state_dir" ]]; then
  state_dir="$data_dir/state"
fi
mkdir -p "$state_dir"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
pythonpath_entry="$repo_root/tracker/src"
if [[ -z "${PYTHONPATH:-}" ]]; then
  export PYTHONPATH="$pythonpath_entry"
elif [[ ":$PYTHONPATH:" != *":$pythonpath_entry:"* ]]; then
  export PYTHONPATH="$PYTHONPATH:$pythonpath_entry"
fi

alias_action=""
case "$alias_name" in
  os) alias_action="start" ;;
  oe) alias_action="end" ;;
  ox) alias_action="cross" ;;
  *)
    echo "unsupported alias name: $alias_name" >&2
    exit 2
    ;;
esac

status_payload=""
if [[ -n "$fixture" ]]; then
  if [[ ! -f "$fixture" ]]; then
    echo "fixture not found: $fixture" >&2
    exit 1
  fi
  status_payload="$(cat "$fixture")"
else
  # Ensure a Codex session exists.
  codex exec "hi" >/dev/null 2>&1 || true
  if [[ "$phase" == "after" && "$buffer_seconds" -gt 0 ]]; then
    sleep "$buffer_seconds"
  fi
  if [[ "$phase" == "cross" && "$buffer_seconds" -gt 0 ]]; then
    sleep "$buffer_seconds"
  fi
  status_payload="$(printf '/status\n/quit\n' | codex resume --last)"
fi

# Emit captured pane so operators see the exact text.
printf '%s\n' "$status_payload"

note_value="$notes"
if [[ -z "$note_value" ]]; then
  note_value="automation:$phase"
fi

tracker_cmd=(
  python -m tracker.cli
  --data-dir "$data_dir"
  alias
  "$alias_action"
  codex
  --stdin
  --source automation
  --notes "$note_value"
)

if [[ -n "$window" ]]; then
  tracker_cmd+=(--window "$window")
fi
if [[ -n "$state_dir" ]]; then
  tracker_cmd+=(--state-dir "$state_dir")
fi

alias_output="$(printf '%s\n' "$status_payload" | "${tracker_cmd[@]}")"
printf '%s\n' "$alias_output"
