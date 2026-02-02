# Standard Operating Procedures

## UI / Feature Work
1. Review `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/Tasks/parity-backlog-and-plan.md`, and referenced manual chapters (CH3/CH5) before editing UI.
2. Build accessible components: provide labels, keyboard support, and `aria-live` announcements for state changes.
3. Update screenshots (`docs/SCREENSHOT_INDEX.md`) when layouts change. Store images under `docs/reference/screenshots/` with descriptive names.
4. Document behaviour deltas in the parity plan and update the backlog after each slice.
5. Run `npm run build` and `npm run test`. Delete `test-results/` artefacts before committing.
6. Capture verification notes in `docs/SESSION_HANDOFF.md`.

## Playwright / Test Work
1. Use Playwright for end-to-end scenarios; prefer label-based selectors.
2. Keep tests deterministic—reset state via the UI, avoid timing flakiness.
3. Remove `test-results/` after runs so the repo stays clean.
4. Mention new coverage in the parity plan and backlog.

## Documentation Workflow
- `docs/System/documentation-structure.md` lists where each doc lives—update it when adding new files.
- `docs/System/documentation-index.md` links to quick references; keep it in sync.
- `docs/SOP/ui-walkthrough-checklist.md` must reflect the latest UI flow.
- `docs/Tasks/parity-backlog-and-plan.md` should always show the next actionable items.

### Post-change Checklist
After landing a feature or bug fix:
1. Update `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` with behaviour changes.
2. Revise `docs/Tasks/parity-backlog-and-plan.md` (move completed items, add follow-ups).
3. Refresh SOP or walkthrough docs if workflows changed.
4. Capture new/updated screenshots and reference them in `docs/SCREENSHOT_INDEX.md`.
5. Add verification notes to `docs/SESSION_HANDOFF.md`.

## Deployments
1. Confirm tests pass locally.
2. `git push origin main`.
3. `vercel deploy --prod --yes` and record the resulting URL in the session handoff.
