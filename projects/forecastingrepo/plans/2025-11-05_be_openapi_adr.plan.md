## Metadata
- Task: Coordinate BE demo freeze follow-ups (OpenAPI, ADR log, Behave smoke) and align docs with reviewer guidance
- Discovery:
  - `docs/Tasks/BE_AGENT_SESSION.md:1-38`
  - `docs/Tasks/NEXT_AGENT_SCOUT.md:1-118`
  - `reviews/DEMO_FREEZE.md:1-40`
  - `docs/System/Review_Pack.md:1-40`
  - `docs/System/documentation-index.md:1-70`
  - `.github/workflows/ci.yml:1-80`
  - `scripts/api_app.py:100-320`
- Related docs: `reviews/20251105/core_pipeline/2_followup/backend_sites.md`, `reviews/20251105/backtesting_eval/2_followup/backend_site_backtest.md`, `reviews/NOTES/api.md`

## Desired End State
Backend endpoints publish typed contracts with generated OpenAPI under `docs/api/openapi.json`, Behave smoke scenarios run (not dry-run) in CI, the ADR log documents accepted decisions with an index, coordinator docs reference the new artifacts, and review bundles can include concatenated context generated via a reproducible script. All demo smokes (four curls + Behave + pytest/spec/docs) stay green, and review registry/session handoff capture the changes.

### Key Discoveries
- `docs/Tasks/BE_AGENT_SESSION.md:13-33` already lists demo freeze smokes but lacks OpenAPI/ADR tasks from coordination notes.
- `reviews/DEMO_FREEZE.md:1-24` defines the curls and environment expectations to keep in sync after changes.
- `.github/workflows/ci.yml:28-62` currently runs `behave --dry-run ... || true`, meaning Behave scenarios never execute.
- `scripts/api_app.py:140-320` returns raw dicts/lists without FastAPI `response_model`, so the OpenAPI spec is untyped and out of sync.
- `docs/ADR/*.md` exist for earlier decisions, but there is no decision log for accepting P0/P1 or module-size/test policies referenced by the coordinator.
- `docs/System/Review_Pack.md:1-35` and `reviews/NOTES/api.md` need to reflect the OpenAPI asset and the new smoke outputs.

## What We're NOT Doing
- No changes to forecast computation, site simulator defaults, or route CSV generation beyond verifying presence for the demo date.
- No UI code changes beyond updating docs/bundles; UI execution stays in the separate repo.
- No monorepo migration or repo ownership transfer (explicitly deferred post-demo per coordination brief).
- No additional Behave scenarios beyond tagging existing smoke features; we keep non-smoke features untouched.

## Implementation Approach
Work in phased updates: first author ADRs and documentation so decisions are recorded; next add typed responses and OpenAPI export tooling in `scripts/api_app.py` with accompanying tests; then activate Behave smoke tags and CI enforcement; finally add the context concatenation helper and refresh coordination docs, ending with full validation and registry/handoff updates.

## Phase 1: Decision Log & Coordinator Docs
### Overview
Capture the six accepted decisions via new ADR files and index, and update task/coordination docs to reflect new responsibilities.
### Changes Required
1. Add ADR files and index.
   **Files**: `docs/ADR/ADR-0001-accept-P0-P1-now.md`, `docs/ADR/ADR-0002-module-size-and-waiver-policy.md`, `docs/ADR/ADR-0003-test-pyramid-BDD-and-E2E.md`, `docs/ADR/ADR-0004-surface-site-accuracy-and-forecast-per-site.md`, `docs/ADR/ADR-0005-api-contracts-openapi-v1.md`, `docs/ADR/ADR-0006-repo-ownership-and-monorepo.md`, `docs/ADR/DECISIONS_INDEX.md`
   **Changes**: Create Markdown files with Status/Context/Decision/Consequences/References sections per coordinator brief. Append each entry to a new index table linking ADR -> summary -> status.
   ```commands
   cat <<'EOF' > docs/ADR/ADR-0001-accept-P0-P1-now.md
   # ADR-0001: Accept P0/P1 Reviewer Items Immediately
   **Status:** Accepted (2025-11-05)
   ## Context
   ...
   EOF
   ```
   (Repeat for ADR-0002..0006 with summarized decisions; finalize index via `cat <<'EOF' > docs/ADR/DECISIONS_INDEX.md` containing a Markdown table.)
2. Update documentation index and coordinator docs.
   **Files**: `docs/System/documentation-index.md`, `docs/System/Review_Pack.md`, `reviews/DEMO_FREEZE.md`, `docs/Tasks/BE_AGENT_SESSION.md`, `docs/Tasks/NEXT_AGENT_BRIEF.md`, `docs/Tasks/NEXT_AGENT_SCOUT.md`, `docs/SOP/review-process.md` (registry/context bullet).
   **Changes**: Add ADR-0001..0006 to ADR section with link to decisions index; mention OpenAPI artifact and context bundler command; embed curl + OpenAPI validation snippets; extend BE tasks to include OpenAPI export, Behave smoke, ADR updates; add scout references for new files. Use `apply_patch` to insert bullet sections without disturbing existing checklists.
3. Update review notes placeholder.
   **File**: `reviews/README_STATUS.md` (if present) or create `reviews/README_STATUS.md` summarizing BE/UI doc readiness.
   **Changes**: Ensure there is a short status referencing new ADR index and OpenAPI spec, as requested by coordination message.

