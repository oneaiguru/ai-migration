# Form Wrappers – Draft Notes

This draft captures the React Hook Form + Zod patterns referenced during Phase 6/7 planning. Keep it in sync with production implementations under `src/wrappers/form/`.

## Files
- `FormField.tsx` – label/hint/error wrapper using tokenized spacing.
- `EmployeeForm.tsx` – basic login/email/status example with Zod schema.
- `README.md` (this file) – guidance and follow-up notes.

## Key Behaviours
1. Generate a stable control ID with `useId` when consumers do not provide one.
2. Provide `formFieldAriaProps` helpers that wire `aria-describedby` to hint/error elements and expose `aria-invalid`.
3. Default inputs to Employee Management tokens (padding, border, background) in production; draft samples keep inline styles for clarity.
4. Expose `required` flag logic while leaving validation copy to RHF/Zod.

## Usage Example
```tsx
const emailIds = formFieldAriaProps({
  controlId: "employee-email",
  hasError: Boolean(errors.email),
  errorId: errors.email ? "employee-email-error" : undefined,
  hintId: "employee-email-hint",
});

<FormField fieldId={emailIds.id} label="Email" error={errors.email} hint="Используйте корпоративный адрес">
  <input
    type="email"
    {...register("email")}
    id={emailIds.id}
    aria-labelledby={emailIds.labelId}
    aria-invalid={emailIds["aria-invalid"]}
    aria-describedby={emailIds["aria-describedby"]}
  />
</FormField>
```

## Follow-Ups
- Mirror any production changes (new props, styling tokens) here before shipping plans.
- Add Storybook examples and smoke tests in production, then link them back to this README for planners.
- Flag this folder as the "frozen" Phase 7 reference once audits complete; note that production may diverge until a new snapshot is captured.
