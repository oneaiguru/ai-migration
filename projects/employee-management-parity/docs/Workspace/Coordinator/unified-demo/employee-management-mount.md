# Employee Management Package – Mount Guide

Exports live in `src/Root.tsx`:
- `Root` (default and named) – React component with all providers/styles.
- `setupRU()` – idempotent registrar for Chart.js + RU locale wiring.

## Mount Steps (host shell)
1. Import the helpers from the package workspace:
   ```ts
   import { Root as EmployeeManagementRoot, setupRU as setupEmployeeRU } from 'packages/employee-management/src/Root';
   ```
2. Call `setupEmployeeRU()` once during shell bootstrap (before rendering any routes). This wires Chart.js adapters to the RU locale so charts render correctly.
3. Render `<EmployeeManagementRoot />` inside the `/employees` route. No internal router ships with the package; the host shell owns routing/StrictMode wrappers.
4. Styles are bundled automatically when `Root` is imported (it pulls in `src/styles/tokens.css` and `src/index.css`). Ensure your bundler handles CSS imports from dependencies.

Example wiring in the unified shell:
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Root as EmployeeManagementRoot, setupRU as setupEmployeeRU } from 'packages/employee-management/src/Root';

setupEmployeeRU();

createRoot(container).render(
  <React.StrictMode>
    <EmployeeManagementRoot />
  </React.StrictMode>,
);
```

> Reminder: keep the host shell responsible for RU registrar invocation; avoid calling `setupRU()` inside the package to prevent double-registration when multiple demos mount side by side.
