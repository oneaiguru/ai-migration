# ADR-004 — Lag Buffer for Meter Reads

- **Status:** Proposed (2025-11-05)
- **Context:** Vendor panes lag by a few minutes; PRD §6 mandates a safety buffer to prevent AFTER reads from reporting lower values than BEFORE.
- **Decision:** Wait at least 5 minutes after completing a window before capturing AFTER meters.
- **Rationale:** Aligns with operational comfort and mitigates UI rounding delays.
- **Implications:**
  - Scheduler blocks ingestion until the buffer elapses; provide `--force` override for manual runs.
  - Document buffer enforcement in Week-0 protocol (`docs/SOP/week0_final_protocol.md`).
