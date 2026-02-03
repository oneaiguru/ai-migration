## scope

* **codex lane only** (no proxy/remote ingest).
* finalize the current window (if pending), then open/close **one new window** delivering **3–4 micro-tasks**.
* ship **alias UX BDD**, **multi-agent docs**, **automation pack polish**, **decision-card BDD**, and start **knowledge migration**.

## invariants (hard)

* **after ≥ +5 min** post reset; else tag `notes=late-after` and write anomaly row.
* multi-pane trim → keep last; `multi-pane-trimmed` allowed in `parsed.errors`.
* non-negative deltas; negative → set delta `None`, append `anomalies.jsonl`.
* **append-only** JSONL/CSV; corrections via `alias delete` (wrappers `od1/od2` OK).
* absolute paths in docs; no env-path shortcuts.

## pre-flight (run at start)

```
PYTHONPATH=tracker/src pytest
PYTHONPATH=tracker/src behave features
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview
```

**gate:** tests green; preview prints `Anomalies: N` without error.

---

## commit A — alias UX coverage (od1/od2 + AGENT_ID concurrency)

**work**

* Extend `features/tracker_aliases.feature`:
  * **undo** flows: `alias delete --index 1` (od1) and `--index 2` (od2) for AFTER snapshots.
  * **concurrency** doc-sim: two temps with `AGENT_ID=main` and `AGENT_ID=sub1` (each in separate tmp data dirs) both record “before”; assert distinct state dirs, no collisions.
* Add a light pytest helper if needed for state-dir isolation.

**accept**

* `behave ../features` passes with the new scenarios.
* Preview on each tmp data dir shows “Snapshots: codex: before” with `notes` reflecting each agent id.

**artifacts**

* `features/tracker_aliases.feature` (+ scenarios)
* (optional) `tracker/tests/test_alias_state_isolation.py`

**docs**

* `docs/Tasks/tracker_cli_aliases.md`: examples for `AGENT_ID` and `od1/od2`, note flock lock.

---

## commit B — automation pack polish + decision-card BDD

**work**

* `docs/System/scheduler/standing_jobs.md`: ready-to-run snippets:
  * **start/end** captures (codex_status.sh) with +5-min guard.
  * **ledger checkpoint** (plan/actual/features → Token_Churn_Ledger; run `tracker churn`).
* **BDD for decision card**:
  * Minimal feature that: finalize a tmp window, append one evidence row (use `scripts/tools/append_evidence.sh`), run `python scripts/tools/decision_card.py --window <W>`; assert `GO` (or `SOFT GO` when evidence/churn missing as expected).
* Ensure preview always prints `Anomalies: N` (tests already present); add one SOP bullet referencing it.

**accept**

* `behave ../features` includes the decision-card scenario and passes.
* SOP doc updated to show the anomalies check and the decision-card step in close-out.

**artifacts**

* `features/decision_card.feature`
* `docs/SOP/uat_opener.md` (anomalies + evidence steps already present; confirm)

---

## commit C — close current window → open/close new window with 3–4 tasks + knowledge migration

> if a window is pending (e.g., `W0-CHP`), finalize it **first**; otherwise, start fresh at **open**.

### A) close current (if pending)

```
# AFTER (respect +5 min)
codex /status | PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live alias end codex \
  --stdin --window <W0-XX> \
  --state-dir data/week0/live/state --notes after-clean

# finalize + churn
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  complete --window <W0-XX> --codex-features <N> --quality 1.0 --outcome pass

PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  churn --window <W0-XX> --provider codex --methodology long_session \
  --commit-start <shaA> --commit-end <shaB>

# checkpoint + decision
scripts/automation/ledger_checkpoint.sh --window <W0-XX> --provider codex \
  --task end_of_session --plan <PLANNED> --actual <ACTUAL> --features <N> \
  --notes session005
python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>
```

**accept (close):** preview shows Providers/Outcome/Churn with `Anomalies: 0`; Token/Churn ledgers append; Decision Card prints.

