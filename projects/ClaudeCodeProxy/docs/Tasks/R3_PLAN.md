# docs/Tasks/R3_PLAN.md

Theme
From “thin slice” to “operator-grade”: richer quotas/HUD, model-aware routing, and basic ACP prep.

Major epics
E1) Usage HUD + budget guards in CLI
- Add `cc quotas` and `cc hud`:
  - `cc quotas` prints per-model rolling/weekly %, warn/block flags, next reset ETA.
  - `cc hud` runs a TUI that shows live /metrics and /v1/usage (optional; gate with `CCP_TUI=1`).
- ✅ `/v1/usage` now returns rolling/session TPS (ELR vs dirty) plus 24 h trends; `cc status` table surfaces warn/block + fastest hour.

E2) Provider catalog maturity
- Expand providers.yaml schema to support:
  - `models` map with route defaults (lane, headerMode).
  - `auth` section per provider with `env`, `headerMode`, and optional `scopedEnv` (profile-based).
- Add `./bin/cc providers` pretty printer with source path and effective config.
- ✅ Schema now allows `header_mode` + `scoped_env`; `cc providers` prints a formatted table with routes.

E3) Token parsing per provider
- Implement pluggable extractors in `usage_tokens.go` with interface:
  - `type TokenExtractor interface { FromJSON([]byte) (in, out int, ok bool); FromHeaders(http.Header) (in, out int, ok bool) }`
- Ship Anthropic+Z.AI extractors; default noop.

E4) Observability
- Promote /metrics to OTEL (optional); or keep text but add:
  - `ccp_requests_total{{lane,op,status}}`
  - `ccp_latency_ms_bucket` with CLI chart in `cc hud`.

E5) ACP readiness (no editor work yet)
- Add HTTP control hooks to accept “external orchestrator decisions” input (dry-run only):
  - `POST /v1/decisions` stores a recent decision sample (route/model/escalation reason) for HUD/demo. No enforcement yet.

E6) Docs & packaging updates
- Update README/OPS-GUIDE for new commands.
- Expand QUOTAS.md with tokens-first examples per provider.

Deliverables for R3
- New files:
  - services/go-anth-shim/cmd/ccp/usage_tokens.go
  - cmd/cc subcommands: hud/quotas/providers improvements.
- Updated docs: OPS-GUIDE, QUOTAS, SESSION_HANDOFF.
- Tests: unit tests for token extractors; snapshot test for `cc quotas` output.

Stop criteria
- Live runs show token-based usage increasing; warnings fire at configured thresholds; CLI surfaces status without hitting the HTTP API manually.
