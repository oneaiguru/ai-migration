# Phase 6 Task – Overlay Follow-up & A11y Polish

## Goal
Document remaining overlay concerns after executing `plans/2025-10-10_overlay-migration.plan.md`. Focus on Radix dialog labelling, dependency hygiene, and any UI polish left for bulk edit, tag manager, quick add, edit drawer, import/export, and future overlays.

## Current Snapshot
- Shared `Overlay` now wraps every employee-management modal/drawer using `@wrappers/ui/Dialog`.
- `useFocusTrap` has been removed; focus management depends on Radix.
- Tests (`npm run test -- --project=chromium --workers=1 --grep "Employee list"`) cover the migrated overlays.
- Hidden dialog titles/descriptions are supplied via `DialogTitle`/`DialogDescription` rendered with sr-only spans; Radix no longer emits console warnings.
- `@radix-ui/react-dialog` and `@radix-ui/react-visually-hidden` are direct dependencies to support the wrapper contract.

## Open Questions / Follow-up Areas
1. Confirm whether hidden titles (VisuallyHidden) or explicit `ariaLabelledBy` ids should be standard across overlays.
2. Audit each overlay’s footer/header spacing after the Radix migration—match production reference screens.
3. Decide whether the Radix close button should be default-on or controllable via a prop (current wrapper always shows it when `preventClose` is false).
4. Verify Playwright selectors remain stable for newly added `data-testid`s.
5. Review dependency list for any remaining sandbox imports that should move into `package.json`.

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md`
3. `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`
4. `docs/Archive/Tasks/06_phase-6-migration-execution-plan.md` (historical context)
5. `migration-prep/RESEARCH_BRIEF.md`

## Role Cadence & Deliverables
| Role | Key Actions | Deliverables |
| --- | --- | --- |
| **Scout** | Inspect overlays in code/UI, capture console warnings, note dependency or design gaps, cross-check with parity references. | Updated discovery notes in this file (add a dated subsection) + `docs/SESSION_HANDOFF.md` entry. |
| **Planner** | Draft a sed-friendly plan targeting the confirmed gaps (e.g., hidden titles, prop additions, dependency clean-up, visual tweaks). | `plans/YYYY-MM-DD_overlay-follow-up.plan.md` + handoff update. |
| **Executor** | Apply the plan, run required tests/build, update docs, archive plan. | Code changes + `docs/SESSION_HANDOFF.md` update + `PROGRESS.md` status. |

## Validation Checklist (for Execution Phase)
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual overlay sanity lap (VoiceOver): toolbar → bulk edit → tag manager → import/export → quick add → edit drawer.

Document outcomes and blockers in `docs/SESSION_HANDOFF.md` at each handoff point.

## 2025-10-10 – Scout Notes
- Hidden title/descriptions: address via wrapper `titleHidden`/`descriptionHidden` props (see plan `plans/2025-10-10_overlay-follow-up.plan.md`).
- Dependency hygiene: add `@radix-ui/react-visually-hidden` alongside Radix dialog before execution.
- Overlay consumers: update Employee list overlays, QuickAdd, and EmployeeEditDrawer to pass real strings while hiding headings.
- Layout audit: after execution, compare bulk edit/import/export/tag manager headers against parity screenshots.
- Playwright guardrail: promote Radix dialog warnings to failures in `tests/employee-list.spec.ts`.

## 2025-10-11 – Execution Notes (Overlay Follow-up)
- `Overlay` wrapper now accepts `titleHidden`/`descriptionHidden`; `Dialog` renders VisuallyHidden titles by default.
- Employee list overlays, quick add, and employee edit drawer inject sr-only `DialogTitle`/`DialogDescription` nodes so Radix's accessibility warnings stay silent.
- `tests/employee-list.spec.ts` fails fast on Radix console warnings and targets overlay headings via `getByRole`/`getByTestId` selectors.
- Build + targeted Playwright suite pass (`npm run build`, `npm run test -- --project=chromium --workers=1 --grep "Employee list"`).
