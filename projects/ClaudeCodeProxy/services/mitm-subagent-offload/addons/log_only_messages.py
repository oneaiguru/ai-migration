"""
Filter addon to mark non-/v1/messages traffic so downstream addons
can skip logging. Does not block proxying; only marks metadata.
"""
from mitmproxy import http


def request(flow: http.HTTPFlow) -> None:
    path = (flow.request.path or "").split("?", 1)[0]
    if flow.request.method == "POST" and path.endswith("/v1/messages"):
        return
    flow.metadata["ignored_by_filter"] = True

