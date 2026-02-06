# Demo: Clean Routing Proof (Model-only, Haiku ⇒ Z.AI)

Use this to produce a minimal, auditable proof that Haiku requests route to Z.AI and never to Anthropic. Sonnet stays on Anthropic.

## Prereqs
- MITM installed (mitmdump), repo checked out.
- ZAI key present in `.env` (git-ignored).

## One‑liner script (recommended)
```
bash scripts/demo-clean-routing.sh
```

## Manual steps (copy/paste)
```
cd /Users/m/git/tools/ClaudeCodeProxy
pkill -f "mitmdump.*-p 8082" || true
sleep 1
mkdir -p logs
[ -f logs/usage.jsonl ] && mv logs/usage.jsonl logs/usage.prev.$(date +%H%M%S).jsonl || true
: > logs/usage.jsonl
MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 nohup bash scripts/run-mitm.sh > logs/mitm.live.out 2>&1 & echo $! > logs/mitm.pid
sleep 3
source scripts/sub-env.sh 8082
for i in 1 2 3; do claude -p --model haiku "Say ok" --output-format json >/dev/null 2>&1 || true; sleep 1; done
claude -p --model sonnet "Say ok" --output-format json >/dev/null 2>&1 || true

# Proof grep queries
rg -n '"lane":"zai"' logs/usage.jsonl | rg 'haiku' | tail -n 5
rg -n '"lane":"anthropic"' logs/usage.jsonl | rg 'haiku' || echo "OK: none"
rg -n '"lane":"anthropic".*"header_mode":"x-api-key"' logs/usage.jsonl || echo "OK: no Z.AI header on Anthropic"

# Metrics
make summarize && make verify-routing
```

## Expected output (examples)
- Z.AI lane with Haiku model and Z.AI header:
```
{"lane":"zai","model":"claude-haiku-4-5-20251001","status":200,"upstream":"zai","header_mode":"x-api-key"}
```
- No Haiku on Anthropic:
```
OK: none
```
- Routing summary:
```
[verify-routing] decisions: N/M to_zai (...)
[verify-routing] completions by lane: anthropic=1 zai=11 unknown=…
```
