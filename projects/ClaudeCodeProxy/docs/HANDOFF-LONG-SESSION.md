# Handoff: Long Session Plan (P0 endurance + stability)

This is the single doc the next agent should use to run the longest feasible session with our current setup (MITM for Haiku→Z.AI, Sonnet on Anthropic).

## Model-Only Routing: Quick Plan (Haiku ⇒ Z.AI)

Read First (2–3 min)
- docs/P0-EXIT-CRITERIA.md:1
- docs/HANDOFF-LONG-SESSION.md:1
- docs/ERROR-TAXONOMY.md:1

Preflight (5 min)
- MITM on 8082 with model-only routing:
  - export FORCE_HAIKU_TO_ZAI=1
  - MITM_PORT=8082 make mitm
  - Optional: export MITM_FILTER_CHAIN=1 before make mitm to include clean logging + body tee addons
- Subscription terminal env:
  - export HTTPS_PROXY=http://127.0.0.1:8082
  - export NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem"
  - unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN
- Versions snapshot: bash scripts/print-versions.sh → VERSIONS.json:1

Phases (60–90 min total)
- Warmup (10 min)
  - Re-run T1/T2/T3; verify logs/usage.jsonl shows sonnet→anth, haiku→zai with decision:"forced_model".
  - make summarize to baseline metrics.
- Soak (30–40 min)
  - Alternate Sonnet and Haiku without restarting MITM:
    - while true; do claude -p --model sonnet "/status" --output-format json; sleep 2; claude -p --model haiku "/status" --output-format json; sleep 2; done
  - Tail logs/usage.jsonl; run make summarize every ~10 minutes.
- Parallel (5–10 min)
  - bash scripts/parallel-subagents.sh 4
  - If 429/503 appear, export MITM_ENABLE_BACKOFF=1 (backoff recorded in logs/anomalies.jsonl).
- Burst (5–10 min)
  - bash scripts/burst.sh 30
  - If jitter/stalls, restart MITM with MITM_FORCE_H1=1 and note impact.
- Chaos (optional, 5 min)
  - bash scripts/chaos-restart-mitm.sh 8082 20 during a streaming run; confirm recovery and no stuck sockets.

Observability (throughout)
- Error taxonomy is logged: err_type (401|429|5xx|4xx|net|timeout), upstream (anth|zai).
- Context flags: decision, op (stream|nonstream), h2, header_mode; verify splits in results/METRICS.json:1.
- Header-mode test (only if Z.AI 401): export ZAI_HEADER_MODE=authorization and continue.

 Deliverables (end of session)
 - results/METRICS.json:1 — updated with ops/header_mode/h2/error splits
 - results/SUMMARY.md:1 — p50/p95 per lane/op, error counts by err_type, brief notes
 - results/TESTS.md:1 — append stability, parallel, burst, chaos outcomes with 2–4 representative log lines
 - docs/SESSION_HANDOFF.md:1 — append commands, toggles, versions, commit hashes
 - docs/P0-EXIT-CRITERIA.md:1 — tick Routing, Stability, Safety, Observability
 - Optional cleanup: `make prune-results` to keep only the freshest metrics snapshots.

Acceptance Gates (P0)
- Routing: 100% of Haiku calls route to Z.AI; Sonnet stays on Anthropic
- Stability: ≥30 min soak + burst + parallel without stalls; SSE intact
- Safety: no header cross-leak; secrets redacted; body tee off by default
- Observability: tests + metrics + handoff complete

Optional mini A/Bs
- H1/H2: 10-minute soak with default h2 vs MITM_FORCE_H1=1; record deltas
- Header-mode (if 401): x-api-key vs authorization timing

Quick use for next agent
- Start MITM (model-only): FORCE_HAIKU_TO_ZAI=1 MITM_PORT=8082 make mitm
- Set env in subscription terminal: source scripts/sub-env.sh 8082
- Run soak/burst/parallel: make longrun-model-only; make burst; make parallel
- Summarize: make summarize → results/METRICS.json
- Bundle at end: make bundle

## Read First (5 minutes)
- docs/HANDOFF-LONG-SESSION.md:1 (this file)
- docs/mitm-subagent-offload/02-PRD-SUBAGENT-OFFLOAD.md:1
- inbox/tasks/27-LONG-RUN-EXPERIMENTS.md:1, inbox/tasks/40-EXPERIMENT-PLAYBOOK.md:1
- inbox/docs/44-SECURITY-REDLINES.md:1, inbox/results/35-RESULTS-TEMPLATE.md:1
- Optional: docs/mitm-subagent-offload/05-MITM-ADDON-SPEC.md, docs/mitm-subagent-offload/24-SECURITY-HARNESS.md, inbox/results/47-RESULTS-CHEATSHEET.md

