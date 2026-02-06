# Workspace – Staging Area for Multi‑Demo Docs

Purpose
- Temporary staging for Docs/Coordinator work. Agents write drafts here; orchestrator reviews and merges to canonical docs.

Structure
```
Coordinator/<demo-name>/
  README.md           # Demo-specific context
  Drafts/             # Work in progress
    DEMO_PARITY_INDEX.md
    WRAPPER_ADOPTION_MATRIX.md
    [other reports]
```

Workflow
1) Coordinator agent reads templates under `docs/SOP/artifacts/`.
2) Fill Drafts/ for the assigned demo.
3) Orchestrator reviews Drafts/.
4) Merge approved content to:
   - `docs/System/` (reports)
   - `docs/Tasks/uat-packs/` (UAT prompts)
   - `docs/SOP/demo-refactor-playbook.md`

After Merge
- Mark Drafts/ as MERGED or archive under `docs/Archive/`.
- Update `docs/SESSION_HANDOFF.md` with merge notes.

See: `docs/SOP/docs-coordinator-workflow.md`.

