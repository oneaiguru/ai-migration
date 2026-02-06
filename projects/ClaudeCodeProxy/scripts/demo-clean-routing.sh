#!/usr/bin/env bash
set -euo pipefail
cd /Users/m/git/tools/ClaudeCodeProxy

# Clean restart on :8082 and rotate logs
pkill -f "mitmdump.*-p 8082" >/dev/null 2>&1 || true
sleep 1
mkdir -p logs
if [[ -f logs/usage.jsonl ]]; then mv logs/usage.jsonl logs/usage.prev.$(date +%H%M%S).jsonl; fi
: > logs/usage.jsonl

# Start filtered chain (router + message-only filter + optional body tee disabled by default)
export MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1
nohup bash scripts/run-mitm.sh > logs/mitm.live.out 2>&1 & echo $! > logs/mitm.pid
sleep 3

# Point Claude to the proxy
source scripts/sub-env.sh 8082 >/dev/null

# 3× Haiku probe (routes to Z.AI), 1× Sonnet (stays on Anthropic)
for i in 1 2 3; do
  timeout 30s claude -p --model haiku "Say ok" --output-format json >/dev/null 2>&1 || true
  sleep 1
done
timeout 30s claude -p --model sonnet "Say ok" --output-format json >/dev/null 2>&1 || true

# Proofs
echo '--- Haiku routed to Z.AI (last 5)'
rg -n '"lane":"zai"' logs/usage.jsonl | rg 'haiku' | tail -n 5 || true
echo '--- Haiku on Anthropic (should be none)'
rg -n '"lane":"anthropic"' logs/usage.jsonl | rg 'haiku' || echo 'OK: none'
echo '--- Any Anthropic lines with Z.AI header (should be none)'
rg -n '"lane":"anthropic".*"header_mode":"x-api-key"' logs/usage.jsonl || echo 'OK: no Z.AI header on Anthropic'

# Metrics
echo '--- Routing summary'
make summarize >/dev/null
make verify-routing
