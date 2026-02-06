**Delta from your current `server.js`**

* Ensure `anthropic-version` header always set when forwarding.
* Add compact JSONL usage logging (`logs/usage.jsonl`).
* Return upstream `status`, model, lane in response envelope (debug builds).

*(Your current code nearly does this; agent can patch rather than rewrite.)*

---