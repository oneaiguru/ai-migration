**Executive Summary**

* **Green**: Subagent‑only offload is technically and operationally feasible; proceed to P0 build and tests.
* **Yellow**: Per‑turn routing inside one interactive stream depends on proxy/H2 nuances; requires targeted experiments.
* **Red lines**: No token redistribution; no API substitution for subscription flows outside CLI; keep it local.

**Key Findings (concise)**

* Claude Code honors HTTPS proxy + custom CA.
* Z.AI endpoint is Anthropic‑compatible for Claude Code.
* Streaming must be preserved; retarget requires new upstream.

---