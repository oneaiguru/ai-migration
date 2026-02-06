# Task Plan Seed — Upstream Safety & Policy Cache

> Use this as the starting context when you run the **planner prompt** from `docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`. Updated after the zero-touch/log-path work on 2025-10-22.

## Context

The log/profile sweep is done (`CCP_LOGS_DIR` respected everywhere). The next safety pass focuses on:

1. Stopping the Go shim from reading client-facing env vars as upstream overrides (prevents self-proxy loops).
2. Relocating the policy cache + related artifacts under the active logs directory.
3. Backfilling unit tests to lock the new behavior and document the expectations.
4. Tidying docs/tasks that still mention the old flow.

## Inputs & References

- Planning template: `docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
- Shim source: `services/go-anth-shim/cmd/ccp/main.go`, `policy_loader.go`, tests under the same directory.
- Alias workflow (for context only): `scripts/shell/ccc-aliases.sh`
- Updated log helpers: `scripts/run-go-shim.sh`, `scripts/review-bundle.sh`

## Task A — Harden upstream host overrides

**Problem**
- `services/go-anth-shim/cmd/ccp/main.go:108-139` reads `ANTHROPIC_BASE_URL` / `ZAI_BASE_URL` via `os.Getenv` when constructing upstream URLs. If an operator exports the shim-facing env (`ANTHROPIC_BASE_URL=http://127.0.0.1:8082`) *before* launching the shim, the shim will point at itself.

**Requirements**
- Ignore `ANTHROPIC_BASE_URL` / `ZAI_BASE_URL` when selecting upstreams. Keep policy overrides working.
- Allow explicit overrides via new names (e.g., `CCP_UPSTREAM_ANTH`, `CCP_UPSTREAM_ZAI`) or extend the policy file; make the surface obvious in docs.
- Update decision logs if you introduce new env-based overrides (include `upstream_src:"env"` vs `"policy"`).

**Acceptance**
- ✅ Unit test in `main_extra_test.go` (TestUpstream_IgnoresClientFacingEnv) proves that setting `ANTHROPIC_BASE_URL` only affects client requests, not upstream selection. Shim defaults remain `api.anthropic.com`/`api.z.ai`.
- ✅ Added `CCP_UPSTREAM_ANTH` / `CCP_UPSTREAM_ZAI` support with source logging; test `TestUpstream_EnvOverridesTakeEffect` covers env override.
- ✅ Docs updated in `docs/ops/000-quickstart-zai-routing.md` and `services/go-anth-shim/README.md` warning not to reuse client envs; document new env names.
- Commit: <pending>

**Anchors**
- `services/go-anth-shim/cmd/ccp/main.go:118-133` — existing env reads.
- `services/go-anth-shim/cmd/ccp/main_extra_test.go` — add a companion test near other routing cases.

## Task B — Policy cache & ancillary files under CCP_LOGS_DIR

**Current code**
- Default cache path defined at `services/go-anth-shim/cmd/ccp/main.go:609` → `filepath.Join("logs", "policy-cache.json")`.
- Tests in `policy_loader_test.go` also expect `logs/policy-cache.json`.
- Review bundle still copies cache from `LOG_ROOT`—verify after changes.

**Changes needed**
- Derive the default cache from `CCP_LOGS_DIR` (same fallback logic as the usage log).
- Ensure cache directories are created alongside usage logs.
- Update unit tests to use temp dirs via `t.TempDir()`.
- After relocation, confirm `scripts/review-bundle.sh` still picks up the cache file (currently copies `${LOG_ROOT}/policy-cache.json`).

**Acceptance**
- ✅ Default cache path now derives from `CCP_LOGS_DIR` via `defaultPolicyCachePath()`; test `TestDefaultPolicyCachePath_RespectsEnv` added.
- ✅ `scripts/review-bundle.sh` copies `${CCP_LOGS_DIR}/policy-cache.json` into the bundle.
- Repro commands unchanged; summarizer continues to read from the env-aware log path.
- Commit: <pending>

## Task C — Backfill safety tests & docs

**Tests**
- ✅ Added coverage ensuring:
  - Anth lane strips `x-api-key` headers while still passing/falling back `Authorization` (see `TestAnthropicAuth_PassthroughAndEnvFallback`).
  - Z.AI lane removes client `Authorization` when operating in API-key mode and logs completion metadata (`TestZAI_HeaderMode_AuthorizationAndDefault`).
  - SSE completions still produce usage entries when env overrides steer the shim (`TestSSEUsage_WithEnvOverrides`).

**Docs**
- ✅ Long-form guides updated to promote `ccc-on` with manual fallback notes (`docs/ops/000-quickstart-zai-routing.md`, `docs/HANDOFF-CONSOLIDATED-SESSION.md`, `docs/SESSION_HANDOFF.md`, `docs/PROD-TESTS.md`, roadmap/LICENSING references).
- ✅ Troubleshooting includes guidance on `CCP_UPSTREAM_ANTH` / `CCP_UPSTREAM_ZAI` to avoid self-proxy loops.
- ✅ Summarizer now reports per-lane SSE chunk/duration stats for streaming validation.

**Anchors**
- `services/go-anth-shim/cmd/ccp/main_test.go:120-210` (existing hygiene tests).
- `docs/HANDOFF-LONG-SESSION.md`, `docs/TROUBLESHOOTING.md` — updated per above.

## Notes for the Planner/Executor loop

- Run the planner prompt from the CE Magic doc and pin the tasks above. Keep the plan ≤400 lines.
- Executor should:
  1. Confirm anchor lines with `rg` before editing.
  2. Apply minimal patches.
  3. Run `CCP_LOGS_DIR=logs go test ./cmd/ccp`, `make summarize`, and a quick `ccc-on`/`ccc-logs` sanity if time permits.
  4. Update this file (mark items with ✅ + commit hash) when each is complete.
