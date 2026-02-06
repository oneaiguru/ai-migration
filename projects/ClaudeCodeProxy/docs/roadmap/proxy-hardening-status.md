# Proxy Hardening Status (L1 context)

## TL;DR
- **What exists today:** Go shim (`services/go-anth-shim`) handles Haiku→Z.AI routing, lane hygiene, and CLI parity with Python MITM. MITM addon remains as a reference path but isn’t in the daily loop.
- **What does *not* exist (yet):** The “proxy-guard” forward proxy stack described in `agents/L1-ProxyHardening/KickoffBrief.md` (Python + Go implementations, SNI enforcement, policy persistence, unix-socket bridges, sandbox wiring) has not been built. The repo structure assumes a future project.
- **What we’re doing:** Treat the kickoff brief as the **next phase**. This document keeps L0/L2 aligned on what’s already done, what remains, and why we’re currently focused on the Go shim path.

## Current state (Go shim + MITM reference)
- Go shim routes Haiku→Z.AI with header isolation, SSE preservation, and OAuth passthrough for Sonnet/Opus.
- Ergonomics match Python MITM: `ccc-on` (preferred) or `make go-proxy` + `source scripts/go-env.sh`, followed by `claude …`, `make summarize`/`make verify-routing`.
- Acceptance gates are documented in `docs/HANDOFF-CONSOLIDATED-SESSION.md` and verified in the latest runs.
- MITM addon (`services/mitm-subagent-offload`) remains for reference/backup but is no longer the primary path.

## What the kickoff brief expects (not yet implemented)
- New project structure under `proxy-guard/` (Python asyncio version + Go port with identical behavior).
- ClientHello/SNI inspection to enforce `CONNECT host == SNI` and block IP literals/missing SNI.
- Policy persistence layer (TTL allowlist, fronting settings) with live reload and event emission.
- Integration with sandbox runtime via unix-socket bridge / bubblewrap hooks.
- Unified test harness coverage for fronting cases, SSE passthrough, allowlist TTL, etc.
- Additional docs (`ARCHITECTURE.md`, `DECISIONS.md`) and control endpoints.

## Why we haven’t built the full proxy-guard yet
- Immediate priority was **Go shim parity** so day-to-day work could leave the MITM path (mission accomplished).
- Packaging, policy packs, and sandboxing are the next slated deliverables (see `docs/roadmap/MVP-micro-saas-goal.md` and `docs/roadmap/policy-architecture.md`).
- The proxy-guard brief is useful for L2/L1 planning, but implementing it requires several dedicated sessions (new codebase, tests, runtime integration). We didn’t want to over-promise before upstream pieces (Go shim, policy packs) were stable.

## Recommendation for L0 / L2 handoff
1. **Share this status doc** alongside the kickoff brief so L2 knows the starting point.
2. **Sequence the work:**
   - Finish the micro-SaaS surfaces (policy fetch, packaging, log rotation) in the main repo.
   - Spin up the proxy-guard project afterward, using the kickoff brief as the target spec.
3. **Document dependencies:** proxy-guard will depend on the policy pack signer and sandbox wiring outlined in `docs/roadmap/policy-architecture.md`.

This keeps expectations clear: we aren’t discarding the proxy-guard plan, but it’s a future phase layered on top of the Go shim work that just landed.
