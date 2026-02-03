# CCC Adapter Integration — Options & Execution Notes

```
AgentOS (Python)            Privacy Tier Guards            CCC (Go)
┌────────────────────┐      ┌──────────────────────────┐   ┌────────────────────────┐
│ ccc_client.py       │──▶──│ Local / Minimized / Full │──▶│ /v1/events, /v1/metrics │
│ metrics/rollup.py   │     │ licensing & policy gates │   │ licensing + routing      │
│ schemas/v1/*.json   │     └──────────────────────────┘   └────────────────────────┘
│ privacy/tier.py     │
│ licensing/client.py │
└────────────────────┘
```

## 1. Implementation Snapshot (Epics A1–A6)

| Epic | Scope & Status | Dependencies | Tests / Evidence |
| ---- | -------------- | ------------ | ---------------- |
| **A1** | `agentos/integrations/ccc_client.py:25` wraps `/v1/events` + `/v1/metrics`, writes `windows.jsonl`, `glm_counts.jsonl`, refreshes rollups, enforces tier entitlements before session start. | stdlib (`uuid`, `urllib.request`), LIC client, privacy tier. | `tests/integration/test_ccc_adapter.py:61` — local-only, minimized, full tier scenarios. |
| **A2** | JSON schemas under `agentos/schemas/v1/` + lightweight validator (`agentos/schemas/__init__.py:1`) ensure session/turn/measurement/cost/value compatibility with CCP metrics doc. | No external deps; pure `json`. | Schemas exercised indirectly via CCC tests + backfill pipeline. |
| **A3** | Tier strategies in `agentos/privacy/tier.py:16` define network allowances and payload redaction (safe-field filter for minimized tier). | None. | CCC integration tests assert upload suppression / redaction behaviour. |
| **A4** | Licensing handled by `agentos/licensing/client.py:35` (canonical JSON, optional Ed25519 verifier, entitlement check). | Optional `cryptography` for default verify; accepts injected verifier for offline tests. | Integration tests inject dummy verifier; next step to add unit coverage once deps decided. |
| **A5** | BDD-aligned pytest scenarios (`tests/integration/test_ccc_adapter.py`) mimic story steps: local logs only, minimized uploads, full-tier streaming. | `pytest`, existing harness. | `pytest tests/integration/test_ccc_adapter.py` (green). |
| **A6** | `agentos/tools/backfill_ccp.py:1` ingests CCP `logs/archive/usage*.jsonl` + `results/METRICS*.json`, normalises concatenated JSON fragments, writes seeded `metrics_summary.json`. | stdlib only. | `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --output data/integration/ccp_metrics_summary.json`. |

## 2. Dependency & Packaging Review

```
agentos/
├─ integrations/ccc_client.py      # runtime needs stdlib + optional network
├─ licensing/client.py             # Ed25519 verification → optional `cryptography`
├─ metrics/rollup.py               # pure stdlib
├─ privacy/tier.py                 # pure stdlib
├─ schemas/__init__.py + v1/*.json # pure stdlib
└─ tools/backfill_ccp.py           # pure stdlib
```

- **Python packaging gap:** repository lacks a root `pyproject.toml`/`setup.cfg`. To reuse modules from CLI or Behave, add packaging metadata or treat `agentos/` as a package via editable install. Proposal below covers this.
- **Verification dependency options:**
  1. Ship with `cryptography`. Pros: robust Ed25519; Cons: heavier install, wheels. Ensure tracker/uv workflows install it.
  2. Vendor a small Ed25519 verifier (Rust/Python bindings). Pros: deterministic bundle; Cons: maintenance.
  3. Require caller to supply verifier callback (current fallback) and document fast path for dev/test. Pros: zero deps; Cons: risk if callers forget signature check.

Recommendation: adopt **Option 1** for production, keep callback hook for tests/offline builds, document in SOP.

## 3. Privacy Tier Behaviour Matrix

| Tier | Network Behaviour | Licensing Gate | Stored Artefacts |
| ---- | ----------------- | -------------- | ---------------- |
| LocalOnly | No `/v1/events`, no `/v1/metrics`. | None (local tier) | `windows.jsonl`, `glm_counts.jsonl`, `metrics_summary.json` only. |
| Minimized | `/v1/metrics` uploads safe aggregate fields (counts, ratios). | Requires `telemetry_minimized`. | Same as Local + transmitted summary subset. |
| Full | Streams `/v1/events` + `/v1/metrics`; value payload redacted to summary/links. | Requires `telemetry_full`. | Same as above plus event copies server-side.

