# Documentation Overview

This repository now groups documentation into three tracks while keeping the existing developer guides in place.

## Primary P0 – MITM Subagent Offload
- Folder: `docs/mitm-subagent-offload/`
- Start with `README.md` for the curated reading order.
- Supports the current Plan Of Record: keep subscription Sonnet/Opus locally and route Haiku subagents to Z.AI via a mitmproxy addon.

## Archived Multi-Path POC
- Folder: `docs/archive/multipath-poc/`
- Captures the broader Moonshot experiments (dual CLI broker, PTY wrapper, HTTP gateway, etc.).
- Reference when exploring alternatives beyond the P0 scope.

## Research Notes
- Folder: `docs/research/`
- `intercepting-claude-code-api.md` summarizes the proxy behavior, client compatibility, and ToS posture.

## Quick Run
- Handoff for T1–T3: `docs/HANDOFF-T1-T3.md`

## Licensing & Community Mode
- We are not shipping a licensed product yet. Everything needed to run locally is in this repo.
- CCP runs without a license pack in community mode: all endpoints, metrics, and the new R4 persistence + rollups work.
- Optional features (e.g., `zai_offload`) are license-gated and disabled in community mode. Samples will record `decision:"license_block"` when a gated lane would be selected. This does not block local validation or UAT.

## Standard Operating Procedures
- Index lives in `docs/SOP/README.md`; use it to find or add repeatable playbooks (environment profiles, deployments, etc.).
- See also: `docs/SOP/PROFILES.md` for Dev vs Prod profiles (community vs licensed) with concrete steps.

## System Reference (work in progress)
- `docs/System/README.md` defines the future home for architecture/operations/quality docs. The backlog of documents to port lives in `docs/System/TODO.md`.

## Packaging (stealth)
- `docs/Packaging/PRIVATE-OVERVIEW.md` documents the private build/tap workflow. Keep all distribution assets internal until launch.
- `docs/Packaging/SIGNING-CHECKLIST.md` covers codesign/notarize/signtool steps and the helper scripts under `scripts/release/`.

## Progress & Handoff
- `docs/Progress.md` keeps a session-by-session highlight log (inspired by `~/git/tools/agentos/docs/SessionReports/`).
- `docs/SESSION_HANDOFF.md` remains the detailed handoff checklist for the current window.

## Existing Getting-Started Docs
- `docs/setup-guide.md`, `docs/vscode-setup.md`, and `docs/future-improvements.md` remain unchanged and apply across all tracks.

Let me know if you want a docs index added to the root `README.md` as a follow-up.

## Integration (AgentOS)
- Joint UAT (10‑minute smoke): see AgentOS `docs/integration/JOINT_UAT.md`.
- Shim quick recipe (local):
  1. Build: `make go-shim-build`
  2. Start: `./services/go-anth-shim/bin/ccp serve --port 8082`
  3. Fetch: `curl -s :8082/v1/usage > /tmp/ccp_usage.json`; `curl -s :8082/metrics > /tmp/ccp_metrics.prom`
  4. Optional fallback proof: see `docs/tests/R3-FALLBACK-429.md`.
- CI bundle for AgentOS (schema + fixtures + key bundle):
  - `artifacts/agentos_bridge/agentos_bridge_ci.tar.gz`

### Dual‑Agent (self‑serve) process
- Start here: `docs/integration/DUAL_AGENT/README.md`
- Shared log: `docs/integration/DUAL_AGENT/CHAT.md` (append‑only)
- Artifact index: `docs/integration/DUAL_AGENT/ARTIFACT_INDEX.md`

## Transcripts (raw chat mirrors)
- See `docs/transcripts/README.md`; paste raw session text under
  `docs/transcripts/session-YYYY-MM-DD.md` with a short TL;DR and artifacts.
