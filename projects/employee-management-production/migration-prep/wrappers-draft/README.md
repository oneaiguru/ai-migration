# Wrapper Prototypes

Draft API sketches for migrating the employee-management UI to shared component wrappers.

## Modules
- `ui/Dialog.tsx` – Radix-based modal with opinionated overlay/content styles.
- `ui/Popover.tsx` – Radix popover wrapper with default arrow and spacing.
- `data/DataTable.tsx` – TanStack Table + Virtual combo (sorting + virtualization baked in).
- `form/FormField.tsx` – Basic field label/error helper.
- `form/EmployeeForm.tsx` – Example RHF + Zod form composition using the field helper.

These files illustrate desired props/usage and are not production ready (inline styles, no theming, minimal typing).
