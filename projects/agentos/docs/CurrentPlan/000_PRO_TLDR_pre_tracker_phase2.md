Got it. I won’t suggest “data batteries” again. Let’s keep it strictly on‑vision, on‑SOP, and move the project forward.

------

## What to do **next session** (unchanged)

Ship the three Ready‑Next items exactly as already on the board:

1. **Stats/CI in preview** – show `efficiency, ci=[lo,hi], n=<feature_count>`; if `n<3` print `ci=n/a`.
2. **Outcome & quality capture** – `quality_score` + `outcome` recorded on `complete` and rendered in preview.
3. **UPS v0.1 cross‑links** – keep Contracts/Recipes aligned to the shared fields.

**Acceptance (what the preview must print):**

```
Windows: W0-XX
Providers:
  - codex: features=3, capacity=18 pp, efficiency=0.17, ci=n/a
  - claude: features=2, capacity=0 pp, efficiency=n/a, ci=n/a
Outcome: quality=1.0, outcome=docs:api-research
```

------

## After that session: **Churn instrumentation is next**

You asked for churn “we can blame” per methodology. Here’s a concrete three‑commit plan that stays inside our SOP style and is immediately useful.

### Commit 1 — **SOP + Schema hooks (no code execution)**

**Goal:** Make churn measurable and reviewable without ambiguity.

- **Docs/SOP updates**
  - `docs/SOP/commit_conventions.md` (new): require window+methodology tags in commit messages:
     `feat(tracker): ... [window:W0-21] [method:alias_cycle]`
  - `docs/System/git_churn_strategy.md` (update): define churn as **lines changed (adds+deletes)** in the **commit range** `[commit_start, commit_end]` for a window, optionally filtered by **methodology paths**.
- **Schema additions**
  - Add optional fields to `windows.jsonl` on finalize:
     `commit_start`, `commit_end`, `methodology` (string), `feature_ids` (list).
- **Ledger**
  - Create `docs/Ledgers/Churn_Ledger.csv` headers:
     `date,window,provider,methodology,commit_start,commit_end,files_changed,insertions,deletions,net,features,normalized_churn`

**Why first:** It forces traceability even before the tool runs, and it’s reversible (docs only).

------

### Commit 2 — **Collector CLI + ledger write (small, testable)**

**Goal:** Compute churn for a window and append a ledger row.

- **CLI**: `tracker churn --window W0-XX [--methodology alias_cycle] [--paths "tracker/src/**,docs/System/**"]`
  - Resolves `commit_start/commit_end` from `windows.jsonl` if not provided.
  - Computes `files_changed/insertions/deletions/net` via `git` (or GitPython), optionally path‑filtered.
  - Reads `features` from that window; computes `normalized_churn = net / max(1, features_total)`.
- **Storage**
  - Append a JSONL mirror under `data/.../churn.jsonl` (for reproducibility), **and** a CSV line to `docs/Ledgers/Churn_Ledger.csv`.
- **Tests (pytest)**
  - Temp git repo fixture; make two commits across a known path; run `tracker churn`; assert counts and CSV append.

**Why second:** Produces a real, reviewable signal without touching preview yet.

------

### Commit 3 — **Preview integration (read‑only)**

**Goal:** Put churn in the operator’s line of sight without blocking anything.

- **Preview** adds (if present):

  ```
  Churn:
    - window=W0-21 method=alias_cycle: files=7, +120/-40 (net=80), per-feature=26.7
  ```

- **UAT addition** in `docs/SOP/uat_opener.md`: run `tracker churn` for the last finalized window and confirm a ledger row appears.

**Why third:** Keeps preview informative, not prescriptive. Decisions remain with the operator.

------

## Do you invest now in **automation (cron/launchd/calendar/scripts)**?

**Yes**—this is the right time **after** Ready‑Next, to keep the data clean and A‑grade with minimal manual effort. Keep it **small and deterministic**:

### Minimal “Clean‑Data Automation Pack”

Fill `docs/System/scheduler/standing_jobs.md` with these five jobs and ship the scripts:

