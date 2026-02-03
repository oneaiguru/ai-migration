# SOP – Directory Governance

Purpose: keep documentation predictable and easy to search.

## Canonical Folders (`docs/`)
- `SOP/` – operating procedures and playbooks
- `System/` – reference material (indexes, path conventions, ADRs)
- `Tasks/` – active task briefs, discovery notes, UAT packs
- `Archive/` – completed plans/tasks/research (read-only)
- `Workspace/` – scratch space to be cleaned on handoff

## Rules
1. Do not create new top-level folders under `docs/` without an approved plan.
2. Place new documents inside the canonical folders above.
3. Update `docs/System/documentation-index.md` when adding or moving docs.
4. Leave binary attachments where they live unless a plan approves relocation.

## Change Control
1. Draft `plans/YYYY-MM-DD_directory-change.plan.md` describing rationale, affected files, validation, and rollback.
2. Obtain owner approval in `progress.md` or `docs/SESSION_HANDOFF.md` before executing.
3. After executing, refresh indexes and archive the plan.

## Enforcement Checklist
- [ ] No unauthorized folders under `docs/`
- [ ] New files filed under SOP/System/Tasks/Archive/Workspace
- [ ] Indexes updated where needed

## Detection Helpers
- `ls -1 docs/`
- `rg -n "^\\+.*docs/[^SOTAW]" -S`
