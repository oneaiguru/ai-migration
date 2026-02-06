#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
RESULTS_DIR="${CCP_RESULTS_DIR:-$REPO_ROOT/results}"
KEEP=5
PATTERN='METRICS*.json'
DRY_RUN=0

usage() {
  cat <<USAGE
Usage: ${BASH_SOURCE[0]} [--dir <results_dir>] [--pattern <glob>] [--keep <n>] [--dry-run]

Defaults:
  dir     = \
${RESULTS_DIR}
  pattern = ${PATTERN}
  keep    = ${KEEP}
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir)
      RESULTS_DIR="$2"
      shift 2
      ;;
    --pattern)
      PATTERN="$2"
      shift 2
      ;;
    --keep)
      KEEP="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "[prune-results] unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! [[ "$KEEP" =~ ^[0-9]+$ ]]; then
  echo "[prune-results] --keep must be a non-negative integer" >&2
  exit 1
fi

if [[ ! -d "$RESULTS_DIR" ]]; then
  echo "[prune-results] results directory not found: $RESULTS_DIR" >&2
  exit 0
fi

shopt -s nullglob
files=( "$RESULTS_DIR"/$PATTERN )
shopt -u nullglob

if (( ${#files[@]} == 0 )); then
  echo "[prune-results] no files matching pattern '$PATTERN' in $RESULTS_DIR"
  exit 0
fi

if (( ${#files[@]} <= KEEP )); then
  echo "[prune-results] ${#files[@]} file(s) <= keep=$KEEP; nothing to prune"
  exit 0
fi

# Sort by modification time (newest first)
IFS=$'\n' read -r -d '' -a sorted < <(LC_ALL=C command ls -1t -- "$RESULTS_DIR"/$PATTERN 2>/dev/null && printf '\0')

if (( ${#sorted[@]} <= KEEP )); then
  echo "[prune-results] ${#sorted[@]} file(s) <= keep=$KEEP; nothing to prune"
  exit 0
fi

delete=()
for ((i=KEEP; i<${#sorted[@]}; i++)); do
  delete+=( "${sorted[$i]}" )
done

if (( ${#delete[@]} == 0 )); then
  echo "[prune-results] nothing to prune"
  exit 0
fi

echo "[prune-results] pruning ${#delete[@]} file(s) (keep=$KEEP pattern=$PATTERN)"
for file in "${delete[@]}"; do
  if (( DRY_RUN )); then
    echo "  [dry-run] would remove $file"
  else
    rm -f -- "$file"
    echo "  removed $file"
  fi
done
