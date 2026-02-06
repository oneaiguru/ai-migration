#!/usr/bin/env bash
set -euo pipefail

# Dev helper: start local issuer, issue a trial license scoped to this host,
# and print the exports required for CCP licensed mode.

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ISSUER_BIN="$REPO_ROOT/services/go-anth-shim/bin/licissuer"
OUT_DIR="${REPO_ROOT}/logs/dev-license"
export OUT_DIR
mkdir -p "$OUT_DIR"

HOST_HASH=$(python3 - <<'PY'
import hashlib, base64, platform, socket
seed = f"{socket.gethostname()}|{platform.system().lower()}|{platform.machine()}".encode()
print(base64.b64encode(hashlib.sha256(seed).digest()).decode())
PY
)

echo "[dev-lic] building licissuer..."
(
  cd "$REPO_ROOT/services/go-anth-shim"
  GOPROXY=direct GOSUMDB=off go build -o "$ISSUER_BIN" ./cmd/licissuer
)

INVITES_JSON="$OUT_DIR/invites.json"
cat > "$INVITES_JSON" <<'JSON'
{
  "DEV-TRIAL-7D": {
    "plan": "trial",
    "features": ["zai_offload"],
    "ttl_days": 7,
    "max_redemptions": 100
  }
}
JSON

if [[ -z "${PRIVATE_SEED_B64:-}" ]]; then
  if command -v openssl >/dev/null 2>&1; then
    PRIVATE_SEED_B64=$(openssl rand -base64 32)
  else
    PRIVATE_SEED_B64=$(python3 - <<'PY'
import os, base64
print(base64.b64encode(os.urandom(32)).decode())
PY
)
  fi
fi

PORT="${LICISSUER_PORT:-8787}"
ADDR=":${PORT}"

echo "[dev-lic] starting issuer on ${ADDR}..."
LICISSUER_KID="dev-$(date +%Y%m%d-%H%M%S)" PRIVATE_SEED_B64="$PRIVATE_SEED_B64" LICISSUER_INVITES="$INVITES_JSON" \
  "$ISSUER_BIN" --addr "$ADDR" --invites "$INVITES_JSON" >"$OUT_DIR/issuer.out" 2>&1 &
ISS_PID=$!
trap 'kill "$ISS_PID" >/dev/null 2>&1 || true' EXIT
sleep 0.5

echo "[dev-lic] requesting trial license from issuer..."
ISSUE_JSON=$(curl -sS "http://127.0.0.1:${PORT}/v1/license/issue" \
  -H 'content-type: application/json' \
  -d '{"invite_code":"DEV-TRIAL-7D","email":"local@dev","device":"'"${HOST_HASH}"'"}')
if [[ -z "$ISSUE_JSON" ]]; then
  echo "[dev-lic] issuer returned empty response" >&2
  exit 1
fi

echo "$ISSUE_JSON" > "$OUT_DIR/issue.json"

python3 - <<'PY'
import json, os, pathlib
root = pathlib.Path(os.environ["OUT_DIR"])  # provided by shell
issue_path = root / "issue.json"
issue = json.loads(issue_path.read_text())
(root / "license.json").write_text(json.dumps(issue["license"], separators=(",", ":")))
(root / "license.sig").write_text(issue["sigB64"])
(root / "license.pack").write_text(issue.get("license_pack", ""))
(root / "pubkey.b64").write_text(issue["pubKeyB64"])
PY

read -r PUBKEY KID <<< "$(python3 - <<'PY'
import json, os
issue = json.load(open(os.path.join(os.environ["OUT_DIR"], "issue.json")))
pub = issue["pubKeyB64"].strip()
kid = issue["license"].get("kid", "env_1").strip() or "env_1"
print(pub, kid)
PY
)"

LICENSE_JSON_PATH="$OUT_DIR/license.json"
LICENSE_SIG_PATH="$OUT_DIR/license.sig"

EXPORT_PATH="$OUT_DIR/exports.sh"
cat <<ENV > "$EXPORT_PATH"
export CCP_LICENSE_PUBKEY_B64="${KID}=$PUBKEY"
export CC_LICENSE_JSON="$LICENSE_JSON_PATH"
export CC_LICENSE_SIG="$LICENSE_SIG_PATH"
export ZAI_HEADER_MODE=authorization
ENV

echo "[dev-lic] pubkey=$PUBKEY kid=$KID"
echo "[dev-lic] wrote exports to $EXPORT_PATH"
echo "[dev-lic] restart the shim: pkill -f ccp && make -C '$REPO_ROOT' go-proxy"
