# Session Handoff Notes

CCC_AGENT_CHAT: landed; R4 persistence endpoints live
- Changed paths:
  - services/go-anth-shim/cmd/ccp/store.go
  - services/go-anth-shim/cmd/ccp/store_sqlite.go
  - services/go-anth-shim/cmd/ccp/usage_persist_http.go
  - services/go-anth-shim/cmd/ccp/metrics.go
  - services/go-anth-shim/cmd/ccp/main.go
  - services/go-anth-shim/cmd/ccp/store_sqlite_test.go
  - services/go-anth-shim/cmd/ccp/usage_persistence_test.go
  - services/go-anth-shim/go.mod
  - scripts/perf/soak_persist.sh
  - docs/System/STORE.md
  - docs/OPS-GUIDE.md

Quick commands run + outputs
- Build tests: `cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...` → ok
- Start server: `CCP_PERSIST=1 CCP_DB_PATH=logs/ccp.sqlite3 ./bin/ccp serve --port 18082 &` → ok (pid printed)
- Readiness: `curl -s http://127.0.0.1:18082/readyz` → 200 JSON (upstreams may show timeout if offline)
- Samples: `curl -s http://127.0.0.1:18082/v1/usage/samples?since=0 | jq .` → JSON shape ok
- Rollups: `curl -s http://127.0.0.1:18082/v1/usage/rollups?granularity=hour | jq .` → JSON shape ok
- Metrics: `curl -s http://127.0.0.1:18082/metrics | rg 'ccp_store|ccp_rollup'` → counters/histogram/gauge present

Bundle
- Created: `~/Downloads/ccc_r4_persistence_bundle.zip`

Live UAT snapshot (local)
- Built CCP and started on :18092 with persistence enabled.
- T1 Haiku via CLI (FORCE_HAIKU_TO_ZAI=1) executed; license in community mode blocks Z.AI lane → anth lane used.
- POST /v1/messages (no Anth token) produced 401 from upstream but persisted samples.
- GET /v1/usage/samples?since=-1h → samples present for model `claude-haiku-4.5`.
- GET /v1/usage/rollups?granularity=hour → count reflects recent samples.
- GET /metrics → `ccp_store_writes_total` incremented; rollup histogram populated; store size gauge > 0.

Licensing status
- No license required for local use. The repo includes everything needed to run CCP, persistence, rollups, endpoints, and metrics in community mode.
- Optional features (e.g., `zai_offload`) are gated. In community mode, those lanes are disabled and samples record `decision:"license_block"` when applicable. This is expected and acceptable for UAT.

R5 SaaS Backlog created
- Plan: docs/roadmap/R5-SaaS-CLI.md
- Tickets: docs/Tasks/BACKLOG_R5_SaaS_CLI.md
- Next-agent sequence: see docs/TODO-NEXT-AGENT.md (R5 SaaS Backlog section)

## Investigation — Restore Haiku → Z.ai Routing (current blocker)
- **Symptom:** Haiku requests reach CCP but either fall back to the Anth lane (`decision:"license_block"`) or hit Z.ai and receive 5xx despite the Z.ai key working via direct curl.
- **Goal:** Recover a working configuration that routes Haiku to Z.ai with 200s, then reapply recent changes safely.
- **Owner:** Next agent (see doc below).

### Plan overview (doc/Tasks/PLAN_restore_zai_routing.md)
1. Identify the last known working commit (pre-licensing changes) and reproduce Haiku→Z.ai success there.
2. Diff/bisect to find the regression that broke routing.
3. Patch the current HEAD so Haiku requests succeed in licensed mode.
4. Update `results/TESTS.md` and this handoff with lane=zai evidence once fixed.

- ✅ 2025-10-26: Reproduced Haiku→Z.ai success on commit `dc3791e` via `scripts/repro-go-shim-quick.sh` (logs under `ClaudeCodeProxy-prelicense/logs/usage_go_repro_quick.jsonl`).
- ✅ 2025-10-26: Regression isolated to `44025be` (license gate). Current `master` now accepts env-supplied pubkeys (`CCP_LICENSE_PUBKEY_B64=KID=BASE64`) and the helper script regenerates exports with the right kid.
- ✅ 2025-10-26: Added `scripts/uat/run_haiku_zai.sh`, `scripts/uat/run_sonnet_anth.sh`, and `scripts/uat/run_haiku_sonnet.sh`; each prints the CLI JSON plus matching `lane` log lines (Z.ai 200 and Anth 200 with license disabled). |

- Network validation commands and curl recipes are outlined in `~/Desktop/haiku_zai_investigation.md` (copied here for continuity).

