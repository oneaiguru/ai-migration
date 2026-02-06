#!/usr/bin/env python3
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

REPO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LICENSE_PATH = os.path.join(REPO_DIR, "services", "go-anth-shim", "testdata", "license", "trial_license.json")
SIG_PATH = os.path.join(REPO_DIR, "services", "go-anth-shim", "testdata", "license", "trial_license.sig")

with open(LICENSE_PATH, "r", encoding="utf-8") as f:
    LICENSE_TEXT = f.read()
LICENSE_OBJ = json.loads(LICENSE_TEXT)
with open(SIG_PATH, "r", encoding="utf-8") as f:
    SIGNATURE = f.read().strip()

LICENSE_PACK = "{" + "\"license\":" + LICENSE_TEXT + ",\"signature\":\"" + SIGNATURE + "\"}"
POLL_TOKEN = "mock-token"
USER_CODE = "AB-CD-EF-GH"


def format_authorize_url(callback: str, code: str) -> str:
    callback = (callback or "").strip()
    if not callback:
        return ""
    if "%s" in callback:
        return callback % code
    if "{code}" in callback:
        return callback.replace("{code}", code)
    parsed = urlparse(callback)
    qs = parse_qs(parsed.query)
    qs["code"] = [code]
    new_query = "&".join(f"{k}={v[0]}" for k, v in qs.items())
    return parsed._replace(query=new_query).geturl()


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("content-length", "0"))
        body = self.rfile.read(length) if length else b""
        try:
            payload = json.loads(body) if body else {}
        except json.JSONDecodeError:
            payload = {}
        if self.path == "/v1/device/begin":
            redirect_url = payload.get("redirect_url", "")
            authorize_url = format_authorize_url(redirect_url, USER_CODE)
            response = {
                "user_code": USER_CODE,
                "poll_token": POLL_TOKEN,
                "authorize_url": authorize_url,
                "interval": 1,
                "expires_in": 300,
                "plan": "trial",
                "features": ["zai_offload"],
                "exp": LICENSE_OBJ.get("exp", 0),
            }
            self._send_json(200, response)
        elif self.path == "/v1/device/poll":
            response = {
                "status": "ok",
                "license_pack": LICENSE_PACK,
            }
            self._send_json(200, response)
        else:
            self._send_json(404, {"error": "not found"})

    def log_message(self, format, *args):
        return

    def _send_json(self, status: int, payload: dict):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main():
    addr = os.environ.get("MOCK_ISSUER_ADDR", "127.0.0.1:8787")
    host, port = addr.split(":")
    server = HTTPServer((host, int(port)), Handler)
    print(f"mock issuer listening on http://{addr}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
