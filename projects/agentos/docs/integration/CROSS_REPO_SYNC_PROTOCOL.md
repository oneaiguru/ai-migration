# Cross‑Repo CCC ↔ AgentOS Sync Protocol (CE‑Aligned)

Purpose: minimize back‑and‑forth and make alternating sessions predictable. This protocol is the single source for how AgentOS and CCC agents coordinate on integration work.

## Roles & Cadence
- Scout → Planner → Executor per repo. Alternate repos between sessions so each agent always inherits the other’s latest context.
- Every session begins with Required Reading, then an Alignment Gate, then execution only after ACK.

## Single Canonical Log
- Shared chat log lives in AgentOS at `docs/integration/CCC_AGENT_CHAT.md`.
- Rule: no implementation change begins without an explicit ACK to the latest “alignment gate” entry in this file.

## Required Reading (each session)
- AgentOS: `docs/integration/INTEGRATION-ROADMAP-and-EXECUTION.md`, `docs/integration/CCC_ADAPTER_PROPOSALS.md`, this protocol, and the latest entries in `CCC_AGENT_CHAT.md`.
- CCC: `ClaudeCodeProxy/docs/System/integration/agentos-ccc-integration-plan.md`, `docs/System/contracts/USAGE_EVENT_SCHEMA.md` (or PRO twin), and the latest `CCC_AGENT_CHAT.md`.

## Alignment Gate (template)
Post in `CCC_AGENT_CHAT.md` before coding:
- What we will change (paths + fields).
- Exact field names/contracts (Yes/No confirms).
- Validation matrix and acceptance.
- Packaging/licensing impacts.
- D+1/D+2 timeline.
Coding starts only after “ACK”.

## Deliverable Checklists
- Plan file: `plans/YYYY-MM-DD_<slice>.plan.md` with Required Reading, Tasks, and Validation Matrix.
- BDD parity: feature + steps, green locally (`pytest`, `behave`).
- Docs: README quick‑start, SOP snippet, operator guide updates.
- Evidence: archive logs, outputs under `artifacts/test_runs/<slice>/`.
- Bundle: zip all touched files to `~/Downloads/<repo>_<slice>_bundle.zip`.

## Validation Matrix (pattern)
- Unit/Integration: `pytest tests/integration/test_ccc_adapter.py` (AgentOS), `go test ./...` (CCC as applicable).
- BDD: `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature` (AgentOS).
- Backfill/fixtures: ingest usage fixture(s) and assert metrics fields.
- E2E smoke (when online): `scripts/tools/ccc_e2e_smoke.sh` calls `/v1/usage` + `/metrics` and runs adapter ingest (no content upload for Local/Minimized).

## Schema & Licensing Change Control
- Schema: versioned, additive only; flat keys for current R4 items. Unknown fields must be tolerated.
- Licensing: local Ed25519 verification via bundle `ClaudeCodeProxy/docs/LEGAL/PUBKEYS.json`; optional `cryptography` extra in AgentOS; callback supported air‑gapped.

## Alternating Sessions (small slices)
- Keep slices 1–2 days (D+1/D+2). Alternate repos: CCC executes R3.5, AgentOS picks up D+1 R4 adapter, CCC does next R4 slice, etc.
- Each session ends with: updated plan pointer in `progress.md`, `docs/SESSION_HANDOFF.md` entry, and a new chat entry with “Ready for ACK”.

## Handoff Definition of Done
- All acceptance checks pass (tests, behave, docs), bundle produced, log updated, plan for next agent created with clear scope and budget.

— End of protocol —
