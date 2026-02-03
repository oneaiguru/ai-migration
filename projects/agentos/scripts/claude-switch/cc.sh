#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<USAGE
Usage: $0 <sub|zai> [claude-args...]

  sub   Launch Claude Code using subscription (OAuth) auth.
  zai   Launch Claude Code routed through Z.ai (API mode).

Environment:
  ISOLATE_HOME=1   Force each mode to use an isolated HOME directory.
USAGE
}

if [[ $# -lt 1 ]]; then
  usage >&2
  exit 1
fi

mode="$1"
shift

case "$mode" in
  sub)
    exec "$SCRIPT_DIR/claude-sub.sh" "$@"
    ;;
  zai)
    exec "$SCRIPT_DIR/claude-zai.sh" "$@"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    echo "Unknown mode: $mode" >&2
    usage >&2
    exit 1
    ;;
 esac
