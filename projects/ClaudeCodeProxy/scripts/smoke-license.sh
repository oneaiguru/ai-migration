#!/usr/bin/env bash
set -euo pipefail

if [[ ${ALLOW_REAL_API:=0} -ne 1 ]]; then
  echo "Skipping smoke-license (requires ALLOW_REAL_API=1 for live Anthropic/Z.AI calls)"
  exit 0
fi

repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
profile="${CCP_PROFILE:-prod}"
case "$profile" in
  dev)
    logs_dir="${CCP_LOGS_DIR:-$repo/logs/dev}"
    results_dir="${CCP_RESULTS_DIR:-$repo/results/dev}"
    license_root="${CCP_LICENSE_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/ccc}"
    ;;
  *)
    logs_dir="${CCP_LOGS_DIR:-$repo/logs}"
    results_dir="${CCP_RESULTS_DIR:-$repo/results}"
    license_root="${CCP_LICENSE_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/ccp}"
    ;;
esac

mkdir -p "$logs_dir" "$results_dir" "$license_root"

usage="$logs_dir/usage.jsonl"
trial_json="$repo/services/go-anth-shim/testdata/license/trial_license.json"
trial_sig="$repo/services/go-anth-shim/testdata/license/trial_license.sig"
result_dir="$results_dir"
cc_cli="$repo/bin/cc"
license_pack_path="$license_root/license.pack"
use_login="${USE_LICENSE_LOGIN:-0}"
mkdir -p "$result_dir"
cli_out="$result_dir/SMOKE_LICENSE_CLI.jsonl"
: > "$cli_out"

echo "[smoke-license] profile=$profile" >&2

if [[ ! -f "$trial_json" || ! -f "$trial_sig" ]]; then
  echo "Trial license files not found; expected $trial_json and $trial_sig" >&2
  exit 1
fi

if [[ -z "${ZAI_API_KEY:-}" ]]; then
  if [[ -f "$repo/.env" ]]; then
    candidate=$(grep -Ev '^[[:space:]]*#' "$repo/.env" | head -n1 | tr -d '\r')
    if [[ -n "$candidate" ]]; then
      export ZAI_API_KEY="$candidate"
    fi
  fi
fi
if [[ -z "${ZAI_API_KEY:-}" ]]; then
  echo "ZAI_API_KEY not set; export it or put it in .env" >&2
  exit 1
fi

start_shim() {
  pkill -f 'go-anth-shim/bin/ccp' >/dev/null 2>&1 || true
  unset ANTHROPIC_BASE_URL HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_AUTH_TOKEN
  make -C "$repo" go-proxy >/tmp/smoke-license-go-proxy.log 2>&1
  . "$repo/scripts/go-env.sh" 8082 >/tmp/smoke-license-go-env.log 2>&1
}

run_cli() {
  claude -p --model haiku "Say hi" --output-format json >>"$cli_out"
}

ensure_log_has() {
  local needle=$1
  if ! tail -n 50 "$usage" | rg -q "$needle"; then
    echo "Failed expectation: $needle" >&2
    tail -n 50 "$usage" >&2
    exit 1
  fi
}

reset_usage() {
  mkdir -p "$(dirname "$usage")"
  : > "$usage"
}

lanes=${SMOKE_LANES:-both}

if [[ "$lanes" != "zai" ]]; then
  echo "== T1: Community mode (no license) =="
  unset CC_LICENSE_JSON CC_LICENSE_SIG
  rm -f "$license_pack_path"
  reset_usage
  start_shim
  run_cli
  sleep 1
  ensure_log_has '"decision":"license_block"'
fi


echo "== T2: Trial license (Z.AI lane) =="
if [[ "$use_login" -eq 1 ]]; then
  rm -f "$license_pack_path"
  if ! "$cc_cli" license login --no-browser --issuer "${LICISSUER_BASE_URL:-http://127.0.0.1:8787}" --invite "${SMOKE_INVITE_CODE:-DEV-TRIAL-7D}"; then
    echo "[smoke-license] cc license login failed" >&2
    exit 1
  fi
else
  export CC_LICENSE_JSON="$trial_json"
  export CC_LICENSE_SIG="$trial_sig"
fi
reset_usage
start_shim
run_cli
sleep 1
ensure_log_has '"lane":"zai"'


if [[ "$lanes" != "zai" ]]; then
  echo "== T3: Back to community =="
  unset CC_LICENSE_JSON CC_LICENSE_SIG
  rm -f "$license_pack_path"
  reset_usage
  start_shim
  run_cli
  sleep 1
  ensure_log_has '"decision":"license_block"'
fi

pkill -f 'go-anth-shim/bin/ccp' >/dev/null 2>&1 || true

printf '\nSmoke license checks passed. CLI transcript saved to %s\n' "$cli_out"
