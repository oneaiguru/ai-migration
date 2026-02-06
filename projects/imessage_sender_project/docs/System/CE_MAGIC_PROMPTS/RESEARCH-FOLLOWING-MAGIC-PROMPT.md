# RESEARCH MAGIC PROMPT - R ONLY

Use this script whenever a task asks you to research, analyze, investigate, or gather context before planning.

1. SEARCH BEFORE YOU READ
- Run `rg` across `apps/`, `packages/`, `specs/`, `docs/`, `scripts/`, `images/` for keywords.
- Include related files referenced in specs or HANDOFF.

2. READ SOURCE MATERIAL END-TO-END
- Start with the Required Reading list in `docs/Tasks/<slug>.task.md`.
- Open relevant files with `sed -n` or `cat` (avoid truncation).
- Prioritize: specs and HANDOFF -> code -> scripts -> docs.

3. CAPTURE FILE:LINE RANGES
- Record findings with precise paths and line ranges (e.g., `apps/worker/src/index.ts:120-168`).
- Keep the list concise and copy-paste friendly.
- Write findings to `docs/Tasks/<slug>.research.md` (see `docs/Tasks/ACTIVE_TASK.md` for the slug).

4. MAP READY VS MISSING
- Summarize what exists and what is missing, tied to the file:line evidence.
- Call out reusable patterns versus new work.

5. FLAG RISKS AND FOLLOW-UPS
- Document conflicts with guardrails or missing tests.
- Note any spec inconsistencies and stop before editing.

MUST-NOT BREAK RULES
- No edits, no tests.
- Output must be file:line ranges only, one per line; output `NONE` if nothing found.
Format example:
specs/entrypoint.md:40-118
apps/worker/src/index.ts:120-210
