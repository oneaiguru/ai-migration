# TLDR (operator-grade) — Long Session 002 Plan

Yes — proceed with a long (3×) session. This plan (1) locks data integrity, (2) runs your main lane and the sub‑agent POC in parallel without collisions, (3) ingests proxy telemetry live and compares costs, (4) closes W0‑20, finalizes and churn‑logs windows, and (5) leaves a tight handoff. It sets clear acceptance, artifacts, and guardrails so you can call the session done with confidence.

---

## Session Objectives (what “done” means)

1. Clean window chain: W0‑20 ended cleanly; W0‑19/W0‑20/W0‑CHN finalized with quality/outcome; no anomalies.
2. Parallel lanes: main + sub‑agent operate with isolated alias state (AGENT_ID), zero collisions.
3. Telemetry live: proxy telemetry ingested to JSONL while other agent works; cost compare produces ≥3 rows.
4. Ledgers: Token, Churn, Feature logs updated (append‑only) and linked in handoff.
5. Preview: shows Providers (eff/CI/n/power), UPS Outcome, ccusage scopes, Subagent Proxy block, Anomalies: 0.
6. Handoff: single, copy‑pasteable brief the next agent can start from without rereads.

---

## Pre‑Flight (5–8 min)

Run UAT opener:

```
PYTHONPATH=tracker/src pytest
PYTHONPATH=tracker/src behave features
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-19
```

Pass criteria: all green; preview prints Providers + ccusage; no exceptions.

Data integrity invariants (enforced this session):
- +5 min after reset before any AFTER capture (ADR‑004).
- Keep last pane only (flag multi‑pane‑trimmed if trimmed).
- If delta < 0 → set provider delta None, add errors=["negative-delta"], write anomaly to anomalies.jsonl.
- ccusage vs bars divergence >10% → print both; tag notes=divergent:ccusage.
- Append‑only JSONL/CSVs; corrections via alias delete only.

---

## Phase 1 — Close W0‑20 cleanly (6–10 min)

When your AFTER pane is ready (respect reset buffer):

```
codex /status \
| PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live alias end codex \
  --stdin --window W0-20 \
  --state-dir data/week0/live/state --notes after-clean
```

If a wrong pane slips in:

```
PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live alias delete codex \
  --phase after --window W0-20 --state-dir data/week0/live/state
```

Check: `preview --window W0-20` prints a Providers line; no anomalies.

---

## Phase 2 — Parallel lanes (main + sub‑agent) (5 min)

Isolation model:

```
# Main lane
AGENT_ID=main;  source scripts/tracker-aliases.sh

# Sub-agent lane (other terminal or tmux pane)
AGENT_ID=sub1;  source scripts/tracker-aliases.sh
```

Both shells stamp `notes=AGENT_ID=<id>` into snapshots. State: `data/week0/live/state/<AGENT_ID>/*.json`; lock via flock to avoid collisions.

Check: two before captures in same minute do not collide; preview picks latest per provider with correct before/after.

---

## Phase 3 — Sub‑agent telemetry ingest (live) + cost compare (20–60+ min)

Run while the sub‑agent works:

```
tail -n +1 logs/usage.jsonl \
| PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live ingest proxy-telemetry \
  --window W0-CHN --stdin
```

When first rows accumulate, run cost comparison:

```
python scripts/tools/proxy_cost_compare.py \
  --data-dir data/week0/live
```

Paste the top 3 rows (rid, baseline_tokens, glm_tokens, delta) into `docs/SESSION_HANDOFF.md`.

Check:
- `data/week0/live/proxy_telemetry.jsonl` appended with stamped rows.
- `preview --window W0-CHN` shows:

```
Subagent Proxy:
  - routed=<XX>% (events=<N>), latency=<p50> ms p50 / <p95> ms p95, errors=<X>%
```

---

## Phase 4 — Finalize + churn (W0‑19 / W0‑20 / W0‑CHN as applicable) (10–25 min)

Finalize when feature counts/quality/outcome are known:

```
PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live complete \
  --window W0-19 \
  --codex-features <#> --claude-features <#> --glm-features <#> \
  --quality 1.0 --outcome pass \
  --notes "session002 main lane"
```

(Repeat for W0‑20 after AFTER capture; for W0‑CHN if the sub‑agent ends this window.)

Churn (per window):

```
PYTHONPATH=tracker/src python -m tracker.cli churn \
  --window W0-19 --provider codex --methodology <tag>
```

Appends `Churn_Ledger.csv` and `data/week0/live/churn.jsonl`.

Preview sanity (each window post‑finalize):

```
PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live preview --window <W0-XX>
```

