# SOP — External TLDR Ingestion & Processing (PRO TLDR)

Purpose
- Standardise how we ingest the operator’s external TLDR (`/Users/m/Desktop/TLDR.markdown`), rename it to the next sequential brief, and process it into actionable repo artifacts (brief, board, tasks, handoff).

When
- End of every session during the reflection phase, before drafting or updating the next-session plan.

Source Path (constant)
- `/Users/m/Desktop/TLDR.markdown` (operator-maintained; latest guidance from PRO).

Numbering & Targets (flat, sequential)
- Determine next brief number `<NNN>` by scanning `docs/CurrentPlan/` and `docs/SessionBoards/`.
- Copy the external TLDR to: `docs/CurrentPlan/<NNN>_PRO_TLDR.md` (append‑only; keep earlier files intact).
- Ensure the paired files exist/update:
  - `docs/CurrentPlan/<NNN>_Agent_Brief.md`
  - `docs/SessionBoards/<NNN>_board.md`
  - Optional: add a `docs/SessionReports/<YYYY-MM-DD>_TLDR.md` (operator TLDR digest) if desired for daily indexing.

Approval Note
- Ask the operator once per session if ingest is approved (file may be a working draft). If approved, proceed and cite the source path in the copied file’s header.

Processing Steps (do, don’t just copy)
1) Copy & cite
   - Copy source to `docs/CurrentPlan/<NNN>_PRO_TLDR.md`.
   - Add a 3–4 line header at the top with date/time, source path, and brief number.
2) Extract actions
   - From the TLDR, pull: next-session goals, acceptance, gates/guardrails, and any code‑review nits.
   - Update `docs/CurrentPlan/<NNN>_Agent_Brief.md` Required Reading, Tasks, and Validation Matrix accordingly.
   - Update `docs/SessionBoards/<NNN>_board.md` Ready‑Next block to match the TLDR’s Must‑Ship items.
3) Reflect feedback into tasks
   - Amend `docs/Tasks/tracker_cli_todo.md` (check/uncheck, add bullets with links) per TLDR feedback.
   - If the TLDR introduces longer‑term measurement or policy items, add or update backlog stubs under `docs/Backlog/` and list them in `docs/Backlog/index.md`.
4) Record review notes
   - Append a short “PRO Review — <NNN>” section into `docs/SESSION_HANDOFF.md` with links to the copied TLDR and the updated brief/board/tasks.
   - Add a one‑line entry in `progress.md` noting the new brief number, with links to the TLDR and board.
5) Cross‑check consistency
   - Ensure `README`, UAT SOPs, and plans reference the current brief number where applicable.

Acceptance (each session)
- `docs/CurrentPlan/<NNN>_PRO_TLDR.md` exists with source citation.
- `docs/CurrentPlan/<NNN>_Agent_Brief.md` and `docs/SessionBoards/<NNN>_board.md` reflect the TLDR’s Must‑Ship and guardrails.
- Updated tasks/backlog where relevant; `SESSION_HANDOFF.md` and `progress.md` contain pointers.

Example Commands (manual copy)
```bash
# Determine NNN (e.g., 002)
NNN=002
cp -v "/Users/m/Desktop/TLDR.markdown" "docs/CurrentPlan/${NNN}_PRO_TLDR.md"
# Then open and add the 3–4 line header (date, source path, brief number)
```

Notes
- Files are append‑only; do not rewrite prior briefs.
- Keep the folder structure flat and numbered for grepability.
- If the TLDR revises earlier guidance, reflect changes in the new brief/board; do not edit historical briefs.
