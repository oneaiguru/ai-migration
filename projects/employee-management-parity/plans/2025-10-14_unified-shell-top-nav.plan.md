# Plan — Unified Shell Top Navigation Parity

## Goal
Replace the sidebar chrome with the Naumen-style top navigation so the unified shell mirrors the real system screenshots (e.g., `/Users/m/Desktop/xds/04cd3a65-8914-4d1e-a753-73ac3e099158.png`). All modules must stretch across the viewport under the new header while keeping role-aware behaviour.

## Required Reading
- PROGRESS.md (role + current status).
- docs/Workspace/Coordinator/unified-demo/README.md.
- docs/Workspace/Coordinator/unified-demo/CodeMap.md (latest context).
- docs/Tasks/unified-demo_integration-audit-scout-2025-10-13-codex.md (original chrome findings).
- docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md (header copy conventions).
- Reference captures in `/Users/m/Desktop/xds/` (focus on `04cd3a65-8914-4d1e-a753-73ac3e099158.png`, `095ab8c5-016b-4dc4-8b82-f3864bdd2613.png`, `7b28108e-6172-4425-8b5a-6d222e668872.png`).

## Scope
- Shell layout in `apps/shell` (header, nav, role switch UI).
- Tailwind tokens + global CSS needed for top bar and secondary tab strip.
- Responsive behaviour for the header (desktop + collapsible overflow).
- Documentation updates (CodeMap, Subtask, SESSION_HANDOFF, PROGRESS).
- Vercel deploy + smoke checks.

Out of scope: Implementing new module content, reworking package internals, or adding real auth persistence.

## Implementation Tasks
1. **Capture requirements from reference images**
   - Catalogue spacing, colours, typography, and icon positions from the `/Users/m/Desktop/xds` set.
   - Define the secondary tab strip structure (e.g., `Смены`, `Схемы`, `График`, ...).
   - Document hover/active styles and iconography (download, bell, avatar).

2. **Reshape shell layout**
   - Replace `AdminShell` container with a top navigation layout component (e.g., `TopNavShell`).
   - Move global nav tabs into a horizontal primary bar; embed secondary tabs as route-provided children.
   - Ensure Employees/Schedule modules render full width with consistent padding.

3. **Navigation configuration update**
   - Adjust `config/navigation.ts` to drive the new top tabs (primary + optional secondary tabs per module).
   - Wire role gating to hide primary tabs that the current user cannot access.

4. **Header controls + actions**
   - Implement the right-side cluster (download icon, bell, help, avatar) using lucide-react.
   - Add RU copy for user block (`ИП Ракитин` style) and ensure hover/active states match references.
   - Expose a placeholder action to trigger future drawers (e.g., org structure button).

5. **Secondary navigation & module affordances**
   - For Schedule module, render the secondary tabs (`Смены`, `Схемы`, `График`, …) as route stubs.
   - Ensure active state reflects the current sub-route; default to first tab when landing on a primary route.

6. **Styling + responsive tweaks**
   - Update `tailwind.config.cjs` with navy palette + subtle shadows from screenshots.
   - Adjust `index.css` (and minimal `App.css` if needed) for body background and typography.
   - Handle mobile/overflow behaviour (collapse secondary tabs into a horizontal scroll or menu).

7. **Validation + documentation**
   - Run `npm run build` at repo root.
   - Deploy via `vercel deploy --prod --yes`.
   - Smoke test `/forecasts`, `/schedule`, `/employees`, `/reports` to confirm nav states and full-width content; capture console logs.
   - Update:
     - `docs/Workspace/Coordinator/unified-demo/CodeMap.md` (new layout references).
     - `docs/Workspace/Coordinator/unified-demo/Subtask_Integrator_Agent_TBD_2025-10-13.md` (Outcome section).
     - `docs/SESSION_HANDOFF.md` and `PROGRESS.md` (Test Log + Docs section).
     - `docs/System/ports-registry.md` if the agent reserved a port during dev.

## Acceptance Criteria
- Top navigation matches the Naumen screenshots for colours, spacing, icon placement, and RU copy.
- Primary tabs (Прогнозы/Расписание/Сотрудники/Отчёты) live in the top bar; secondary tabs render directly below for the active module.
- Content modules occupy the full viewport width beneath the header.
- Role gating still hides unauthorized tabs and redirects appropriately.
- `npm run build` and production deploy succeed; local/production consoles remain clean.
- Documentation reflects the new layout and deploy URL.

## Risks / Open Questions
- Precise hover/active colours may require sampling from images—verify accessibility contrasts.
- Determine behaviour for modules without secondary tabs (placeholder row or collapse).
- Confirm whether download/help icons trigger any interim dialogs or stay as inert placeholders.