Look for: Providers with efficiency, ci, n, power; `Outcome: quality=, outcome=`; `Anomalies: 0`; ccusage weekly/daily/session; Subagent Proxy (for W0‑CHN).

---

## Phase 5 — Ledger checkpoint + docs handoff (10–15 min)

At session end, checkpoint tokens + churn + links:

```
scripts/automation/ledger_checkpoint.sh \
  --window <latest> --provider codex \
  --task end_of_session --plan <PLANNED> --actual <ACTUAL> \
  --notes "session002 close"
```

Effects:
- Appends to `docs/Ledgers/Token_Churn_Ledger.csv`.
- Runs `tracker churn --window <latest>`; appends `docs/Ledgers/Churn_Ledger.csv`.
- Update `docs/SESSION_HANDOFF.md` with artifact paths.

Update `docs/Ledgers/Feature_Log.csv` rows (feature_id, window, files touched) and paste the top‑3 `proxy_cost_compare` rows.

---

## Acceptance Criteria

- UAT opener green (pytest + behave).
- W0‑20 ended; no anomalies; W0‑19/W0‑20 finalized.
- Sub‑agent proxy telemetry ingested live; cost compare prints ≥3 rows.
- `docs/Ledgers/Token_Churn_Ledger.csv`, `Churn_Ledger.csv`, `Feature_Log.csv` got new rows (append‑only).
- `preview` for each window shows Providers, UPS Outcome, ccusage scopes, Subagent Proxy (for W0‑CHN), Anomalies: 0.
- `docs/SESSION_HANDOFF.md` updated with commands, artifact paths, & cost‑compare snippet.

---

## Guardrails

- After‑reset buffer: never capture AFTER < +5 min; if unavoidable, add `notes=late-after` and expect an anomaly.
- One before/after per provider per window; use alias delete for corrections.
- Append‑only JSONL/CSV; no in‑place edits.
- Two shells, two agents: always set `AGENT_ID=<main|sub1>` and re‑source aliases per shell.
- Absolute paths in docs (ADR‑007); no env var indirection.

---

## Risks & Mitigations

- Multi‑pane after / stale pane → run `oe` twice with ~60s gap; preview will keep the last; `multi-pane-trimmed` error is expected.
- Negative delta (wrap/race) → treat as anomaly; don’t finalize until corrected capture.
- ccusage vs bars divergence >10% → print both; tag `divergent:ccusage`; investigate scheduling vs reset.
- Proxy telemetry gaps → if sub‑agent stalls, ingest continues harmlessly; cost compare shows fewer rows (acceptable).

---

## Artifacts Produced

- `data/week0/live/` → `snapshots.jsonl`, `windows.jsonl`, `glm_counts.jsonl`, `codex_ccusage.jsonl`, `proxy_telemetry.jsonl`, `anomalies.jsonl`, `churn.jsonl`
- `docs/Ledgers/` → `Token_Churn_Ledger.csv`, `Churn_Ledger.csv`, `Feature_Log.csv` (new rows)
- `docs/SESSION_HANDOFF.md` → commands run, artifact links, top‑3 cost deltas
- Updated: `docs/System/scheduler/standing_jobs.md` (if you ran checkpoint script)

---

## Next Agent Handoff (copy‑paste)

```
# READ FIRST
docs/CurrentPlan/001_Agent_Brief.md
docs/CurrentPlan/003_PRO_TLDR.md
docs/SOP/uat_opener.md

# UAT OPENER
PYTHONPATH=tracker/src pytest
PYTHONPATH=tracker/src behave features
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-19

# PARALLEL LANES
AGENT_ID=main;  source scripts/tracker-aliases.sh
# (In another shell if needed)
AGENT_ID=sub1;  source scripts/tracker-aliases.sh

# CLOSE W0-20 (AFTER)
codex /status | PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live alias end codex \
  --stdin --window W0-20 --state-dir data/week0/live/state --notes after-clean

# SUBAGENT TELEMETRY (LIVE INGEST)
tail -n +1 logs/usage.jsonl \
| PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live ingest proxy-telemetry --window W0-CHN --stdin

# COST COMPARE
python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live
# Paste top 3 rows in docs/SESSION_HANDOFF.md

# FINALIZE WINDOWS + CHURN
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  complete --window W0-19 --codex-features <#> --quality 1.0 --outcome pass --notes "session002 main"
PYTHONPATH=tracker/src python -m tracker.cli churn --window W0-19 --provider codex --methodology <tag>

# PREVIEW CHECKS
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-19
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-20

# LEDGER CHECKPOINT
scripts/automation/ledger_checkpoint.sh --window <latest> --provider codex \
  --task end_of_session --plan <PLANNED> --actual <ACTUAL> --notes session002-close
```

