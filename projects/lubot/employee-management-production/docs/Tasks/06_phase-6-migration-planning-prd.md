# Phase 6 Migration Planning Snapshot

_Read this document in full before executing any Phase 6 plan. It provides the strategic context referenced by every plan._

## Goals
1. Swap bespoke overlays, forms, and table implementations for the shared wrapper stack (Radix + React Hook Form/Zod + TanStack Table).
2. Keep the UI parity evidence intact (screenshots, UAT notes, plan history).
3. Land each slice behind a clean build/test cycle so the next agent starts from a stable baseline.

## Stage Breakdown
| Stage | Focus | Acceptance Notes |
| ----- | ----- | ---------------- |
| Stage 0 | Harden wrapper APIs, theme tokens, and playground demos. | Tokens in DTCG format, wrappers covered by smoke tests, accessibility checklist seeded. |
| Stage 1 | Overlay migration. | Quick Add, edit drawer, bulk edit, tag manager, import/export, column settings on Radix. |
| Stage 2 | Form migration. | Quick Add + edit drawer use RHF + Zod schemas; error messaging matches legacy behaviour. |
| Stage 3 | Table migration. | TanStack DataTable replaces legacy grid with virtualization. |
| Stage 4 | Cleanup & polish. | Remove legacy flags, harmonise docs, prep deployment. |
| Stage 5 | Final QA. | Visual spot checks, voiceover/NVDA scheduling, Stage 6 prep. |
| Stage 6 | AI UAT. | Browser-agent checklist comparing current build vs previous refactor. |

## Execution Principles
- One plan per agent (enforced via `PROGRESS.md`).
- Each plan contains the exact commands to run; no improvisation.
- Tests must pass before handoff.
- Update `PROGRESS.md` immediately after each plan with the next plan name and status.

## Evidence Pointers
- `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` – parity evidence inventory and open risks.
- `docs/SESSION_SUMMARY.md` – current workstream summary.
- `docs/Archive/stage-6-ai-uat/Stage-6-Refactor-Issues-Beyond-the-Checklist.md` – latest AI UAT findings.

_If you uncover a gap or need additional context, log it in `PROGRESS.md` and stop—do not edit this document._