### Read these before coding
- `docs/SOP/PROFILES.md` (Dev vs Prod profiles; license verification)
- `docs/OPS-GUIDE.md` and `docs/System/STORE.md` (persistence + metrics context)
- `docs/roadmap/R5-SaaS-CLI.md`, `docs/Tasks/BACKLOG_R5_SaaS_CLI.md`, `docs/TODO-NEXT-AGENT.md`
- `AGENTS.md`, `README.md` (env conventions, `.env` credentials)
- `scripts/dev/dev-license-activate.sh` (trial pack helper)
- `~/Desktop/haiku_zai_investigation.md` (curl/key tests)


- See consolidated runbook: `docs/HANDOFF-CONSOLIDATED-SESSION.md:1`
- Go Shim Parity Session (non‑interactive)
  - Build + test: `make go-shim-build && make go-test`
  - Rotate logs: `make clean-logs`
  - Start shim: `ccc-on` (preferred; ensures env + tail). Manual fallback: `ZAI_API_KEY=$ZAI_API_KEY ./services/go-anth-shim/bin/ccp serve --port 8082 &`.
  - Env for curl (if using fallback): `export ANTHROPIC_BASE_URL=http://127.0.0.1:8082; export ANTHROPIC_AUTH_TOKEN=…`
  - Probes: run 3× haiku + 3× sonnet (see `make repro-go` or `scripts/repro-go-shim.sh`)
  - Summarize + verify: `node scripts/summarize-usage.js "${CCP_LOGS_DIR:-logs}/usage.jsonl" | tee "${CCP_RESULTS_DIR:-results}/METRICS_go_repro.json" && make verify-routing`
  - Acceptance: no Haiku on Anth lane; no Z.AI header on Anth lane; metrics present

- **2025-10-20 — Productization pilot (W0-CHN)**
  - commit_start: 12c843b38c91f2715dc9d85ec08c9a5daa73da0b
  - commit_end: 12c843b38c91f2715dc9d85ec08c9a5daa73da0b (no new commit)
  - Window / methodology: W0-CHN · mitm_offload
  - Toggles: MITM_FILTER_CHAIN=1, MITM_PORT=8082, FORCE_HAIKU_TO_ZAI=1, ZAI_HEADER_MODE=x-api-key, MITM_FORCE_H1=0, OFFLOAD_PAUSED=0
  - Key commands:
    - make install-local · bin/cc doctor · make clean-logs
    - MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm (background)
    - claude -p --model haiku/sonnet "ok" --output-format json (proxied)
    - bin/cc h|s --output-format json "say hi" (post-fix verification)
    - bin/cc verify · bin/cc quota · bin/cc productize-check · bin/cc bundle
  - Edits: bin/cc now forwards extra CLI args correctly and productize-check only flags Anthropics with explicit Z.AI headers (avoids null false-positives).
  - Metrics snapshot: results/METRICS.json updated (37 Z.AI completions, 0 errs, p50≈3.1s, p95≈19.4s).
  - Bundle: /Users/m/Downloads/agentos_tmp_review-20251020-120103{/, .tgz}
  - Notes: cc quota shows 33 Z.AI completions in the last 5h window (input tokens 13, output 628). Logs rotated via make clean-logs before session.

- Window: W0-CHN
- Methodology: mitm_offload
- Provider: codex
 - Commit start: fb5b833743f2dc0c8322ac39ceb1f6840150b37d
 - Commit end: fb5b833743f2dc0c8322ac39ceb1f6840150b37d

Environment snapshot
- MITM_PORT: 8082 (logs/mitm.pid contains current pid)
- Suggested subscription env:
  - `export HTTPS_PROXY=http://127.0.0.1:8082`
  - `export NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem"`
  - `unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN`
- Toggles:
- `FORCE_HAIKU_TO_ZAI=1` (default; set 0 only for explicit comparisons)
  - `MITM_FORCE_H1=0` (set 1 if H2 host retarget issues)
  - `ZAI_HEADER_MODE=x-api-key` (switch to `authorization` if 401s)
  - `MITM_ENABLE_BACKOFF=1` (log/enable backoff on 429/503; off by default)
  - `OFFLOAD_PAUSED=1` (manual failover pause; force Anthropic lane)

