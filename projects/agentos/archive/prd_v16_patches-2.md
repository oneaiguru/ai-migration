# PRD v1.6-final — Complete Specification

**Subscription-Mode Usage Tracker & Optimizer**

Version: v1.6-final · Mode: Subscription only · Date: October 2025

---

## 0) Ground Truth & Scope (Oct 2025)

**Authoritative facts (no corrections):**

* **OpenAI Codex CLI:** Models `gpt-5-codex` (coding-optimized) and `gpt-5` (general reasoning); **Reasoning Levels** (Minimal/Low/Medium/High) affect capacity burn; 5-hour session window + weekly overlay shown via `/status`.

* **Anthropic Claude Code:** Tiers include **Pro** and **Max (×5 / ×20)**; sessions reset every 5 hours; weekly overlays apply. **Claude Sonnet 4.5** is current (memory features). **Thinking Levels** ("think", "think hard", "ultrathink") are token-budget triggers in Claude Code only.

* **Z.AI GLM (Coding Plans):** **GLM-4.6** (default) + **GLM-4.5-Air** (lightweight) with **Lite/Pro/Max ≈ 120/600/2400 prompts per 5h**. Via Claude Code integration; usage tracked in prompts, not tokens.

* **Subscription-mode only.** API prices appear for comparison only. Confirm limits at run-time (plans evolve).

---

## 1) Objective & KPIs

**Goal:** Maximize successful features per capacity while enforcing quality gates and respecting 5h/weekly caps.

**Primary unit:** A **Feature** is done when its BDD scenarios go green.

**Core metrics:**

* **Efficiency (E):** `successful_features / capacity_unit`
  * Codex/Claude: capacity unit = Δbar % points (pp) over window
  * GLM: capacity unit = prompts used

* **Quality-adjusted efficiency (E_q):** `Σ(successful_features × quality_score) / capacity_unit`
  * `quality_score = 1 – normalized_churn_14d` (bounded [0.5, 1.0])

* **IMPF:** Interaction minutes per feature (human time)
* **CLS:** Cognitive Load Score per feature

**Routing reward (when enabled):**
* Bar-based: `r = quality_score / (ε + Δpp)` (ε≈0.5pp)
* GLM: `r = quality_score / (ε + prompts)`

---

## 2) Data Sources & Ingestion

**Primary (canonical):**
* **claude-monitor** — session/daily/monthly views, 5h math
* **ccusage** — Claude+Codex parsing; emits JSON/JSONL; 5h blocks

**Fallback (text parsers):**
* **Codex `/status`** — 5h + weekly bars, reasoning level, context %
* **Claude `/usage`** — session/weekly bars (all-models, Opus); thinking level
  * Edge case: "Failed to load usage data" → send "hi" first

