"""
MITM addon to route Claude Code subagent Haiku traffic to Z.AI while
leaving main Anthropic traffic unchanged.

Run with:
  mitmdump -s services/mitm-subagent-offload/addons/haiku_glm_router.py -p 8080

Environment:
  ZAI_API_KEY           API key for Z.AI Anthropic-compatible endpoint
  ANTH_VERSION          Optional; default '2023-06-01'
  FORCE_HAIKU_TO_ZAI    Optional; '1' to route any haiku model to Z.AI (for explicit tests)
  MITM_DRY_RUN          Optional; '1' to only log routing decisions (no retarget)
  MITM_DISABLE          Optional; '1' to bypass all logic
  MITM_FORCE_H1         Optional; '1' to disable HTTP/2 upstream
  MITM_ENABLE_BACKOFF   Optional; '1' to sleep briefly on 429/503 (instrumentation)
  OFFLOAD_PAUSED        Optional; '1' to force Anthropic lane (manual failover pause)
  ZAI_HEADER_MODE       Optional; 'x-api-key' (default) or 'authorization'
  ZAI_HOST              Optional; default 'api.z.ai'
  ANTH_HOST             Optional; default 'api.anthropic.com'
  SUBAGENT_HINT         Optional; substring (case-insensitive) to detect subagent via system text or payload
"""

from mitmproxy import http, ctx
import json
import os
import time
import os.path
import uuid
from urllib.parse import urlparse
import random

try:
    from .usage_log import append_usage
except ImportError:  # when executed as stand-alone script
    from usage_log import append_usage


def append_anomaly(entry: dict, path: str = "logs/anomalies.jsonl") -> None:
    d = os.path.dirname(path)
    if d and not os.path.exists(d):
        os.makedirs(d, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, separators=(",", ":")) + "\n")


ANTHROPIC_HOST = os.getenv("ANTH_HOST", "api.anthropic.com")
ZAI_HOST = os.getenv("ZAI_HOST", "api.z.ai")
ZAI_PORT = 443


def _is_json_content(flow: http.HTTPFlow) -> bool:
    ctype = flow.request.headers.get("content-type", "").lower()
    return "application/json" in ctype


def _ensure_anthropic_version(flow: http.HTTPFlow) -> None:
    ver = os.getenv("ANTH_VERSION", os.getenv("ANTHROPIC_VERSION", "2023-06-01"))
    if not flow.request.headers.get("anthropic-version"):
        flow.request.headers["anthropic-version"] = ver


