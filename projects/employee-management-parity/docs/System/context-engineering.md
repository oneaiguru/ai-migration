# Context Engineering Playbook

This guide summarizes how Human Layer context engineering and the CE_MAGIC prompt suite apply to the employee-management parity repo. Every agent should review this document before choosing a role for a new session.

## Core Principles
- **Everything is context.** LLM quality depends on the tokens we send; keep instructions repeatable and compact.
- **Agents are stateless.** Externalize state in repository docs (`PROGRESS.md`, `docs/SESSION_HANDOFF.md`, plans, discovery notes).
- **Three-role cadence.** Run every task as Scout → Plan → Execute. Each role has its own prompts, SOPs, and deliverables.
- **Document handoffs.** Record outcomes in `docs/SESSION_HANDOFF.md` so the next agent inherits precise context.

## Role Mapping & Required Prompts
| Role | Primary Actions | Required Prompts | Required SOPs | Expected Deliverables |
| --- | --- | --- | --- | --- |
| **Scout** | Research current state, gather file:line evidence, identify gaps. | `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`<br>`${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md` | `docs/SOP/code-change-plan-sop.md` (Exploration step) | Discovery notes in `docs/Tasks/...-discovery.md` or `ai-docs/RESEARCH_BRIEF.md`, entry in `docs/SESSION_HANDOFF.md`. |
| **Planner** | Convert discovery into a sed-friendly change plan. | `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`<br>`${CE_MAGIC_PROMPTS_DIR}/PLAN-USING-MAGIC-PROMPT.md` | `docs/SOP/code-change-plan-sop.md` (Plan authoring) | `plans/YYYY-MM-DD_<task>.plan.md`, links logged in `docs/SESSION_HANDOFF.md`. |
| **Executor** | Apply plans exactly, run validations, prepare handoff. | `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`<br>`${CE_MAGIC_PROMPTS_DIR}/EXECUTE-WITH-MAGIC-PROMPT.md` | `docs/SOP/plan-execution-sop.md`, relevant task SOPs | Code changes, passing tests, updated docs, clean git state, detailed `docs/SESSION_HANDOFF.md` entry. |

## Required Reading Order
1. `PROGRESS.md` - identify the active plan and role expectation. Ask for clarification if the role is unclear.
2. Role-specific CE_MAGIC prompt(s) (table above) plus `SIMPLE-INSTRUCTIONS.md`.
3. SOP listed for that role.
4. Survey the `ai-docs/` workspace before diving into a task: skim `ai-docs/README.md`, `MANIFEST.md`, `RESEARCH_BRIEF.md`, `QUESTIONS.md`, and use the playground or reference docs as needed so you understand the latest research context.
5. Required Reading list inside the active plan or discovery notes, including any additional `ai-docs/…` pointers spelled out there.

## Handoff Expectations
- Always append a concise update to `docs/SESSION_HANDOFF.md` referencing delivered artifacts (discovery doc, plan file, code changes, tests).
- Archive older handoff sections in `docs/Archive/` once a major plan completes to keep the active log short.
- When executing, follow the CE message-file pattern conceptually: `docs/SESSION_HANDOFF.md` is our canonical message log.
- Executors: capture any new library gotchas or reusable patterns (e.g., dependency additions, Radix labelling rules) in the relevant discovery doc or SOP/README as part of the handoff.
- If an insight affects long-term workflow or SOP content, submit a follow-up plan so the SOP can be updated formally rather than leaving tribal knowledge in commits.

## Additional References
- Human Layer primer: `${MANUALS_ROOT}/details/l1/context_engineering/HUMAN_LAYER_COMPLETE.md`.
- Magic prompts directory: `${CE_MAGIC_PROMPTS_DIR}/`.
- AI Docs knowledge base: `ai-docs/` (README, MANIFEST, RESEARCH_BRIEF, QUESTIONS, playground, wrapper drafts). Use the search helpers (`ai-docs/scripts/docs_search.mjs`) when you need to locate specific guidance.
- For broader parity roadmap context, read `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` after the role prompts and SOPs.
