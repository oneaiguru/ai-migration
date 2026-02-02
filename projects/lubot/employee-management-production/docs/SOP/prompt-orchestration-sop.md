# Prompt Orchestration SOP (WIP)

This SOP defines a two-step prompting workflow so future coding agents can be primed with the exact context they need—without re-reading the entire repo—while keeping the final execution instructions deterministic. Inspired by Human Layer context-engineering patterns and the prompt templates under `~/git/tools/compact/`, the process emphasises stateless prompts, externalised plans, and guardrails that prevent accidental doc rewrites.

## 1. Goals

1. **Speed up onboarding** – deliver a single “prime” prompt containing only unique information for the task.
2. **Avoid context drift** – keep change instructions in dedicated plan files, referenced from the final execution prompt.
3. **Prevent collateral edits** – explicitly warn agents not to reformat checklists (e.g., don’t turn numbered readlists into `[x]` tasks).

## 2. Prompt Structure

### Step 1 – Prime Prompt
* Audience: fresh agent with zero prior context.
* Contents:
  - Purpose of the session and overall objective.
  - Ordered reading list with precise file line ranges (only the files needed for discovery).
  - Links to relevant SOPs/plan files.
  - Behavioural guardrails (e.g., “Do NOT convert enumerated readlists into checkboxes”).
* Output expectation: agent reads the listed files and acknowledges readiness; no code/doc changes yet.

### Step 2 – Execution Prompt
* Audience: same agent, now primed.
* Contents:
  - Reference to the specific plan file under `plans/` (e.g., `plans/YYYY-MM-DD-task.plan.md`).
  - Exact commands/tests to run.
  - Deployment/reporting steps.
* Output expectation: agent executes the plan, runs tests, updates docs, and records evidence.

## 3. Authoring Guidelines

1. **Create or update** `docs/prompts/<task>-prime.md` and `<task>-execute.md` per project.
2. **Mirror plan files** – the execution prompt should always point at a plan produced earlier (see `docs/SOP/code-change-plan-sop.md`).
3. **Guardrail wording** – include explicit instructions such as:
   - “Do not alter numbering/formatting of `docs/SESSION_READLIST.md`.”
   - “Only update the files listed in the plan unless instructed otherwise.”
   - “Once primed, proceed straight to execution; skip status summaries unless blocked.”
4. **Leverage template inspiration** – reuse compact prompt patterns from `~/git/tools/compact/enhanced-magic-prompts.md` and `~/git/tools/compact/ce-magic-prompts-value-analysis.md` to keep prompts concise and cache-friendly.

## 4. Future Automation (WIP)

* Automate generation of prime/execute prompts via a script that reads plan metadata.
* Integrate with the “stateless reducer” mindset: store prompt history in git so any agent can resume work without the LLM relying on long chat memory.

> **Status:** Draft (WIP). Use as guidance when crafting manual prompts; once validated, codify into tooling.
