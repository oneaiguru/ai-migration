Title
AGENT‑OS × CCC (Claude Code Companion) — Integration Plan (R3→R4)

Purpose
Unify your two projects so they reinforce each other without re‑doing work:
• **CCC (Go shim)** = real‑time router, usage/quotas, metrics, fallbacks.
• **AGENT‑OS (Python tracker)** = measurement, windows, cost/quality estimators, portfolio/router logic.
This doc defines roles, the thin contracts between them, and near‑term tasks to ship in parallel.

TL;DR (one page)

• **Keep two repos in parallel** now. Merge later only if the interface stabilizes.
• **Role split:** CCC = runtime proxy and live counters; AGENT‑OS = batch/analytics + scheduling.
• **Interface (northbound from CCC):** stable HTTP/JSON: `/v1/usage`, `/v1/metrics`, `/v1/readyz`, `/v1/events` (optional later). CCC already exposes usage/metrics/readyz; we’ll add “speeds” in R3 and keep JSON stable.
• **Interface (southbound to CCC):** read‑only config files (`providers.yaml`, `quotas.json`) + feature flags; AGENT‑OS never writes CCC config in R3/R4.
• **Shared vocabulary:** adopt Agent‑OS commit tags (`xfeat::…`/`xproto::…`) and “Week‑0/Window” measurement cadence repo‑wide so churn/efficiency analytics line up.
• **Avoid duplication:** Agent‑OS keeps pane parsers, GLM/Claude pane ingesters, the “windows.jsonl” store, and the “features per capacity” normalizer; CCC focuses on live quotas + speeds (ELR/dirty TPS), fallbacks, provider readiness.
• **Acceptance:** “One dashboard” in Agent‑OS shows CCC’s tokens, speeds, fallbacks, plus Agent‑OS’s windows/quality. One command (`tracker preview`) renders live CCC overlays.

Context (anchored in current repos)

• CCC already documents operator surfaces (start, verify routing, bundle) and now exposes quotas + `/metrics`. We’ll enrich `/v1/usage` with speeds (ELR/dirty TPS) and hour‑of‑day bins in R3.
• Agent‑OS PRD v1.6 fixes how to measure “capacity”, enforce 10pp weekly buffer, and tag commits for churn. Use that measurement rigor; don’t move it into CCC.

Architecture (who does what)

• CCC (Go, on the developer machine)
– Route per model/provider; preserve SSE; log per‑request usage; expose `/v1/usage`, `/v1/quotas`, `/v1/readyz`, `/metrics`.
– Enforce **tokens‑only** quotas (warn/block); record fallbacks; compute **speeds** (ELR & “dirty”), TTFT, hour‑of‑day bins.
– Never parse IDE panes; never compute “cost per feature”.

• AGENT‑OS (Python)
– Poll CCC endpoints; append to `windows.jsonl`; render “Providers” and “Outcome” blocks; keep GLM/Claude/Codex pane parsers and the “features per capacity” math.
– Optimize portfolio (which provider/model/methodology to run) under weekly caps and 5h windows; feed hints back as *operator prompts/config advice* (not live rewrites).

Contracts (v1, stable for R3–R4)

1. HTTP: `/v1/usage` (CCC → AGENT‑OS) — JSON snapshot per model with: rolling_tokens, weekly_tokens, flags (warn/block), **speeds** (ELR/dirty/input/total TPS), TTFT avg, HOD[24] bins, source path, last_reload_ts. (See companion schema file below.)
2. HTTP: `/metrics` (Prometheus text) — scrape into Agent‑OS for long‑term charts; do not depend on names for control logic.
3. Files: `~/.config/ccp/providers.yaml`, `~/.config/ccp/quotas.json` — user‑editable; AGENT‑OS displays diffs and suggestions, does not mutate in R3/R4.
4. Git tags: `xfeat::…`/`xproto::…` for session windows and method identity, shared across both repos.

Planning & sequencing

• Now (R3): CCC ships speeds; Agent‑OS consumes `/v1/usage` to display rates and fallbacks alongside windows.
• Next (R3.5): Quota hardening & reroute policy study (run to real limit vs pre‑emptive), calibration experiments, GLM limit clarity.
• Next (R4): Licensing (MoR + device/loopback) parallel track; CCC shows license gate in `/readyz`; Agent‑OS records gated lanes and plan limits. (ADR set exists; we validate with deep research separately.)

Risks

• Divergent schemas: lock `/v1/usage` fields now; evolution through additive keys only.
• Double‑counting: CCC resets on restart; Agent‑OS dedupes by `(rid, ts)` if present; when absent, dedupe by `(hash(model, ts_bucket))`.
• Feedback confusion: keep AGENT‑OS → CCC influence as **human‑confirmed** until R5 (no automatic rewriting of CCC configs).

Acceptance (for this doc)

• A single Agent‑OS page renders CCC speeds + quotas next to windows; commit tags survive; 10pp buffer policy remains visible.