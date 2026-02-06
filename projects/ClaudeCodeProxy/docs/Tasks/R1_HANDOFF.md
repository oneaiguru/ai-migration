# R1 Handoff — Multi‑model connectors + routing MVP

Status
- Baseline (R0) restored and green.
- Tests: ok (cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...)
- No providers.yaml wiring present in runtime; catalog work is deferred to R1.

What changed in this handoff
- Reverted partial R1 drift; removed temporary catalog loader + configs.
- Kept improved log rotation (env‑driven dir + age/size) and updated shim to call new helpers.
- Fixed license loader call to match current library signature.

Executor starting point (do this first)
- Branch: create your own feature branch: `git switch -c feature/r1-routing`.
- Read order (SOP):
  1) docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md:1
  2) docs/tasks/ccp2-review.md:74-99
  3) docs/OPS-GUIDE.md:36-115
  4) docs/PROD-TESTS.md:8-19
  5) docs/Tasks/ccp_r1_execution_plan.md:1

Scope (execute exactly per plan)
- Implement providers.yaml loader, routing by catalog, manual /model switch, and single fallback.
- Update readiness and CLI as specified; keep R0 invariants (no body logs; header isolation; SSE passthrough).

Validation after each phase
- `cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...`
- `./bin/cc providers` (after you wire the print path)
- `curl -s http://127.0.0.1:8082/readyz | jq` (when shim running)
- `make summarize && make verify-routing`

Recording
- Append each command + outcome to `docs/SESSION_HANDOFF.md` under a new R1 section.

