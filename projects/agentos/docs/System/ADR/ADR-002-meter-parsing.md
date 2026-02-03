# ADR-002 — Meter Parsing Strategy

- **Status:** Proposed (2025-11-05)
- **Context:** CLI panes include varying glyph bars, spacing, and reset text (`resets 21:29 on 19 Oct`, `Resets Oct 20, 2am (Asia/Irkutsk)`); PRD §2 defines regex-based fallbacks.
- **Decision:** Parse Codex `/status` and Claude `/usage` using regex families resilient to glyph bars, spacing, and reset phrasing changes.
- **Rationale:** Historical fixtures show vendors tweak formatting; resilient regex keeps ingestion stable without manual intervention.
- **Implications:**
  - Keep fixtures current (`tests/fixtures/codex/*`, `tests/fixtures/claude/*`).
  - On parse failure, provide manual overrides (`tracker window finalize --override ...`).
  - Add regression tests to ensure narrow panes trigger explicit `insufficient-data` errors.
