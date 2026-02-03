# ADR-003 — GLM Prompt Counting via ccusage (Primary)

- **Status:** Proposed (2025-11-05)
- **Context:** PRD §2 highlights ccusage as the canonical provider for GLM prompt counts; trace JSON lacks `"role":"user"` markers.
- **Decision:** Use ccusage as the primary counter for GLM prompts/blocks; fall back to trace heuristics only when ccusage data is unavailable.
- **Rationale:** ccusage already understands Claude JSONL shapes and 5-hour blocks, reducing custom parsing risk.
- **Implications:**
  - Implement a ccusage bridge in the tracker; pin version if CLI output changes.
  - Record `count_source` (`ccusage`, `trace`, `manual`) in `glm_counts.jsonl`.
  - Provide diagnostics for missing ccusage snapshots to trigger manual entry.