1. **ccusage daily capture (Codex)**
   - When: once per day **1h after the posted reset time**.
   - Command: `npx @ccusage/codex daily --json | tracker ingest codex-ccusage --window <W0-XX> --scope daily --stdin --notes automation:ccusage-daily`
   - Guardrails: write to `data/week0/live`, atomic temp→rename, `--offline` if pricing fetch fails; stamp a note if “backfill”.
2. **Codex /status before/after wrappers**
   - When: at window start/end (use your calendar or a small `window_timer.sh` that reads a local schedule file).
   - Commands: `scripts/automation/codex_status.sh --phase before|after --window <W0-XX> --pipe-alias os|oe --buffer-seconds 0`
   - Guardrails: lockfile in `TRACKER_ALIAS_STATE_DIR`; abort if previous phase missing.
3. **Claude monitor snapshot**
   - When: at window end (aligned to above).
   - Command: `claude-monitor --view realtime | scripts/automation/claude_monitor.sh --window <W0-XX> --data-dir data/week0/live --notes automation:claude-monitor`
   - Guardrails: timeout + stderr capture; append `errors` if CLI returns non‑zero.
4. **Weekly usage snapshot**
   - When: weekly at T+1h after reset; if no weekly endpoint, **aggregate daily** and mark notes=`derived:weekly`.
5. **Ledger checkpoint**
   - When: session close.
   - Command: small script to:
     - append token plan/actual to `Token_Churn_Ledger.csv`
     - run `tracker churn --window <last>` and append to `Churn_Ledger.csv`
     - update `docs/SESSION_HANDOFF.md` with paths.

**Calendar integration (optional but useful):** keep a flat `docs/System/scheduler/windows.local.txt` (or an `.ics` you export) and have `window_timer.sh` read it. No external calendar plumbing required.

**Why this helps:** You get **A‑grade** live records (correct timing, consistent notes, metadata stamped) with almost no operator time, and without changing core logic.

------

## Code review (tight, actionable)

- **`JsonlStore._load`**: good sort fallback; consider sorting by `(captured_at or finalized_at, provider)` to stabilize order in preview when timestamps tie.
- **`DEFAULT_DATA_DIR`**: switched to `data/week0/live` – aligns with SOP (good).
- **`PARSERS`**: make sure `parse_claude_usage` and `parse_codex_status` always return an `errors: []` array; preview relies on the key’s presence.
- **`_handle_ingest` (codex-ccusage)**: `tokens = parsed.get("total_tokens")`; keep as is, your `_format_number` handles `None`.
- **Preview ccusage block**: `latest_by_scope` uses last record per scope (sorted by `captured_at/finalized_at`)—that’s correct after your sort fix.
- **Stamping (`meta.py`)**: solid. Add a doc: *when schema changes → bump `SCHEMA_VERSION` + short migration note* in `docs/System/schemas/universal_provider_schema.md`.

------

## Spend / subscriptions (quick)

You don’t need to buy anything for clean data. Automation + Ready‑Next + churn is the highest‑leverage step **now**. Revisit GLM/extra seats **after** churn lands and Stats/CI are visible; you’ll know exactly where throughput or diversity helps.

------

## “Do now” checklist (copy/paste to your plan)

-  Ship Ready‑Next (Stats/CI, Outcome, UPS links).
-  **Commit 1:** SOP + schema hooks for churn; add `commit_start/commit_end/methodology` to window finalize.
-  **Commit 2:** `tracker churn` subcommand + ledger write + pytest (temp git repo).
-  **Commit 3:** Preview shows churn line when present.
-  Fill `docs/System/scheduler/standing_jobs.md` with the 5 jobs; add tiny wrappers if any are missing.
-  Keep `Token_Churn_Ledger.csv` append‑only (you already corrected 270K→164K with a proper audit note—good).

If you want, I can draft the exact file diffs/text for:

- `commit_conventions.md`
- `git_churn_strategy.md` (short)
- `standing_jobs.md` (the five jobs as ready-to-run snippets)
- the CLI flags and sample preview line

—so your next session can implement without spending time on wording.