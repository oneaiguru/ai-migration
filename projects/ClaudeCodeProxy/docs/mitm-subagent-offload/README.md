# MITM Subagent Offload Docs

This directory is the canonical bundle for the current P0 plan: keep Claude subscription traffic local while routing Haiku subagents through Z.AI using a mitmproxy addon.

**Purpose:** Master directory of this POC bundle + recommended import order.

## Recommended order to read / act

1. **01-DECISION-REPO-STRUCTURE.md** — where to build (existing vs fresh) → **Monorepo in your existing repo**
2. **02-PRD-SUBAGENT-OFFLOAD.md** — P0 product spec
3. **03-ADR-001-REPO-STRATEGY.md** — decision record (monorepo + services)
4. **04-ADR-002-ZAI-HAIKU-ALIAS.md** — decision: GLM replaces Haiku lane
5. **05-MITM-ADDON-SPEC.md** — technical spec of MITM
6. **06-MITM-ADDON-SKELETON.md** — original scaffold (final addon lives in services/.../haiku_glm_router.py)
7. **07-NODE-GATEWAY-SPEC.md** — API‑key gateway (keep your current server.js path)
8. **08-NODE-GATEWAY-SKELETON.md** — harden your existing gateway minimally
9. **09-ORCHESTRATION-RUNBOOK.md** — how to run both Claude instances + MITM
10. **10-VERSION-PINNING.md** — pin Claude Code & tool versions
11. **11-POLICY-RISK-NOTES.md** — ToS risk posture (keep it local, user‑owned)
12. **12-TEST-MATRIX.md** — test plan
13. **13-USAGE-LOGGING-SPEC.md** — what to log
14. **14-TRACE-WATCHER-SPEC.md** — optional trace watcher
15. **15-UX-GUIDELINES.md** — agent-friendly CLI UX
16. **16-MIGRATION-GUIDE-EXISTING-PROXY.md** — how to slot this into your repo
17. **17-README-TOP.md** — the root README that ties it all together
18. **18-DEEP-RESEARCH-PLAN.md** — focused sweep items (for your research agent)
19. **19-DEEP-RESEARCH-REPORT.md** — current findings, concise
20. **20-AGENT-TODO.md** — exact next tasks for coding agent
21. **21-FAQ.md** — quick answers
22. **22-ROADMAP.md** — P0 → P1 → P2
23. **23-ROLLBACK.md** — safe revert
24. **24-SECURITY-HARNESS.md** — CA trust, env, secrets
25. **25-ENV-EXAMPLES.md** — env templates
26. **26-MAKE-TARGETS.md** — simple scripted commands
27. **CLAUDE.md** — one-pager / cheatsheet for the project

---
Notes
- Default pilot uses model‑based routing (Haiku → Z.AI) for simplicity; subagent metadata is optional and not required.
- The earlier "subagent marker" exploration has been retired. Do not rely on metadata flags; model heuristics and env toggles are the supported path.
- For the two‑terminal production pilot, see `docs/HANDOFF-DUAL-TERMINAL-PILOT.md`.
