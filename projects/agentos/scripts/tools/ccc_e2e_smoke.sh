#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $0 [--ccp-root PATH] [--output DIR] [--base-url URL]

Fetches /v1/usage and /metrics from a running CCC shim, then runs the AgentOS
backfill ingest against the provided CCP repository. Outputs artefacts under
DIR (default: artifacts/test_runs/CCC_E2E).
USAGE
}

CCP_ROOT="../ClaudeCodeProxy"
OUTPUT_DIR="artifacts/test_runs/CCC_E2E"
BASE_URL="${CCP_BASE_URL:-http://127.0.0.1:8082}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ccp-root)
      CCP_ROOT="$2"
      shift 2
      ;;
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

mkdir -p "$OUTPUT_DIR"

USAGE_PATH="$OUTPUT_DIR/usage.json"
METRICS_PATH="$OUTPUT_DIR/metrics.prom"
SUMMARY_PATH="$OUTPUT_DIR/summary.json"

curl -fsS "$BASE_URL/v1/usage" -o "$USAGE_PATH"
curl -fsS "$BASE_URL/metrics" -o "$METRICS_PATH"

python agentos/tools/backfill_ccp.py \
  --ccp-root "$CCP_ROOT" \
  --usage-json "$USAGE_PATH" \
  --output "$SUMMARY_PATH"

if command -v yq >/dev/null 2>&1; then
  yq '.' "$SUMMARY_PATH"
else
  python -m json.tool "$SUMMARY_PATH"
fi

echo "Smoke complete. Artefacts in $OUTPUT_DIR"