def _detect_subagent(payload: dict) -> bool:
    """Conservative detection of a subagent request.

    Until we observe the exact field path from a real request, search
    common locations and fall back to a recursive scan for either:
      - a boolean field named 'subagent' == True, or
      - a string field 'role' == 'subagent'.
    """
    try:
        meta = payload.get("metadata") or {}
        if isinstance(meta, dict):
            if meta.get("subagent") is True:
                return True
            if (meta.get("role") or "").lower() == "subagent":
                return True

        # Shallow top-level checks
        if payload.get("subagent") is True:
            return True
        if (payload.get("role") or "").lower() == "subagent":
            return True

        # Recursive scan (cheap walk over dict/list)
        def walk(obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    kl = str(k).lower()
                    if kl == "subagent" and v is True:
                        return True
                    if kl == "role" and isinstance(v, str) and v.lower() == "subagent":
                        return True
                    if walk(v):
                        return True
            elif isinstance(obj, list):
                for it in obj:
                    if walk(it):
                        return True
            return False

        if walk(payload):
            return True

        # Optional hint from env: match system text or payload blob
        hint = (os.getenv("SUBAGENT_HINT", "") or "").strip().lower()
        if hint:
            try:
                # Check system array
                sys = payload.get("system")
                if isinstance(sys, list):
                    for item in sys:
                        txt = None
                        if isinstance(item, dict):
                            # Either {type:text, text: "..."} or raw string
                            if isinstance(item.get("text"), str):
                                txt = item.get("text")
                        elif isinstance(item, str):
                            txt = item
                        if isinstance(txt, str) and hint in txt.lower():
                            return True
                # Fallback: search entire payload string
                blob = json.dumps(payload).lower()
                if hint and hint in blob:
                    return True
            except Exception:
                pass
        return False
    except Exception:
        return False


class HaikuGlmRouter:
    def __init__(self) -> None:
        self.zai_token = os.getenv("ZAI_API_KEY", "")
        self.force_haiku = os.getenv("FORCE_HAIKU_TO_ZAI", "") == "1"
        self.dry_run = os.getenv("MITM_DRY_RUN", "") == "1"
        self.disabled = os.getenv("MITM_DISABLE", "") == "1"
        self.force_h1 = os.getenv("MITM_FORCE_H1", "") == "1"
        self.enable_backoff = os.getenv("MITM_ENABLE_BACKOFF", "") == "1"
        self.zai_header_mode = (os.getenv("ZAI_HEADER_MODE", "x-api-key") or "x-api-key").lower()
        self.h2 = (not self.force_h1)

        if self.force_h1:
            try:
                ctx.options.http2 = False
                ctx.log.info("MITM_FORCE_H1=1 → http2 disabled")
            except Exception as e:
                ctx.log.warn(f"Failed to disable http2: {e}")

        if not self.zai_token and not self.dry_run:
            ctx.log.warn("ZAI_API_KEY not set; Haiku reroute will be disabled")

    def request(self, flow: http.HTTPFlow) -> None:
        # Kill switch
        if self.disabled:
            return

        # Only inspect POST JSON to /v1/messages
        if flow.request.method != "POST":
            return
        path = flow.request.path or ""
        p0 = path.split("?", 1)[0]
        if not p0.endswith("/v1/messages"):
            return
        if not _is_json_content(flow):
            return

        try:
            body_text = flow.request.get_text()
            payload = json.loads(body_text)
        except Exception as e:
            ctx.log.warn(f"JSON parse failed; pass-through. err={e}")
            return

        model = (payload.get("model") or "").lower()
        is_subagent = _detect_subagent(payload)
        rid = uuid.uuid4().hex[:8]
        flow.metadata["rid"] = rid
        flow.metadata["t0"] = time.time()

        # Decide lane
        to_zai = False
        decision_type = "pass_through"
        paused = (os.getenv("OFFLOAD_PAUSED", "") == "1")
        if not paused and _is_haiku_model(model) and (is_subagent or self.force_haiku):
            if self.zai_token or self.dry_run:
                to_zai = True
                decision_type = "subagent" if (is_subagent and not self.force_haiku) else "forced_model"
            else:
                ctx.log.warn("Wanted Z.AI route but ZAI_API_KEY missing; staying on Anthropic")
        elif paused:
            decision_type = "failover_paused"

        # Ensure anthropic-version header set
        _ensure_anthropic_version(flow)

        # Optional test redirect to local mock upstream
        test_redirect = os.getenv("MITM_TEST_REDIRECT", "").strip()
        if test_redirect:
            try:
                u = urlparse(test_redirect)
                flow.request.scheme = u.scheme or "http"
                flow.request.host = u.hostname or "127.0.0.1"
                flow.request.port = int(u.port or (443 if flow.request.scheme == "https" else 80))
                flow.metadata["lane"] = "test"
            except Exception as e:
                ctx.log.warn(f"Invalid MITM_TEST_REDIRECT value: {e}")
        elif to_zai:
            # Strip Anthropic auth, add Z.AI key
            if "authorization" in flow.request.headers:
                del flow.request.headers["authorization"]
            # Set exactly one header depending on mode
            if self.zai_header_mode == "authorization":
                flow.request.headers["authorization"] = f"Bearer {self.zai_token}"
                if "x-api-key" in flow.request.headers:
                    del flow.request.headers["x-api-key"]
            else:
                flow.request.headers["x-api-key"] = self.zai_token
                if "authorization" in flow.request.headers:
                    del flow.request.headers["authorization"]

            # Rewrite path for Z.AI anthropic-compatible base
            try:
                p = flow.request.path or "/"
                if not p.startswith("/api/anthropic/"):
                    flow.request.path = "/api/anthropic" + (p if p.startswith("/") else "/" + p)
            except Exception:
                pass
            flow.request.host = ZAI_HOST
            flow.request.port = ZAI_PORT
            flow.request.scheme = "https"
            flow.metadata["lane"] = "zai"
            flow.metadata["zai_header_mode"] = self.zai_header_mode
            if os.getenv("MITM_CONNECTION_CLOSE", "") == "1" and not self.h2:
                flow.request.headers["connection"] = "close"
        else:
            # Ensure no Z.AI key leaks to Anthropic
            if "x-api-key" in flow.request.headers and flow.request.host != ZAI_HOST:
                # remove any stray API key header unless targeting ZAI
                del flow.request.headers["x-api-key"]
            flow.request.host = ANTHROPIC_HOST
            flow.request.scheme = "https"
            flow.metadata["lane"] = "anthropic"
            if os.getenv("MITM_CONNECTION_CLOSE", "") == "1" and not self.h2:
                flow.request.headers["connection"] = "close"

        flow.metadata["model"] = model
        flow.metadata["routed"] = "dry-run" if self.dry_run else "active"
        flow.metadata["decision_type"] = decision_type
        flow.metadata["h2"] = self.h2

        # Dry-run: do not change the target, only log decision
        if self.dry_run:
            ctx.log.info(f"[dry-run] rid={rid} lane={'zai' if to_zai else 'anthropic'} model={model}")
            # Restore default host if altered
            return

        # Log decision event early (before upstream dial)
        try:
            append_usage({
                "ts": time.time(),
                "rid": rid,
                "lane": flow.metadata.get("lane", "unknown"),
                "model": model,
                "status": -1,
                "event": "decision",
                "decision": decision_type,
                "upstream": ("zai" if to_zai else "anth"),
                "h2": self.h2,
                "header_mode": (flow.metadata.get("zai_header_mode") if to_zai else None),
                "paused": paused,
            })
        except Exception:
            pass

    def response(self, flow: http.HTTPFlow) -> None:
        # Skip non-message traffic when using filters
        try:
            p0 = (flow.request.path or "").split("?", 1)[0]
            if not p0.endswith("/v1/messages"):
                return
        except Exception:
            return
        if flow.metadata.get("ignored_by_filter"):
            return
        lane = flow.metadata.get("lane", "unknown")
        model = flow.metadata.get("model", "")
        status = int(flow.response.status_code or 0)
        rid = flow.metadata.get("rid", "-")
        header_mode = flow.metadata.get("zai_header_mode") if lane == "zai" else None

        # Try to parse usage when response is JSON
        input_tokens = 0
        output_tokens = 0
        ctype = (flow.response.headers.get("content-type") or "").lower()
        is_json = "application/json" in ctype
        is_stream = "text/event-stream" in ctype
        # Latency
        t0 = flow.metadata.get("t0")
        latency_ms = int((time.time() - t0) * 1000) if t0 else None
        if is_json:
            try:
                data = json.loads(flow.response.get_text())
                usage = data.get("usage") or {}
                input_tokens = int(usage.get("input_tokens") or 0)
                output_tokens = int(usage.get("output_tokens") or 0)
            except Exception:
                # Streaming or non-JSON body; leave tokens at 0
                pass
        else:
            # Do not attempt to read SSE/event-stream bodies
            pass

        # Error taxonomy
        err_type = None
        if status >= 400:
            if status == 401:
                err_type = "401"
            elif status == 429:
                err_type = "429"
            elif status >= 500:
                err_type = "5xx"
            else:
                err_type = "4xx"

        # 401 fallback: retry once with alternate header for Z.AI, then return (avoid duplicate logs)
        if lane == "zai" and status == 401 and not flow.metadata.get("zai_retried") and not self.dry_run:
            flow.metadata["zai_retried"] = True
            try:
                # Switch header mode
                cur = flow.metadata.get("zai_header_mode", self.zai_header_mode)
                if cur == "authorization":
                    if "authorization" in flow.request.headers:
                        del flow.request.headers["authorization"]
                    flow.request.headers["x-api-key"] = self.zai_token
                    flow.metadata["zai_header_mode"] = "x-api-key"
                else:
                    if "x-api-key" in flow.request.headers:
                        del flow.request.headers["x-api-key"]
                    flow.request.headers["authorization"] = f"Bearer {self.zai_token}"
                    flow.metadata["zai_header_mode"] = "authorization"

                # Retry only if supported; do not clear response otherwise
                if hasattr(flow, "retry"):
                    flow.response = None
                    flow.retry()
                    ctx.log.info(f"rid={rid} 401 fallback retry with {flow.metadata.get('zai_header_mode')}")
                    return
                else:
                    ctx.log.warn("Retry API not available; leaving 401 response as-is (consider ZAI_HEADER_MODE)")
            except Exception as e:
                ctx.log.warn(f"Z.AI 401 fallback failed: {e}")

        # Optional backoff (instrumentation only; off by default); capture backoff_ms for usage log
        backoff_ms = 0
        if lane == "zai" and self.enable_backoff and not is_stream and status in (429, 503):
            try:
                delay = random.uniform(0.2, 0.6) if status == 429 else random.uniform(1.0, 3.0)
                backoff_ms = int(delay * 1000)
                append_anomaly({
                    "ts": time.time(), "rid": rid, "event": "backoff", "status": status,
                    "delay_s": round(delay, 3), "lane": lane, "model": model
                })
                time.sleep(delay)
            except Exception:
                pass

        # Usage log (single source of truth including err_type/retry/backoff_ms)
        try:
            append_usage({
                "ts": time.time(),
                "rid": rid,
                "lane": lane,
                "model": model,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "status": status,
                "reason": ("streaming" if is_stream else ("ok" if is_json else "unknown")),
                "op": ("stream" if is_stream else "nonstream"),
                "latency_ms": latency_ms,
                "err_type": err_type,
                "retry": bool(flow.metadata.get("zai_retried")),
                "backoff_ms": backoff_ms,
                "upstream": ("zai" if lane == "zai" else ("anth" if lane == "anthropic" else lane)),
                "h2": self.h2,
                "header_mode": header_mode,
            })
        except Exception as e:
            ctx.log.warn(f"usage log failed: {e}")

        if lane == "zai" and status == 200 and not flow.metadata.get("zai_ok_banner"):
            flow.metadata["zai_ok_banner"] = True
            ctx.log.info(f"{{\"event\":\"zai_ok\",\"host\":\"{ZAI_HOST}\",\"rid\":\"{rid}\"}}")

        ctx.log.info(f"rid={rid} lane={lane} model={model} status={status} in={input_tokens} out={output_tokens}")

    def error(self, flow: http.HTTPFlow) -> None:
        # Network/protocol errors
        try:
            rid = flow.metadata.get("rid", uuid.uuid4().hex[:8])
            lane = flow.metadata.get("lane", "unknown")
            msg = getattr(flow.error, "msg", "") if getattr(flow, "error", None) else ""
            et = "timeout" if ("timeout" in msg.lower()) else "net"
            append_usage({
                "ts": time.time(), "rid": rid, "lane": lane, "model": flow.metadata.get("model", ""),
                "status": 0, "event": "error", "err_type": et, "upstream": ("zai" if lane == "zai" else "anth"),
                "h2": self.h2
            })
        except Exception:
            pass


addons = [HaikuGlmRouter()]

# Helpers placed at end to keep class focused
def _is_haiku_model(model: str) -> bool:
    """Robust Haiku model detector for P0 routing.

    - Case-insensitive match on 'haiku'
    - Covers variants like 'claude-3-5-haiku', 'haiku-4-5', 'claude-haiku-4:mini'
    - Explicitly does NOT match Sonnet/Opus
    """
    if not isinstance(model, str):
        return False
    m = model.strip().lower()
    if not m:
        return False
    if "sonnet" in m or "opus" in m:
        return False
    return "haiku" in m