- Commands run (chronological):
  - 2025-10-23: `cd services/go-anth-shim/cmd/ccp && CCP_LOGS_DIR=logs go test ./...`
  - 2025-10-23: `cd services/go-anth-shim/cmd/licissuer && go test ./...`
  - 2025-10-23: `make test-aliases`
  - As needed: `make prune-results` (keeps the newest METRICS*.json files under `results/`).
  - Zero-touch toggle verification: `./scripts/install-shell-aliases.sh`; `zsh -lic 'ccc-status'`; `zsh -lic 'ccc-on'`; `zsh -lic 'ccc-logs'` (spawn/kill tail); `zsh -lic 'ccc-off'`; `zsh -lic 'ccc-restart 8182'`; `zsh -lic 'ccc-off'`.
  - make setup
  - installed mitmproxy==12.2.0 (user)
  - started mock upstream on :3001
  - started mitmdump with test redirect on :8082
  - claude -p "/status" --output-format json (work/sub)
  - export ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN; claude -p "/status" --output-format json (work/zai)
  - curl tests (if applicable)
  - started MITM live with FORCE_HAIKU_TO_ZAI=1 on :8082
  - T1: claude -p --model haiku "/status" --output-format json → Z.AI lane 200
  - restarted MITM with FORCE_HAIKU_TO_ZAI=0 on :8082
  - T2: claude -p --model sonnet "/status" --output-format json → Anthropic lane 200
  - T3: bash scripts/verify-sse.sh → streaming ok (Anthropic lane)
  - Burst: 5× Sonnet, 5× Haiku (forced) + parallel 4× Haiku
  - make summarize → results/METRICS.json
  - Observability upgrades: err_type, upstream, decision, h2, header_mode, op + new SSE chunk/duration stats in the summarizer.

 - Test matrix outcomes: see results/TESTS.md

Clean routing micro‑pilot (fresh session)
- pkill mitm on :8082; rotate logs; start MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1
- source scripts/sub-env.sh 8082
- 3× Haiku "Say ok"; 1× Sonnet "Say ok"
- Proof greps:
  - LOG_FILE="${CCP_LOGS_DIR:-logs}/usage.jsonl"
  - rg '"lane":"zai"' "$LOG_FILE" | rg 'haiku' | tail -n 5
  - rg '"lane":"anthropic"' "$LOG_FILE" | rg 'haiku' || echo "OK: none"
  - rg '"lane":"anthropic".*"header_mode":"x-api-key"' "$LOG_FILE" || echo "OK: no Z.AI header on Anthropic"
- make summarize && make verify-routing
- Result: no Haiku completions on Anthropic; Z.AI header present only on Z.AI lane; decisions to_zai ~89% for the small sample

## Next Agent Starter — Dual‑Terminal Pilot (45–60 min)
- Goals: Ship real work using two terminals: A=proxied (Haiku→Z.AI), B=stock Anthropic. Prove routing, capture metrics, bundle results.
- Preflight:
  - cd /Users/m/git/tools/ClaudeCodeProxy
  - git status (clean or commit)
  - Start MITM: MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm
  - Terminal A env: source scripts/sub-env.sh 8082
  - Optional login: claude; /login; /exit
- Terminal A (proxied):
  - Proofs: claude -p --model haiku "ok" --output-format json; claude -p --model sonnet "ok" --output-format json
  - Verify: make summarize && make verify-routing
  - Do 1–2 real tasks (code review/refactor); keep outputs concise.
- Terminal B (stock Anthropic): fresh shell (no HTTPS_PROXY), then claude; use for Sonnet‑only checks/parallel work.
- Wrap:
  - make summarize && make verify-routing
  - make bundle
  - Update results/TESTS.md and note toggles/versions/bundle path here.
- Toggles + triage:
  - H2 jitter → MITM_FORCE_H1=1 (restart MITM)
  - Z.AI 401s → ZAI_HEADER_MODE=authorization (restart MITM)
  - Pause offload → export OFFLOAD_PAUSED=1
- Tip: if port in use, pkill -f "mitmdump.*-p 8082" or use MITM_PORT=8083.
- Body‑tee: keep off by default (enable only for diagnostics).

## Reading & Repro (one place)
- Reading order: `docs/READING-LIST.md`
- Python MITM repro (non‑interactive): `make repro-py` → `results/METRICS_py_repro.json`, `results/PY-REPRO-SUMMARY.md`
- Go shim repro (non‑interactive): `make repro-go` → `results/METRICS_go_repro.json`, `results/GO-REPRO-SUMMARY.md`

## Silent Long Session
- Quick sanity (1× each, 60s timeouts): `make repro-go-quick`
- Overnight loop until both lanes succeed: `make overnight-go` (knobs: `MAX_MINUTES`, `TIMEOUT_SECS`, `SLEEP_BETWEEN`)
- Hygiene checks: `scripts/check-hygiene.sh "${CCP_LOGS_DIR:-logs}/usage.jsonl"`

