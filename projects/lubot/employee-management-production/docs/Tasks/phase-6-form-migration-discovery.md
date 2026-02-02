# Phase 6 – Form Migration Discovery

## 2025-10-10 – Scout Notes

## Draft Plan Gaps (`docs/Archive/Plans/wrong-drafts/02_form-migration.plan.md`)
- Step 1 expects `src/components/forms/employeeEditFormHelpers.ts` to be newly created, but the helper already exists with the same mapping/resolver exports (`src/components/forms/employeeEditFormHelpers.ts:1`). Executing the plan as written would clobber current logic.
- Plan assumes Quick Add currently relies on wrapper buttons/fields (`@wrappers/ui/Button`, `@wrappers/form/FormField`), yet production still uses plain `<button>`/manual labels (`src/components/QuickAddEmployee.tsx:223`). Swapping templates without adjusting Tailwind classes would regress styling.
- Step 4 removes `useFocusTrap`, but the hook is already absent repo-wide (`rg useFocusTrap` returns no matches). Plan should drop that cleanup.
- Playwright edits reference a `quick-add-dialog` test id, while the suite and component expose `quick-add-modal` and rely on button text selectors (`tests/employee-list.spec.ts:394`, `src/components/QuickAddEmployee.tsx:174`).

## Current Implementation Gaps
- Quick Add modal uses local `useState` validation instead of RHF/Zod: `validate()` enforces regex/lengths manually (`src/components/QuickAddEmployee.tsx:136`) and `handleSubmit` builds payload without schema guards (`src/components/QuickAddEmployee.tsx:160`). The existing Zod schema is unused in runtime (`src/schemas/quickAddSchema.ts:3`).
- The modal renders raw inputs/buttons with inline classes; no shared `FormField`/`Button` usage yet (`src/components/QuickAddEmployee.tsx:210`, `src/components/QuickAddEmployee.tsx:282`). Screen-reader labelling comes from hand-authored `<label>` tags rather than wrapper props.
- Employee edit drawer mirrors the pre-wrapper approach: it bootstraps a `FormState` object and validates with custom regex/constants (`src/components/EmployeeEditDrawer.tsx:111`, `src/components/EmployeeEditDrawer.tsx:248`). `handleSubmit` manually maps strings back to domain objects and spawns timeline entries (`src/components/EmployeeEditDrawer.tsx:266`).
- Drawer UI renders dozens of individual `<input>`/`<textarea>` controls with class strings; replacing them with wrapper components will require mapping current error surfaces (`src/components/EmployeeEditDrawer.tsx:525`).
- The shared helper already provides `mapEmployeeToForm`, `mapFormToEmployee`, and exposes the Zod resolver (`src/components/forms/employeeEditFormHelpers.ts:8`). No component imports these functions yet—plan should flip the drawer to consume them instead of reimplementing conversions.
- Schemas exist and cover current validation rules (email/phone/hour norm enums) but clients ignore them (`src/schemas/employeeEditSchema.ts:17`). Transitioning to RHF should re-use these definitions.
- Playwright exercises current behavior: drawer save gating (`tests/employee-list.spec.ts:291`), persistence checks (`tests/employee-list.spec.ts:313`), and quick-add focus/close semantics (`tests/employee-list.spec.ts:386`). Any migration must preserve selectors/ids for these assertions.

## AI-Docs References
- `ai-docs/wrappers-draft/form/FormField.tsx:1-76` – documents wrapper API (`fieldId`, `error`, `hint`) and the helper `formFieldAriaProps` we should reuse for RHF error wiring.
- `ai-docs/wrappers-draft/form/EmployeeForm.tsx:1-92` – example of wiring RHF + Zod resolver through wrapper components while keeping submit styling minimal.
- `ai-docs/playground/src/examples/form-demo/FormDemo.tsx:1-99` – practical RHF + Zod flow echoing production field patterns (validation, `aria-invalid`).
- `ai-docs/README.md:1-63`, `ai-docs/MANIFEST.md:1-82`, `ai-docs/RESEARCH_BRIEF.md:1-117`, `ai-docs/QUESTIONS.md:1-19` – baseline workspace guidance and open issues to respect in any follow-up.

## Missing Assets / Follow-Ups
- `ai-docs/wrappers-draft/form/README.md` referenced in the task checklist is absent; log a follow-up to author it so future planners can cite wrapper intent explicitly.
- No dedicated RHF playground beyond `form-demo/FormDemo.tsx`; note this if additional scenarios (multi-step forms) are needed later.

### Suggested Next Steps for Planner
1. Update the draft plan to reuse existing helper/schema files instead of overwriting them; call out any refactors needed inside `employeeEditFormHelpers.ts`.
2. Define migration tasks that swap Quick Add + drawer over to RHF while preserving current class-based styling or explicitly replacing it with wrapper styling.
3. Ensure the new plan threads schema validation errors through `FormField` components and updates Playwright selectors only where necessary (retain `quick-add-modal`, `employee-edit-drawer`).
4. Include dependency/typing checks (ensure `react-hook-form`/`@hookform/resolvers` versions satisfy the wrapper drafts) and add a test step that covers quick-add submission plus drawer save.

## 2025-10-11 – Execution Notes
- Quick Add modal now runs on RHF + Zod with `FormField` wrappers (`src/components/QuickAddEmployee.tsx:1`), preserving existing styling/test ids while wiring `formFieldAriaProps` for accessibility.
- Employee Edit drawer consumes the shared helpers/resolvers (`src/components/forms/employeeEditFormHelpers.ts:1`, `src/components/EmployeeEditDrawer.tsx:1`) to map domain data and drive validation through RHF.
- Added `@hookform/resolvers`, `react-hook-form`, and `zod` dependencies (`package.json`, `package-lock.json`) plus reusable default factories for Quick Add/Edit flows (`src/schemas/quickAddSchema.ts:1`).
- Discovery references remain accurate; no new schema gaps observed. Playwright selectors unchanged (`tests/employee-list.spec.ts:1`).
