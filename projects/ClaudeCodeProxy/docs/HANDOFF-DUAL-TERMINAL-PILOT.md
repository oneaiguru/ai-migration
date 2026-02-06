# Handoff: Dual‑Terminal Pilot (Ship Real Work)

Goals
- Use two terminals in parallel: A = proxied (Haiku → Z.AI), B = stock Anthropic.
- Prove routing, capture metrics, and produce a bundle.
- Complete 1–2 real tasks (code review/refactor) with minimal diffs.

Preflight (5 min)
- cd /Users/m/git/tools/ClaudeCodeProxy
- git status (clean or commit)
- Start MITM on 8082 with model‑only routing:
  - MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm
- Terminal A env:
  - source scripts/sub-env.sh 8082
- Optional: claude; /login; /exit

Terminal A — Proxied (GLM offload)
- Quick proofs:
  - claude -p --model haiku  "ok" --output-format json
  - claude -p --model sonnet "ok" --output-format json
- Verify routing:
  - make summarize && make verify-routing
- Do the work: 1–2 code‑review/refactor tasks; keep diffs minimal.

Terminal B — Stock Anthropic
- Open a fresh shell (no HTTPS_PROXY), then:
  - claude
- Use for Sonnet‑only checks or parallel work that should not offload.

Wrap (metrics + bundle)
- make summarize && make verify-routing
- make bundle
- Update results/docs if needed:
  - results/H1H2-AB.md, results/ZAI-Header-AB.md, results/TESTS.md
  - docs/SESSION_HANDOFF.md (note toggles, versions, bundle path)

Toggles & Triage
- H2 jitter → export MITM_FORCE_H1=1 (restart MITM)
- Z.AI 401s → export ZAI_HEADER_MODE=authorization (restart MITM)
- Pause offload → export OFFLOAD_PAUSED=1 (unset to resume)

Two micro‑steers (low risk)
- Port busy: pkill -f "mitmdump.*-p 8082" or switch to MITM_PORT=8083
- Body‑tee: keep off by default; enable only for diagnostics

Mermaid — Two Terminals at a Glance
```mermaid
flowchart LR
  subgraph Terminal A (proxied)
    A1[claude CLI \n model: haiku/sonnet]
  end
  subgraph Local Proxy
    P1[mitmproxy addons\n log_filter + router]
  end
  subgraph Upstreams
    U1[Anthropic API]
    U2[Z.AI Anthropic‑compat]
  end
  subgraph Terminal B (stock)
    B1[claude CLI \n model: sonnet]
  end
  A1 -- HTTPS_PROXY=https://127.0.0.1:8082 --> P1
  P1 -- Haiku --> U2
  P1 -- Sonnet/Other --> U1
  B1 -- direct HTTPS --> U1
```

ELI16 — What these commands do
- make summarize: reads logs/usage.jsonl and prints counts/latency by lane (no network)
- make verify-routing: quick sanity that Haiku→Z.AI, Sonnet→Anthropic
- make bundle: collects logs + metrics into ~/Downloads/agentos_tmp_review-<ts>{/, .tgz}

Next Agent Starter (5 min)
- Read: docs/HANDOFF-LONG-SESSION.md, docs/methodology/post-polish-session-plan.md
- Start: MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm; source scripts/sub-env.sh 8082
- Prove: haiku/sonnet "ok"; make summarize && make verify-routing
- Do work: one small code‑review/refactor; keep diffs minimal
- Deliver: make bundle; update docs/SESSION_HANDOFF.md with toggles and bundle path

