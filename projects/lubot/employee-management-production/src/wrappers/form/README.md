# Form Wrapper Library

Wrappers in this directory standardise React Hook Form (RHF) + Zod usage and keep accessibility wiring
consistent across drawers, overlays, and sheets.

## Exports
- `FormField` – label + helper/error layout with tokenised spacing
- `formFieldAriaProps` – helper that returns ids/aria attributes for inputs
- `EmployeeForm` – reference implementation of the employee credential form hooked to Zod

## Patterns
- Always pair `FormField` with RHF's `Controller` or `register`. Pass `fieldId`/`fieldName` so the wrapper
  can link the label, hint, and error message.
- Use `formFieldAriaProps({ controlId, hasError })` to wire `aria-describedby`/`aria-invalid` correctly.
- When hiding labels visually, wrap them in `VisuallyHidden` but keep the `label` element in the DOM.

## Validation
- Schemas live under `src/schemas/`. Import them into RHF resolvers (`zodResolver`).
- Display translated validation messages from the schema; do not duplicate strings inside components.
- `EmployeeForm` demonstrates the expected resolver wiring and submit handler signature.

## Testing Guidance
- Unit-level smoke tests are located in `src/wrappers/__tests__/FormField.test.tsx` and
  `EmployeeForm.test.tsx`. Extend coverage whenever you add new error states.
- Playwright relies on stable `data-testid` attributes when interacting with Quick Add and Edit Drawer;
  ensure migrations preserve these ids.

## AI Workspace Alignment
When you update these wrappers, mirror the changes in `ai-docs/wrappers-draft/form/` and note new patterns
in the discovery docs so future planners/executors can reuse them.
