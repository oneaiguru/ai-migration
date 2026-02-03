#!/usr/bin/env bash

# Tracker alias wrapper
#
# Usage examples:
#   codex /status | os          # record Codex start pane
#   codex /status | oe          # record Codex end pane
#   codex /status | ox          # end current Codex window and seed the next
#   od --phase after            # delete the latest Codex AFTER snapshot
#   od1                          # convenience: delete latest Codex AFTER
#   od2                          # convenience: delete second-latest Codex AFTER
#   ccusage blocks --json | zs      # store GLM baseline
#   ccusage-codex --json | occ W0-19 # store Codex session summary for W0-19
#   claude-monitor --view realtime | head -n 40 | acm W0-19 # snapshot Claude monitor output
#
# Environment variables:
#   TRACKER_DATA_DIR        Override tracker data directory (default: <repo>/data/week0/live)
#   TRACKER_ALIAS_STATE_DIR Override state directory      (default: $TRACKER_DATA_DIR/state)

__tracker_alias_repo_root() {
  local script_dir
  script_dir="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
  cd -- "$script_dir/.." >/dev/null 2>&1 && pwd
}

__tracker_alias_run() {
  local action=$1
  local provider=$2
  shift 2

  if [ -t 0 ]; then
    printf 'error: %s/%s expects input via STDIN\n' "$provider" "$action" >&2
    return 1
  fi

  local repo_root
  repo_root=${TRACKER_ALIAS_REPO_ROOT:-$(__tracker_alias_repo_root)}
  local data_dir
  data_dir=${TRACKER_DATA_DIR:-"$repo_root/data/week0/live"}
  local state_dir
  state_dir=${TRACKER_ALIAS_STATE_DIR:-"$data_dir/state"}

  # Optional AGENT isolation: keep state in a per-agent subdir
  if [ -n "${AGENT_ID:-}" ]; then
    state_dir="$state_dir/$AGENT_ID"
  fi

  mkdir -p "$state_dir"

  # Simple lock to avoid concurrent alias collisions
  exec 9>"$state_dir/.alias.lock"
  if command -v flock >/dev/null 2>&1; then
    flock -w 5 9 || {
      printf 'alias lock busy for provider=%s (state=%s)\n' "$provider" "$state_dir" >&2
      return 2
    }
  fi

  # Propagate AGENT_ID in notes unless caller provided their own
  local pass_notes=()
  if [ -n "${AGENT_ID:-}" ]; then
    local saw_notes=false
    for arg in "$@"; do
      if [ "$arg" = "--notes" ]; then
        saw_notes=true
        break
      fi
    done
    if [ "$saw_notes" = false ]; then
      pass_notes=(--notes "AGENT_ID=${AGENT_ID}")
    fi
  fi

  local cmd=(tracker --data-dir "$data_dir" alias "$action" "$provider" \
    --state-dir "$state_dir" --stdin)
  if [ ${#pass_notes[@]} -gt 0 ]; then
    cmd+=("${pass_notes[@]}")
  fi
  if [ $# -gt 0 ]; then
    cmd+=("$@")
  fi

  "${cmd[@]}"
}

__tracker_alias_delete() {
  local provider=$1
  shift 1

  local repo_root
  repo_root=${TRACKER_ALIAS_REPO_ROOT:-$(__tracker_alias_repo_root)}
  local data_dir
  data_dir=${TRACKER_DATA_DIR:-"$repo_root/data/week0/live"}
  local state_dir
  state_dir=${TRACKER_ALIAS_STATE_DIR:-"$data_dir/state"}

  local cmd=(tracker --data-dir "$data_dir" alias delete "$provider" --state-dir "$state_dir")
  cmd+=("$@")
  "${cmd[@]}"
}

__tracker_alias_ingest_ccusage() {
  local provider=$1
  local window=$2
  shift 2

  if [ -z "$window" ]; then
    printf 'usage: %s <window>\n' "$provider" >&2
    return 1
  fi

  if [ -t 0 ]; then
    printf 'error: %s expects input via STDIN\n' "$provider" >&2
    return 1
  fi

  local repo_root
  repo_root=${TRACKER_ALIAS_REPO_ROOT:-$(__tracker_alias_repo_root)}
  local data_dir
  data_dir=${TRACKER_DATA_DIR:-"$repo_root/data/week0/live"}

  local cmd=(tracker --data-dir "$data_dir" ingest "$provider" --window "$window" --stdin)
  cmd+=("$@")
  "${cmd[@]}"
}

# Codex aliases ---------------------------------------------------------
os() { __tracker_alias_run start codex "$@"; }
oe() { __tracker_alias_run end codex "$@"; }
ox() { __tracker_alias_run cross codex "$@"; }
od() { __tracker_alias_delete codex "$@"; }
od1() { __tracker_alias_delete codex --phase after --index 1 "$@"; }
od2() { __tracker_alias_delete codex --phase after --index 2 "$@"; }

# Claude aliases --------------------------------------------------------
as() { __tracker_alias_run start claude "$@"; }
ae() { __tracker_alias_run end claude "$@"; }
ax() { __tracker_alias_run cross claude "$@"; }
ad() { __tracker_alias_delete claude "$@"; }

# GLM aliases -----------------------------------------------------------
zs() { __tracker_alias_run start glm "$@"; }
ze() { __tracker_alias_run end glm "$@"; }
zx() { __tracker_alias_run cross glm "$@"; }
zd() { __tracker_alias_delete glm "$@"; }

# Codex ccusage bridge -------------------------------------------------
occ() {
  local window=$1
  shift 1
  __tracker_alias_ingest_ccusage codex-ccusage "$window" "$@"
}

acm() {
  local window=$1
  shift 1
  __tracker_alias_ingest_ccusage claude-monitor "$window" "$@"
}
