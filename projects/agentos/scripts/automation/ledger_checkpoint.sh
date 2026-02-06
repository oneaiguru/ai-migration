#!/usr/bin/env bash
set -euo pipefail

# Ledger checkpoint script
# - Appends a token checkpoint row to docs/Ledgers/Token_Churn_Ledger.csv
# - Runs tracker churn for a window and appends docs/Ledgers/Churn_Ledger.csv
# - Optionally runs the decision card and surfaces the status in output/notes
#
# Usage:
#   scripts/automation/ledger_checkpoint.sh \
#     --window W0-XX \
#     --provider codex \
#     --task "end_of_session" \
#     --plan 200000 \
#     --actual 168000 \
#     [--notes "after-clean"] [--features 0] [--commit-start <sha>] [--commit-end <sha>] [--paths "src/** docs/**"]

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LEDGER_TOKENS="$ROOT_DIR/docs/Ledgers/Token_Churn_Ledger.csv"
DECISION_STATUS=""

DATA_DIR="$ROOT_DIR/data/week0/live"

WINDOW=""
PROVIDER="codex"
TASK="session_checkpoint"
PLAN=""
ACTUAL=""
NOTES=""
FEATURES=""
COMMIT_START=""
COMMIT_END=""
PATHS=()
DECISION_CARD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --window) WINDOW="$2"; shift 2 ;;
    --provider) PROVIDER="$2"; shift 2 ;;
    --task) TASK="$2"; shift 2 ;;
    --plan) PLAN="$2"; shift 2 ;;
    --actual) ACTUAL="$2"; shift 2 ;;
    --notes) NOTES="$2"; shift 2 ;;
    --features) FEATURES="$2"; shift 2 ;;
    --commit-start) COMMIT_START="$2"; shift 2 ;;
    --commit-end) COMMIT_END="$2"; shift 2 ;;
    --paths) shift; while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do PATHS+=("$1"); shift; done ;;
    --decision-card) DECISION_CARD=true; shift ;;
    --data-dir) DATA_DIR="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$WINDOW" ]]; then
  echo "--window is required" >&2
  exit 2
fi

# Ensure token ledger exists with header
mkdir -p "$(dirname "$LEDGER_TOKENS")"
if [[ ! -s "$LEDGER_TOKENS" ]]; then
  echo "date,session_id,task,tokens_planned,tokens_actual,delta,commits,lines_added,lines_deleted,features_added,tests_added,notes" > "$LEDGER_TOKENS"
fi

DATE_UTC=$(date -u +%F)
SESSION_ID=${SESSION_ID:-n/a}
PLANNED=${PLAN:-}
ACTUAL_TOK=${ACTUAL:-}
DELTA=""
if [[ -n "$PLANNED" && -n "$ACTUAL_TOK" ]]; then
  DELTA=$((ACTUAL_TOK - PLANNED))
fi

NOTE_FIELDS="window=$WINDOW; provider=$PROVIDER"
if [[ -n "$NOTES" ]]; then
  NOTE_FIELDS="$NOTE_FIELDS; $NOTES"
fi

# Run churn if window is finalized; ignore failures to keep checkpoint append-only
PYTHONPATH="$ROOT_DIR/tracker/src" python -m tracker.cli --data-dir "$DATA_DIR" churn --window "$WINDOW" --provider "$PROVIDER" ${COMMIT_START:+--commit-start "$COMMIT_START"} ${COMMIT_END:+--commit-end "$COMMIT_END"} ${FEATURES:+--features "$FEATURES"} ${PATHS:+--paths ${PATHS[*]}} || true

if $DECISION_CARD; then
  CARD_OUTPUT=$(PYTHONPATH="$ROOT_DIR/tracker/src" python "$ROOT_DIR/scripts/tools/decision_card.py" --data-dir "$DATA_DIR" --window "$WINDOW") || {
    echo "decision card failed" >&2
    echo "$CARD_OUTPUT"
    exit 1
  }
  echo "$CARD_OUTPUT"
  DECISION_STATUS=$(printf '%s\n' "$CARD_OUTPUT" | awk -F': ' '/^  Status/ {sub(/^ +/ ,"", $2); sub(/ +$/, "", $2); print $2}' | tr -d '\r')
  if [[ -n "$DECISION_STATUS" ]]; then
    NOTE_FIELDS="$NOTE_FIELDS; decision=$DECISION_STATUS"
  fi
fi

echo "$DATE_UTC,$SESSION_ID,$TASK,$PLANNED,$ACTUAL_TOK,$DELTA,0,0,0,${FEATURES:-0},0,$NOTE_FIELDS" >> "$LEDGER_TOKENS"

echo "ledger checkpoint recorded for $WINDOW (provider=$PROVIDER)"
