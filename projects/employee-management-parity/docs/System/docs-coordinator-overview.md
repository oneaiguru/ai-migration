# Docs Coordinator – Overview

This overview explains how we stage multi‑demo documentation so multiple agents can work in parallel without touching canonical docs until review.

- Roles
  - Docs/Coordinator: collects facts (path:line + CH §) and fills Drafts per demo.
  - Orchestrator: reviews Drafts, merges into canonical docs, queues execution plans.

- Where work happens
  - Staging: `docs/Workspace/Coordinator/<demo>/Drafts/*` (agent output)
  - Templates: `docs/Workspace/Templates/*`
  - Canonical (after merge): `docs/System/*.md`, `docs/Tasks/uat-packs/*.md`, `docs/SOP/demo-refactor-playbook.md`, `docs/Tasks/screenshot-checklist.md`

- Plan
  - See `docs/Tasks/multi-demo-docs-coordinator.plan.md` for the per‑demo reading list and acceptance.
  - Decisions are recorded in `docs/System/DEMO_EXECUTION_DECISION.md`.

- Evidence
  - Always include code `path:line` and CH § references; unknowns become UAT items.

This setup keeps the repo stable and enables parallel work across demos.
