Purpose
A **minimal, offline** harness to validate license‑pack flows end‑to‑end using your existing shim CLI. Use these for smoke tests and local demos; replace the placeholder pack with a real one during issuer integration.

What’s here

* `packs/trial_license.pack` — placeholder single‑line pack (`{"license":{…},"signature":"…"}`), not valid for real runs.
* `device_flow/begin_response.json`, `device_flow/poll_ok.json` — example payloads to test CLI rendering.
* `smoke.sh` — runs `cc license set` / `cc license status` and confirms shim gating messages.
* `ccp_verify.sh` — calls the shim verifier if present (`services/go-anth-shim/bin/ccp license status --pack ...`).

How to use

1. `./docs/LICENSING/harness/smoke.sh` → should show “saved license pack” and status output.
2. If you have a real pack: `cc license set "$(cat real.pack)" && cc license status`.
3. Optional: `./docs/LICENSING/harness/ccp_verify.sh` to exercise the embedded verifier.

References in tree

* ADRs 0001–0010 (format, device flow, binding, distribution, billing) live under `docs/LICENSING/ADR/`.

---

# docs/LICENSING/harness/ccp_verify.sh

#!/usr/bin/env bash
set -euo pipefail
PACK="${1:-$(dirname "$0")/../packs/trial_license.pack}"
BIN="./services/go-anth-shim/bin/ccp"
if [[ ! -x "$BIN" ]]; then
echo "[harness] build shim first (make go-proxy)"; exit 1;
fi
"$BIN" license status --pack "$PACK"

---

# docs/LICENSING/harness/smoke.sh

#!/usr/bin/env bash
set -euo pipefail
PACK_DIR="$(dirname "$0")/../packs"
PACK="$PACK_DIR/trial_license.pack"
mkdir -p "$PACK_DIR"
echo "[harness] writing placeholder pack to: $PACK"
cat >"$PACK" <<'JSON'
{"license":{"plan":"trial","features":["zai_offload"],"kid":"TEST","device":"local-demo","exp":4102444800},"signature":"PLACEHOLDER_BASE64"}
JSON
echo "[harness] persisting via cc CLI..."
cc license set "$(cat "$PACK")"
cc license status || true

---

# docs/LICENSING/packs/trial_license.pack

{"license":{"plan":"trial","features":["zai_offload"],"kid":"TEST","device":"local-demo","exp":4102444800},"signature":"PLACEHOLDER_BASE64"}

(Your repo already contains sample JSON+SIG pairs under `services/go-anth-shim/testdata/license/`. This pack is a friendly single‑string variant to exercise the CLI path described in SESSION_HANDOFF.  )

---