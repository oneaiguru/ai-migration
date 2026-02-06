# Plan — Reports Directory Consolidation

## Goal
Retire legacy `docs/Reports/*` markdown references by pointing all documentation to the System canon (`docs/System/...`) and leave the `docs/Reports/` folder as an attachments archive only.

## Inputs
- Current references: `docs/SESSION_HANDOFF.md`, `docs/Workspace/Coordinator/manager-portal/Drafts/DEMO_PARITY_INDEX.md`, `docs/Workspace/Coordinator/manager-portal/Drafts/PARITY_MVP_CHECKLISTS.md`
- Canonical files: `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, `docs/System/APPENDIX1_SCOPE_CROSSWALK.md`, `docs/System/DEMO_EXECUTION_DECISION.md`
- Attachments to preserve: `docs/Reports/FeatureParity_2025-10-20/feature-parity-check.zip`, `docs/Reports/Trimmed_2025-10-20/`

## Tasks
0. **Checklist exception**: Keep all links pointing to `docs/Reports/PARITY_MVP_CHECKLISTS.md`. Treat `docs/System/PARITY_MVP_CHECKLISTS.md` as a mirror only.
1. Update references in:
   - `docs/SESSION_HANDOFF.md`
   - `docs/Workspace/Coordinator/manager-portal/Drafts/DEMO_PARITY_INDEX.md`
   - `docs/Workspace/Coordinator/manager-portal/Drafts/PARITY_MVP_CHECKLISTS.md`
   to point at the `docs/System/` copies. Confirm no other files contain `docs/Reports/` strings via `rg`.
2. Review SOPs/indexes to ensure they already target `docs/System/` (no changes required if so).
3. Move (or delete) redundant markdown duplicates from `docs/Reports/` once references are repointed. Keep attachment folders; replace removed files with README explaining archive usage if needed.
4. Run `rg "docs/Reports/"` to verify only intended attachment paths remain. Leave any checklist references targeting `docs/Reports/PARITY_MVP_CHECKLISTS.md` untouched.
5. Document the consolidation in `docs/SESSION_HANDOFF.md` and add a bullet to `PROGRESS.md` once changes land.

## Validation
- `rg "docs/Reports/"` returns only attachment-focused paths (no markdown references).
- Docs index and SOPs load the System versions.

## Rollback
- Restore `docs/Reports/` markdown files and references via `git checkout` if any missing citations are discovered.

## Notes
- Do not move or delete attachment archives without confirming downstream consumers (feature parity/trimmed reports).
- Coordinate with Docs Coordinator SOP to reflect archive-only status during the next documentation pass.
- Optional TODO: remove `docs/Reports/.DS_Store` if committed in future cleanup; keep `docs/Reports/Trimmed_2025-10-20/screenshots/` unless broader docs review confirms it is unused.
