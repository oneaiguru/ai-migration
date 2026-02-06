# MITM Addon Skeleton — `haiku_glm_router.py`

This skeleton is the starting point for the man-in-the-middle addon that reroutes Haiku subagent traffic to Z.AI while keeping all other calls on Anthropic.

```python
# services/mitm-subagent-offload/addons/haiku_glm_router.py
# Run with: mitmdump -s addons/haiku_glm_router.py -p 8080

from mitmproxy import http
from mitmproxy import ctx
import json
import os

ANTHROPIC_HOST = "api.anthropic.com"
ZAI_HOST = "api.z.ai"
ZAI_PORT = 443

class HaikuGlmRouter:
    """Route Claude Code subagent (haiku) traffic to Z.AI."""

    def __init__(self):
        self.zai_token = os.getenv("ZAI_API_KEY", "")
        if not self.zai_token:
            ctx.log.warn("ZAI_API_KEY not set; Haiku reroute disabled")

    def request(self, flow: http.HTTPFlow) -> None:
        """Inspect outbound requests and retarget when needed."""
        if flow.request.method != "POST":
            return
        if flow.request.pretty_url.endswith("/v1/messages"):
            try:
                payload = json.loads(flow.request.get_text())
            except json.JSONDecodeError:
                ctx.log.warn("Failed to parse request JSON; leaving as-is")
                return

            model = (payload.get("model") or "").lower()
            is_subagent = payload.get("metadata", {}).get("role") == "subagent"
            if "haiku" in model and is_subagent and self.zai_token:
                flow.request.host = ZAI_HOST
                flow.request.port = ZAI_PORT
                flow.request.scheme = "https"
                flow.request.headers["x-api-key"] = self.zai_token
                flow.metadata["mitm_lane"] = "zai"
            else:
                flow.request.host = ANTHROPIC_HOST
                flow.metadata["mitm_lane"] = "anthropic"

    def response(self, flow: http.HTTPFlow) -> None:
        """Attach metadata for downstream logging (usage, status)."""
        lane = flow.metadata.get("mitm_lane", "unknown")
        ctx.log.info(f"lane={lane} status={flow.response.status_code}")

addons = [HaikuGlmRouter()]
```

## Next Steps

1. Copy this file to `services/mitm-subagent-offload/addons/haiku_glm_router.py`.
2. Extend the request handler to:
   - (Optional) Add metadata-based heuristics if we ever need to distinguish specific subagent flows.
   - Preserve streaming by passing through server-sent events untouched.
   - Strip Anthropic tokens before forwarding to Z.AI and vice versa.
3. Add JSONL logging (see `13-USAGE-LOGGING-SPEC.md`) by teeing chunks inside `response()`.
4. Wire into run scripts (`scripts/run-mitm.sh`) and execute the acceptance tests in `12-TEST-MATRIX.md`.