### B) open/close new window (`W0-N`)

```
# BEFORE
codex /status | PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live alias start codex \
  --stdin --window W0-N --state-dir data/week0/live/state --notes before-long
```

* implement **3–4 micro-tasks** from `docs/Tasks/specs/*.md`; run acceptance; stash artifacts under `artifacts/test_runs/<id>/`.
* append evidence (per task):

```
scripts/tools/append_evidence.sh \
  --window W0-N --cap <CAP-ID> --runner <pytest|behave|manual> \
  --result <pass|fail|partial> --artifacts artifacts/test_runs/<id>/
```

* **AFTER** (+5 min if near reset) → finalize → churn → checkpoint → decision:

```
codex /status | PYTHONPATH=tracker/src python -m tracker.cli \
  --data-dir data/week0/live alias end codex \
  --stdin --window W0-N --state-dir data/week0/live/state --notes after-long

PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  complete --window W0-N --codex-features <N> --quality 1.0 --outcome pass

PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  churn --window W0-N --provider codex --methodology long_session \
  --commit-start <shaC> --commit-end <shaD>

scripts/automation/ledger_checkpoint.sh --window W0-N --provider codex \
  --task end_of_session --plan <PLANNED> --actual <ACTUAL> --features <N> \
  --notes session005
python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-N
```

**accept (new window):** preview correct with `Anomalies: 0`; evidence rows ≥ tasks; Token/Churn ledgers append; Decision Card prints.

### C) knowledge migration (docs)

* Move alias/automation how-tos from archive into wiki notes and link from:
  * `docs/Tasks/tracker_cli_aliases.md`
  * `docs/System/scheduler/standing_jobs.md`
* Keep it short: paths, one-line purpose, canonical commands.

**accept (docs):** wiki link paths present in both docs; “one-page” operator can find alias+scheduler quickly.

---

## validation matrix (end of session)

```
PYTHONPATH=tracker/src pytest
PYTHONPATH=tracker/src behave features
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-N
python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>
python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-N
```

## artifacts to update

* `docs/SESSION_HANDOFF.md` — commands run, windows closed, Decision Card results, artifact paths.
* `docs/Tasks/tracker_cli_todo.md` — checkboxes for A/B/C done.
* `docs/Ledgers/Token_Churn_Ledger.csv`, `docs/Ledgers/Churn_Ledger.csv`, `docs/Ledgers/Feature_Log.csv`, `docs/Ledgers/Acceptance_Evidence.csv` (append-only).
* `docs/System/scheduler/standing_jobs.md` (final snippets).
* `progress.md` (one succinct entry linking to handoff).

---

## quick “do-only” block (paste if you want a one-pager)

**close pending window**

```
codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  alias end codex --stdin --window <W0-XX> --state-dir data/week0/live/state --notes after-clean
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live complete --window <W0-XX> --codex-features <N> --quality 1.0 --outcome pass
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live churn --window <W0-XX> --provider codex --methodology long_session --commit-start <shaA> --commit-end <shaB>
 scripts/automation/ledger_checkpoint.sh --window <W0-XX> --provider codex --task end_of_session --plan <P> --actual <A> --features <N> --notes session005
python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>
```

**open & close new**

```
codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  alias start codex --stdin --window W0-N --state-dir data/week0/live/state --notes before-long
# implement 3–4 tasks; append evidence per task
codex /status | PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live \
  alias end codex --stdin --window W0-N --state-dir data/week0/live/state --notes after-long
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live complete --window W0-N --codex-features <N> --quality 1.0 --outcome pass
PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live churn --window W0-N --provider codex --methodology long_session --commit-start <shaC> --commit-end <shaD>
scripts/automation/ledger_checkpoint.sh --window W0-N --provider codex --task end_of_session --plan <P> --actual <A> --features <N> --notes session005
python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-N
```

**plus**: run `behave` scenarios added in commit A/B; update docs links; append ledgers; update handoff.

that’s it—straight execution, no chatter, no proxy ingress.