## Quick Checklist
- Ensure `work/sub` is authorized (you already did).
- Keep `FORCE_HAIKU_TO_ZAI=0` unless explicitly testing routing by model.
- Start MITM (simple): `make mitm`.
- Optional filtered chain (clean logs + body tee): load `addons/log_only_messages.py` and `addons/body_sample_tee.py` alongside the router; enable tee via `make tee-on` only when needed.
- Subscription terminal: set `HTTPS_PROXY` + `NODE_EXTRA_CA_CERTS`; unset `ANTHROPIC_*` API vars.
- Where to put results: `make summarize` → `results/METRICS.json`; add representative lines to `results/TESTS.md`; append exact commands/toggles to `docs/SESSION_HANDOFF.md`.

## Preflight (once)
- Confirm authorized subscription in `work/sub` (you can run `/status`).
- Confirm `.env` has `ZAI_API_KEY=...` (git-ignored).
- Ensure CA trust exists: `~/.mitmproxy/mitmproxy-ca-cert.pem`.
- Start MITM (router only or filtered chain):
  - Simple: `make mitm`
  - Filtered chain (optional):
    - `mitmdump -s services/mitm-subagent-offload/addons/log_only_messages.py -s services/mitm-subagent-offload/addons/body_sample_tee.py -s services/mitm-subagent-offload/addons/haiku_glm_router.py -p 8080`
- In subscription terminal: set:
  - `export HTTPS_PROXY=http://127.0.0.1:<MITM_PORT>`
  - `export NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem"`
  - `unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN`
- Keep `FORCE_HAIKU_TO_ZAI=0` unless explicitly testing.

### MITM env toggles
- `FORCE_HAIKU_TO_ZAI=0` (default; set `1` only for explicit experiments)
- If H2 issues: `MITM_FORCE_H1=1` and restart MITM
- If Z.AI 401s: `ZAI_HEADER_MODE=authorization`

## Execution Phases (60–90 min)
1) Short Stability (20–30m)
- In `work/sub`:
  - `claude -p --model sonnet "/status" --output-format json`
  - Two short Sonnet prompts (≤50 output tokens each)
  - `bash scripts/verify-sse.sh` (one medium stream)
- Expect: `lane=anthropic` only; no Z.AI entries.

2) Z.AI Lane Validation (20–30m)
- Optional body tee ON: `make tee-on` (export `ENABLE_BODY_TEE=1` before starting MITM) if you need request samples for diagnostics.
- Run 3 Haiku tasks (explicit `/model haiku` or delegated subagent jobs): expect `lane=zai`, `status=200`.
- Turn body tee OFF: `make tee-off`

3) Stability Soak + Alternation (20–30m)
- Soak (balanced): `make soak` (runs Sonnet and Haiku alternation for 60m by default; you may shorten with `bash scripts/soak.sh 20`).
- Burst: `make burst` (20 fast alternations).
- Parallel: `make parallel` (4 concurrent Haiku jobs).
- Chaos (optional): `make chaos` (restarts MITM mid-run on 8080; adjust if needed).
 - Mixed long-run (alt lanes via MITM): `make longrun` (alternates Sonnet/Haiku by toggling FORCE_HAIKU_TO_ZAI; writes metrics periodically).

## Guardrails
- If host-change/H2 issues: restart MITM with `MITM_FORCE_H1=1`.
- If Z.AI 401s: set `ZAI_HEADER_MODE=authorization` and retry once.
- Never log auth headers; body tee is opt-in and off by default.
- For P0, do not parse SSE bodies—status-only is sufficient.

## Metrics & Results
- Summarize usage: `make summarize` → `results/METRICS.json` (p50/p95 latency, counts, tokens, per-lane breakdown, error taxonomy, ops, header_mode, h2).
- Fill `results/TESTS.md` using inbox/results/47-RESULTS-CHEATSHEET.md format; include 2–4 representative `logs/usage.jsonl` lines per test.
- Optionally estimate cost: follow inbox/docs/36-COST-ESTIMATOR.md.

## What to Deliver
- Filled `results/TESTS.md` (T1–T3 + stability/soak/burst/parallel/chaos).
 - `results/METRICS.json` and a brief `results/SUMMARY.md` (use inbox/results/35-RESULTS-TEMPLATE.md).
- Updated `docs/SESSION_HANDOFF.md` with commands, env toggles, versions, and commit hashes.
 - Error taxonomy reference: `docs/ERROR-TAXONOMY.md` and P0 acceptance `docs/P0-EXIT-CRITERIA.md`.

## Checkpoints (safe handoff moments)
- After Short Stability (Phase 1): confirm `lane=anthropic` only → OK to pause.
- After Z.AI validation (Phase 2): haiku probes confirmed `lane=zai` → OK to pause.
- After Soak (Phase 3): `make summarize` produced metrics → OK to pause.

If you need to reduce risk, run filtered chain (log_only_messages + body_sample_tee + router) to keep `logs/usage.jsonl` clean and sample bodies only when required.
