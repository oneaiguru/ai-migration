# 🎛️ Controls & Safety Toggles

Environment flags you can use when starting MITM or during a session.

- `FORCE_HAIKU_TO_ZAI` (default `1`)
  - `1`: Route any Haiku request to Z.AI (**recommended pilot default**).
  - `0`: Keep Haiku on Anthropic (useful for comparisons or fallback runs).

- `MITM_FORCE_H1=1`
  - Disable HTTP/2 upstream to avoid host‑retarget issues.

- `ZAI_HEADER_MODE=authorization`
  - Use `Authorization: Bearer` instead of `x-api-key` (401 fallback).

- `OFFLOAD_PAUSED=1`
  - Keep traffic on original lane; log decisions as dry runs.

- `ANTH_VERSION=2023-06-01` (default)
  - Anthropic API version sent to both lanes.

Apply by prefixing command or exporting:

```bash
MITM_FORCE_H1=1 cc mitm start 8082
export ZAI_HEADER_MODE=authorization; cc mitm start 8082
export OFFLOAD_PAUSED=1
```

Log hygiene guardrails (always on):

- Never log auth headers or request bodies (body‑tee is OFF by default).
- JSONL entries: `{ts, rid, lane, model, status, input_tokens?, output_tokens?, reason?, latency_ms?}`
