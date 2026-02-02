# Standard Operating Procedures

## UI / Feature Work
1. Review `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, the relevant task spec in `docs/Tasks/` (check its status header), and referenced manual chapters (CH3/CH5) before editing UI.
2. Build accessible components: provide labels, keyboard support, and `aria-live` announcements for state changes.
3. Update screenshots (`docs/SCREENSHOT_INDEX.md`) when layouts change. Store images under `docs/reference/screenshots/` with descriptive names.
4. Document behaviour deltas in the parity plan and update the backlog after each slice.
5. Run `npm run build` and `npm run test`. Delete `test-results/` artefacts before committing.
6. Capture verification notes in `docs/SESSION_HANDOFF.md`.

### Wrapper Library Work (Storybook + Vitest)
1. Treat Storybook as the public surface for wrappers—extend or update stories under `src/wrappers/**/**/*.stories.tsx` whenever wrapper APIs change. Validate the build with `npm run storybook:build` before handing off.
2. Keep wrapper smoke tests green by running `npm run test:unit` (Vitest) alongside the Playwright slice; add new cases in `src/wrappers/__tests__/` when behaviour changes.
3. Update wrapper READMEs (`src/wrappers/ui|form|data/README.md`) and note deltas in `docs/Tasks/phase-7-component-library-followups.md` so future plans pick them up.
4. Mirror only essential snippets into `ai-docs/wrappers-draft/` and record future “frozen snapshot” decisions in `docs/System/ai-docs-index.md`.

## Playwright / Test Work
1. Use Playwright for end-to-end scenarios; prefer label-based selectors.
2. Keep tests deterministic—reset state via the UI, avoid timing flakiness.
3. Remove `test-results/` after runs so the repo stays clean.
4. Mention new coverage in the parity plan and backlog.

## Documentation Workflow
- Use `docs/System/context-engineering.md` to confirm your role and required prompts before following plan instructions.
- `docs/System/documentation-structure.md` lists where each doc lives—update it when adding new files.
- `docs/System/documentation-index.md` links to quick references; keep it in sync.
- `docs/SOP/ui-walkthrough-checklist.md` must reflect the latest UI flow.
- Keep the parity backlog pointer (`docs/Tasks/parity-backlog-and-plan.md`) in sync; Phase 1–5 history still lives in `docs/Archive/Tasks/00_parity-backlog-and-plan.md`, while new work remains under `docs/Tasks/` with status badges.

### Post-change Checklist
After landing a feature or bug fix:
1. Update `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` with behaviour changes.
2. Update the applicable task document in `docs/Tasks/` (status badge, links to handoff) when adding follow-ups or closing work. Use the archived backlog only when touching legacy Phase 1–5 records.
3. Refresh SOP or walkthrough docs if workflows changed.
4. Capture new/updated screenshots and reference them in `docs/SCREENSHOT_INDEX.md`.
5. Add verification notes to `docs/SESSION_HANDOFF.md`.

## Deployments
1. Confirm tests pass locally.
2. `git push origin main`.
3. `vercel deploy --prod --yes` and record the resulting URL in the session handoff.
