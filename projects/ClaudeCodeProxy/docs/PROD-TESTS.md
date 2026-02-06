# Prod Usage E2E Tests (Python MITM + Go Shim)

Purpose
- Run the exact non-interactive proofs we use to validate routing, SSE integrity, and header hygiene for both implementations.
- Produce standardized artifacts in `results/` and `logs/` for handoff and bundle.

Preflight
- Repo root: `cd /Users/m/git/tools/ClaudeCodeProxy`
- Start proxy via `ccc-on` (preferred) so the shim, proxy exports, and tails come up automatically.
- Manual fallback: `make go-proxy` then `source scripts/go-env.sh 8082`.
- Ensure `claude` CLI is authorized (optional; Go path uses curl).
- Ensure keys in env or `.env`:
  - `ZAI_API_KEY` (Z.AI)
  - `ANTHROPIC_AUTH_TOKEN` (Anthropic; used by Go shim curl path)

Acceptance Gates (both paths)
- No Haiku completions on Anthropic lane
- No Z.AI `header_mode` on Anthropic lane
- `curl -s http://127.0.0.1:8082/readyz | jq` shows HTTP 200 with `anth` and `zai` `ok: true` (and any catalog providers listed)
- `./bin/cc providers` succeeds and shows the resolved lanes (anth, zai, plus any catalog providers)
- `results/METRICS*.json` present; `logs/usage.jsonl` rotated before run

Python MITM — non-interactive repro
1) Rotate logs and start MITM on `:${PORT:-8082}`
   - `make clean-logs`
   - `MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm &`
   - `source scripts/sub-env.sh 8082`
2) Run probes (3× haiku + 3× sonnet)
   - `claude -p --model haiku  "Say hi" --output-format json`
   - `claude -p --model sonnet "Say hi" --output-format json`
   - Repeat 3× (script does this)
3) Summarize + proofs
   - `node scripts/summarize-usage.js logs/usage.jsonl | tee results/METRICS_py_repro.json`
   - `rg -n '"lane":"anthropic".*haiku' logs/usage.jsonl || echo "OK: no Haiku on Anth lane"`
   - `rg -n '"lane":"anthropic".*"header_mode":' logs/usage.jsonl || echo "OK: no Z.AI header on Anth lane"`

Shortcut
- `make repro-py`
- Artifacts:
  - `results/METRICS_py_repro.json`
  - `results/PY-REPRO-SUMMARY.md`
  - `logs/usage.jsonl` (rotated before run)

Go Shim — non-interactive repro
1) Build + start shim on `:${PORT:-8082}`
   - `ccc-on` (preferred)
   - Manual fallback: `make go-proxy`; export `ANTHROPIC_AUTH_TOKEN=…` for curl runs; `source scripts/go-env.sh 8082` if invoking CLI directly
2) Run probes (3× haiku + 3× sonnet via curl)
   - See `scripts/repro-go-shim.sh` for exact curl blocks
3) Summarize + proofs
   - `node scripts/summarize-usage.js logs/usage.jsonl | tee results/METRICS_go_repro.json`
   - Same two `rg` proofs as Python
   - Review the per-lane SSE section for chunk counts, durations, and total bytes (helps confirm long streams stayed healthy).

Shortcut
- `make repro-go`
- Artifacts:
  - `results/METRICS_go_repro.json`
  - `results/GO-REPRO-SUMMARY.md`
  - `logs/usage.jsonl` (rotated before run)

Quick CLI path (no token; very fast)
- Use the Claude CLI to exercise pass‑through OAuth and the shim. This runs 1× per model with 60s timeouts.

1) Run: `make repro-go-quick` (same probes as `ccc-on` + two CLI calls)
   - Starts shim on :8082, rotates logs, runs 1× haiku + 1× sonnet with per‑call 60s timeouts.
2) Summarize + proofs
   - `node scripts/summarize-usage.js logs/usage.jsonl | tee results/METRICS_go_repro_quick.json`
   - `rg -n '"lane":"anthropic".*haiku' logs/usage.jsonl || echo "OK: no Haiku on Anth lane"`
   - `rg -n '"lane":"anthropic"[^\n]*"header_mode":' logs/usage.jsonl || echo "OK: no Z.AI header on Anth lane"`
   - Expect small `sse` metrics because the quick script only streams briefly.

