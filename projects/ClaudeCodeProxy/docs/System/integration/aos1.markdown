##  **AgentOS Coding Agent: Execution Plan (start now)**

> Create/modify paths are suggestions; adapt to your repo layout.

### Epic A1 — CCC API Client (Python)

- **Create:** `agentos/integrations/ccc_client.py`
  - Methods: `start_session()`, `log_event()`, `end_session()`, `upload_minimized_metrics()`, `license_handshake()`
  - **Config:** `AGENTOS_CCC_BASE_URL`, `CCC_API_KEY`, `LICENSE_PACK_PATH`, `PRIVACY_TIER`
- **Acceptance:**
  - Can open/close a session and send a synthetic `turn` + `measurement`.
  - If `PRIVACY_TIER=local`, network calls are no‑ops.
  - License handshake validates a local pack or remote issuer per ADR. 

### Epic A2 — Unified Event Schema (local models)

- **Create:** `agentos/schemas/v1/{session,turn,feature,measurement,cost,value}.json` (mirror CCP’s metrics schema; include compatibility tests). 
- **Create:** `agentos/metrics/rollup.py` to compute **CLS, IMPF, churn‑score**, features/capacity; write to `metrics_summary.json`. (Names per workflow metrics spec.) 
- **Acceptance:** JSON Schema validation passes; round‑trip from event → local log → summary file.

### Epic A3 — Privacy/Telemetry tiers

- **Create:** `agentos/privacy/tier.py` with strategies: `LocalOnly`, `Minimized`, `Full`.
- **Wire:** `ccc_client.upload_minimized_metrics()` only sends summaries for Minimized; Full can send redacted events.
- **Acceptance:** Setting each tier flips behavior without code edits.

### Epic A4 — Licensing client integration

- **Create:** `agentos/licensing/client.py` implementing: `load_pack()`, `validate_pack()`, `bind_device()`, `check_entitlement(feature)`, `refresh()`.
- **Follow:** issuer/key/rotation/pack ADRs; deny‑by‑default policy. 
- **Acceptance:** Invalid/expired packs block Full telemetry & paid features; offline pack works.

### Epic A5 — BDD + Test harness

- **Create:** `tests/integration/test_ccc_adapter.py`
- **Scenarios:**
  - `Scenario: local-only session produces local logs only`
  - `Scenario: minimized tier uploads summary without content`
  - `Scenario: full tier uploads redacted events after license check`
- **Acceptance:** All scenarios green; produces `windows.jsonl` and `glm_counts.jsonl` locally per spec. 

### Epic A6 — Retroactive backfill (from CCP logs/results)

- **Create:** `agentos/tools/backfill_ccp.py`
  - Inputs: CCP `logs/archive/usage*.jsonl`, `results/METRICS*.json`, `results/*SUMMARY.md`
  - Output: update local `metrics_summary.json` and `progress.log.md` with historic **features shipped**, CLS, IMPF, churn, and capacity ratios. (All paths exist in CCP.) 
- **Acceptance:** Produces a dated trendline; idempotent re‑runs.

### Epic A7 — Model‑mix observability

- **Extend:** event model with `attribution` field per turn (what subagent/model contributed). (Subagent/routing docs exist in CCP.) 
- **Acceptance:** We can query “value per model” for any session.

### Epic A8 — Docs & SOP

- **Create:** `agentos/docs/integration/README.md` (copy this file’s key sections);
- **Mirror CCP SOP/Process conventions**: branch names, review gates, CI checks. (Process/SOP files exist in CCP.) 
- **Acceptance:** New contributors can run the adapter in <5 steps (no time promises, just step count).