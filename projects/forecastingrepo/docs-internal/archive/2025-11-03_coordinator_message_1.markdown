Great—thanks for the full dump. I read through your recap and the new agent’s notes. Here’s a clean **status verdict** and **what to do next**, with copy‑paste‑ready messages and a step‑by‑step PR queue so a single coding agent can drive for several hours without you.

------

## ✅ Current state — on track

- **PR #9** (`feat/backtest-driver-scoreboard`) now has coverage fixes and should meet gates (scripts ≈ 91%, `ingest_and_forecast.py` ≈ 90%). This matches the plan (no behavior changes).
- **Docs branches** exist and look correctly scoped:
  - `docs/import-pro-tmp-docs` – docs only (Validation Checklist, PR Ladder, Review Bundle SOP, research docs, Agent‑Mode archive note).
  - `chore/agentmode-fetch-scripts` – fetch tooling staged but **paused** (informational only).
  - `feat/weather-ab-offline` – **evaluation‑only** CLI + tests (no pipeline change).
- **No secrets or raw data committed**; Agent‑Mode explicitly paused; golden baseline unchanged by default.
- The only delta I still want to **ensure** lands in the docs import PR:
  - `docs/AgentMode/cdsapirc.example` (template only; never commit real keys).
  - `docs/System/Golden_Bump.md` (explicit golden update process).
  - **Replace** any stubs of `docs/research/bibliography.bib` and `docs/research/links.csv` with the fuller versions we prepared (no placeholders).

------

## 🔜 Immediate queue (do these in order)

### 1) Land PR #9 (backtest driver; no model change)

**Agent actions**

- Re‑run CI on PR #9. If coverage is **still** finicky on GH Actions, add the **optional** single test we prepared earlier (`tests/scripts/test_ingest_cli_runpy.py`) to tick uncovered argparse/IO paths in `ingest_and_forecast.py`. Only add if CI misses; otherwise skip.
- Assign the correct reviewer (you) and merge when green.
- **Tag**: `v0.1.1` “Backtest driver & scoreboard”.

**Copy‑paste PR comment to post now**

> Coverage fixed per plan; no behavior changes. CI is hardened (deterministic env + headless Agg). If GH Actions still misses the gate, I’ll add the small `runpy` CLI test as fallback; otherwise ready to merge.

------

### 2) Open PR: **docs import** (no behavior changes)

**Branch:** `docs/import-pro-tmp-docs`
 **Title:** `docs: import tmp docs (ADR/PRD/SOP/data/eval/research/AgentMode) — no behavior changes`

**Must read before touching files**

- `docs/System/documentation-index.md`
- `docs/SOP/standard-operating-procedures.md`
- `docs/SOP/policies.md` (ensure present)
- `docs/Tasks/VALIDATION_CHECKLIST_Current_State.md`

**Scope (files to include/ensure)**

- ADRs 001..008, PRDs, Data, Eval, Research (with **full** `bibliography.bib` and `links.csv`), SOPs, Agent‑Mode docs (including `ARCHIVE_NOTE.md`), scenarios example.
- **Add** `docs/AgentMode/cdsapirc.example`.
- **Add** `docs/System/Golden_Bump.md`.
- **Update** `docs/System/documentation-index.md` to link **Golden_Bump** under “Tasks & SOPs”.

**Gates**

- `python .tools/docs_check.py` → OK
- `python .tools/spec_sync.py` → OK
- No test/behavior change; coverage unaffected.

**Definition of done**

- Index has **no dead links**; docs_check/spec_sync green; PR merged.
- **Tag**: `v0.1.2` “Docs import & golden process”.

**Copy‑paste PR description**

> Docs‑only import per plan (ADR/PRD/Data/Eval/Research/Agent‑Mode); adds `docs/AgentMode/cdsapirc.example` and `docs/System/Golden_Bump.md`. Updates docs index. No code changes; gates green.

------

### 3) (Optional Draft) PR: **Agent‑Mode fetch scripts** (paused)

**Branch:** `chore/agentmode-fetch-scripts`
 **Title:** `chore(agentmode): add fetch scripts (paused; informational only)`

- Mark as **Draft** and label `paused/agent-mode`.
- Do **not** wire into CI or pipeline; do **not** include secrets.
- Merge only when we explicitly re‑enable Agent‑Mode in policy.

------

### 4) PR: **Offline weather A/B** (evaluation‑only)

**Branch:** `feat/weather-ab-offline`
 **Title:** `feat: weather A/B (offline, evaluation‑only) — no forecast changes`

**Must read**

- `docs/Tasks/PR-Weather-AB-Local.md`
- `docs/research/weather_features.md`
- `docs/research/evaluation_patterns.md`
- `docs/System/AgentMode.md` + `docs/AgentMode/ZIP_IMPORT.md` (input file conventions)

**Scope**

- `scripts/weather_join_local.py` (local files only).
- If present: `src/plugins/weather/{adapter.py,features.py,join.py,qa.py}` kept strictly **local** and **offline**.
- Tiny test to assert the CLI emits `reports/weather_ab/*` with expected schemas (no changes to forecast outputs).
- Explicitly **no default scenario change**; weather remains **behind a flag** for later PRs.

**Gates**

- Tests/spec_sync/docs_check green; coverage ≥ 85% overall.
- **Do not** commit `data/raw/**` or `.nc/.xlsx`.

**Definition of done**

- A/B report can run locally on your side; repo behavior unchanged.
- **Tag**: `v0.1.3` “Offline A/B evaluation CLI”.

------

## 🧭 Reading list & “what to touch” per PR (quick slip for agent)

- **PR #9** — *Read*: `scripts/backtest_eval.py`, `docs/System/Quicklook.md`; *Touch*: tests only (if CI coverage short).
- **Docs import** — *Read*: `docs/System/documentation-index.md`; *Touch*: only docs (Research full set, `cdsapirc.example`, `Golden_Bump.md`, index bullet).
- **Agent‑Mode (paused)** — *Read*: Agent‑Mode docs; *Touch*: none (or push as **draft**).
- **Offline A/B** — *Read*: PR‑Weather‑AB‑Local instructions + Research/Weather Features; *Touch*: `scripts/weather_join_local.py` (+ minimal tests).

