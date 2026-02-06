# Parser & BDD Test Plan (v1.3 Archive)

This document condenses the guidance from the legacy `13bdd.md` handoff. All referenced feature files, step definitions, and parser sketches are stored alongside this note so the original structure is preserved for historical reference.

---

## 0) Requirements Observed From Fixtures

### Codex `/status`
- Bars are always present but may wrap onto multiple lines.
- Weekly reset phrasing varies (for example, `resets 21:29 on 19 Oct` vs `resets 13:05 on 8 Oct`).
- Ultra-narrow panes can show headers without percentages; such cases must trigger an `insufficient-data` error.

### Claude `/usage`
- Pane can return `Error: Failed to load usage data` until any message (such as `hi`) is sent.
- Narrow widths produce two-line headers (e.g., `Current week (all models)` on one line and the percentage on the next).
- `Current week (all models)` and `Current week (Opus)` must be parsed as distinct sections.

### General Handling
- Strip ANSI/box glyphs before parsing.
- Regexes must accept wrapped content (use DOTALL) so tokens like `"82% u\nsed"` are handled.

---

## 1) Parser Contracts
- `tracker/sources/codex.py` exposes `parse_codex_status(text)` returning `fiveh_pct`, `fiveh_resets`, `weekly_pct`, `weekly_resets`, and `errors`.
- `tracker/sources/claude.py` exposes `parse_claude_usage(text)` returning `session_pct`, `session_resets`, `all_models_pct`, `all_models_resets`, `opus_pct`, and `errors`.
- Shared preprocessing includes ANSI stripping, whitespace normalization, and wrap-tolerant regex matching.
- Error heuristics include:
  - Codex: append `insufficient-data` when neither percentage is present.
  - Claude: append `usage-not-loaded` when the pane content indicates it; add `section-missing-*` when a header is present without a percentage.

---

## 2) Files In This Archive Folder
- `tests/bdd/features/codex_status_parse.feature`
- `tests/bdd/features/claude_usage_parse.feature`
- `tests/bdd/steps/parse_steps.py`
- `tracker/sources/codex.py`
- `tracker/sources/claude.py`

These files mirror the original snippets from the v1.3 notes so agents can replay or adapt them as needed.

---

## 3) Coverage Targets & CLI UX
- Maintain combined BDD + unit coverage ≥90% for `tracker/sources/*` and `normalize/windows.py`.
- Enforce at least one failing test when Codex output lacks percentages (protects against silent parsing failures).
- CLI guidance to surface parser errors:
  - `insufficient-data`: instruct the operator to widen the terminal and rerun `/status`.
  - `usage-not-loaded`: instruct to send `hi` followed by `/usage`.
  - `section-missing-*`: highlight the specific missing section.

---

## 4) Additional Research Requests (Historical)
- Capture a `ccusage blocks --live` sample to extend coverage to GLM prompt counts.
- Provide a small Claude trace JSONL to validate fallback parsing when `ccusage` is unavailable.

---

This file, together with the adjacent code artifacts, satisfies the requirement to preserve the complete v1.3 handoff while marking it as obsolete relative to PRD v1.6.
