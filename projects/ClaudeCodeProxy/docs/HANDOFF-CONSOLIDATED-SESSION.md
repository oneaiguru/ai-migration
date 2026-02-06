# Consolidated Handoff — Claude Code Proxy (Go Shim + MITM)

Rule (operate in silent, non‑interactive mode)
- Use the provided scripts/Make targets; avoid ad‑hoc interactive steps.
- Prefer quick probes with short timeouts; escalate via H1 toggle; loop until acceptance gates are met.
- Never cross‑leak headers; do not log bodies; preserve SSE (no buffering).

Objectives
- Keep Sonnet/Opus on Anthropic subscription OAuth (Authorization passthrough from Claude CLI).
- Route all Haiku to GLM (Z.AI) via local Go shim; no MITM/CA required for daily use.
- Prove routing + hygiene with logs/metrics and bundle deliverables.

Key Commands (non‑interactive)
- Quick sanity (1× each; 60s timeouts): `make repro-go-quick` (same probes as `ccc-on` + two CLI calls)
- Overnight loop (stop only when both lanes have a 200): `make overnight-go`
  - Knobs: `MAX_MINUTES=30 TIMEOUT_SECS=45 SLEEP_BETWEEN=8 make overnight-go`
- Full Go repro (3×+3× curl or CLI fallback): `make repro-go`
- H1/H2 A/B (Go shim): runs in steps above; artifacts listed below.
- MITM T1–T3 (reference P0 proofs): `make repro-py`

Environment notes
- Start shim: `ccc-on` (installs aliases if needed, launches shim, exports proxy vars)
- `ccc-status` verifies active port/profile; `ccc-logs` tails usage (`Ctrl-C` to stop tail)
- Manual fallback: `make go-proxy` then `source scripts/go-env.sh 8082`
- Z.AI key is read from `ZAI_API_KEY` or first non‑comment line in `.env`.
- Tune retention with `CCP_LOG_MAX_BYTES` / `CCP_LOG_MAX_FILES` (see `docs/System/logging-retention.md`).
- Policy packs: `./services/go-anth-shim/bin/ccp serve --policy-url <https://.../policy.json> --policy-pubkey <path/to/pubkey>`
  - The shim fetches `policy.json` + `policy.json.sig`, verifies the detached Ed25519 signature, caches `$CCP_LOGS_DIR/policy-cache.json` (fallback `logs/policy-cache.json`), and refuses expired packs. Public hosting is fine because the pack contains no secrets.
- Licensing: supply `CC_LICENSE_JSON` + `CC_LICENSE_SIG` (or the corresponding flags) to unlock Haiku→Z.AI. Without a valid license the shim logs `"decision":"license_block"` and keeps Haiku on the Anth lane.

Acceptance gates
- No Haiku on Anth lane, and no Z.AI header on Anth lane.
- At least one 200 completion per lane (Anthropic+Z.AI).
- Results JSON present; bundle generated under `~/Downloads`.

Artifacts (created this session)
- Metrics
  - `results/METRICS_go_repro_quick.json`
  - `results/METRICS_h2_real_go.json`, `results/METRICS_h1_real_go.json`
  - `results/METRICS_py_repro.json`
  - Rolling: `results/overnight/METRICS_*.json` (when overnight runner used)
- Logs
  - `logs/usage_go_repro_quick.jsonl`, `logs/usage_h2_real_go.jsonl`, `logs/usage_h1_real_go.jsonl`
  - Final overnight snapshot: `logs/usage_overnight_final.jsonl` (when used)
- A/B notes
  - `results/H1H2-AB-real-go.md`
- Bundles
  - `~/Downloads/agentos_tmp_review-20251020-222413(.tgz)` (MITM proofs)
  - `~/Downloads/agentos_tmp_review-20251020-225422(.tgz)` (Go shim H1/H2)

Files to read (code)
- Shim logic and auth passthrough
  - `services/go-anth-shim/cmd/ccp/main.go:66` (server struct)
  - `services/go-anth-shim/cmd/ccp/main.go:81` (newServer; H1 toggle, clients)
  - `services/go-anth-shim/cmd/ccp/main.go:108` (decideLane)
  - `services/go-anth-shim/cmd/ccp/main.go:134` (handleMessages; SSE, auth selection, JSON vs stream clients, 401 retry for JSON)
  - `services/go-anth-shim/cmd/ccp/main.go:59` (anthropicVersion)
- Shim tests (green)
  - `services/go-anth-shim/cmd/ccp/main_test.go:1`
  - `services/go-anth-shim/cmd/ccp/main_extra_test.go:1`
- Python MITM addon (reference)
  - `services/mitm-subagent-offload/addons/haiku_glm_router.py:62` (_detect_subagent)
  - `services/mitm-subagent-offload/addons/haiku_glm_router.py:153` (request)
  - `services/mitm-subagent-offload/addons/haiku_glm_router.py:276` (response)
  - `services/mitm-subagent-offload/addons/haiku_glm_router.py:397` (error)

Operator scripts
- Quick CLI proof (1× each; 60s timeouts): `scripts/repro-go-shim-quick.sh:1`
- Full Go repro (3×+3×; curl or CLI): `scripts/repro-go-shim.sh:1`
- Overnight loop (auto‑escalation + bundle): `scripts/overnight-go-shim.sh:1`
- Hygiene checks: `scripts/check-hygiene.sh:1`
- Per‑call timeout helper: `scripts/with-timeout.sh:1`
- MITM runner (reference P0): `scripts/run-mitm.sh:1`, `scripts/repro-py-mitm.sh:1`

Toggles & safety
- `MITM_FORCE_H1=1` → disable upstream HTTP/2 (shim and MITM)
- `ZAI_HEADER_MODE=authorization|x-api-key` → set Z.AI header style
- `OFFLOAD_PAUSED=1` → force Anth lane (failover)
- Invariants: never log bodies; strip foreign headers per lane; no SSE buffering.
- Logs: automatic rotation at ~5 MB keeps five generations; manual trigger `make logs-rotate`.

Known quirks
- CLI OAuth can stall sporadically on Sonnet in some shells; short timeouts + H1 toggle typically clear it. Use `make overnight-go` to self‑heal and prove a completion.
- H1/H2 metrics may vary by network; H1 can reduce p50 for Z.AI.

Next agent TODOs
- Packaging: add Homebrew tap + winget manifests; codesigning notes.
- Log rotation policy/retention for `logs/` and `results/`.
- Optional: enrich summarizer with decision vs completion counts split by op (stream/nonstream).
- Subagent marker: if/when reliable field confirmed, tighten `_detect_subagent()` and add a test sample.
- Real‑world SSE long‑run timing per lane; record p50/p95 chunk gaps.

Tracker (optional)
- Start meter: `source ~/git/tools/agentos/scripts/tracker-aliases.sh && os --window W0-CHN --notes "subagent start"`
- Complete + churn per your SOP; include commit_start and commit_end.

Definition of Done (for this handoff)
- Run `make repro-go-quick` → Z.AI completion exists; hygiene OK.
- Run `make overnight-go` → Both lanes at least one 200; hygiene OK; bundle produced in `~/Downloads`.
