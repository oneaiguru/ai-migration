# Claude Code Proxy — One‑Pager (ELI16)

What this does
- Sends Haiku work to Z.AI automatically; keeps Sonnet on Anthropic.
- Lets you run two terminals: A=proxied (offload), B=stock.
- Gives you simple commands to verify, summarize, and bundle results.
- Supports multi-provider routing with configurable catalog overrides (`cc providers`).

Start (5 min)
1) From repo root: MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm
2) Proxied terminal: source scripts/sub-env.sh 8082
3) Optional: claude; /login; /exit

Use
- Quick proof: claude -p --model haiku  "ok" --output-format json; claude -p --model sonnet "ok" --output-format json
- Summarize: make summarize && make verify-routing → results/METRICS.json
- Dual terminals (tmux): cc two-up 8082

Everyday commands (via cc)
- cc mitm start|stop|status [PORT] — manage the proxy
- cc h|s "prompt" — one-shot Haiku/Sonnet
- cc verify — summarize + routing audit
- cc quota — last 5h Z.AI usage (counts/tokens)
- cc bundle — build the review bundle
- cc doctor — sanity check tools/env/logs
- cc model <name> — persist the default model hint (stored under ~/.config/ccp/model)
- cc providers — print merged policy/catalog lanes and key envs

Safety
- Body tee OFF by default (only enable for diagnostics)
- If Z.AI 401 → export ZAI_HEADER_MODE=authorization and restart MITM
- If HTTP/2 retarget jitter → export MITM_FORCE_H1=1 and restart MITM
- Emergency pause → export OFFLOAD_PAUSED=1

Wrap up a session
1) cc verify
2) cc bundle → ~/Downloads/agentos_tmp_review-<timestamp>
3) Append toggles and bundle path to docs/SESSION_HANDOFF.md

If stuck
- See docs/HANDOFF-DUAL-TERMINAL-PILOT.md and docs/OPS-GUIDE.md
