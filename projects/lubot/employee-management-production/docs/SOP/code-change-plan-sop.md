# SOP – Structured Code-Change Plans (Sed-Friendly)

## Goal
Create executable change plans so multiple agents can collaborate without touching the same files simultaneously. Follow the Human Layer cadence (Scout → Planner → Executor) and the CE_MAGIC prompts for each role to keep context engineered and repeatable.

## Role Cadence & Required Prompts
| Role | Prompts | Primary SOP Section | Output |
| --- | --- | --- | --- |
| **Scout** | `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`<br>`/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md` | This document – *Exploration* | Discovery notes (`docs/Tasks/...-discovery.md` or `ai-docs/RESEARCH_BRIEF.md`) + `docs/SESSION_HANDOFF.md` entry |
| **Planner** | `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`<br>`/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md` | This document – *Planning* | `plans/YYYY-MM-DD_<task>.plan.md` + handoff update |
| **Executor** | `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`<br>`/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md` | `docs/SOP/plan-execution-sop.md` | Code changes, tests, documentation updates + handoff |

Refer to `docs/System/context-engineering.md` for a full explanation of the cadence and reading order.

## Workflow Overview
1. **Exploration agent** gathers context (files, requirements, test matrix) following the research prompt, recording file:line evidence in discovery notes and `docs/SESSION_HANDOFF.md`.
2. **Plan authoring agent** reads the scout output, runs the planning prompt, and produces an immutable change plan containing every edit, validation step, and rollback path.
3. **Execution agent** reads the execution prompt, runs the plan verbatim, pushes commits, and documents outcomes in both `PROGRESS.md` and `docs/SESSION_HANDOFF.md`.

Each phase happens on `main` without local commits until execution completes. Planners must confirm the scout’s discovery includes an **AI-Docs References** section before continuing; if it is missing or incomplete, stop and send the work back to the scout.

## Plan File Structure (Magic Prompt Template)
Every plan must follow this structure exactly:

1. `## Metadata` – task title, target files/folders, related docs.
2. `## Desired End State` – description of the post-plan repo state and how to verify it.
3. `### Key Discoveries` – bullet list with file:line references from the scout phase.
4. `## What We're NOT Doing` – guardrails to avoid scope creep.
5. `## Implementation Approach` – one-paragraph strategy referencing existing patterns.
6. For each phase (e.g., `## Phase 1: Overlay Wrapper Updates`):
   - `### Overview` – goal of the phase.
   - `### Changes Required:` – numbered subsections by file group including:
     - **File:** `path/to/file.ext`
     - **Changes:** short summary.
     - fenced code block (language-tagged) with the exact `apply_patch` or content to add/remove.
7. `## Tests & Validation` – exact commands (`npm run build`, Playwright slices) and expected outcomes.
8. `## Rollback` – commands to restore the prior state if execution fails.
9. `## Handoff` – instructions for updating `PROGRESS.md`, `docs/SESSION_HANDOFF.md`, and any other docs.

Use `apply_patch`, `cat <<'EOF' >`, or POSIX-safe `sed -i ''` commands. Plans must be idempotent; rerunning them should not duplicate content.

## Authoring Rules
- Never draft a plan without a completed scout phase. Link to the discovery doc in the Metadata section.
- Scouts must mine `ai-docs/` (README, MANIFEST, RESEARCH_BRIEF, QUESTIONS, wrapper drafts, reference snippets, playground demos) using the provided scripts (`ai-docs/scripts/docs_search.mjs`) so new findings don’t get missed, then surface the results in discovery under an **AI-Docs References** heading. When tasks list AI-doc files, read each one end-to-end before touching production code and cite every reference with file:line detail. Discovery or plans missing required AI-doc citations are invalid and must be redone. If you need production parity for a specific behaviour, copy just the relevant excerpt into the draft and note it in the README rather than mirroring entire files by default.
- Planners cite those AI-doc file:line references inside `### Key Discoveries` (and anywhere patterns are reused) so executors know which examples informed the plan.
- Reference existing code patterns instead of inventing new ones; include file:line evidence.
- Keep commands grouped by file and add 3–5 lines of context for TypeScript/JSX edits when possible.
- Prefer configuration/template updates over algorithmic rewrites, mirroring the CE prompts.
- Include `set -euo pipefail` at the top of any multi-command shell block.
- Record the plan’s filename in `docs/SESSION_HANDOFF.md` with a brief summary and required next steps.
- When a new plan supersedes an older draft, move the previous markdown into `docs/Archive/Plans/wrong-drafts/` or `docs/Archive/Plans/executed/`—do not delete plan files from the repository.

### Planner Onboarding Checklist
Before drafting any plan (example: Stage 3 table migration), follow this repeatable sequence:
1. Re-read `PROGRESS.md` to confirm the active workstream and verify no other plan is in flight.
2. Review role guidance: `docs/System/context-engineering.md`, the CE planner prompt (`PLAN-USING-MAGIC-PROMPT.md` + `SIMPLE-INSTRUCTIONS.md`), and this SOP to refresh cadence expectations.
3. Read the latest discovery doc end-to-end (e.g. `docs/Tasks/phase-6-table-migration-discovery.md`) and note all cited AI-doc assets.
4. Open every AI-doc referenced by the scout (`ai-docs/wrappers-draft/...`, playground demos, reference snippets) to validate patterns before you cite them in `### Key Discoveries` or phase instructions.
5. Revisit supporting context (PRDs, parity plan, migration briefs) linked from the discovery so the plan covers adjacent systems (overlays, exports, Playwright selectors, etc.).
6. Draft `plans/YYYY-MM-DD_<task>.plan.md` following the structure above, ensure tests/rollback steps are explicit, then log the plan in `docs/SESSION_HANDOFF.md` and mark it as the active plan in `PROGRESS.md`.

## Handoff Expectations
- Discovery notes → `docs/SESSION_HANDOFF.md` + linked markdown file.
- Plan author → `docs/SESSION_HANDOFF.md` entry that cites the new plan path and highlights validation commands.
- Executor → update `PROGRESS.md`, append a detailed `docs/SESSION_HANDOFF.md` entry (tests, blockers, deployment), and archive superseded plans/docs.

## Example Timeline
| Phase | Owner | Deliverable |
| ----- | ----- | ----------- |
| Scout | Agent A | `docs/Tasks/<task>-discovery.md`, handoff update |
| Plan | Agent B | `plans/YYYY-MM-DD_<task>.plan.md`, handoff update |
| Execute | Agent C | Code changes + tests + updated docs + handoff |

By separating planning from execution and grounding each phase in the CE prompts, we avoid merge conflicts, preserve cache-friendly context, and maintain an auditable trail of every intended change.
