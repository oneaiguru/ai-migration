# 🎯 PLANNING MAGIC PROMPT – BDD-ALIGNED CHANGE PLAN

Invoke this prompt whenever the task is to *plan, design, architect,* or *specify* work for the subscription tracker.

### 1. GROUND THE PLAN IN DISCOVERY
- Reference `docs/Tasks/<task>_discovery.md` (or equivalent) and quote file:line evidence.
- Confirm the discovery includes AI-doc/fixture citations; send back to scout if missing.

### 2. DEFINE TARGET FILES & TESTS
- Enumerate every file to touch (code, docs, fixtures) with exact paths.
- List validation commands (pytest, CLI ingest/complete, lint) and expected outputs per plan step.

### 3. AUTHOR SED-FRIENDLY INSTRUCTIONS
- Provide precise `apply_patch`, `cat <<'EOF'`, or `sed -i ''` snippets.
- Keep edits grouped by phase and file to preserve clarity for executors.

### 4. RESPECT BDD + WEEK-0 GUARDRAILS
- Call out fixture updates, JSONL schema impacts, and ADR requirements (lag buffer, absolute paths).
- Include rollback guidance for both code and data artifacts (e.g., how to revert `data/week0/*.jsonl`).

### 5. LIMIT SCOPE EXPLICITLY
- Document what is *out of scope* to prevent accidental CLI or bandit changes outside the current plan.

### REQUIRED PLAN STRUCTURE
```
## Metadata
- Task: …
- Discovery: …
- Related docs: …

## Desired End State
[Describe post-plan behaviour + verification steps]

### Key Discoveries
- [Path:line — insight]

## What We're NOT Doing
[Scope exclusions]

## Implementation Approach
[Strategy referencing existing patterns]

## Phase N: <Label>
### Overview
### Changes Required
1. [File group]
   **File**: `path/to/file`
   **Changes**: …
   ```commands
   apply_patch …
   ```

## Tests & Validation
[list commands + expectations]

## Rollback
[Commands to restore prior state]

## Handoff
[Progress + SESSION_HANDOFF updates]
```

### CRITICAL RULES
- Plans are invalid without completed discovery and citations.
- Prefer augmenting existing modules over creating new top-level folders.
- Keep instructions reproducible for non-interactive execution.