### 2025-10-21 — Next Agent Run (Go shim)
- Quick proof: `make repro-go-quick` (same probes you get from `ccc-on` + two CLI calls; hygiene passed, Z.AI lane 200 captured)
  - Artifacts: `results/METRICS_go_repro_quick.json`, `logs/usage_go_repro_quick.jsonl`
- Overnight loop: `MAX_MINUTES=12 TIMEOUT_SECS=45 SLEEP_BETWEEN=8 make overnight-go`
  - Result: Z.AI completions present; Anthropic CLI OAuth 200 not captured within window (expected occasional stall; H1 toggled every 3 attempts).
  - Artifacts: `logs/usage_overnight_final.jsonl`, `results/overnight/METRICS_*.json`
  - Bundle: `~/Downloads/agentos_tmp_review-20251021-000744{,.tgz}`
- Next step (if you want to finish Anth lane proof now): re-run `make overnight-go` with higher `MAX_MINUTES` or use curl path if `ANTHROPIC_AUTH_TOKEN` is available in the shell.
- License check: run `make repro-go-quick` once with no license (expect `license_block` in the profile log), then export `CC_LICENSE_JSON`/`CC_LICENSE_SIG` for a signed license containing `zai_offload` to confirm Haiku returns to the Z.AI lane. For local proofs you can use `services/go-anth-shim/testdata/license/trial_license.{json,sig}` (expires in 7 days).

### Timeline — 2025-10-21 (Local trial unlock)
- `make go-proxy` → build/launch shim on `:8082`.
- `ccc-on` handles env automatically; manual fallback: `source scripts/go-env.sh 8082` → point CLI at shim (clears proxy vars).
- `export CC_LICENSE_JSON=services/go-anth-shim/testdata/license/trial_license.json`.
- `export CC_LICENSE_SIG=$(cat services/go-anth-shim/testdata/license/trial_license.sig)`.
- Prefer a single file? Save `{ "license": {...}, "signature": "BASE64" }` to `~/.config/ccp/license.pack` (or pass `--license-pack` / `CC_LICENSE_PACK`) and skip the separate JSON/SIG exports.
- Subsequent `claude -p --model haiku …` calls show `lane:"zai"` (paywall unlocked). Removing the exports reverts to `decision:"license_block"`.
- Need a fresh license? Run `go run services/go-anth-shim/cmd/licissuer/main.go --seed $PRIVATE_SEED_B64 --invites configs/invites.dev.json` and post `{ "invite_code": "DEV-TRIAL-7D", "email": "you@example.com" }` to `/v1/license/issue`.
- Quick regression: `ALLOW_REAL_API=1 make smoke-license` restarts the shim three times (no license → trial → no license) and asserts the lane/decision logs. Set `SMOKE_LANES=zai` when you need to run Z.AI-only without hitting Anthropic.
- License helpers: pipe a pack into `cc license set` to persist/validate, and `cc license status` (or the shortcut `ccp-license`) to inspect the active plan/kid/expiry without scanning logs.
- Device flow: when the issuer is running, `cc license login --no-browser --issuer http://127.0.0.1:8787 --invite DEV-TRIAL-7D` (also accessible via the dev profile) will fetch a fresh pack and store it under `~/.config/ccp/license.pack`. Add `--loopback` to capture the redirect automatically. `USE_LICENSE_LOGIN=1 make smoke-license` reuses that path inside the smoke harness.
- Daily workflow shortcuts: `ccc-on [port]`, `ccc-off`, `ccc-status`, `ccc-logs`, `ccc-restart`, `ccp-haiku`, `ccp-sonnet` auto-load once you run `./scripts/install-shell-aliases.sh` (manual fallbacks: `ccp-start/env/stop`).
- Profiles: use `bin/ccp` (or `source scripts/env/prod.sh`) for production shells and `bin/ccc` (or `source scripts/env/dev.sh`) for isolated dev work. See `docs/ops/environment-profiles.md` for details.
- CI-friendly regression: `go test ./...` exercises the issuer + shim logic without consuming CLI tokens. Run this before bundle if you cannot (or must not) trigger `claude -p`.
- Pending follow-ups:
  - `docs/Tasks/ccc_upstream_policy_followup.md` — upstream env hardening + policy cache relocation (run CE planner first).
  - `docs/Tasks/mitm_strip_thinking.plan.md` — GLM→Anthropic thinking sanitizer plan.

