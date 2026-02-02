## Metadata
- **Task Title:** Restore dialog padding in overlay wrapper
- **Owner:** Planner
- **Related Docs:** `docs/Tasks/overlay-padding-regression.md`
- **Code Areas:** `src/components/common/Overlay.tsx`, overlay consumers (`src/components/QuickAddEmployee.tsx`, `src/components/EmployeeList/*`), documentation updates

## Desired End State
- Modal and sheet overlays render with the design-token spacing defined in `Dialog`, matching the legacy screenshots and removing the cramped edges.
- No overlay-specific overrides fight the shared dialog styles; background, padding, and shadows come from `Dialog` unless a consumer explicitly opts in to custom styling.
- Regression task reflects the active plan so future agents can follow execution instructions.

### Key Discoveries
- `docs/Tasks/overlay-padding-regression.md:3-31` documents the visual regression, reproduction steps, and root cause pointing to a padding override.
- `src/components/common/Overlay.tsx:48` forces `padding: 0`, cancelling the dialog defaults and producing the cramped layout.
- `src/wrappers/ui/Dialog.tsx:69-109` already provides the correct padding (`spacingVar('xl')` / `spacingVar('2xl')`), surface color, and shadow for both modal and sheet variants.

## What We're NOT Doing
- No redesign of dialog sizing, token values, or typography.
- No overhaul of individual modal layouts beyond removing compensating classes if they only existed to fight the padding override.
- No changes to Radix dialog behaviour (focus management, close handlers, etc.).

## Implementation Approach
Stop overriding the dialog container styles in `Overlay` so the shared token-driven padding and colors apply. After removing the override, review key overlay consumers to ensure they no longer need redundant spacing classes; only drop classes that became unnecessary due to the restored defaults. Update the regression doc to flag this plan, then validate modals and sheets with a local preview before handing off.

## Phase 1: Restore overlay container padding

### Overview
Remove the zero-padding override so `Dialog` supplies spacing.

### Changes Required:

1. **File:** `src/components/common/Overlay.tsx`
   **Changes:** Stop forcing `padding: 0` while keeping optional consumer overrides.

```tsx
*** Begin Patch
*** Update File: src/components/common/Overlay.tsx
@@
-      contentStyles={{ padding: 0, backgroundColor: '#ffffff', ...(contentStyles ?? {}) }}
+      contentStyles={{ backgroundColor: '#ffffff', ...(contentStyles ?? {}) }}
*** End Patch
```

2. **File:** `src/components/common/Overlay.tsx`
   **Changes:** After removing the override, spot-check consumers that passed extra padding utility classes solely to compensate. If a class only restored the missing gap, drop it so we rely on dialog defaults (e.g. replace `px-6 py-5` wrappers with token-aligned spacing when redundant). Preserve layout-specific classes like flex utilities or borders.

```
Manual editing guided by verification; no automated patch required.
```

## Phase 2: Documentation sync

### Overview
Record the execution outcome in the regression log so future agents see the fix summary and verification evidence.

### Changes Required:

1. **File:** `docs/Tasks/overlay-padding-regression.md`
   **Changes:** Update the regression log after execution to capture what changed (e.g., confirm the padding override removal, list any class clean-up, include validation evidence) and flip the status to ✅ once the fix ships.

```
Manual editing guided by execution results; structure matches existing regression docs.
```

## Tests & Validation
- `npm run build`
- `npm run test:unit`
- `npm run preview -- --host 127.0.0.1 --port 4174` → Verify Quick Add modal, Tag Manager modal, Import/Export modals, Column Settings overlay, and Employee Edit drawer all display restored spacing without clipping or double shadows.

## Rollback
1. Revert the `Overlay.tsx` change to restore the prior `padding: 0` override.
2. Revert any consumer class removals if applied.
3. Remove the status update from `docs/Tasks/overlay-padding-regression.md`.
4. Re-run `npm run build` to confirm the app compiles with the rolled-back state.

## Handoff
- Executor should follow this plan exactly, record test results, and update `PROGRESS.md` + `docs/SESSION_HANDOFF.md` with outcomes.
- After execution, flip the regression doc status to ✅ with links to validation evidence and archive this plan under `docs/Archive/Plans/executed/`.
