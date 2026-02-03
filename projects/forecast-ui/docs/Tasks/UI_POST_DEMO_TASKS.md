# UI Post‑Demo Tasks (Planner → Executor)

Status legend: TODO / IN_PROGRESS / DONE

## Goals
- Keep UI maintainable (file sizes under 300–400 LoC) without changing behavior.
- Strengthen nightly e2e (add registry filter coverage, allow real CSV downloads).
- Add advisory lint/format and size‑gate scripts.

## Tasks

1) Nightly E2E: Registry filter coverage — DONE
- File: `tests/e2e/registry_filter.spec.ts:1`
- Notes: Skips on PR smokes; enabled with `E2E_NIGHTLY=1`.
- Validation: `npm run test:e2e:nightly`.

2) Nightly E2E: Allow CSV download — DONE
- Route spec already gated by `E2E_ALLOW_DOWNLOAD=1`.
- Nightly script added: `package.json:test:e2e:nightly`.

3) Advisory lint/format — DONE
- Files: `.eslintrc.cjs`, `.prettierrc`, `package.json` scripts `lint`, `format:check`, `format`.
- Validation: `npm run lint`, `npm run format:check`.

4) Size‑gate advisory script — DONE
- File: `scripts/ci/check_large_files_ui.sh` (warn>350, block≥500)
- Validation: `bash scripts/ci/check_large_files_ui.sh`.

5) File splits (no behavior change) — TODO (only if sizes exceed target)
- Current sizes: `Routes.tsx≈242`, `RoutesTable.tsx≈191`, `Sites.tsx≈165` → No split required now.
- Plan (if needed):
  - Create `components/routes/RoutesContainer.tsx` and `components/routes/RoutesTableView.tsx`.
  - Move presentational table markup to `RoutesTableView.tsx`; keep hooks in `hooks/*`.
  - Mirror for Sites if file grows >300–350 LoC.
- Validation: unit + e2e pass; bundle unchanged behavior.

## Artifacts & Docs
- Pre‑show checklist: `reviews/PRE_SHOW_CHECKLIST.md` (in bundle)
- Coordinator drop: `reviews/COORDINATOR_DROP_UI.md` (in bundle)
- Test SOP updated with nightly command: `docs/SOP/TEST_RUN_SOP.md`

## Handoff
- Next agent: if file sizes remain within target, skip splits and keep advisory gates.
- If you add features that grow routes/sites, execute the split plan with no behavior changes and re-run tests + bundle.