## 2025-10-23 R0 hardening (readyz/metrics/log retention)
- Commands executed
- `cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...`
- `./bin/cc usage --banner`
- `./bin/cc partials`
- `./bin/cc verify`
- Notes
  - Added `/readyz` + `/metrics` handlers, time-based log rotation, usage meter CLI, and partial stream persistence.
  - Avoided new external modules (Prometheus libs) due to offline environment; implemented lightweight metrics writer instead.
  - Updated docs (`OPS-GUIDE`, `System/logging-retention`, `PROD-TESTS`) to reflect new knobs and workflows.

-### 2025-10-21 — Go shim parity pass (manual)
- Steps:
  1. `make go-proxy`
  2. In same shell (if aliases unavailable): `source scripts/go-env.sh 8082`
  3. `claude -p --model sonnet "Say ok" --output-format json`
  4. `claude -p --model haiku "Say ok" --output-format json`
- Result: Anth lane 200 (`logs/usage_go_parity_run.jsonl:8`); Z.AI lane 200 (`:5-7,12,14,15`)
- Artifacts: `results/METRICS_go_parity_run.json`, `logs/usage_go_parity_run.jsonl`


## 2025-10-20 P0.1 Polishing Session
- Focus: HTTP/2 vs HTTP/1 latency check and Z.AI header mode validation.
- MITM runs: scripts/demo-clean-routing.sh orchestrated each A/B pass (auto-rotates logs, restarts mitmdump under :8082).
- Key env toggles exercised:
  - `MITM_FORCE_H1=1` (HTTP/1 run only; reset before wrap-up)
  - `ZAI_HEADER_MODE` cycled between `x-api-key` and `authorization`
  - `ENABLE_BODY_TEE=1` (temporary; diagnostics only — opt-in when sampling payloads)
  - `CLAUDE_CODE_SUBAGENT_MODEL=haiku` optional convenience toggle
- Artifacts captured:
  - `results/H1H2-AB.md`, `results/ZAI-Header-AB.md`
  - Metrics snapshots: `results/METRICS_h2.json`, `results/METRICS_h1.json`, `results/METRICS_xapikey.json`, `results/METRICS_bearer.json`
  - Log snapshots: `logs/usage_h2.jsonl`, `logs/usage_h1.jsonl`, `logs/usage_xapikey.jsonl`, `logs/usage_bearer.jsonl`
  - Bundle: `/Users/m/Downloads/agentos_tmp_review-20251020-110857{,.tgz}`
- Observations:
  - HTTP/1 shaved ~10% off median latency for Z.AI probes; p95 unchanged.
  - Bearer header removed sporadic `err_type:"net"` entries but introduced higher p50 (~+50%). Default remains `x-api-key`.
  - (Marker hunt retired) Routing remains model-based by default; no metadata probe required.
- Next operator: start from `docs/methodology/post-polish-session-plan.md` to design the extended pilot block (5h Sonnet vs 5h GLM).

## Next Agent — Optional Go Shim Spike
- Read: `services/go-anth-shim/README.md`, `docs/methodology/NEXT-AGENT-GO-SHIM.md`
- Build & run shim on :8082: `make go-shim-build && PORT=8082 make go-shim-run`
- Point Claude with `export ANTHROPIC_BASE_URL=http://127.0.0.1:8082` and prove routing as usual
- Run `make summarize && make verify-routing && make bundle`

## 2025-10-23 R1 — Provider Catalog & Routing (Phase 1–3 partial)
- Branch: feature/r1-routing (from handoff/r0-clean)
- Commands executed
  - git switch -c feature/r1-routing
  - apply patches per docs/Tasks/ccp_r1_execution_plan.md:
    - Added YAML dep: services/go-anth-shim/go.mod (gopkg.in/yaml.v3 v3.0.1)
    - New loader: services/go-anth-shim/cmd/ccp/providers_config.go
    - Example catalog: configs/providers.example.yaml
    - main.go: load catalog, add repoRoot(), extend decideLane() to consult catalog routes; add --print-providers path
    - bin/cc: fixed `cc providers` to cd into submodule and set CCC_REPO_ROOT/CCP_PROVIDERS_FILE
  - GOPROXY=direct GOSUMDB=off go mod tidy
  - cd services/go-anth-shim && go test ./...  → OK
  - ./bin/cc providers → OK (prints empty catalog without config)
  - CCP_PROVIDERS_FILE=configs/providers.example.yaml ./bin/cc providers → prints validation error (local provider lacks key_env). Intentional for now; leave example as reference.
