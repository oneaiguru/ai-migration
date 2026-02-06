#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TS=$(date +%Y%m%d-%H%M%S)
DEST_BASE="$HOME/Downloads/agentos_tmp_review"
DEST_DIR="$DEST_BASE-$TS"
mkdir -p "$DEST_DIR"

LOG_ROOT="${CCP_LOGS_DIR:-$ROOT/logs}"
RESULTS_ROOT="${CCP_RESULTS_DIR:-$ROOT/results}"

copy_safe() { [[ -e "$1" ]] && cp -a "$1" "$2" || true; }

mkdir -p "$DEST_DIR/results" "$DEST_DIR/logs" "$DEST_DIR/docs" "$DEST_DIR/services" "$DEST_DIR/scripts" "$DEST_DIR/inbox"

# Results and metrics
copy_safe "$RESULTS_ROOT/TESTS.md" "$DEST_DIR/results/"
copy_safe "$RESULTS_ROOT/METRICS.json" "$DEST_DIR/results/"
copy_safe "$RESULTS_ROOT/SUMMARY.md" "$DEST_DIR/results/"

# Logs
copy_safe "$LOG_ROOT/usage.jsonl" "$DEST_DIR/logs/"
copy_safe "$LOG_ROOT/anomalies.jsonl" "$DEST_DIR/logs/"
copy_safe "$LOG_ROOT/mitm.live.out" "$DEST_DIR/logs/"
copy_safe "$LOG_ROOT/policy-cache.json" "$DEST_DIR/logs/"

# Docs (keys + runbooks)
copy_safe "$ROOT/VERSIONS.json" "$DEST_DIR/"
copy_safe "$ROOT/docs/SESSION_HANDOFF.md" "$DEST_DIR/docs/"
copy_safe "$ROOT/docs/HANDOFF-LONG-SESSION.md" "$DEST_DIR/docs/"
copy_safe "$ROOT/docs/ERROR-TAXONOMY.md" "$DEST_DIR/docs/"
copy_safe "$ROOT/docs/P0-EXIT-CRITERIA.md" "$DEST_DIR/docs/"
copy_safe "$ROOT/docs/README.md" "$DEST_DIR/docs/"
copy_safe "$ROOT/README.md" "$DEST_DIR/"
copy_safe "$ROOT/CLAUDE.md" "$DEST_DIR/"
copy_safe "$ROOT/docs/mitm-subagent-offload/README.md" "$DEST_DIR/docs/"
if [[ -d "$ROOT/docs/mitm-subagent-offload" ]]; then
  mkdir -p "$DEST_DIR/docs/mitm-subagent-offload"
  cp -a "$ROOT/docs/mitm-subagent-offload"/* "$DEST_DIR/docs/mitm-subagent-offload/" || true
fi

# Code of interest (addons + scripts + Makefile)
mkdir -p "$DEST_DIR/services/mitm-subagent-offload/addons"
if [[ -d "$ROOT/services/mitm-subagent-offload/addons" ]]; then
  cp -a "$ROOT/services/mitm-subagent-offload/addons"/*.py "$DEST_DIR/services/mitm-subagent-offload/addons/" || true
fi
cp -a "$ROOT/scripts"/* "$DEST_DIR/scripts/" || true
copy_safe "$ROOT/Makefile" "$DEST_DIR/"

# State summary
{
  echo "repo: $ROOT"
  echo -n "commit: "; (cd "$ROOT" && git rev-parse HEAD 2>/dev/null || echo "unversioned")
  echo -n "mitm_port: "; test -f "$LOG_ROOT/mitm.pid" && echo 8082 || echo unknown
  echo "env_toggles:"
  echo "  FORCE_HAIKU_TO_ZAI=${FORCE_HAIKU_TO_ZAI:-unknown}"
  echo "  MITM_FORCE_H1=${MITM_FORCE_H1:-unknown}"
  echo "  ZAI_HEADER_MODE=${ZAI_HEADER_MODE:-unknown}"
  echo "  MITM_ENABLE_BACKOFF=${MITM_ENABLE_BACKOFF:-unknown}"
  echo "  OFFLOAD_PAUSED=${OFFLOAD_PAUSED:-unknown}"
} > "$DEST_DIR/STATE.txt"

# Bundle tarball
TAR_PATH="$DEST_DIR.tgz"
tar -czf "$TAR_PATH" -C "$DEST_DIR" .
echo "[bundle] wrote $DEST_DIR and $TAR_PATH"
