# P0 Exit Criteria — Subagent-only Offload

Routing
- 100% of verified subagents route to Z.AI
- Main Sonnet/Opus traffic remains on Anthropic

Stability
- ≥30 minutes balanced soak with no stalls (SSE intact)
- Burst + Parallel complete without hangs or unrecovered errors

Safety
- No auth cross-leak between lanes (spot-check headers)
- Logs redact secrets; body tee disabled by default

Observability
- results/TESTS.md filled for T1–T6 + stability
- results/METRICS.json includes by-lane p50/p95 and error taxonomy
- docs/SESSION_HANDOFF.md captures commands, toggles, versions, commits

When all four are met, mark P0 complete and proceed to P1 (session-level split).