## Phase 2: Typed API Responses & OpenAPI Export
### Overview
Annotate FastAPI endpoints with response models, add supporting Pydantic models/tests, and provide an export script for OpenAPI with CI enforcement.
### Changes Required
1. Enhance `scripts/api_app.py` with response models.
   **File**: `scripts/api_app.py`
   **Changes**:
   - Import `BaseModel`/`Field` types if needed, and define models `QuantileTriplet`, `MetricsEnvelope`, `DistrictSMAPE`, `SiteRow`, `RouteRow`, `TrajectoryPoint` at module level.
   - Update route decorators: `@app.get("/api/metrics", response_model=MetricsEnvelope)` etc., returning typed dict/list rather than bare JSON where feasible while preserving CSV/404 fallbacks via `JSONResponse`.
   - Ensure headers (e.g., `X-Total-Count`) remain set by using `JSONResponse` for JSON branch.
   - Add helper to compute overall/district data if necessary.
2. Add OpenAPI export utility.
   **File**: `scripts/export_openapi.py` (new)
   **Changes**: Script should call `create_app().openapi()`, optionally format, and write to `docs/api/openapi.json`; include `--check` flag to error if file differs and `--write` default.
   ```commands
   cat <<'EOF' > scripts/export_openapi.py
   #!/usr/bin/env python3
   """Export FastAPI OpenAPI spec to docs/api/openapi.json."""
   ...
   EOF
   chmod +x scripts/export_openapi.py
   ```
3. Update API documentation and tests.
   **Files**: `docs/System/API_Endpoints.md`, `tests/api/test_api_app.py`, `tests/api/test_api_sites_v1.py`
   **Changes**: Note presence of `docs/api/openapi.json` and example usage; add a unit test to ensure `/openapi.json` path exposes required schema (e.g., verifying route component). Adjust existing tests if response structures changed by Pydantic models.
4. Regenerate OpenAPI artifact.
   **File**: `docs/api/openapi.json`
   **Changes**: After script modifications run `python scripts/export_openapi.py --write` to update JSON.

## Phase 3: Behave Smoke Activation & CI Updates
### Overview
Tag smoke features and run them in CI alongside OpenAPI verification.
### Changes Required
1. Tag smoke features.
   **Files**: `specs/bdd/features/api_metrics_smoke.feature`, `specs/bdd/features/api_sites_smoke.feature`, `specs/bdd/features/api_routes_smoke.feature`
   **Changes**: Insert `@smoke` tag at top of each file (before `Feature:`) via `apply_patch`.
2. Update CI workflow.
   **File**: `.github/workflows/ci.yml`
   **Changes**:
   - Replace dry-run step with `behave --tags @smoke --no-capture --format progress` (no `|| true`).
   - Add step after docs check to run `python scripts/export_openapi.py --check` to ensure spec synced.
   - Document determinism env (reuse existing env where relevant).
3. Document Behave command.
   **File**: `docs/SOP/review-process.md`
   **Changes**: Add bullet instructing authors to run `behave --tags @smoke` locally before sending review bundles.

## Phase 4: Context Concatenation Helper & Bundles
### Overview
Provide a reproducible way to generate concatenated context files for reviewers.
### Changes Required
1. Create manifest and script.
   **Files**: `docs/Tasks/context_manifest.yml` (new), `tools/concat_context.py` (new), `.gitignore`
   **Changes**: Manifest lists bundles (e.g., backend_review, ui_review) with ordered source files; script reads manifest, concatenates text into `concatenated_output/<bundle>.md`, and logs paths. Add `concatenated_output/` to `.gitignore`.
2. Update SOP/docs.
   **Files**: `docs/SOP/review-bundle.md`, `docs/System/Review_Pack.md`, `reviews/DEMO_FREEZE.md`
   **Changes**: Add instructions to run `python3 tools/concat_context.py` during bundle prep and note where outputs live.

## Phase 5: Validation, Registry, and Handoff
### Overview
Run required checks, update registry/handoff, and capture latest curls.
### Changes Required
1. Validation commands.
   ```commands
   python scripts/export_openapi.py --write
   pytest -q
   behave --tags @smoke --no-capture --format progress
   python .tools/spec_sync.py
   python .tools/docs_check.py
   ```
   Re-run the four curls (per `reviews/DEMO_FREEZE.md`) against the tunnel or local uvicorn and append outputs under a new heading in `reviews/NOTES/api.md` if changed.
2. Review registry & docs updates.
   **Files**: `reviews/REVIEWED_FILES.yml`, `docs/SESSION_HANDOFF.md`
   **Changes**: Update hashes/status for modified files (API, tests, docs, ADRs, workflow, tools). Append executor summary in session handoff referencing this plan.

## Tests & Validation
- `python scripts/export_openapi.py --write` (regenerates spec)
- `pytest -q`
- `behave --tags @smoke --no-capture --format progress`
- `python .tools/spec_sync.py`
- `python .tools/docs_check.py`
- Four API curls (metrics/districts/sites/routes) with env lock as per `reviews/DEMO_FREEZE.md`

## Rollback
- To revert ADR/docs: `git checkout -- docs/ADR docs/System docs/Tasks docs/SOP reviews/DEMO_FREEZE.md reviews/README_STATUS.md`
- To restore API/workflow: `git checkout -- scripts/api_app.py scripts/export_openapi.py .github/workflows/ci.yml specs/bdd/features tools/ concat_output .gitignore tests/api`
- Remove generated outputs: `rm -rf concatenated_output`.

## Handoff
- Log completion in `docs/SESSION_HANDOFF.md` referencing this plan and validation commands.
- Note any follow-up (e.g., UI repo tasks) separately for UI agent.
