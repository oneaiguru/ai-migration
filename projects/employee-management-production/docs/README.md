# Documentation Overview

Welcome to the employee-management parity docs. Start here before planning any new work.

## Folder Map
- `System/` – architecture snapshots & parity guardrails.
  - `employee-management-overview.md` – key modules and data fields.
  - `project-structure.md` – directory layout and key files.
  - `documentation-index.md` – quick links to every doc.
  - `documentation-structure.md` – rules for maintaining docs.
  - `context-engineering.md` – Human Layer + CE_MAGIC role guidance.
  - `ui-guidelines.md` – copy conventions (no “демо” labels, no tech names in UI).
- `SOP/` – operating procedures and validation checklists.
  - `standard-operating-procedures.md`
  - `ui-walkthrough-checklist.md`
  - `prd-feedback-sop.md`
  - `session-prep-and-handoff.md`
- `Tasks/` – active Phase docs, discovery notes, and PRDs. Each file carries a status header (Active/Completed/Deprecated) and links to the relevant session handoff entry.
  - Example: `phase-6-overlay-discovery.md`, `phase-7-component-library-task.md`, `phase-8-trimmed-demo-task.md`.
  - Legacy Phase 1–5 PRDs remain in `docs/Archive/Tasks/` for reference, but new work stays in `docs/Tasks/` with status notes.
  - Plans continue to archive under `docs/Archive/Plans/` (`executed/` vs `wrong-drafts/`).
- Root docs:
  - `EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`
  - `SCREENSHOT_INDEX.md`
  - `AGENT_PARITY_REPORT.md`
  - `SESSION_HANDOFF.md`
  - `SESSION_SUMMARY.md`
  - `TODO_AGENT.md`
  - `ENVIRONMENT_FIX_TODO.md`
  - `Archive/` – previous session handoffs and historical notes
  - `PRD_STATUS.md`
  - `System/parity-roadmap.md`
- `ai-docs/` – research sandbox (playground, wrapper drafts, reference docs, discovery notes).
- `for_humans/` – plain-language explainers for human collaborators. Only update this folder when a human explicitly requests it (e.g. “document it for me in for_humans”).

## Before You Start
1. Go to the repository root and read `PROGRESS.md`.
2. Identify your role (Scout, Planner, Executor) and read the corresponding prompts/SOPs using `docs/System/context-engineering.md`.
3. Follow the plan listed in `PROGRESS.md`; no other plan or doc starts work.
4. Use this README only as a reference index once you’re inside a plan.
