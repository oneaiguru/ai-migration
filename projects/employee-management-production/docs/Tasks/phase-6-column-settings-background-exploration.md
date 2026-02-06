# Exploration – Column Settings Drawer Background Transparency

## Reproduction
1. Build and start the preview (`npm run build && npm run preview -- --host 127.0.0.1 --port 4174`).
2. Navigate to the employee list and open the column settings drawer via the `Колонки` toolbar button.
3. Observe that the sheet surface shows the toolbar content ghosted behind the drawer instead of a solid white background.

## Observations
- The Radix `Dialog.Content` rendered by our shared `Overlay` wrapper inherits a transparent background when no `backgroundColor` is applied. (`src/components/common/Overlay.tsx`)
- Column settings, quick add, and edit drawer pass flex layout classes but rely on Radix for the background (`src/components/EmployeeListContainer.tsx:2443-3145`, `src/components/QuickAddEmployee.tsx:172-220`, `src/components/EmployeeEditDrawer.tsx:482-540`).
- Because the drawer content is transparent, the employee toolbar buttons remain visible beneath the sheet, matching the issue reported in the screenshot.

## Root Cause
`Overlay` forwards consumer-provided `contentStyles`, defaulting only to `{ padding: 0 }`. When callers omit an explicit `backgroundColor`, Radix renders a transparent surface and the underlying UI bleeds through. The column settings drawer does not enforce its own background, so the overlay appears semi-transparent.

## Candidate Fix
Force the shared `Overlay` wrapper to set `backgroundColor: '#ffffff'` on the dialog content, while still letting consumers override other styles. This keeps all sheets/modals opaque without requiring every caller to repeat the same class.
