# ⚡ EXECUTION MAGIC PROMPT – DELIVER THE BDD PLAN

Use this pattern when you are asked to *execute, implement, build, code,* or otherwise apply an approved plan for the subscription tracker.

### 1. FOLLOW THE PLAN VERBATIM
- Re-read the active plan and required SOPs before typing commands.
- Execute steps sequentially; if instructions are unclear, pause and flag in `docs/SESSION_HANDOFF.md` instead of improvising.

### 2. REUSE EXISTING PATTERNS
- Pull logic from archived parsers, fixtures, or docs instead of inventing new conventions.
- Maintain JSONL schemas, CLI verb signatures, and directory governance rules.

### 3. KEEP IMPLEMENTATIONS SIMPLE
- Prefer configuration or adapter layers to large rewrites.
- Honor ADR-004 lag buffer, ADR-007 absolute-path references, and subscription-only ingestion.

### 4. VALIDATE WITH REAL FIXTURES
- Run the commands listed in the plan (pytest, CLI ingest/complete, manual JSONL inspection).
- Use the provided fixtures for Codex/Claude (and GLM when available); never fabricate sample data.

### 5. DOCUMENT THE OUTCOME
- Capture tests run, JSONL artifacts created, and any follow-up work in `docs/SESSION_HANDOFF.md`.
- Update `progress.md` with a concise summary and command log.

### HANDOFF FILE PATTERN
When work is complete:
```
## YYYY-MM-DD – Executor: <Task>
- Agent: `<identifier>`
- Plan: `plans/YYYY-MM-DD_<task>.plan.md`
- Work summary: [file:line notes]
- Validation: [commands + results]
- Next: [follow-ups or confirm none]
```

### CRITICAL RULES
- **Do not** deviate from the plan; request a new plan if scope needs to change.
- **Do not** leave scratch files, dirty fixtures, or partial JSONL writes.
- **Do** stage only intended changes, run tests, and ensure the working tree is clean before handoff.
- **Do** flag blockers immediately in both the plan file (if applicable) and the handoff log.
