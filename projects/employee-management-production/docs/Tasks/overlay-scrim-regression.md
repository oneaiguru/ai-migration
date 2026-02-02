# Overlay Scrim Regression

> **Status:** ✅ Completed – see `docs/Archive/Plans/executed/2025-10-15_overlay-scrim-plan.md`

## Context
- Reporter screenshots (legacy): `/Users/m/Desktop/Screenshot 2025-10-11 at 13.39.23.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 13.39.29.png`.
- Reporter screenshots (current build): `/Users/m/Desktop/Screenshot 2025-10-11 at 13.46.53.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 13.46.58.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 13.47.03.png`.
- Regression surfaced while comparing the parity build (`npm run preview -- --host 127.0.0.1 --port 4174`) against the legacy demo under identical steps.

## Summary
Radix-based overlays (Quick Add, Tag Manager, Edit Drawer) no longer render the dimmed scrim behind the dialog. The legacy build darkens the background, while the current parity build leaves the page fully lit, reducing contrast and making it harder to distinguish active modals.

## Reproduction Steps
1. `npm install`
2. `npm run preview -- --host 127.0.0.1 --port 4174`
3. Open the employee list in the browser.
4. Trigger any overlay (e.g. press `+ Новый сотрудник`, open `Теги`, or click an employee name).

## Findings
- **Legacy behaviour:** overlays include a semi-transparent backdrop that dims the employee table and nav chrome.
- **Current behaviour:** overlays open directly on top of the table with no dimming; the background remains the same brightness as the main page.
- The issue reproduces across multiple overlay types, suggesting a shared wrapper/regression (likely `Overlay` or the Radix `Dialog` wrapper) rather than a per-component styling gap.
- `Dialog` still requests the design-token backdrop (`colorVar("backdrop")`) for its Radix overlay component (`src/wrappers/ui/Dialog.tsx:91-109`).
- The CSS variable `--em-colors-backdrop` lives in `src/styles/tokens.css:1-40`, but that stylesheet is never imported into the app bundle (`rg "tokens.css" src` returns no hits). Without the variable, the computed overlay background falls back to transparent—hence the missing scrim.
- `Overlay` explicitly forces white sheet content via `backgroundColor: '#ffffff'`, masking the missing surface token while leaving the backdrop fully transparent (`src/components/common/Overlay.tsx:60-75`).

## Impact
- Visual hierarchy suffers; users may miss that a modal is active, especially in bright environments.
- Accessibility risk: the missing scrim reduces focus isolation and could cause cognitive load for keyboard/screen-reader users expecting modal context.

## Resolution – 2025-10-15
- Imported the generated token stylesheet in the app entry point so `colorVar("backdrop")` and other tokenized values resolve (`src/main.tsx`).
- `npm run build` ✅; `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings remain expected).
- Previewed via `npm run preview -- --host 127.0.0.1 --port 4174` (actual port 4175) and confirmed Quick Add, Tag Manager, and Edit Drawer now render the dimmed scrim across the employee list background.
- Archived execution details in `docs/SESSION_HANDOFF.md` and moved the plan to `docs/Archive/Plans/executed/2025-10-15_overlay-scrim-plan.md`.
