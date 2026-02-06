Title
Operational Notes — Z.ai 502s, Startup, DB Proof, and Unified Alias

Summary
- 502s observed are due to Z.ai upstream timeouts (header/handshake). Sonnet/Anth lane remains healthy.
- Startup is hardened: no self-proxy loops; dev license auto-loads; HTTP/1 for Z.ai recommended for stability.
- Unified interactive alias `cz` replaces multiple launchers. Use `/model` to switch in-session.
- DB persistence stores tokens and timing; `/v1/usage/rollups` now includes an estimated `cost_usd` computed from tokens.

One Clear Command (fresh/reboot)

bash /Users/m/git/tools/ClaudeCodeProxy/scripts/quick/bootstrap.sh 8082

Daily “Here” Sessions

source /Users/m/git/tools/ClaudeCodeProxy/scripts/shell/ccc-aliases.sh

cz

cz haiku

cz sonnet

Quick Verify (probes + log proof)

ccc-ok

Troubleshooting
- Force HTTP/1 for Z.ai:

export MITM_FORCE_H1=1

ccc-restart 8082

source /Users/m/git/tools/ClaudeCodeProxy/scripts/go-env.sh 8082

ccc-ok

- Optional Z.ai net fallback (default off):

export CCP_NET_FALLBACK=1

ccc-restart 8082

Proof — Logs
- `logs/prod/ccp.out` should show `[license] plan=trial features=[zai_offload]` and `anth=https://api.anthropic.com`.
- `logs/prod/usage.jsonl` must include:
  - Haiku → `"lane":"zai","status":200` (or `net_fallback` decision if fallback is enabled and used)
  - Sonnet → `"lane":"anthropic","status":200`

DB Proof — Samples and Rollups
- Samples (last hour):

python3 - <<'PY'
import time,requests,json
since=int(time.time())-3600
print(json.dumps(requests.get(f"http://127.0.0.1:8082/v1/usage/samples?since={since}").json(), indent=2))
PY

- Rollups (hourly, last day) — includes cost_usd estimated from tokens:

python3 - <<'PY'
import time,requests,json
since=int(time.time())-86400
print(json.dumps(requests.get(f"http://127.0.0.1:8082/v1/usage/rollups?granularity=hour&since={since}").json(), indent=2))
PY

Unit Pricing (env-tunable)
- Z.AI defaults: `ZAI_PRICE_IN_PER_M=0.6`, `ZAI_PRICE_OUT_PER_M=2.2`
- Anth defaults: `ANTH_PRICE_IN_PER_M=3.0`, `ANTH_PRICE_OUT_PER_M=15.0`
  - Adjust via env and restart to change estimates.

Stock Mode (without shim)

ccc-stock

or manually:

unset ANTHROPIC_BASE_URL

unset HTTPS_PROXY

unset NODE_EXTRA_CA_CERTS

unset ANTHROPIC_AUTH_TOKEN

claude

