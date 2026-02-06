#!/usr/bin/env python3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    server_version = "MockUpstream/0.1"

    def do_POST(self):
        if self.path.endswith("/v1/messages"):
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length) if length else b"{}"
            try:
                req = json.loads(body.decode('utf-8') or '{}')
            except Exception:
                req = {}
            model = req.get('model', '')
            resp = {
                "id": "msg_mock_123",
                "model": model,
                "type": "message",
                "role": "assistant",
                "content": [{"type": "text", "text": "mock reply"}],
                "usage": {"input_tokens": 11, "output_tokens": 22},
            }
            self.send_response(200)
            self.send_header("content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()


def main():
    host = '127.0.0.1'
    port = 3001
    print(f"Mock upstream listening on http://{host}:{port}")
    HTTPServer((host, port), Handler).serve_forever()


if __name__ == '__main__':
    main()

