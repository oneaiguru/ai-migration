# 📋 SIMPLE INSTRUCTIONS – SUBSCRIPTION TRACKER CADENCE

These guardrails apply to every role (Scout → Planner → Executor) when working on the Week-0 subscription tracker and its BDD workflow.

### ALWAYS DO FIRST
1. **Read `progress.md` and the active plan** so you know the current role, scope, and validation commands.
2. **Open every required doc** listed in the plan (PRD v1.6, Week-0 protocol, Saturday prep, ADRs, task briefs).
3. **Search the repository** (`rg`, `ls`, doc indexes) before proposing new code or docs.
4. **Trace requirements back to BDD fixtures** – confirm the relevant feature file and fixture snapshot before changing code.

### NEVER DO
- Start editing without confirming the role or plan status.
- Skip referenced SOPs/ADRs or the task discovery doc.
- Invent algorithms or new workflows when a template/process already exists.
- Reformat fixtures or JSONL outputs outside the plan.

### WEEK-0 REALITY CHECK
- Subscription-only ingestion; all data comes from CLI meters and JSONL logs.
- BDD-first: fixtures in `tests/fixtures/{codex,claude}` plus future GLM inputs drive acceptance.
- Append-only storage in `data/week0/{snapshots,windows,glm_counts}.jsonl`.
- Clean handoffs: update `docs/SESSION_HANDOFF.md` and archive superseded docs.

### SUCCESS PATTERN
1. **Scout** – catalogue current behaviour with file:line citations, especially fixture coverage.
2. **Plan** – map sed-friendly edits with explicit JSONL/test commands.
3. **Execute** – apply plan verbatim, run pytest/CLI checks, document outcomes and remaining work.
