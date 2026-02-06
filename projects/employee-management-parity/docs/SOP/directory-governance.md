# SOP – Directory Governance (No New Folders Without Approval)

Purpose
- Prevent churn from ad‑hoc folder creation. Keep docs discoverable and consistent.

Canonical Docs Structure (top‑level under `docs/`)
- `SOP/` – operating procedures and checklists
- `System/` – reference/indexes/reports (canonical homes)
- `Tasks/` – active phase docs, UAT packs, plans pointers
- `Archive/` – historical tasks/plans/reports only

Grandfathered (do not expand without approval)
- `Workspace/` – temporary staging used by Docs Coordinator
- Existing utility folders/files created prior to this SOP (e.g., `SOP/artifacts/`)

Rules
- Do NOT create new top‑level folders under `docs/` without explicit owner approval in writing (handoff or plan).
- New documents must live inside one of: `SOP/`, `System/`, `Tasks/`, or `Archive/`.
- Reports belong in `System/` (e.g., `DEMO_PARITY_INDEX.md`, `WRAPPER_ADOPTION_MATRIX.md`).
- The MVP checklist is canonical at `docs/Reports/PARITY_MVP_CHECKLISTS.md` until the owner approves a full relocation; keep the `System/` mirror in sync.
- Attachments (zips/screenshots) stay where they are; do not restructure without approval.

Change Control (when a new folder is unavoidable)
1) Draft a short plan `plans/YYYY-MM-DD_directory-change.plan.md` listing:
   - Proposed folder, rationale, alternatives considered
   - Exact files to move/update and link impacts
   - Validation (rg to find references), rollback
2) Get owner approval in writing (session handoff or plan comment).
3) Execute once approved; update indexes and `SESSION_HANDOFF.md`.

PR Checklist (enforce locally)
- [ ] No new top‑level folder under `docs/` (unless plan approved)
- [ ] New files placed in `SOP/`, `System/`, `Tasks/`, or `Archive/`
- [ ] Indexes updated: `docs/System/documentation-index.md`, `docs/README.md` (if needed)

Detection
- List top‑level under `docs/`: `ls -1 docs/`
- Search for non‑canonical paths in diffs: `rg -n "^\\+.*docs/[^SOTA]" -S` (S=System, O=SOP, T=Tasks, A=Archive)

