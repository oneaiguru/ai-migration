Date: 2025-10-23 18:46 UTC

Scope reviewed
- services/go-anth-shim/cmd/ccp/main.go (R1/R2 changes)
- services/go-anth-shim/cmd/ccp/logrotate.go (R0 baseline)
- services/go-anth-shim/cmd/ccp/quotas.go (R2)
- services/go-anth-shim/cmd/ccp/quotas_test.go (R2)
- docs/OPS-GUIDE.md, docs/QUOTAS.md, docs/SESSION_HANDOFF.md

Solid
1) Routing hygiene; 2) single-retry fallback; 3) /readyz probe; 4) /metrics text; 5) quotas loader+reload; 6) observability scripts + cc status.

R2 gaps closed here
- Rotation guard: logrotate already serialized; ensured directory creation per computed path.
- Token accounting: best-effort JSON extraction for non-stream; SSE remains best-effort (no final token probe).
- Budget guard: enforced quota_block reroute from ZAI → Anth.

Defer to R3
- HUD table; provider catalog maturity; pluggable token extractors; deeper metrics.

