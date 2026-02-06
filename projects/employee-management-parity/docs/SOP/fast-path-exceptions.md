# SOP – Fast-Path Exceptions

Purpose
- Reduce ceremony for low-risk changes while keeping traceability.

Allowed Fast Paths
- Typos / documentation edits
  - Direct PR allowed; update `docs/SESSION_HANDOFF.md` (1 line).
- Emergency hotfixes (docs or build scripts)
  - Execute first; document within 24h (retro plan optional).
- Dependency updates (non-breaking)
  - Update + tests; note in `PROGRESS.md`.

Not Allowed (use full Scout→Planner→Executor)
- UI behavior changes
- API contracts
- DB/schema/data model changes
- New features (any size)

Checklist
- [ ] Record change in `docs/SESSION_HANDOFF.md`
- [ ] Update any affected indexes (`docs/System/documentation-index.md`)
- [ ] Validate build/tests where applicable

