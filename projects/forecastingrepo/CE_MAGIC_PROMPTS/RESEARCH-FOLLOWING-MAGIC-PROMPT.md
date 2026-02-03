# 🔮 RESEARCH MAGIC PROMPT – BDD DISCOVERY PATTERN

Use this script whenever a task asks you to *research, analyze, investigate, survey,* or otherwise gather context before planning.

### 1. SEARCH BEFORE YOU READ
- Run `rg`/`find` across `tracker/`, `tests/`, `docs/`, and `archive/` for relevant keywords (provider names, JSONL keys, feature IDs).
- Include historical references (`archive/v1_3/`, `archive/deepresearch/`) so regressions are avoided.

### 2. READ SOURCE MATERIAL END-TO-END
- Open the files you locate using `sed -n`/`cat` (no truncation) to understand the full behaviour.
- Prioritize: active docs → fixtures → legacy implementations → external references named in tasks/PRD.

### 3. CAPTURE FILE:LINE EVIDENCE
- Record findings with precise paths and line numbers (e.g., `archive/v1_3/tracker/sources/codex.py:18`).
- Note whether each reference applies to Codex, Claude, GLM, or shared infrastructure.

### 4. MAP READY VS MISSING
- Summarize what already exists (parsers, CLI verbs, tests) and what gaps remain.
- Highlight reusable templates (BDD feature structures, CLI patterns, JSONL schemas) versus new work needed.

### 5. FLAG RISKS & FOLLOW-UPS
- Document parser edge cases (narrow panes, "usage not loaded" states) and where fixtures live.
- Identify dependencies on Week-0 rituals (lag buffer, window naming) or ADR requirements.

### TAGGING CONVENTIONS
- **[PRD]** = Source of requirement in `docs/SOP/PRD_v1.6-final.md`
- **[SOP]** = Operational rule (Week-0 protocol, Saturday prep)
- **[FIXTURE]** = Evidence from `tests/fixtures`
- **[LEGACY]** = Archived implementation that informs the update
- **[GAP]** = Missing asset that blocks planning/execution

### MUST-NOT BREAK RULES
- **Do not** skip fixture review; BDD coverage is mandatory context.
- **Do not** propose API-mode or non-subscription alternatives.
- **Do** surface absolute paths so executors can copy-paste quickly.

### SAMPLE OUTPUT
```
1. Searching for "snapshots.jsonl" references…
   - Found: docs/SOP/PRD_v1.6-final.md:59 [PRD]
   - Found: archive/v1_3/PRD_v1.3_subscription_usage_tracker.md:219 [LEGACY]
2. Reading fixtures…
   - tests/fixtures/codex/wide_status_82_1.txt [FIXTURE]
3. Existing behaviour: legacy parser handles weekly reset text [LEGACY]
4. Missing: live CLI to write JSONL snapshots [GAP]
```
