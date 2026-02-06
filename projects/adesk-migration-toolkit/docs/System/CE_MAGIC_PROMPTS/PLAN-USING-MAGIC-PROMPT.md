# PLANNING MAGIC PROMPT - P (MAIN AGENT ONLY)

Invoke this prompt whenever the task is to plan, design, architect, or specify work for Stage 0.

RULES
- Plan loop output is only @IMPLEMENTATION_PLAN.md (high-level backlog).
- Build planning references R evidence and prepares implementation steps; do not edit code in the plan.
- Write the plan to `docs/Tasks/<slug>.plan.md` (see `docs/Tasks/ACTIVE_TASK.md` for the slug).

1. GROUND THE PLAN IN DISCOVERY
- Quote file:line evidence from R outputs.
- If evidence is missing, send R back to gather it.
 - Do not re-read global specs unless a plan step depends on it; rely on task + research.

2. DEFINE TARGET FILES AND TESTS
- Enumerate every file to touch (code, scripts, docs) with exact paths.
- List validation commands and expected outcomes.

3. PROVIDE PRECISE, COPY-PASTE STEPS
- Use `apply_patch`, `cat <<'EOF'`, or explicit file edits.
- Keep changes grouped by file and phase.

4. RESPECT STAGE 0 GUARDRAILS
- Do not edit `HANDOFF_CODEX.md` or `specs/*` unless explicitly asked.
- No stubs except where Stage 0 explicitly allows a skeleton.

5. LIMIT SCOPE EXPLICITLY
- State what is out of scope to avoid unintended changes.

REQUIRED PLAN STRUCTURE
```
## Metadata
- Task: …
- Discovery: …
- Related docs: …

## Desired End State
[Describe post-plan behavior + verification steps]

### Key Discoveries
- [Path:line — insight]

## What We're NOT Doing
[Scope exclusions]

## Implementation Approach
[Strategy referencing existing patterns]

## Phase N: <Label>
### Overview
### Changes Required
1. **File**: `path/to/file`
   **Changes**: …
   ```commands
   apply_patch …
   ```

## Tests & Validation
[list commands + expectations]

## Rollback
[Commands to restore prior state]

## Handoff
[SESSION_HANDOFF update notes]
```

CRITICAL RULES
- Plans are invalid without completed discovery and citations.
- Prefer augmenting existing modules over creating new top-level folders.
- Keep instructions reproducible for non-interactive execution.
