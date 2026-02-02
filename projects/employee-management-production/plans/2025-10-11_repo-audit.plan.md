# Repo Reference Audit – Post-Docs Cleanup

## Metadata
## Required Reading (read in full)
- PROGRESS.md
- docs/SOP/code-change-plan-sop.md
- docs/SOP/plan-execution-sop.md

- **Task**: verify that non-code assets (docs, plans, prompts, AI workspace) no longer link to removed files after the backlog archive refresh.
- **Related Docs**:
  - AGENTS.md
  - docs/System/documentation-index.md
  - docs/prompts/stage-6-uat-agent.md
  - docs/SESSION_READLIST.md
  - docs/Archive/Tasks/00_parity-backlog-and-plan.md
  - ai-docs/README.md, MANIFEST.md, RESEARCH_BRIEF.md, QUESTIONS.md

## Desired End State
- No repository file references missing assets like the legacy `docs/Tasks/parity-backlog-and-plan.md` or `docs/SESSION_READLIST.md`; all pointers either hit the active stub or the archived files.
- Plans and prompts (current + archived) reference the rebuilt readlist and backlog paths.
- AI-docs guidance and README files match the refreshed documentation structure.
- Handoff updated with findings, and any remaining gaps flagged for follow-up.

### Key Discoveries
- AGENTS.md:57-70 – primary doc index now calls out the stubbed backlog and archived PRDs; verify other references follow suit.
- docs/System/documentation-index.md:5-26 – index rewired to the stub/archives but still the single source for quick links.
- docs/prompts/stage-6-uat-agent.md:1-44 – prompt now points at `plans/05_stage6-uat-report.plan.md` and the new readlist; ensure other prompt files align.
- docs/SESSION_READLIST.md:1-9 – new readlist stub created to satisfy plan/SOP references.

## What We're NOT Doing
- No code or test changes beyond fixing references.
- No restructuring of archived content; copy the approach we already established (stub → archive).
- No updates to the active table migration plan (leave `plans/2025-10-10_table-migration.plan.md` untouched).

## Implementation Approach
Use repo-wide searches to locate leftover references (`rg` for `docs/Tasks/`, `SESSION_READLIST`, etc.), update them to the stub/archived paths, and confirm the same conventions exist across prompts, plans (active + archived), and AI-docs guidance. Finish by logging the audit in `docs/SESSION_HANDOFF.md` without changing the active plan status.

## Phase 1: Sweep documentation & SOP references

### Overview
Catch any remaining direct links to the removed backlog or readlist files in `docs/`.

### Changes Required:

1. Search for outdated paths
   ```bash
   rg "docs/Tasks/" docs -g"*.md"
   rg "SESSION_READLIST" docs -g"*.md"
   ```
2. For each hit:
   - If it should point at the backlog, reference `docs/Tasks/parity-backlog-and-plan.md` (stub) or `docs/Archive/Tasks/00_parity-backlog-and-plan.md` explicitly.
   - If it references the readlist, ensure it targets `docs/SESSION_READLIST.md`.
3. Update affected files with `apply_patch` blocks, keeping edits scoped to the necessary lines.

## Phase 2: Audit plan & prompt files (active + archived)

### Overview
Plans under `plans/` and `docs/Archive/Plans/` frequently embed readlist/backlog instructions. Bring them in line with the new structure.

### Changes Required:

1. Search the plan directories
   ```bash
   rg "parity-backlog" plans docs/Archive/Plans -g"*.md"
   rg "SESSION_READLIST" plans docs/Archive/Plans -g"*.md"
   ```
2. Update any occurrences of removed paths using `apply_patch`, mirroring Phase 1 conventions.
3. When editing archived plans, add a short note (e.g., `(archived reference updated 2025-10-11)`) if context would be unclear.

## Phase 3: Sync AI-docs guidance

### Overview
Ensure the AI workspace references the same doc structure so future scouts don’t regress to the deleted files.

### Changes Required:

1. Open these files and apply targeted updates as needed:
   - `ai-docs/README.md`
   - `ai-docs/MANIFEST.md`
   - `ai-docs/RESEARCH_BRIEF.md`
   - `ai-docs/QUESTIONS.md`
2. Confirm any mentions of the backlog/readlist or SOPs reference the stubbed/archived paths.
3. Use `apply_patch` for edits, preserving surrounding context.

## Phase 4: Document the audit

### Overview
Log the completed sweep and leave breadcrumbs for future agents.

### Changes Required:

1. Update `docs/SESSION_HANDOFF.md`:
   - Add a new dated entry summarising the reference audit (files touched, commands run, remaining TODOs if any).
2. Leave `PROGRESS.md` unchanged (table migration plan stays active).

## Tests & Validation
- `rg "docs/Tasks/"` (no unexpected hits outside the stub/archived files)
- `rg "SESSION_READLIST"` (only the stub and intended plans/prompts)

## Rollback
```bash
set -euo pipefail
git restore AGENTS.md \
  docs/System/documentation-index.md \
  docs/prompts/stage-6-uat-agent.md \
  docs/SESSION_READLIST.md \
  docs/SOP/standard-operating-procedures.md \
  docs/SOP/documentation-refresh-checklist.md \
  docs/SOP/prd-feedback-sop.md \
  docs/SOP/ui-walkthrough-checklist.md \
  docs/SOP/session-prep-and-handoff.md \
  docs/System/ui-guidelines.md
```
(Extend the list if additional files are touched during execution.)

## Handoff
- Leave `PROGRESS.md` pointing at `plans/2025-10-10_table-migration.plan.md` (executor still owns it).
- Record the audit summary, commands, and any follow-ups in `docs/SESSION_HANDOFF.md`.
- Do not create new plans after finishing—this file remains queued until the table migration closes.
