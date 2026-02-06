# docs/Tasks/R3_EXECUTOR_PROMPT.md

You are the executor for “R3 — Operator-grade quotas/HUD + provider catalog maturity”.

Read order (10 minutes)
- docs/QUOTAS.md
- docs/OPS-GUIDE.md (Observability + CLI sections)
- docs/Tasks/R3_PLAN.md

Branching
- git switch -c feature/r3-hud-and-tokens

Rules
- Touch only files listed in R3_PLAN.md.
- Keep header isolation (never leak Z.AI key to Anth lane).
- No body logs; SSE untouched.
- Commit after each checklist item with descriptive message. Append commands/outcomes to docs/SESSION_HANDOFF.md.

Phases (execute in order)
1) Token extractor plumbing
- Create services/go-anth-shim/cmd/ccp/usage_tokens.go with interface and Anthropic/Z.AI implementations.
- Wire into main.go non-stream and SSE finalization.
- Tests: usage_tokens_test.go with fixtures.

2) CLI surfaces
- Extend bin/cc with `hud` (optional TUI; or simple loop printing /v1/usage) and `quotas` (pretty JSON summary).
- Add `providers` pretty print improvements.
- ✅ `cc status` now renders a table with TPS + peak hour (raw JSON available via `--json`).
- ✅ `cc providers` prints the catalog table (auth env, header mode, base URL, routes).

3) Docs + proofs
- Update docs/QUOTAS.md with token examples.
- Run: go test ./..., ./bin/cc quotas, ./bin/cc providers, curl /v1/usage | jq, make summarize && make verify-routing.
- Update docs/SESSION_HANDOFF.md.
- ✅ GLM probe harness: see `docs/Experiments/GLM_LIMIT_PROBE.md` + `scripts/experiments/glm-limit-probe.sh`.

Stop when acceptance in R3_PLAN passes. Do not start ACP/editor work or OTEL exporter in this round.