- Notes
  - decideLane returns "anthropic" for Anth lane to keep existing logs/tools consistent (minor deviation from plan’s "anth").
  - Readiness probe wiring for provider catalog is deferred; R0 `/readyz` expectations may not reflect catalog yet.
  - Future executor should finalize fallback helper and precedence tests as per plan TODOs.

## 2025-10-23 UAT (MITM path)
- Reason: Go shim offload gated by license; test license failed verification (see `logs/ccp.out`). Pivoted to MITM to complete T1–T3.
- Commands
  - `make clean-logs`
  - `MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 nohup bash scripts/run-mitm.sh > logs/mitm.live.out 2>&1 & echo $! > logs/mitm.pid`
  - `HTTPS_PROXY=http://127.0.0.1:8082 NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem" ANTHROPIC_BASE_URL= ANTHROPIC_AUTH_TOKEN= timeout 45s claude -p --model haiku "/status" --output-format json`
  - `HTTPS_PROXY=http://127.0.0.1:8082 NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem" ANTHROPIC_BASE_URL= ANTHROPIC_AUTH_TOKEN= timeout 45s claude -p --model sonnet "/status" --output-format json`
  - `HTTPS_PROXY=http://127.0.0.1:8082 NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem" ANTHROPIC_BASE_URL= ANTHROPIC_AUTH_TOKEN= timeout 60s claude -p "Generate 80 lines of numbered text quickly."`
  - `node scripts/summarize-usage.js logs/usage.jsonl | tee results/METRICS_uat_mitm.json`
  - `node scripts/verify-routing.js logs/usage.jsonl`
- Outcomes
  - `[verify-routing] decisions: 8/8 to_zai (100.0%)`
  - Completions by lane: anthropic=0 zai=9 unknown=6 (unknown lines are decision/error markers — OK for P0)
  - Added representative lines and summary to `results/TESTS.md` under “2025-10-23 UAT (MITM path)”.

## 2025-10-23 R1 verification (MITM path)
- Commands
  - `make clean-logs`
  - `MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 nohup bash scripts/run-mitm.sh > logs/mitm.live.out 2>&1 & echo $! > logs/mitm.pid`
  - `HTTPS_PROXY=http://127.0.0.1:8082 NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem" ANTHROPIC_BASE_URL= ANTHROPIC_AUTH_TOKEN= timeout 45s claude -p --model haiku "/status" --output-format json`
  - `HTTPS_PROXY=http://127.0.0.1:8082 NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem" ANTHROPIC_BASE_URL= ANTHROPIC_AUTH_TOKEN= timeout 45s claude -p --model sonnet "/status" --output-format json`
  - `HTTPS_PROXY=http://127.0.0.1:8082 NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem" ANTHROPIC_BASE_URL= ANTHROPIC_AUTH_TOKEN= timeout 90s claude -p "Generate 40 lines of quick numbered text."`
  - `node scripts/summarize-usage.js logs/usage.jsonl | tee results/METRICS_uat_r1.json`
  - `node scripts/verify-routing.js logs/usage.jsonl`
- Outcomes
  - `[verify-routing] decisions: 9/9 to_zai (100.0%)`
  - Completions by lane: anthropic=0 zai=10 unknown=6.
  - Metrics captured in `results/METRICS_uat_r1.json`.

## R1 Shim Additions in this session
- Manual model override honored by shim via `~/.config/ccp/model` or `CCP_MODEL`; decision logs include `manual_override`.
- Added `/readyz` JSON endpoint probing configured providers (2s timeout; 200–405 treated as reachable).
- JSON request timeout env: `CCP_JSON_TIMEOUT` (default 30s).
- SSE idle cutoff via `CCP_SSE_IDLE_TIMEOUT` (default 120s) → logs `reason:"stream_timeout"` + `err_type:"idle_timeout"` on idle abort.
- Transport knobs: `CCP_DIAL_TIMEOUT`, `CCP_DIAL_KEEPALIVE`, `CCP_TLS_TIMEOUT`, `CCP_HEADER_TIMEOUT` feed the shared http.Transport.
- Atomic JSONL writes and rotation mutex to avoid interleaving and rename races.
- Added targeted unit tests: catalog precedence/invalid, manual override, readyz error, fallback header hygiene, SSE idle timeout.

