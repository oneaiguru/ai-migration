**Title:** P0 — Subagent‑only offload: *Haiku → GLM* via MITM

**Problem**

* Most tokens are Haiku lane; Claude Code now rate-limited/weekly sessions.
* Z.AI GLM offers better economics for throughput tasks.

**Goal**

* When a **subagent** runs with **haiku** model, route *all its requests* to **Z.AI Anthropic-compatible** endpoint; keep main session on Anthropic subscription.

**Constraints**

* No mid-turn host switching inside a single HTTP/2 stream.
* No ToS violations; keep interception local, user‑owned creds.

**Success Criteria**

* Subagent lane exclusively hits Z.AI; main session exclusively hits Anthropic.
* Streaming intact, no UX regressions.
* Usage logs show backend, model, tokens.

**Out of scope (P0)**

* Per-turn model sniffing inside one interactive stream.
* LLM Gateway for subscription OAuth.

---