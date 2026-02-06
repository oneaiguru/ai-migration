#!/usr/bin/env python3
import os, sys, json, time, requests

base = os.environ.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com")
auth = os.environ.get("ANTHROPIC_AUTH_TOKEN")
url = base.rstrip("/") + "/v1/messages"
headers = {"content-type":"application/json", "anthropic-version": os.environ.get("ANTH_VERSION","2023-06-01")}
if auth:
    headers["authorization"] = f"Bearer {auth}"
payload = {"model":"claude-3-haiku-20240307","max_tokens":32,"stream":True,"messages":[{"role":"user","content":"Stream 5 words."}]}

with requests.post(url, headers=headers, data=json.dumps(payload), stream=True) as r:
    r.raise_for_status()
    last = time.time()
    gaps = []
    for line in r.iter_lines(decode_unicode=True):
        if not line:
            continue
        now = time.time()
        gaps.append((now - last)*1000.0)
        last = now
        if line.startswith("data:"):
            sys.stdout.write("."); sys.stdout.flush()
    print("\n[probe] chunks:", len(gaps), "p50=", sorted(gaps)[len(gaps)//2] if gaps else None)

