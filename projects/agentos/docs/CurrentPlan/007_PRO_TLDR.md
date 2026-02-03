# PRO TLDR — Brief 007
> Source: /Users/m/Desktop/TLDR.markdown
> Captured: 2025-10-20 03:12:41Z (UTC)
> Brief: #007

Absolutely—this is the right moment to brief the PRD author and ask for directional guidance. The repo is green, the decision card for the chosen reference window reads **GO**, and we’ve just landed a set of small but high‑leverage hardening fixes that match the “recoverable, anti‑gaming metrics” principle and the “Subscription Optimizer” vision (ingest/observe only, no proxy work).  

Below is a **full TL;DR** with code‑review highlights, a concrete **Show & Ask** briefing pack, a **finish‑this‑session protocol** for the current agent, and a crisp **near‑term roadmap** the next agent can follow (and the PRD author can adjust).

------

## TL;DR — Where we stand

**Status at a glance**

- ✅ **Build & tests**: unit tests green (latest run: **45 passed**), Behave suite green (**147 steps passed**).
- ✅ **CLI surface**: `preview`, `ingest` (codex/claude/ccusage/proxy-telemetry), `complete`, `churn`, **new** `window‑audit`.
- ✅ **Decision gate**: sample window decision card shows **GO** with **0 anomalies** and completeness line.
- ✅ **Data hygiene**: consistent percent formatting across tools; churn gracefully **skips** when commit bounds are missing (recorded as a decision note); window audit prints duplicate counts.
- ✅ **Subagent telemetry**: parser hardened; preview shows routed %, latency p50/p95, error rate; cost‑compare script prints GLM vs baseline with a totals footer.
- ✅ **Docs**: standing jobs updated; ingest & preview recipes stable; handoff/progress log updated.

**Why it’s safe to brief now**
 The changes are small, observable, and reversible. They improve auditability and reduce false signals without expanding scope—precisely the “recoverable, anti‑gaming metrics” posture we committed to.  And they support the “optimizer” vision by letting us compare routing outcomes from telemetry **without** building or operating a proxy. 

------

## Code‑review results (high‑signal)

**What shipped**

1. **Formatting helper**
   - `format_percent` centralizes percent strings (**50%** vs **50.0%**), reused by CLI + scripts.
2. **Proxy telemetry hardening**
   - Single `_to_float` path for latency + `latency:invalid` tagging.
   - **Whitelist** health statuses (`ok/success/200/routed/cached`) to avoid false errors.
   - Unit tests for whitelist & malformed latency.
3. **Churn resilience**
   - If `commit_start` missing, we **warn + skip diff** and persist a churn row with `decision=missing-commit-range(...)`.
   - Ledger row still appended; preview tolerant.
4. **Window audit (read‑only)**
   - `tracker window-audit --window <id>` reports duplicates per `(provider,phase)` and finalize rows, plus anomaly/churn counts.
5. **Tooling polish**
   - Decision card prints **Completeness: X% (m/n)**.
   - Proxy cost‑compare prints 3+ top rows **and** a totals footer with GLM share.

**Quality notes / tiny nits (non‑blocking)**

- **Status whitelist**: today it’s string‑based. Consider “2xx class = healthy” (and recognize `204`, `201`) to reduce bespoke terms drift.
- **`window-audit`**: great first pass. Consider (later) a `--json` flag for machine‑diffable output.
- **`_merge_notes`**: already dedupes content logically; if notes are long, we could cap stored length to avoid ledger bloat (optional).
- **`proxy_cost_compare`**: stdin fallback is solid; documenting that `rid` is the join key would help future operators (doc‑only).

------

## “Show & Ask” — what to send the PRD author

**One‑page objective** (copy/paste):

> We hardened the tracker around percent formatting, churn resilience, and telemetry parsing—no scope creep. Decision cards render **GO**/SOFT GO/NO‑GO with a completeness score. Telemetry preview shows routed %, p50/p95 latency, and error rate; a small tool prints GLM vs baseline token deltas. We propose next steps (below) and ask you to confirm the decision gates and KPI definitions, especially the error‑rate whitelist and when we label SOFT GO vs GO.

**Artifacts to attach** (fresh runs the agent can generate in <5 min):

- `preview` for a real or sandbox window (shows Providers, Outcome, Anomalies, Subagent Proxy, ccusage).
- `decision_card.py --window <W…>` for the same window (Status + Completeness).
- `window-audit --window <W…>` (dup counts + hygiene).
- `proxy_cost_compare.py --data-dir …` (top rows + totals footer).

