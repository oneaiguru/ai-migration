Purpose

* Canonical, cross‑repo event contract for AgentOS ingestion.

Shape

* schema: usage_event.v1
* ts: float epoch
* rid: string correlation id
* lane: anthropic|zai|unknown
* model: string
* status: int
* decision: string (optional)
* reason: string ("ok"|"streaming"|"timeout" ...)
* op: stream|nonstream
* latency_ms: int
* stream_ms: int (0 for nonstream)
* ttft_ms: int (0 for nonstream)
* in_tokens: int (best‑effort)
* out_tokens: int (best‑effort)
* upstream: anth|zai
* h2: bool
* header_mode: string (optional)
* calibration_gap: float (optional)
* warn_pct_auto: float (optional)

PII/Secrets

* Never log bodies or credential values. Headers are summarized as modes only.

Versioning

* Backwards‑compatible additions allowed; breaking changes bump to v2 with a new path.

---