## Scout Notes for R1 (Multi-model connectors)
- Task reference: `docs/tasks/ccp2-review.md:74-99` outlines the exact R1 deliverables, acceptance tests, and touchpoints.
- Before planning, follow the planning SOP (`docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`) — run the Magic Prompt verbatim once discovery is gathered.
- Required discovery/context for the planner:
  1. Review current shim entrypoints (`services/go-anth-shim/cmd/ccp/main.go`, `metrics.go`, `partial.go`) to understand decision logging and lane handling introduced in R0.
  2. Inspect CLI helpers (`bin/cc`, `scripts/shell/ccc-aliases.sh`) to see how `/model` switches and usage banners currently work.
  3. Check existing docs for routing expectations: `docs/OPS-GUIDE.md:36-115`, `docs/PROD-TESTS.md:1-92`.
- Planning expectations:
  - Use the Magic Prompt structure to enumerate targeted files (e.g., new `providers.yaml` loader module, updates to `cmd/ccp/main.go`, CLI switches) and validation commands (`go test`, new integration scripts).
  - Call out what remains in scope (R1 items only) vs. deferred (pipelines, observability, etc.).
  - Include rollback for config files (`~/.config/ccp/providers.yaml`) and logs if new ingest scripts are added.
- Out-of-scope reminders for the planner/executor:
  - Do not edit R2+ deliverables (pipeline DSL, TUI).
  - Leave existing R0 health/log infrastructure untouched unless the plan requires hook points.
- When handing back, update this section with the executed Magic Prompt plan link and add new commands/tests to the bullet list above.

---

R1 Pre‑execution cleanup (this session)

Commands executed
- rm -f services/go-anth-shim/cmd/ccp/providers_config.go configs/providers.yaml configs/providers.example.yaml
- git checkout -- services/go-anth-shim/cmd/ccp/main.go services/go-anth-shim/go.mod services/go-anth-shim/cmd/ccp/main_test.go services/go-anth-shim/cmd/ccp/main_extra_test.go
- rm -f services/go-anth-shim/go.sum
- Patched shim to use function log paths (usageLogPath()/anomaliesLogPath()) and licensePubKeys map.
- Verified tests: `cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...` → ok

Notes
- R0 baseline is green; R1 catalog wiring intentionally absent.
- Next agent should start from docs/Tasks/ccp_r1_execution_plan.md and docs/Tasks/R1_HANDOFF.md.

---

R2 — Quotas, Budget Guards, Light Metrics (this session)

Commands executed
- cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...  → green
- Started shim locally to verify endpoints: ./services/go-anth-shim/bin/ccp serve --port 8082 &
- Dev simulate (for local proofs): export CCP_DEV_ENABLE=1; curl -s -X POST :8082/v1/dev/sim-usage -d '{"model":"claude-haiku-4.5","in":200,"out":300,"repeat":1}' -H 'content-type: application/json'
- Inspect usage and quotas: curl -s :8082/v1/usage | jq; curl -s :8082/v1/quotas | jq; ./bin/cc status (table shows TPS + peak hour)

What changed
- Implemented quotas engine MVP (services/go-anth-shim/cmd/ccp/quotas.go): loader precedence, rolling/weekly accounting, /v1/usage, /v1/quotas, /v1/quotas/reload, optional /v1/dev/sim-usage.
- Wired quotas into routes and hooked RecordUsage from completion path.
- Added light metrics and exposed /metrics; readiness updates set per‑lane gauges.
- Fixed minor status code scoping in handler; ensured atomic JSONL writes remain intact.
- Added quotas tests (services/go-anth-shim/cmd/ccp/quotas_test.go) covering loader precedence, warn/block flags, reload validation, and hot reload.
- Docs updated: docs/QUOTAS.md (CLI + acceptance) and docs/OPS-GUIDE.md (observability quick checks add `cc status`).

Acceptance
- go test ./... passes including new quotas tests.
- /v1/usage reflects rolling/weekly % and toggles warn at ≥80% and block at 100%.
- Hot reload works via POST /v1/quotas/reload; config path shows the active source.
- ./bin/cc status prints the quotas + speeds snapshot (rolling/session TPS, peak hour).

R2 Follow-ups completed (2025‑10‑23)
- Weekly window semantics corrected (tokens/hours computed strictly over `weekly_seconds`); rolling ETA based on oldest sample within rolling window.
- Streaming partials metric: abnormal SSE endings create `logs/partials/<rid>.partial` and increment `ccp_partial_writes_total`.
- CLI helper added: `./bin/cc quotas reload [FILE]` to hot‑reload quotas without restart.
- Quick checks:
  - `./bin/cc status`
  - `./bin/cc quotas reload configs/quotas.json`
  - `curl -s :8082/v1/usage | jq` and `curl -s :8082/v1/quotas | jq`

