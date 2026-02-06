# Error Taxonomy (P0)

This guide explains how errors are surfaced in `logs/usage.jsonl` and how to classify client‑side issues that do not appear as upstream failures.

Logged fields (status >= 400 or network failures)
- `err_type`
  - `401` — Unauthorized (try alternate header mode; see `ZAI_HEADER_MODE`).
  - `429` — Rate limited (consider backoff; see `MITM_ENABLE_BACKOFF`).
  - `5xx` — Upstream server error.
  - `4xx` — Other client error (non‑401/429).
  - `net` — Network/connection error.
  - `timeout` — Timeout reported by mitmproxy layer.
- `upstream`
  - `anth` — Anthropic lane.
  - `zai` — Z.AI lane.
- `retry`
  - `true` when Z.AI 401 fallback header‑mode retry attempted once.

Client-side classifications (not reflected in `err_type`)
- `client_parse` — CLI/consumer JSON parse failure (e.g., “Unexpected end of JSON input”) while upstream is a healthy stream (`status:200`, `op:"stream"`).
  - Evidence: `.partial` stream file shows `input_json_delta` chunks for tool_use content; no `message_stop` yet when the client parsed.
  - Where to look: `logs/prod/partials/<rid>.partial` and the corresponding `usage.jsonl` entries for the same `rid`.
  - Operator guidance: reproduce once to capture artifacts, then file in `docs/BUGLOG.md`. Upstream is healthy; remediation is in the client (buffer until `content_block_stop`/`message_stop`).

Operational guidance
- 401 (Z.AI): if retries appear, prefer `ZAI_HEADER_MODE=authorization` and restart MITM.
- 429: optional jittered backoff (200–600ms) when `MITM_ENABLE_BACKOFF=1`.
- 503: optional jittered backoff (1–3s) when `MITM_ENABLE_BACKOFF=1`.
- Spikes isolated to `h2=true`: consider `MITM_FORCE_H1=1` and restart.
