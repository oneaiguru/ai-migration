# Universal Provider Schema (UPS) v0.1

Single schema for provider metrics across Codex, Claude, GLM.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `provider` | string | `codex` \| `claude` \| `glm` |
| `window_id` | string | `W0-XX` (zero-padded) |
| `captured_at` | ISO8601 string | Timestamp in UTC (`YYYY-MM-DDTHH:MM:SSZ`) |
| `tokens_used` | number | Capacity units consumed during window (provider-specific definition) |
| `features_completed` | number | Feature count attributed to the window |
| `quality_score` | number | 1–5 rubric; see `docs/System/quality_rubric.md` |
| `outcome` | string | `pass` \| `partial` \| `fail` |
| `reset_at` | ISO8601 string (nullable) | Observed reset time (e.g., Codex 5h delay, ccusage weekly reset) |
| `source` | string | `alias`, `automation`, `ingest`, etc. |
| `schema_version` | string | Semantic version for record schema (e.g., `1.0.0`) |
| `tool_version` | string | Version of CLI/parser that produced the record |
| `notes` | string (optional) | Free-form annotations (e.g., `late-after`, `backfill`) |
| `methodology` | string (optional) | Short tag describing the workflow executed during the window (e.g., `alias_cycle`) |
| `feature_ids` | array[string] (optional) | Identifiers for features delivered in the window (`xfeat::` tags) |
| `commit_start` | string (optional) | Git commit hash marking pre-window baseline |
| `commit_end` | string (optional) | Git commit hash captured after implementation commit |

### Usage
- All JSONL outputs should migrate toward this structure.
- Derived metrics (efficiency, CI/power) use UPS fields for consistency.
- Any new fields must bump `schema_version` and update `docs/System/contracts.md`.