**Storage (append-only JSONL):**
* `snapshots.jsonl` — raw BEFORE/AFTER meter snapshots + pasted block
* `glm_counts.jsonl` — GLM prompt counts (source=ccusage/monitor/trace)
* `windows.jsonl` — window aggregates (providers' deltas/units, pass/fail/score, notes)

**Parser guarantees:**
* Regex: wrap-tolerant, ANSI-stripped, DOTALL
* Errors: `insufficient-data` (Codex narrow), `usage-not-loaded` (Claude)

---

## 3) Provider Profiles (Subscription Facts)

| Provider | Tier/Plan | Reset | Limits | Models | Notes |
|----------|-----------|-------|--------|--------|-------|
| **Codex (OpenAI)** | Pro-200 | 5h + weekly | Via `/status` bars | gpt-5-codex, gpt-5 | Reasoning Levels: Min/Low/Med/High |
| **Claude Code (Anthropic)** | Pro / Max ×5 / Max ×20 | 5h + weekly | Via `/usage` bars | Sonnet 4.5, Opus 4.1 | Thinking Levels: think/ultrathink |
| **GLM (Z.AI)** | Lite/Pro/Max | 5h pools | 120/600/2400 prompts/5h | GLM-4.6, GLM-4.5-Air | No weekly pool documented; 4.6 ≈ 2× Air capacity cost (guidance; measure in Week-0) |

**Policy:** Display "Limits can change — verify here: [provider URL]" banner; log last validation date.

---

## 4) Quality: Spec-First Gates, Churn, CLS, IMPF

### Spec-First Review Gate

**Panel (default):**
* **gpt-5** — Reasoning: High (broad knowledge, edge cases)
* **Claude Sonnet 4.5** — Thinking: ultrathink (deep analysis)
* **GLM-4.6** — Standard budget (tie-breaker)

**Decision rule:**
* **Default:** APPROVE when ≥2 of 3 models sign off ("2-of-3")
* **Capacity guardrail:** If any weekly bar < 10pp remaining OR GLM block < 15% remaining, use **"1-of-2"** (gpt-5 High + Sonnet 4.5) to avoid quota dead-ends
* **Split vote:** If 1-1-1, escalate to Opus 4.1 (ultrathink) as tie-breaker

**Escalation (Tier-2):**
* Only if CLS > 1.2σ OR Tier-1 flags blocking risk
* Add: Opus 4.1 + GPT-5 (both max effort)

**Logging:** Store panel votes + rationales with feature's `xfeat::` tag

### Spec Rubric v1 (10 checks)
1. Unambiguous inputs/outputs
2. Bounded ranges & error paths
3. Security/permission notes
4. Data contracts (OpenAPI/AsyncAPI/Proto)
5. Edge case examples
6. Traceability to BDD
7. Acceptance criteria
8. Rollback/observability hooks
9. Non-functional bounds
10. State/reset rules

### Traceability
Spec → BDD scenarios → code → tests → coverage; link IDs in commits

### Churn
* Track **normalized churn 7/14/28d** per feature/module
* **Exclude** prototype churn via `xproto::` tag (see §8)
* Use churn to penalize quality_score and surface risky modules

### CLS v1 (Cognitive Load Score)
```
CLS = 0.25·z(files_touched) + 0.20·z(module_spread) + 0.15·z(dep_depth)
    + 0.15·z(Δcyclomatic) + 0.10·z(plan_size_kb) + 0.10·z(interface_delta)
    + 0.05·z(cross_refs)
```
* **Gate:** CLS > 1.2σ → Tier-2 sign-off required
* **Routing:** High-CLS → stronger models; low-CLS → cheaper models

### IMPF (Interaction Minutes Per Feature)
Auto-log human time: guidance, intervention, validation. KPI: decreasing trend.

---

## 5) Estimation & Sample Size

**Estimator (small-n, heteroskedastic):**
* **Default:** Delta method with HC3 robust SE for E and E_q
* **Cross-checks:** Fieller + BCa bootstrap when n<10 or heavy skew

**Capacity unit:**
* Δ5h bar % where available
* prompts_delta for GLM
* Store both raw and normalized

**Confidence gates:**
* Begin reallocation ≥75% certainty
* Retire ≥95% certainty

**Sample size guidance:**
* Detect Δ=0.10 E-units with 80% power → ~15-20 windows/provider
* Δ=0.05 → ~60-70 windows (use sequential 75/95 gates in practice)

---

## 6) Router (Subscription Caps, Drift, Rework)

**Algorithm:** Bandits-with-Knapsacks (BwK)
* Discount factor γ≈0.95 for drifting rewards
* Shadow price for remaining weekly capacity
* Handles delayed rework (credit rewards to original arm)

**Arms:** (provider × methodology)

**Constraints:**
* Keep ≥10pp weekly bar buffer (see below)
* Respect 5h windows
* Handle delayed rework

### Safety Margins (Week-0 Defaults)

**Weekly buffer R:**
* Set R = **10pp (absolute points)** below 100% weekly bars for all providers

**Why 10pp:**
1. Pane update lag and read jitter (5-min wait covers most, not all)
2. Rework spillover into next window
3. BwK exploration budget
4. Weekly reset jitter (timezone & UI rounding)

**Stop rules:**
* If weekly bar ≥90% AND projected ΔW_next > (100 - current - R), do NOT start new window
* GLM: Stop block when < 15% prompts remain

**Can tighten to 7-8pp once Week-0 variance is known.*

**Baseline:** Greedy for ablations; expect BwK to outperform under caps.

---

## 7) Context Engineering Policy (Explicit)

### Codex CLI (OpenAI)
* **Models:** gpt-5-codex (coding), gpt-5 (general reasoning)
* **Reasoning Levels:** Minimal / Low / Medium (default) / High
* **Policy:**
  * Default: Medium for routine work
  * High: Planning, spec reviews, complex debugging
  * gpt-5 (High): Spec reviews where broad knowledge matters

### Claude Code (Anthropic)
* **Models:** Sonnet 4.5 (default), Opus 4.1 (rare)
* **Thinking Levels:** think / think hard / ultrathink
  * Triggers: "think", "think hard", "ultrathink" in prompt
  * Token budgets: ~4k / ~10k / ~32k
* **Policy:**
  * Default: think for routine tasks
  * think hard: Intermediate complexity, API integrations
  * ultrathink: High-CLS features, architecture decisions, Tier-2 reviews

### GLM (Z.AI via Claude Code)
* **Models:** GLM-4.6 (default), GLM-4.5-Air (lightweight)
* **Policy:**
  * Prefer 4.5-Air for scouting, simple transforms (2× cheaper capacity)
  * Use 4.6 for reviews, complex reasoning
  * Aim for **fewer, larger prompts** (billing per-prompt, not token)

### Session Hygiene (All Providers)
* Short, single-purpose sessions
* Clone sessions for multi-perspective reviews — make a backup copy of the session folder while it is inactive, ask one review question and capture the output, then remove the active folder and restore from the backup so the model “forgets” the prior question before you continue with the next review angle.
* Rely on Claude Code's memory tools for pruning
* Persist external artifacts (contracts/specs/tests) in repo

---

## 8) Source Control Conventions (Greppable Tags)

**No feature branches.** Single mainline.

### Commit Tag Format (Unique, Greppable)

**Regular features:**
```
xfeat::<FeatureID>::<WindowID>::<Stage>
```
Examples:
* `xfeat::AUTH-01::W0-003::SPEC` — spec written in window 3
* `xfeat::AUTH-01::W0-003::BUILD` — implementation
* `xfeat::FEED-02::W0-005::REVIEW` — review pass

**Prototypes/mocks (exclude from churn):**
```
xproto::<FeatureID>::<WindowID>::<Stage>
```
Examples:
* `xproto::UI-PROTOS::W-P1::MOCK` — UI prototype
* `xproto::DATA-MIG::W-M2::TEMP` — temp migration code

### Why This Works
* `xfeat::` and `xproto::` are unique prefixes (won't match normal text)
* Deterministic grep: `git log --grep="^xfeat::" --not --grep="^xproto::"`
* Zero reliance on flaky heuristics
* Simple for agents to apply

### Churn Calculation
```bash
# Count feature churn only (exclude prototypes)
git log --grep="^xfeat::" --not --grep="^xproto::" --numstat
```

---

## 9) Week-0 Measurement (Fresh Start, Aligned)

**Start:** Sunday 21:00 local, full weekly capacity

**Windows:** Target 6-8 per provider, aligned 5h blocks

**Stop rules:**
* Weekly bar buffer: Leave 10pp unused
* If provider crosses 90%, finish current window and STOP that provider
* Wait 5 minutes after end before AFTER reading (pane lag)

### BEFORE Each Window
* Codex: `/status` → ingest (phase=before)
* Claude: Send "hi", then `/usage` → ingest (phase=before)
* GLM (if used): `ccusage blocks --json` → ingest counts

### AFTER Each Window
* Sleep 5min → repeat readings → `window finalize` with units & quality

**Week-0 outputs:** Clean `snapshots.jsonl`, `windows.jsonl`, summary efficiency by provider/methodology

---

## 10) Tests & Coverage (BDD-First, Anti-Brittle)

**BDD fixtures:** Real panes (wide/narrow/very narrow; error states)

**Targets:** Parser functions (`codex.py`, `claude.py`) and bridges (`ccusage.py`, `claude_monitor.py`)

**Coverage gate:** ≥90% for parsers/normalizers; fail tests when pane too narrow (prevents silent mis-parse)

**Anti-gaming:** Agents never told we track coverage; used only internally as safety signal

---

## 11) Files & Deliverables (For Coding Agents)

**Parsers (fallback):**
* `tracker/sources/codex.py`
* `tracker/sources/claude.py`

**Bridges (primary):**
* `tracker/sources/claude_monitor.py`
* `tracker/sources/ccusage.py`

**Normalize & store:**
* `tracker/normalize/windows.py`
* `tracker/storage/writer.py`

**Estimators & router:**
* `tracker/estimators/{efficiency.py,ci.py}`
* `optimizer/{bwk.py,capacity.py}`

**JSONL:** `snapshots.jsonl`, `glm_counts.jsonl`, `windows.jsonl`

**Tests:** `tests/bdd/features/*` + fixtures; CI `--cov-fail-under=90`

---

## 12) Acceptance Criteria (Week-0 → v1.6 Go)

1. Measurement works in wild (parsers/bridges green on fixtures + live panes)
2. Clean Week-0: ≥6 windows/provider, no cap violations; 10pp buffer respected
3. Estimator outputs stable CIs; router dry-run shows BwK ≥ greedy on replay
4. Spec-first gate in use: Tier-1 reviews logged; Tier-2 only when CLS>1.2σ or disagreement
5. Quality telemetry live: churn_14d, CLS, IMPF, traceability links in `windows.jsonl`

---

## 13) Risks & Mitigations

* **Pane drift/wrap:** Wrap-tolerant regex + explicit error states
* **Usage lag:** Enforce +5min before AFTER readings
* **Vendor limit changes:** Runtime re-validate; UI banner + audit log
* **Coverage gaming:** Hidden; spec-first gate prevents overfitting to tests
* **Prototype bleed-through:** Masked via `xproto::` tag; production runs excluded

---

## Appendices

### A) JSONL Schemas
See §2; keys: `meters.{fiveh_pct,weekly_pct,opus_pct,...}`; `providers.delta_weekly_pp`, `glm.prompts_used`

### B) Spec Rubric v1
See §4; 10-item checklist for Tier-1 & Tier-2 prompts

### C) Week-0 Runbook & Schedule
Use `week0_final_protocol.md` (times, stop rules) and `saturday_prep_checklist.md` (tool installs, tracing)

### D) Capacity Buffers Rationale
Reserve 10pp weekly bar to hedge: pane lag, rework spillover, router exploration. (See §6)

---

## Version History

* **v1.3:** Base with correct parsers, schemas, Week-0 protocol
* **v1.5-final:** Integrated ground truth corrections (GPT-5-Codex, Claude Max ×5/×20, GLM-4.6)
* **v1.6-final:** Simplified tags (`xfeat::`/`xproto::`), explicit review panel with capacity guardrail, terminology split (Reasoning vs Thinking), 10pp buffer rationale, GLM 2× guidance

**Status:** Production-ready. No further PRD changes needed before Week-0.

---

**END PRD v1.6-final**
