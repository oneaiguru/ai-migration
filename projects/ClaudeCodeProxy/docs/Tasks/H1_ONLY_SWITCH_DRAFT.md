Title
Draft — Switch Z.ai Lane to HTTP/1.1 by Default

Objective
Reduce intermittent 502s from Z.ai (HTTP/2 header/handshake stalls) by pinning the Z.ai upstream transport to HTTP/1.1 for interactive CLI workloads.

Background (observed)
- ccp.out shows repeated `http2: timeout awaiting response headers` and occasional `TLS handshake timeout` on lane="zai".
- Sonnet/Anth lane remains healthy at the same time.
- Fresh sessions tend to work; longer sessions with heavy context/file reads start surfacing 502s more often.
- Direct curls to Z.ai (HTTP/1.1) succeed consistently.

Proposed Change (minimal)
- Set `MITM_FORCE_H1=1` for the proxy profile used with Claude Code. Keep Anth lane unchanged.
- Do not enable network fallback (Z.ai→Anth) by default; failures should remain visible for ops.

Operator Commands

export MITM_FORCE_H1=1

ccc-restart 8082

source /Users/m/git/tools/ClaudeCodeProxy/scripts/go-env.sh 8082

ccc-ok

Scope
- Applies only to upstream transport from the shim to Z.ai.
- No changes to API semantics, headers, or the client CLI.

Acceptance Criteria
- 10 consecutive Haiku completions (`claude -p ...`) with p50 ttft_ms < 2s, no 502.
- usage.jsonl shows lane="zai", status=200 for each probe; h2=false on those entries.
- Sonnet remains unaffected (lane="anthropic", status=200).

Diagnostics
- If needed, disable persistence to prove DB writes are not involved:

export CCP_PERSIST=0

ccc-restart 8082

source /Users/m/git/tools/ClaudeCodeProxy/scripts/go-env.sh 8082

- Golden probe (manual):

for i in 1 2 3 4 5 6 7 8 9 10; do timeout 20 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model claude-haiku-4-5-20251001 "ok" --output-format json >/dev/null || echo fail; done

tail -n 200 /Users/m/git/tools/ClaudeCodeProxy/logs/prod/usage.jsonl

Observability (nice to have)
- Add counters for h2-failure and h1-success on Z.ai to confirm improvement:
  - ccp_zai_h2_header_timeout_total
  - ccp_zai_h1_success_total

Rollback

unset MITM_FORCE_H1

ccc-restart 8082

source /Users/m/git/tools/ClaudeCodeProxy/scripts/go-env.sh 8082

Open Questions
- Do we ever need H2 for batch/high-QPS? If so, gate by profile (prod H2, dev H1).
- Do we want a per-request auto-retry on header timeout (H2→H1) behind a flag?

ASCII — current vs proposed

Current (H2)

Claude ──> shim ── H2 ──> Z.ai
                     ▲            
                 stalls → 502

Proposed (H1)

Claude ──> shim ── H1 ──> Z.ai
                   (no H2 header stall class)

