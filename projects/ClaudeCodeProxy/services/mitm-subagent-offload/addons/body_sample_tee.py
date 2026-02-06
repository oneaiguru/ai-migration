"""
⚠️ SECURITY: Writes raw request bodies to logs/body-samples.jsonl. Enable only
for short, audited debugging sessions; prompt data may include secrets.

Optional body tee for /v1/messages JSON requests. Enabled when
logs/.tee-on exists and ENABLE_BODY_TEE=1 is exported before start.
"""
from mitmproxy import http, ctx
import os


def request(flow: http.HTTPFlow) -> None:
    if flow.request.method != "POST":
        return
    path = (flow.request.path or "").split("?", 1)[0]
    if not path.endswith("/v1/messages"):
        return
    if "application/json" not in (flow.request.headers.get("content-type") or "").lower():
        return
    if os.getenv("ENABLE_BODY_TEE", "0") != "1":
        return
    if not os.path.exists("logs/.tee-on"):
        return
    try:
        os.makedirs("logs", exist_ok=True)
        with open("logs/body-samples.jsonl", "a", encoding="utf-8") as f:
            f.write(flow.request.get_text() + "\n")
    except Exception as e:
        ctx.log.warn(f"tee-error: {e}")
