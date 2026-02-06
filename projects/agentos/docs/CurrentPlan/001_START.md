# START — Next Agent (Brief #1)

Follow this exactly. Work autonomously; don’t block on questions.

Read First (in order)
- docs/CurrentPlan/001_Agent_Brief.md
- docs/CurrentPlan/002_PRO_TLDR.md
- plans/005_long_session.plan.md

UAT Opener (must be green before edits)
- PYTHONPATH=tracker/src pytest
- PYTHONPATH=tracker/src behave features
- PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN

Reset Capture (00:06 local, +5 min after 00:01)
- AFTER (W0-CHN):
  codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live alias end codex --stdin --window W0-CHN --state-dir data/week0/live/state --notes after-clean
- BEFORE (W0-CHP):
  codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live alias start codex --stdin --window W0-CHP --state-dir data/week0/live/state --notes before-clean
- If offline at wrap: a safety cross exists; clean captures take precedence when present.

Execute Long Session 002 (phases)
- Phase A — Automation pack
  - scripts/automation/ledger_checkpoint.sh (append tokens plan/mid/final; run tracker churn; update SESSION_HANDOFF paths)
  - Preview prints: Anomalies: N (see anomalies.jsonl)
  - Update docs/System/scheduler/standing_jobs.md with the job
- Phase B — Parallel agents (isolation + lock)
  - TRACKER_ALIAS_STATE_DIR=data/week0/live/state/<AGENT_ID>
  - Stamp AGENT_ID=main or sub1 in notes; add simple flock lock in wrappers
- Phase C — Subagent telemetry (ingest only; no proxy)
  - Ingest: tail -n +1 logs/usage.jsonl | PYTHONPATH=tracker/src python -m tracker.cli ingest proxy-telemetry --window <W0-XX> --stdin
  - Preview block “Subagent Proxy” shows routed %, p50/p95 latency, error rate
  - Cost compare: scripts/tools/proxy_cost_compare.py (GLM vs baseline)

Finalize + Churn (when a window finishes)
- Complete: PYTHONPATH=tracker/src python -m tracker.cli complete --window <W0-XX> --codex-features <#> --quality 1.0 --outcome pass --methodology <tag> --commit-start <sha> --commit-end $(git rev-parse HEAD)
- Churn: PYTHONPATH=tracker/src python -m tracker.cli churn --window <W0-XX> --provider codex --methodology <tag>
- Preview: PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>

Logging & Handoff
- Update docs/Tasks/tracker_cli_todo.md after each phase
- Append plan/mid/final in docs/Ledgers/Token_Churn_Ledger.csv; verify docs/Ledgers/Churn_Ledger.csv
- Add a short note to docs/SESSION_HANDOFF.md with changed paths
- Create review bundle: /Users/m/Downloads/agentos_tmp_review

Guardrails
- No proxy/gateway work. Telemetry ingest only.
- Maintain absolute paths (ADR‑007). Respect +5 min lag buffer (ADR‑004).
- Append‑only ledgers/JSONL; use delete only via tracker alias delete when explicitly required.
