# Wrapper Prototypes

Draft API sketches for migrating the employee-management UI to shared component wrappers.

## Modules
- `ui/Dialog.tsx` – Radix-based modal with opinionated overlay/content styles.
- `ui/Popover.tsx` – Radix popover wrapper with default arrow and spacing.
- `data/DataTable.tsx` – TanStack Table + Virtual combo (sorting + virtualization baked in).
- `form/FormField.tsx` – Basic field label/error helper.
- `form/EmployeeForm.tsx` – Example RHF + Zod form composition using the field helper + aria wiring.
- `reference/snippets/utils/import-export.ts` documents the shared CSV/Excel helpers used in production.

These files illustrate desired props/usage and are not production ready (inline styles, no theming, minimal typing).

> Phase 7 snapshot: treat this folder as the frozen reference for planners. When production diverges, record a new snapshot and update this note.