R2.5 Closeout (2025‑10‑23)
- Branch: `feature/r2-quotas` → PR #1 open against `master`.
- Acceptance recap: all `cmd/ccp` tests pass; `/metrics` and `/readyz` healthy; `cc status` and `cc quotas reload` functional; quota block reroutes correctly with `decision:"quota_block"`.
- Ops polish: added explicit `/readyz` semantics (200–405 OK with `reason`) to `docs/OPS-GUIDE.md`.
- Repo hygiene: removed tracked `.DS_Store` files; ignores remain.
- Local housekeeping: split artifacts from `~/6.md` archived under `~/git/personal/archive/6md-split-<ts>/`; personal tmp deduped against repo.

R3.5 Prep (Quota Hardening — next agent)
- Reference plan: `docs/Architecture/AGENTOS_CCP_BRIDGE_PLAN.md` (integration summary) and `docs/Tasks/R3_5-QUOTA-HARDENING.md` (detailed checklist).
- Key supporting docs copied in this session:
  - `docs/System/contracts/USAGE_EVENT_SCHEMA.md` — event schema for cross-project ingestion.
  - `docs/System/integration/agentos-ccc-integration-plan.md` + `agentos-ccc-decision-log.md` — bridge notes with AgentOS.
  - `docs/tests/R3-FALLBACK-429.md`, `docs/tests/R3-SPEEDS-FIXTURES.md` — fixture references for the upcoming tests.
  - `docs/Experiments/GLM_LIMIT_PROBE.md` + `scripts/experiments/glm-limit-probe.sh` — GLM window measurement harness.
- CLI/metrics state: `cc status` table includes tokens/sec and headroom; `cc quotas` now shows configs; hybrid reroute skeleton is in place (run-to-limit + cooldown logging).
- All calibration/reroute work is deferred to the next agent; no changes to behavior beyond logging improvements were made in this session.

R3.5 Planner Update (2025-10-23)
- Updated `docs/Tasks/R3_5-QUOTA-HARDENING.md` with step-level plan covering reroute modes, calibration sampler, schema changes, instrumentation, and GLM probe ingestion (tokens-only enforcement preserved).
- Added coding-agent execution brief `docs/Tasks/R3_5-CODING_MAGIC_PROMPT.md` outlining per-file work items, env knobs, tests, and validation commands (stay on branch `feature/r3-hud-and-tokens`).
- Key code hotspots for implementation: `services/go-anth-shim/cmd/ccp/main.go` (reroute switch + cooldown), `quotas.go` (bias table + /v1/usage additions), `metrics.go` (new counters), CLI updates, fixtures, and docs.
- Instrumentation + logging alignment: extend `usageEntry` and `/v1/usage` to report `warn_pct_auto`, gap percentiles, reroute decision metadata; metrics to expose preferred attempts, reroute counts, wasted retries.
- GLM probe harness ready: `docs/Experiments/GLM_LIMIT_PROBE.md` + `scripts/experiments/glm-limit-probe.sh`; next agent should run experiment after code lands and capture findings in `results/GLM_LIMIT_PROBE.md`.
- Open questions to resolve while coding: fallback confidence thresholds, vendor-specific 429 detection, cooldown persistence across restarts (documented limitation).

R3.5 Validation (2025-10-24)
- Automated:
  - `cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...`
  - `make check-licenses`
- Manual shim smoke (dev profile):
  - `CCP_QUOTAS_FILE=/tmp/r35-quota-demo.json CCP_REROUTE_MODE=hybrid CCP_DEV_ENABLE=1 ./services/go-anth-shim/bin/ccp serve --port 8082`
  - `curl -sS -X POST :8082/v1/dev/sim-usage -H 'content-type: application/json' -d '{"model":"claude-haiku-4.5","in":120,"out":90,"repeat":2,"seconds":30}'`
  - `curl -sS -X POST :8082/v1/dev/sim-usage -H 'content-type: application/json' -d '{"model":"claude-3.5-sonnet","in":200,"out":150,"repeat":1,"seconds":45}'`
  - `curl -s :8082/v1/usage | jq '.models["claude-haiku-4.5"] | {rolling_pct,warn_pct_auto,warn_pct_confidence,gap_seconds_p50}'`
  - `curl -s :8082/v1/messages -H 'content-type: application/json' -H 'anthropic-version:2023-06-01' -d '{"model":"claude-haiku-4.5","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'`
  - `curl -s :8082/metrics | head -n 40`
  - `tail -n 5 logs/dev/usage.jsonl` → confirms `quota_warn_attempt` decision metadata and new log fields.
- Collected artifacts in `/tmp/r35-metrics.prom` and `/tmp/r35-usage-tail.log` for reference.
