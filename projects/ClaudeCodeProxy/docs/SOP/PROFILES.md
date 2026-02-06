Title
Profiles — Dev vs Prod (Local, Stealth)

Purpose
- Make it unambiguous how to run the product locally without a license (dev), and how to run with a license (prod). Everything you need lives in this repo.

Dev (Community Mode)
- What: No license required. All endpoints, metrics, R4 persistence + rollups function locally.
- How:
  - Start shim: `./services/go-anth-shim/bin/ccp serve --port 8082`
  - Point CLI at shim: `ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p "Say ok"`
  - Verify: `/v1/usage`, `/v1/usage/samples`, `/v1/usage/rollups`, `/metrics`
- Expectation: Z.ai offload is gated; samples may include `decision:"license_block"` where applicable — this is expected in dev.

Prod (Licensed Mode; stealth)
- What: Enables gated features (e.g., `zai_offload`).
- Everything you need is in-repo:
  - Policies: see `configs/` and policy loader in the shim (with signature verification).
  - Licensing: local issuer scaffold + harness under `services/go-anth-shim/cmd/licissuer` and `docs/LICENSING/**`.
- Two ways to supply a license:
  1) JSON + signature files (shim flags/env):
     - `CC_LICENSE_JSON=/path/license.json CC_LICENSE_SIG=/path/license.sig ./bin/ccp serve ...`
  2) Single-line pack + CLI (harness):
     - `cc license set "$(cat packs/real.pack)" && cc license status`
     - Shim will read/verify via embedded pubkeys and enable entitlements.
- Verify:
  - Startup log: `[license] plan=<plan> features=[..., zai_offload, ...]`
  - `/readyz` and `/v1/usage` include a `license` block `{ ok:true, plan, features }`
  - Haiku samples show `lane:"zai"`; metrics increment for `lane="zai"`.

Notes
- The repo includes a test issuer and placeholder packs for harness/testing. Production keys/packs are controlled, but the full flows and docs live here so no external dependency is required to run locally.
- CLI runs do not require `ANTHROPIC_AUTH_TOKEN`; the CLI supplies Authorization automatically. For curl, add an explicit header.

