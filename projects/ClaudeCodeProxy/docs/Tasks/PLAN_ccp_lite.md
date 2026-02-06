# Plan — CCP Lite (No-DB Shim Fallback)

## Context
- The current Go shim (`services/go-anth-shim/cmd/ccp/main.go`) has expanded to ~2k lines with quotas, SQLite persistence, Prometheus metrics, license verification, and reroute heuristics layered into a single binary. This complexity correlates with the instability recorded in `docs/BUGLOG.md` and the churn noted in recent `docs/SESSION_HANDOFF.md` entries (routing drift, `/context` parsing issues, upstream retries).
- The pre-license/reproven version at commit `dc3791e` delivered stable Haiku→Z.ai and Sonnet→Anth flows without database writes or quota logic. Those runs are still archived under `logs/prod/archive/usage_go_repro_quick*.jsonl`.
- We need a deterministic fallback (no DB, no quota calculus) that mirrors the earliest stable shim so we can: (a) compare behavior against the modern feature-full proxy, (b) ship a minimal build when the heavier binary flakes, and (c) simplify debugging by isolating variables.

## Goal
Produce a `ccp-lite` command that reuses the historically stable code path (pre-license, file-backed JSONL logs only) so operators can flip between “full” and “lite” modes. The lite build must:
1. Compile inside the existing `services/go-anth-shim` module with zero SQLite/metrics dependencies.
2. Honor the same env conventions for Anth/Z.ai routing (e.g., `FORCE_HAIKU_TO_ZAI`, `ZAI_HEADER_MODE`).
3. Ship documentation + repro scripts demonstrating parity with the known-good `dc3791e` behavior.

## Non-Goals
- Rewriting or deleting the advanced proxy. `ccp-lite` lives alongside the current binary; it is not a revert.
- Bringing persistence/quotas into the lite build. Those features stay exclusive to the full shim.
- Solving CLI `/context` bugs; the lite build simply avoids additional moving parts.

## Work Plan
1. **Baseline extraction**
   - Add a new command (e.g., `services/go-anth-shim/cmd/ccp-lite`) populated with `main.go` from commit `dc3791e` plus any helpers/tests required.
   - Keep the code untouched except for module/package rename so we preserve the proven logic (JSON body parsing, SSE piping, retry semantics).
   - Capture deltas in a README snippet explaining its provenance.

2. **Build + script integration**
   - Extend the root `Makefile` and existing repro scripts (`scripts/repro-go-shim-quick.sh`, `scripts/uat/run_haiku_zai.sh`, etc.) with a flag or target to run against `ccp-lite`.
   - Ensure binaries drop into `services/go-anth-shim/bin/` as `ccp-lite` (parallel to `ccp`).

3. **Verification + comparison**
   - Re-run the FW0–FW3 routing QA (or the quick repro sequence) with both binaries, producing side-by-side `logs/usage*.jsonl` output.
   - Document observed differences (e.g., lack of quotas/metrics) and codify operator guidance on when to choose lite vs full.
   - Link the results in `docs/SESSION_HANDOFF.md` and `results/TESTS.md`.

## Task Breakdown
- T0: Read `docs/SESSION_HANDOFF.md`, `docs/BUGLOG.md`, and `docs/System/STORE.md` to understand the problematic areas we are intentionally omitting.
- T1: Create `cmd/ccp-lite` by importing `services/go-anth-shim/cmd/ccp/main.go` from commit `dc3791e`; adjust module/package name minimalistically.
- T2: Wire `make go-shim-build` (or add `make go-shim-lite`) plus scripts to build/run the lite binary; document env usage.
- T3: Execute the quick repro + UAT scripts with `ccp-lite`; archive logs under `logs/archive/usage_go_lite_*.jsonl`.
- T4: Summarize findings (stability comparison, limitations) in `docs/SESSION_HANDOFF.md` and backfill `results/TESTS.md`.

## Notes / Usage So Far
- `make go-shim-lite-build` builds the extracted `cmd/ccp-lite` binary alongside the existing `go-shim-build`.
- `scripts/run-go-shim.sh`, `scripts/repro-go-shim*.sh`, and `scripts/uat/run_*.sh` accept `--lite` (or `CCP_SHIM_VARIANT=lite`) to run the minimal binary through the standard harness; this satisfies Work Plan step 2.

## References
- `docs/SESSION_HANDOFF.md` (current state, routing regressions).
- `docs/BUGLOG.md` (CLI instability symptoms).
- Commit `dc3791e` (`scripts/repro-go-shim-quick.sh` success logs) for the source snapshot.