## 4. Metrics & Feature Counting

- `agentos/metrics/rollup.py` collects `measurement.feature_delta` to compute `features_shipped` and now surfaces `model_health[model]` (warn_pct, gaps, samples) using `/v1/usage` snapshots.
- `tests/integration/test_ccc_adapter.py` covers privacy-tier behaviour; `tests/integration/test_ccp_usage_ingest.py` ingests CCP fixtures and verifies model-health fields.
- Backfill script (`agentos/tools/backfill_ccp.py`) ingests `logs/archive/usage*.jsonl` and optionally a usage snapshot (e.g. `fixtures/usage/ccc_usage_r35_full.json`) to seed `data/integration/ccp_metrics_summary.json` for dashboards.

## 5. BDD / Testing Cadence Alignment

1. **Current coverage:** integration pytest scenarios emulate Behave flows; schemas enforce structure.
2. **Next BDD step:** add feature file `features/ccc_adapter.feature` (mirroring the pytest cases) with shared steps under `features/steps/`. Hook into existing `behave` opener (see `docs/SOP/standard-operating-procedures.md#bdd-workflow-tracker-tooling`).
3. **CI smoke:** extend quick-start script to run `pytest tests/integration/test_ccc_adapter.py` + `python agentos/tools/backfill_ccp.py ... --dry-run` to guarantee both ingest and analytics paths stay green.

## 6. Integration Options & Proposals

### Option A — "Local Analytics First"
- Package AgentOS modules (`pyproject.toml`), add entrypoint `python -m agentos.cli ccc ingest` (future work).
- Focus on LocalOnly + Minimized tiers; document license setup with callback verifier to avoid heavy deps initially.
- Deliverable: CLI wrapper, Behave specs, docs update (`docs/integration/CCC_BRIDGE.md`).

### Option B — "Minimized Telemetry in Production"
- Adopt `cryptography` dependency; wire real Ed25519 pubkeys from CCP repo (`services/go-anth-shim/testdata/policy/example.pub`).
- Add retries/backoff + error logging in `CCCClient._http_post`.
- Integrate `upload_minimized_metrics()` into session close workflow (auto-run).
- Deliverable: Configurable API base URL + CLI flags, telemetry SOP update.

### Option C — "Full SaaS Bridge"
- Implement event streaming queue with batching & drop detection (persist pending uploads on disk, replay).
- Extend `metrics_summary.json` with license metadata, reroute fields, churn trend.
- Add monitoring hooks (Prometheus exporter or local health check).
- Deliverable: Combined Behave + pytest suite covering upload failure recovery, plus integration doc for SaaS ops.

## 7. Follow-up Backlog Seeds

- **A7 (Model-mix Observability):** add attribution queries + tests ensuring `model_value` matches per-turn contributions. Consider writing helper at `agentos/metrics/attribution.py`.
- **A8 (Docs & SOP):** draft `agentos/docs/integration/CCC_BRIDGE.md` consolidating setup, CLI usage, test cadence; mirror CCP SOP style. Include step-by-step checklist for orchestration agent.
- **Packaging/CI:** introduce `uv pip install -e .[ccc]` extra with `cryptography`, add `Makefile`/`nox` session for reproducible validation.

## 8. Suggested Next Actions for Orchestration Agent

1. Approve dependency policy (Option A vs B) and update `docs/SOP/` with install instructions.
2. Spin up feature spec (`features/ccc_adapter.feature`) and Behave steps to align with SOP.
3. Extend tracker dashboard ingest to include `data/integration/ccp_metrics_summary.json` trend.
4. Coordinate with CCP repo owners to export stable Ed25519 pubkeys + license pack samples for automated tests.

_All references align with CCP integration guidance (see `ClaudeCodeProxy/docs/System/integration/agentos-ccc-decision-log.md`, `docs/LICENSING/ADR/*.md`) and PRD v1.6 measurement specs (`agentos/docs/SOP/PRD_v1.6-final.md`)._
