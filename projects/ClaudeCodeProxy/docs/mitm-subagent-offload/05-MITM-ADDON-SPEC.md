**Service:** `services/mitm-subagent-offload/`

**Purpose**

* Intercept Claude Code HTTPS traffic.
* If request body indicates **subagent/haiku**, route to **Z.AI** upstream.
* Otherwise pass through to **Anthropic** upstream.

**Key behaviors**

* TLS: trust local CA (mitmproxy CA) via `NODE_EXTRA_CA_CERTS`.
* Routing:

  * Detect `POST /v1/messages`; parse `model` from JSON.
  * Route **haiku/subagent** → `api.z.ai:443`.
  * Else → `api.anthropic.com:443`.
* Headers:

  * **Never** reuse Anthropic subscription token for Z.AI.
  * Ensure **Z.AI token** present when calling Z.AI.
  * Preserve `anthropic-version` or equivalent metadata.
* HTTP/2:

  * Close upstream and re‑dial when host retargeting is required.
* Streaming:

  * Preserve `text/event-stream` and stream chunks; tee for usage logging.
* Logging (append-only JSONL):

  * `ts, lane (anthropic|zai), model, input_tokens, output_tokens, status`.

---