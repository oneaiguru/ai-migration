# Overlay Migration Code Review Prep

Use this sheet before running the overlay code review. It consolidates the executed plans, relevant code, and AI-doc references so the reviewer can trace every change without re-scouting the repo.

## Executed Plans & Commits
- `docs/Archive/Plans/executed/01_overlay-migration.plan.md` → commit `f765b08` ("Plan 2025-10-10_overlay-migration: migrate overlays to Radix").
- `docs/Archive/Plans/executed/06_overlay-follow-up.plan.md` → commit `fdbe634` ("Plan 2025-10-10: overlay follow-up execution").
- `docs/Archive/Plans/executed/07_overlay-background.plan.md` → commit `3fafe65` ("Force white background for Radix overlays").
- Tests ran per plans: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"`.

## Primary Code Artifacts
- `src/components/common/Overlay.tsx:1-87` – Radix-based Overlay wrapper (title/description hiding, forced white background).
- `src/wrappers/ui/Dialog.tsx:1-282` – Dialog wrapper with merged styles, focus management, hidden title/description support via `@radix-ui/react-visually-hidden`.
- `src/components/EmployeeListContainer.tsx:2444-2890` (bulk edit, column settings) & `2892-3169` (tag, import/export) – all sheet/modal overlays with VisuallyHidden fallbacks.
- `src/components/QuickAddEmployee.tsx:173-300` – quick add modal now using Overlay and VisuallyHidden headings.
- `src/components/EmployeeEditDrawer.tsx:483-1004` – edit drawer overlay wiring; confirm close guards and hidden labels.
- `tests/employee-list.spec.ts:1-160` – Playwright guards for console warnings and overlay interactions.
- `package.json:1-40` – dependency addition `@radix-ui/react-visually-hidden@^1.2.3`.

## AI-Docs References to Reconcile
- `ai-docs/wrappers-draft/ui/Dialog.tsx:1-283` – draft now mirrors the shipping dialog wrapper (hidden titles/descriptions, sheet/modal variants, close guards).
- `ai-docs/wrappers-draft/shared/tokens.ts:1-70` – shared token helpers copied from production for AI-doc demos.
- `ai-docs/README.md:1-63`, `ai-docs/MANIFEST.md:1-82` – workspace orientation and overlay conventions.
- `ai-docs/RESEARCH_BRIEF.md:1-120` – Radix migration notes.
- `ai-docs/QUESTIONS.md:1-25` – open overlay questions (e.g., accessibility edge cases).
- `docs/Tasks/phase-6-overlay-discovery.md:1-80` – discovery notes that justified the follow-up work.

## Checks to Perform
- Confirm every Overlay usage passes the correct `titleHidden` / `descriptionHidden` flags and still renders visible headings for sighted users.
- Verify `Dialog` close guards match plan intent (preventClose, closeOnEscape/Overlay toggles).
- Ensure Playwright console warning guard covers all overlays and no new warnings slip through.
- Reconcile styles (padding, background) against design tokens and AI-doc standards.
- Validate dependency addition and lockfile consistency (`npm install` clean state already confirmed during execution).

## Open Questions / Follow-ups
- Should quick-add/edit drawer replace manual close buttons with shared wrapper controls? (check discovery vs executed solution.)
- NVDA/VoiceOver sweep still outstanding per `docs/SESSION_HANDOFF.md`; code review should flag any blockers before that manual task runs.
- Confirm whether AI workspace needs an updated dialog wrapper example that matches the shipped implementation.

_Record review findings in a new code-review note (not in this prep file) and link it from `docs/SESSION_HANDOFF.md` once the review completes._
