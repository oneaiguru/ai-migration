# ADR-007 — Absolute Paths for Magic Prompt References

- **Status:** Proposed (2025-11-05)
- **Context:** The repo runs on a single workstation; environment variables like `${CE_MAGIC_PROMPTS_DIR}` add noise and drift.
- **Decision:** Reference CE magic prompts, enhanced prompts, and BDD process docs using absolute paths specific to this workstation.
- **Rationale:** Eliminates confusion about shell variables and ensures plans/prompts point to the exact files agents must read.
- **Implications:**
  - Documentation must list full paths (e.g., `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/...`).
  - Remove `${...}` path conventions from docs; future relocations require updating this ADR.
  - Scripts relying on environment variables should be updated to consume absolute paths or accept CLI parameters.
