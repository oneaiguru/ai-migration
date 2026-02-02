## Metadata
- **Task**: Fix transparent background on Radix overlay content
- **Plan Date**: 2025-10-11
- **Owner**: Planner → next Executor
- **Source Discovery**: `docs/Tasks/phase-6-column-settings-background-exploration.md`
- **Target Files**:
  - `src/components/common/Overlay.tsx`

## Desired End State
All Radix-backed overlays (sheets and modals) render with an opaque white surface by default, preventing toolbar or page chrome from appearing beneath drawers like the column settings sheet. The shared wrapper sets the background once, so individual components no longer need to manually apply `bg-white` to avoid transparency.

### Key Discoveries
- `src/components/common/Overlay.tsx` – default `contentStyles` is `{ padding: 0 }`, leaving `Dialog.Content` transparent.
- `docs/Tasks/phase-6-column-settings-background-exploration.md` – reproduction notes and screenshots confirm the bleed-through issue.

## What We're NOT Doing
- No layout or copy changes to individual overlays.
- No adjustments to overlay sizing, padding, or focus behavior.
- No new props on the wrapper beyond the background change.

## Implementation Approach
Update the shared `Overlay` wrapper to merge `backgroundColor: '#ffffff'` into the content styles before spreading consumer overrides. This ensures every overlay is opaque out of the box, while still letting callers override the color if needed.

## Phase 1: Enforce White Background on Overlay Content

### Overview
Set the default background color on Radix dialog content so sheets/modals always render opaque surfaces.

### Changes Required:

1. **File**: `src/components/common/Overlay.tsx`
   **Changes**: Extend the `contentStyles` merge with an explicit white background.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/common/Overlay.tsx
@@
-      contentStyles={{ padding: 0, ...(contentStyles ?? {}) }}
+      contentStyles={{ padding: 0, backgroundColor: '#ffffff', ...(contentStyles ?? {}) }}
*** End Patch
PATCH
```

## Tests & Validation
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual spot check (optional): preview the app and open the column settings drawer to confirm the white background.

## Rollback
```bash
set -euo pipefail
git restore src/components/common/Overlay.tsx
```

## Handoff
- Update `PROGRESS.md` to reflect plan execution status (e.g., In Progress → Completed).
- Add an execution entry to `docs/SESSION_HANDOFF.md` summarizing the result and tests.
- Archive this plan in `docs/Archive/Tasks/` after execution (per SOP).
