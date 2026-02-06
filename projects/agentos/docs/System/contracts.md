# Contracts & Invariants (v1)

These rules ensure all tools interoperate cleanly and analyses remain comparable.

- IDs & Keys
  - `window_id`: `W0-XX` (zero‑padded), monotonic per provider
  - `provider`: `codex` | `claude` | `glm`
  - `session_id`: provider native; stored as string
  - `snapshot_id`: `sha256(provider + window + captured_at + raw_text)` (dedupe guard)
- Time & Locale
  - Timestamps in ISO 8601 with `Z` (UTC). Store local timezone separately if needed
  - Respect ADR‑004: do not read “after” within +5min of reset; mark `reset_at` explicitly
- JSONL
  - Append‑only; no deletions; schema evolution via additive fields
  - Each record includes `source`, `captured_at`, and when applicable `tool_version` + `schema_version` so downstream jobs can filter or diff
  - Optional `windows.idx.json` may store offsets for faster preview; rebuild via full scan rather than mutating existing JSONL rows
- Paths & Citations
  - Cite sources as `path:line` or `path:Lstart–Lend` in summaries and handoffs
- Deltas & Validity
  - For capacity deltas: non‑negative; if violated, log `anomalies.jsonl` and prefer ccusage tokens
  - Do not hard‑code provider reset hours; record `reset_at` and infer via timeline
- Features
  - Record `quality_score` (1–5) and `outcome` (pass/partial/fail)
  - Snapshot churn at finalize (commits, lines_added, lines_deleted)
  - Optional window fields for value instrumentation: `spec_id`, `spec_version`, `methodology`, `feature_ids`, `commit_start`, `commit_end` (churn command maps these hashes to numstat output)

Ledgers & Maps
- Acceptance evidence: `docs/Ledgers/Acceptance_Evidence.csv` (append‑only)
- Experiment outcomes: `docs/Ledgers/Experiment_Ledger.csv` (append‑only)
- Capability map: `docs/System/capability_map/<project>/capabilities.csv` (versioned)

Notes
- Privacy/security:
  - Repos are local/intra by default; keep raw events under `.gitignore`. Redaction/PII policies can be added later as a toggle ("secure mode").
  - `operator_id` and `hostname` fields are optional; use only if needed for analysis.
