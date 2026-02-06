#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
import http.server
import socketserver
import urllib.parse
import sys

captured = {"code": ""}

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        captured["code"] = qs.get("code", [""])[0]
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(
            b"<html><body><h1>License captured</h1><p>You can close this tab and return to the CLI.</p></body></html>"
        )

    def log_message(self, format, *args):
        return

with socketserver.TCPServer(("127.0.0.1", 0), Handler) as httpd:
    port = httpd.server_address[1]
    sys.stdout.write(f"{port}\n")
    sys.stdout.flush()
    while not captured["code"]:
        httpd.handle_request()
    sys.stdout.write(captured["code"] + "\n")
    sys.stdout.flush()
PY
