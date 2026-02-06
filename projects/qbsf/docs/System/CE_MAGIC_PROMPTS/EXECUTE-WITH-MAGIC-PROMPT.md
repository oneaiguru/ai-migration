# IMPLEMENTATION MAGIC PROMPT - I (MAIN AGENT ONLY)

Use this pattern when you are asked to implement an approved plan for Stage 0.

1. FOLLOW THE PLAN VERBATIM
- Re-read the plan and required docs before typing commands.
- If steps are unclear, pause and request a plan update instead of improvising.

2. REUSE EXISTING PATTERNS
- Prefer existing modules, scripts, and schemas.
- Keep changes consistent with specs and HANDOFF guardrails.

3. KEEP IMPLEMENTATION SIMPLE
- No placeholders; no stubs except where Stage 0 explicitly allows a skeleton.
- Avoid new workflows when a template already exists.

4. VALIDATE THE WORK
- Run the commands listed in the plan.
- If tests are missing for touched code, run `pnpm run typecheck` and log the gap in @IMPLEMENTATION_PLAN.md.

5. DOCUMENT THE OUTCOME
- Update `docs/SESSION_HANDOFF.md` with files changed, tests run, and next steps.
- Add `ARCHIVE: docs/Tasks/<slug>.task.md` to `PROGRESS.md`.
- Remove `docs/Tasks/ACTIVE_TASK.md` to unlock the next T step.
- Keep progress notes concise; no extra artifacts in git.

HANDOFF FILE PATTERN
When work is complete:
```
## YYYY-MM-DD – Implementer: <Task>
- Agent: `<identifier>`
- Plan: docs/Tasks/<slug>.plan.md
- Work summary: [file:line notes]
- Validation: [commands + results]
- Next: [follow-ups or confirm none]
```

CRITICAL RULES
- Do not deviate from the approved plan.
- Do not commit run artifacts or resume state.
- Stage only intended changes and keep the working tree clean.
