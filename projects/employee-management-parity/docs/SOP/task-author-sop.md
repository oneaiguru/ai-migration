# SOP – Task Author Hand-off (Replication Projects)

## Purpose
Define a repeatable workflow for the "Task Author" role used in replication projects. Task Authors translate fresh UAT feedback or manual deltas into actionable work items for the Scout → Planner → Executor cadence. They do not change code; instead they produce the task brief that other roles will run.

## When to Use
- After UAT agents or coordinators log a parity gap that spans multiple features.
- When existing plans have been executed but new evidence (manual screenshots, real-system walkthroughs) reveals additional remediation work.
- Any time the repo needs a clearly scoped task file before a new scout pass starts.

## Required Reading
1. `PROGRESS.md` (confirm active streams and role expectations).
2. `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md` (baseline CE rules).
3. Relevant UAT reports / parity notes (e.g. `docs/Archive/UAT/…`).
4. Manual references and screenshot packs cited by the UAT report (`${MANUALS_ROOT}/…`, desktop image folders).
5. Existing vision/scout notes for the same domain (`docs/Workspace/Coordinator/...`).
6. `docs/System/path-conventions.md` (ensure portable references).

> Task Authors may optionally scan the CE scout prompt for tone alignment, but they are not running the full scout workflow.

## Output
- A task file under `docs/Tasks/` named `YYYY-MM-DD_<slug>.task.md` (reuse repo/date conventions).
- If scope touches multiple demos, create one task per demo; never mix demos in a single file.
- Update `docs/SESSION_HANDOFF.md` with a short entry pointing to the new task (role = Task Author).

## Workflow
1. **Validate Context** – Confirm no other active task targets the same issue by reviewing `PROGRESS.md` and `docs/SESSION_HANDOFF.md`.
2. **Absorb Evidence** – Read the triggering UAT document end-to-end. Collect manual section IDs, screenshot filenames, and any code pointers from prior scout/plan artifacts.
3. **Inspect Source** – Open the relevant repository files to understand current behaviour. Capture file:line references for every gap the task must address. (Task Authors can use `rg`, `sed -n`, etc., but must not modify files.)
4. **Define Scope & Acceptance** – For each gap, describe:
   - Expected behaviour with manual citations
   - Current implementation reference (`${EMPLOYEE_PORTAL_REPO}/src/...:line`)
   - Acceptance criteria (what proves the gap is closed)
5. **Lay Out Role Handoffs** – Split instructions by role:
   - *Scout* – discovery deliverables needed before planning
   - *Planner* – plan output, required docs, validations
   - *Executor* – code/tests/docs expectations and deploy steps
6. **Document Supporting Material** – List required reading order, manual assets, existing plans, and known risks.
7. **Write the Task File** – Use Markdown sections (Context, Goal, Deliverables, Required Reading, Scope, Tests, Checklist). Keep commands/testing instructions explicit.
8. **Record Handoff** – Add a concise entry to `docs/SESSION_HANDOFF.md` noting the task file path, summary of gaps, and next role expected to act.

## Guardrails
- Do **not** introduce new folders; reuse `docs/Tasks/` and existing workspace directories.
- Avoid duplicating content already present in scouts/plans. Link to those docs instead.
- Task files must stay docs-only. No TODOs should be hidden in code comments.
- If evidence is insufficient (missing manual screenshots, ambiguous requirements), loop with the UAT/coordinator team before publishing the task.
- Never merge multiple unrelated UAT topics into a single task; create separate briefs to keep execution tight.

## Completion Checklist
- [ ] Validated no overlapping active tasks
- [ ] Reviewed UAT/manuscript evidence and current code
- [ ] Authored task markdown with scope, acceptance, role handoffs, validation commands
- [ ] Logged handoff entry referencing the new task file

Following this SOP ensures downstream scouts have a ready-made brief, planners can author precise change plans, and executors get a clean starting point without re-reading all raw UAT feedback.
