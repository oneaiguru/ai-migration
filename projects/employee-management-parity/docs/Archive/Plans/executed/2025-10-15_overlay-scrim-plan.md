## Metadata
- **Task Title:** Restore overlay scrim by mounting design tokens
- **Owner:** Planner
- **Related Docs:** `docs/Tasks/overlay-scrim-regression.md`, `docs/ADR/0004-theme-token-strategy.md`
- **Code Areas:** `src/main.tsx`, `src/styles/tokens.css` (read-only), documentation updates

## Desired End State
- All Radix overlays (modal + sheet variants) render the dimmed backdrop in the parity app, matching the legacy demo.
- Base design tokens are loaded into the runtime so any `colorVar`/`themeVar` usages resolve correctly.
- Regression doc reflects the fix and links to the plan; PROGRESS/Handoff note the active plan.

## Key Discoveries
- `Dialog` still references `colorVar("backdrop")` for the overlay layer (`src/wrappers/ui/Dialog.tsx:91-103`).
- The `--em-colors-backdrop` variable (and the rest of the token map) lives in `src/styles/tokens.css` but that file is never imported, so the overlay background becomes transparent.
- ADR 0004 expects us to surface the token map via `src/styles/tokens.css` or `applyTheme`, but the parity app only imports `src/index.css` today.
- Scout summary captured in `docs/Tasks/overlay-scrim-regression.md:1-35` outlines reproduction steps and the missing stylesheet.

## What We're NOT Doing
- No redesign or alteration of token values.
- No refactor of `Overlay`/`Dialog` beyond ensuring the token map is loaded.
- No runtime theming (`applyTheme`) or additional visual tweaks beyond restoring the dimmed scrim.

## Implementation Approach
Load the generated token stylesheet before Tailwind so all `colorVar` references resolve, then refresh documentation to mark the regression tracked and fix verified. The change happens in `src/main.tsx` by importing `./styles/tokens.css` ahead of `./index.css`; once the tokens are in the bundle the existing Radix overlay backdrop works without further code changes. Finish by updating the regression doc status and logging the fix in PROGRESS/handoff notes.

## Phase 1: Mount design tokens
### Overview
Ensure the parity bundle includes the generated CSS variables.

### Changes Required:
1. **File:** `src/main.tsx`
   - Import `./styles/tokens.css` before the existing `index.css` import so tokens load first.

```tsx
*** Begin Patch
*** Update File: src/main.tsx
@@
-import './index.css'
+import './styles/tokens.css'
+import './index.css'
*** End Patch
```

## Phase 2: Documentation updates
### Overview
Reflect the active plan and resolution path in our docs.

### Changes Required:
1. **File:** `docs/Tasks/overlay-scrim-regression.md`
   - Update status line to indicate the plan is queued/in progress.
   - Add a note linking to this plan so future agents know where execution instructions live.

```md
*** Begin Patch
*** Update File: docs/Tasks/overlay-scrim-regression.md
@@
-\> **Status:** 🚧 Logged – requires follow-up plan
+\> **Status:** 🚧 In progress – see `plans/2025-10-15_overlay-scrim-plan.md`
*** End Patch
```

## Tests & Validation
- `npm run build`
- `npm run test:unit`
- `npm run preview -- --host 127.0.0.1 --port 4174` → open Quick Add, Tag Manager, and Edit Drawer to confirm background dimming is restored.

## Rollback
If issues arise:
1. Remove the `./styles/tokens.css` import from `src/main.tsx`.
2. Revert documentation status change in `docs/Tasks/overlay-scrim-regression.md`.
3. Re-run `npm run build` to confirm the bundle returns to the previous state.

## Handoff
- Executor should follow this plan verbatim, then update `PROGRESS.md` and `docs/SESSION_HANDOFF.md` with outcomes and validation notes.
- After execution, mark `docs/Tasks/overlay-scrim-regression.md` as completed with QA evidence.