**Two concrete “asks”**

1. **KPI & gate confirmation**
   - **Decision card**: Is “GO requires: finalized + outcome∈{pass,partial} AND (churn & evidence present) AND anomalies=0” acceptable?
   - **Proxy error‑rate**: Approve string whitelist or shift to 2xx rule?
2. **Experiment cadence**
   - Confirm we keep the **observe‑only** telemetry path (no proxy work) and use it to feed the optimizer comparison loop. 

------

## Protocol — how the agent should finish this session (ready to send)

> *Run these exactly; paste outputs into the handoff + PRD brief.*

1. **Validation wall**
   - `PYTHONPATH=tracker/src pytest`
   - `PYTHONPATH=tracker/src behave features`
2. **Window preview & decision**
   - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W-ID>`
   - `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W-ID>`
3. **Hygiene**
   - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window <W-ID>`
4. **Telemetry (if you have a telemetry file or JSONL rows)**
   - Ingest: `tail -n +1 logs/usage.jsonl | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live ingest proxy-telemetry --window <W-ID> --stdin`
   - Preview block appears under **Subagent Proxy**.
   - Cost compare: `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
5. **Churn**
   - If **commit range missing**, run `tracker churn` anyway—it will **skip** and log a decision note (this is expected and recorded).
6. **Handoff**
   - Paste the four outputs (preview, decision card, window‑audit, cost‑compare) into the session report; push.

------

## Roadmap we can propose (adjustable by PRD)

**Now (0–2 days)** — tighten metrics & hygiene

- ✅ Ship just landed changes (done).
- **Decide**: KPI gates & error whitelist scope (PRD decision).
- **Add** `--json` output to `window-audit` (optional quick win).
- **Acceptance**: unchanged test counts, decision card still **GO** on the reference window.

**Next (3–5 days)** — richer, still observe‑only signals

- Extend proxy telemetry parsing to generalize “healthy” statuses to **2xx**.
- Add a light **dup‑prune utility** (non‑destructive) to mark canonical finalize rows.
- Acceptance: preview stable; audit reports canonical rows; cost‑compare footer shows totals; decision card logic unchanged.

**Later (1–2 weeks)** — optimizer loops, still no proxy work

- Add a **“cost curve snapshot”**: route‑share vs token deltas summary across time windows (pure read from telemetry).
- Introduce **guardrail counters** per Value System (e.g., % rows with malformed latency). 
- Acceptance: reproducible CSV/JSON for the exec deck; no changes to ingestion sources.

------

## Risks & mitigations (short)

- **False error spikes** if upstream status vocabulary changes → mitigate by moving to **2xx** rule and keeping a small allowlist override.
- **Ledger bloat** from long notes → optional truncation + `notes:…(see jsonl)` convention.
- **Duplicate finalize rows** confusing operators → `window-audit` already surfaces counts; add `--json` + canonical tag later.

------

## Next‑agent quick start (what to do immediately)

1. Pull latest; run the **Validation wall** commands.
2. Recreate the **Show & Ask** outputs for a fresh window; paste into the session board.
3. If the PRD author signs off:
   - Implement **2xx status** logic + tests.
   - Add `window-audit --json`.
   - Draft the dup‑prune proposal (read‑only mark first).

------

## Ready‑to‑send note (template)

> **Subject:** Tracker hardening complete (GO); request KPI gates & error‑whitelist confirmation
>
> We shipped percent‑format unification, churn resilience (safe skip on missing commit bounds), a read‑only window‑audit, and proxy‑telemetry hardening. Tests and Behave are green. Attached: preview, decision card (GO), window‑audit, and cost‑compare output.
>
> **Asks:**
>
> 1. Approve decision‑card gates (GO vs SOFT GO), 2) Confirm proxy error‑rate rule (status 2xx vs explicit whitelist).
>
> We’ll stay observe‑only and expand optimizer reporting once these are confirmed.

------

### Why this aligns with our core docs

- We favored **recoverability** and anti‑gaming metrics over subjective tweaks; the churn skip + decision tags make outcomes auditable and reversible. 
- We kept scope to **ingest/observe** and comparison reporting—consistent with the “Subscription Optimizer” vision that avoids proxy work at this stage. 

If you want, I can condense this into a one‑pager for the PRD author in the exact output format you’ve been using for session reports.