SSE Health (Anthropic lane)
- `bash scripts/verify-sse.sh`
- Accept if stream completes without stalls; `logs/usage.jsonl` has a `reason:"streaming"` entry and a final OK line.

H1/H2 A/B (Go shim)
1) H2 (default): rotate logs, run 5× haiku + 5× sonnet (curl); save `results/METRICS_h2_real_go.json` and a snapshot of `logs/usage_h2_real_go.jsonl`.
2) H1: restart shim with `MITM_FORCE_H1=1`, repeat; save `results/METRICS_h1_real_go.json` and `logs/usage_h1_real_go.jsonl`.
3) Compose quick note in `results/H1H2-AB-real-go.md`.

Bundle
- `make bundle` to collect current logs + results into the review archive.

Policy pack (optional)
- Signed packs can be hosted publicly. Run the shim with:
  - `./services/go-anth-shim/bin/ccp serve --policy-url https://example.com/policy.json --policy-pubkey keys/policy.pub`
  - Public key file must contain a base64 Ed25519 key. The shim fetches `policy.json` and `policy.json.sig`, verifies the detached signature, and caches the last-known-good copy under `$CCP_LOGS_DIR/policy-cache.json` (fallback `logs/policy-cache.json`).
  - Sample pack: `services/go-anth-shim/testdata/policy/example.policy.json` with signature and public key in the same directory (serve via `python -m http.server`).
  - Pack verification failures fall back to the embedded default (Haiku→Z.AI, Sonnet/Opus→Anthropic).

License quick check
- Community mode (no license) ➜ `make repro-go-quick` logs `"decision":"license_block"` and routes Haiku via the Anth lane.
- Pro mode ➜ provide a signed license (feature `zai_offload`) via `CC_LICENSE_JSON`/`CC_LICENSE_SIG` or the matching flags, then rerun `make repro-go-quick`; Haiku should reappear on the Z.AI lane. A bundled 7-day trial lives at `services/go-anth-shim/testdata/license/trial_license.json` + `.sig` for quick validation.
- Prefer a single bundle? Save `{ "license": {...}, "signature": "BASE64" }` to `~/.config/ccp/license.pack` (or pass `--license-pack` / `CC_LICENSE_PACK`). The helper script also understands packs: `jq '{license:.license,signature:.sigB64}' lic.json | cc license set` followed by `cc license status` confirms the active plan.
- Prefer device login instead of manual packs?
  - Start the issuer locally (`go run services/go-anth-shim/cmd/licissuer/main.go --seed …`).
  - Run `cc license login --issuer http://127.0.0.1:8787 --no-browser --invite DEV-TRIAL-7D` to fetch and persist the pack. Add `--loopback` when you want the CLI to auto-handle the redirect over localhost.
  - `USE_LICENSE_LOGIN=1 make smoke-license` exercises the same flow inside the smoke harness (falls back to JSON/SIG when unset).
- To mint additional trial licenses locally, run the invite issuer: `go run services/go-anth-shim/cmd/licissuer/main.go --seed $PRIVATE_SEED_B64 --invites configs/invites.dev.json` and hit `/v1/license/issue` with one of the sample codes.
- Smoke automation: `ALLOW_REAL_API=1 make smoke-license` runs the three toggles above (community → trial → community) and fails fast if the routing or logs regress. Set `SMOKE_LANES=zai` if you only want the Z.AI leg.

Log rotation
- Automatic rotation triggers when `logs/usage.jsonl` exceeds ~5 MB **or** its age passes `CCP_LOG_MAX_AGE` (default 24h). The shim keeps the last five copies.
- Manual trigger: `make logs-rotate` (honours `MAX_LOG_BYTES` and `CCP_LOG_MAX_AGE`).
- Streaming failures leave breadcrumbs in `logs/partials/*.partial`. Inspect them with `./bin/cc partials` and prune with `./bin/cc partials clean` after review.

Pointers
- Read order: `docs/READING-LIST.md`
- Long session flow: `docs/HANDOFF-LONG-SESSION.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
