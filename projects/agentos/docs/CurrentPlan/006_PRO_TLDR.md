# PRO TLDR — Review + Ops TL;DR (Brief #6)

> Source: /Users/m/Desktop/TLDR.markdown  
> Captured: 2025-10-20 02:05:42Z (UTC)  
> Brief: #006

Here’s a **tight review + ops TL;DR** of what you just ran, followed by a code review, data-quality checks, known risks, and a concrete route for folding in other agents’ Codex/GLM/**Sonnet** usage.

------

## TL;DR (session outcome)

- **Plan 005 delivered end-to-end.** Alias UX, automation pack + decision-card BDD, window close + new work, knowledge migration, and **Subagent Proxy telemetry** are all in and covered by tests.
- **Green wall:** `pytest` **41 passed**, `behave` **147 steps`; `preview` shows **Anomalies: 0** for closed windows; Decision Cards for **W0-CHP** and **W0-CHP-1** → **GO**.
- **Telemetry ingest is production-ready (observe-only).** `ingest proxy-telemetry` + preview + cost-compare script are behaving with fixtures and a smoke ingest to `W0-CHN`.
- **Review bundle staged** (Downloads). Docs/ledgers/artifacts are mirrored for audit.
- **One historical quirk remains documented, not dangerous:** an earlier manual-override “finalize” row for `W0-CHP-1` is retained for audit; you marked the later `after-long` as canonical and logged guidance.

Bottom line: you’re on track. Nothing blocking; the ingestion/preview/cost-compare pieces are safe to use in the next session and suitable to adopt in prod **as observation tooling** (no routing decisions). More below on when to graduate from observe-only to controlled **substitutions**.

------

## What shipped vs. plan (quick audit)

- **Commit A — Alias UX coverage:**
  - Undo (`od1/od2`) and state isolation (`AGENT_ID`) added & tested (pytest + Behave).
  - Multi-pane Codex trimming is enforced (latest pane kept).
- **Commit B — Automation pack + Decision Card BDD:**
  - `ledger_checkpoint.sh` now drives `decision_card.py` and appends decision status into token ledger notes.
  - UAT opener SOP shows anomalies line and decision-card step.
- **Commit C — Close→open window + knowledge migration:**
  - `W0-CHP-1` closed cleanly (after snapshot re-captured, complete→churn→checkpoint).
  - Capability map + specs: **CAP-LEDGER-CHECKPOINT-AUTO**, **CAP-FEATURE-RESERVE**, **CAP-KNOWLEDGE-LINK**.
  - Wiki pointers wired from alias/scheduler docs and handoff.
- **Phase C extension — Subagent Proxy telemetry:**
  - Parser (`tracker/sources/proxy_telemetry.py`), CLI ingest (`ingest proxy-telemetry`), preview block, and **cost-compare** utility with fixtures + unit tests.
  - Behave/pytest assertions verify: `events=8`, `routed=50%`, `errors=12.5%`, p50/p95 latencies, CSV output shape.

------

## Code review (high-leverage feedback)

**Strong work**

- **Fixture-driven tests** (moved hardcoded lines into `tests/fixtures/proxy/telemetry_sample.jsonl`) → maintainable diffs.
- **Script testing without import path hacks:** `importlib.util.spec_from_file_location` to load `proxy_cost_compare.py` is the right call for testing a script.
- **Preview guarantees:** explicit test that “**Anomalies: 0 (see anomalies.jsonl)**” always prints.
- **Decision-card integration** in `ledger_checkpoint.sh` with status stamped in ledger notes: matches how ops will actually consume it.

**Nits & small improvements (low effort, high clarity)**

1. **Percent formatting consistency**

   - You corrected tests to expect `routed=50%` vs `50.0%`. Keep it consistent across preview (routed/error), decision-card echoes, and CSVs.
   - Suggest: a single `_fmt_pct(x, digits=1)` helper in CLI to render `12.5%` when non-integer, otherwise `50%`.

2. **Latency list construction** (micro-refactor)

   - In `parse_proxy_telemetry_stream`: you call `_to_float()` in the `if` then `float()` again. Safer & faster to do once:

     ```python
     vals = []
     for e in events:
         v = _to_float(e.get("latency_ms"))
         if v is not None:
             vals.append(v)
     vals.sort()
     ```

   - This also keeps bad types from slipping through with a stray `float(...)` call.

3. **Error classification guardrail**

   - Current rule treats any status not in `("ok", "success", "200")` as error. That’s fine for now, but consider whitelisting known “non-ok but non-fault” reasons (e.g., `routed`, `cached`) if your source sometimes marks them in `status` instead of `reason`.
   - Keep tests loose on the exact whitelist so you can expand it without churn.

4. **Pytest warning cleanup**

   - You saw `pytest-asyncio` deprecation warning. Add this to `pytest.ini` to silence noise and future-proof runs:

     ```ini
     [pytest]
     asyncio_default_fixture_loop_scope = function
     ```

5. **Churn commit bounds UX**

   - You observed a non-fatal churn error when `--commit-start` is omitted. Make the script fail soft **and** stamp a clear note into the ledger row: `commit=missing`. If both SHAs absent, skip churn entirely with exit code 0 and a one-line warning.

6. **Window duplication handling**

   - You documented the superseded `W0-CHP-1` finalize. That’s OK per append-only, but add a tiny **“prune view”** command for operators that *reports* duplicates (doesn’t delete):

     ```
     tracker window-audit --window W0-CHP-1
     # prints: 2 finalize rows (manual-override, after-long) → canonical=after-long
     ```

   - This reduces confusion without touching history.

------

## Data-quality checks (spot-audit)

- **Windows / Snapshots:**
   `preview --window W0-CHP-1` shows **Anomalies: 0**; snapshots list shows the re-captured AFTER (`after-long`) as latest — correct.
- **Ledgers:**
   Token ledger has two checkpoints for W0-CHP-1 (`end_of_session`, `end_of_session_v2`), each with explicit notes; that’s acceptable given audit posture.
- **Evidence & artifacts:**
   You appended acceptance rows for each capability and stored artifacts under `artifacts/test_runs/...`. Good.

------

## Risks (minor) & quick mitigations

- **Formatting drift:** Percent formats and preview wording can drift between commands. → Centralize formatting helpers in CLI.
- **Telemetry schema variance:** If future logs emit `status="routed"` instead of `reason="routed"`, error rate could be overstated. → Add a tolerant status map + tests.
- **Duplicate finalize rows:** Documented today; add a `window-audit` read-only helper as above.

------

## “Should we use substitutions in prod?” (when to flip the switch)

Right now, your code is perfect for **observe-only** adoption in prod: capture telemetry, compute deltas, and inform decisions. I **do not** recommend turning on automatic provider **substitutions/routing** based solely on this session. Use the Decision Card gates:

- **GO for observe-only** (today): ✅
  - Ingest telemetry, preview health, run cost compare, keep ledgers.
- **SOFT GO for limited substitution trials** (when):
  - ≥ **30** matched features (same `rid`) across lanes,
  - **Error rate** with GLM/Sonnet not materially worse (Δ ≤ 2–3 pp),
  - **p95 latency** regression ≤ 15% vs. baseline,
  - **Cost delta** significant and stable (e.g., ≥ 10–15% savings with CI not crossing zero).
  - Run trials behind a *manual* switch; continue logging with this same ingest path.
- **NO-GO:** Any spike in errors or p95 regressions beyond guardrails; trial stops and notes go into ledgers.

This keeps the tracker’s append-only audit guarantees and lets the decision-card remain the single source of truth for escalation.

------

## Route to integrate **other agents using Codex, GLM, and Sonnet** (clear, safe path)

**Goal:** Ingest their usage without changing their workflows; keep your data clean and comparable.

1. **Isolate state per agent**

   - Have each operator export an ID before sourcing aliases:

     ```bash
     AGENT_ID=alice  source scripts/tracker-aliases.sh
     AGENT_ID=bob    source scripts/tracker-aliases.sh
     ```

   - Their state will live in `data/week0/live/state/<AGENT_ID>`, avoiding collisions.

2. **Capture provider snapshots per agent**

   - **Codex:** `os` (start) / `oe` (end) / `ox` (cross).
   - **Sonnet (Claude):** `as`/`ae`/`ax` or wrap `claude-monitor` via `scripts/automation/claude_monitor.sh --window <W>`.
   - **GLM ccusage (prompts):** pipe JSON to `tracker ingest codex-ccusage --scope {session|daily|weekly}` (your ccusage bridge).

3. **Ingest proxy telemetry (if a team runs the MITM addon)**

   - Have them stream usage to your tracker sandbox:

     ```bash
     tail -n +1 logs/usage.jsonl \
     | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest proxy-telemetry \
       --window W0-<AGENT_ID> --stdin --notes "AGENT_ID=<id>"
     ```

   - Maintain append-only discipline; list each agent’s lanes separately in preview.

4. **Cost-compare across lanes**

   - The new script already prints the top deltas; pipe to CSV or clipboard for review meetings.
   - Log the top 3 rows into `docs/SESSION_HANDOFF.md` (you did this for cost runs).

5. **Decision-card gating**

   - Each window (per agent) triggers a decision card; only flip `decision=GO` when conditions above hold.

------

## Longer-term measurement roadmap (keep in backlog — already stubbed)

1. **Distance-to-Target (Replica work)** — after churn, tie capability map + evidence ledger to compute DTT% and ΔDTT% per $.
2. **Stability modifier** — add a persisted-after-7d flag and show an “unstable” badge when rework happens.
3. **Decision value ledger** — track experiments, hypotheses, and outcomes for start-up validation.
4. **Delivery ROI** — record impact deltas (hours saved, revenue lift) per window to track payback.

------

## Immediate next actions (do these first)

1. **Percent/latency helpers** (clean output + perf)
   - Add `_format_percent(value, decimals=1)` in CLI; refactor proxy preview to use it and ensure tests match.
   - Refactor latency list construction in `parse_proxy_telemetry_stream` to avoid double conversions.

2. **Error classification improvements**
   - Create a small whitelist/enum for non-error statuses; update parser + tests accordingly.

3. **Pytest async scope**
   - Set `asyncio_default_fixture_loop_scope = function` in `pytest.ini` to remove warnings and future-proof runs.

4. **Churn CLI resilience**
   - If commit hashes missing, emit a warning, skip git diff, and note `decision=missing-commit-range` (don’t crash mid-checkpoint).

5. **Window audit helper**
   - Add `tracker window-audit --window <id>` that summarizes snapshots/finalize rows and flags duplicates (read-only, append-only friendly).

6. **Percent formatting + CSV consistency**
   - Ensure `proxy_cost_compare` and preview share formatting helpers so manual reviews see consistent values.

Everything else (substitution trials, DTT, stability modifier) stays in backlog until these polish tasks and next windows land cleanly.

------

## Ready next session
- Focus: polish `%` formatting, parser refactors, churn UX, and audit helper.
- Keep telemetry ingest observe-only, but wire the new safeguards before inviting additional agents to stream data.
- Once the above land, re-evaluate substitution trials via decision cards.

