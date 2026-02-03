Below is your **subscription-only** plan, tightened with the evidence you just gathered and the two internal docs you shared.

- Wherever I say “use `claude-monitor`” and “use `ccusage`” as primary sources—that comes from the repo scan you attached (these are the right tools for **subscription** usage, not API billing).
- Wherever I refer to your **Claude Code integration** (tracing, aliases like `c`, `o`, `so`, and the `claude-trace` wrapper), that’s from your Claude integration note.

------

# PRD — Subscription Usage Tracker (CLI-first, JSONL) **v1.3**

> **What changed from v1.2**
>
> 1. Make **`claude-monitor`** and **`ccusage`** the *primary* data sources; our plain-text parsers are now *fallbacks*.
> 2. Lock in **Claude tracing + aliases** (`c`, `o`, `so`, `h`) to guarantee logs exist for analysis.
> 3. Add robust handling for your real edge cases: wrapped lines, ultra-narrow terminals, “usage not loaded until you send `hi`”, and “Status dialog dismissed”.

------

## 1) Goals & Non-Goals

**Goals**

- Ingest **subscription** usage for three providers without API keys:
  - **OpenAI Codex CLI** (`/status` 5h + weekly bars)
  - **Anthropic Claude Code** (`/usage` all-models + Opus) + local JSONL traces
  - **z.ai GLM-4.6 (via Claude Code)** — prompt counts via `ccusage`/traces
- Normalize to **flat JSONL**; compute: Δweekly pp, 5h pp, prompts used (GLM), tokens (when available), and unit outputs.
- Provide **bandit-ready** efficiency & reward (quality-per-cost), plus capacity gates.

**Non-Goals**

- No API gateways (LiteLLM/Helicone/etc.). No DB. No web dashboard. (May add later.)
- No Opus coupling decisions this week (Opus bar recorded, not optimized yet).

------

## 2) System Architecture (subscription-only)

```
┌──────────────────────────────────────────────────────────┐
│ Human/agents run aligned 5h windows per Week-0 protocol  │
│  • Codex: paste `/status` BEFORE/AFTER                   │
│  • Claude: paste `/usage` BEFORE/AFTER (send "hi" first) │
│  • Claude+GLM: ccusage/claude-monitor to count prompts   │
└──────────────────────────────────────────────────────────┘
                │                              │
       clipboard snapshots               local file readers
                │                              │
                ▼                              ▼
        ┌──────────────┐               ┌──────────────────┐
        │ Parsers      │               │ Bridges          │
        │  codex_txt   │               │  claude-monitor  │
        │  claude_txt  │               │  ccusage         │
        └─────┬────────┘               └─────────┬────────┘
              │                                    │
              └───────────────┬────────────────────┘
                              ▼
                       ┌───────────────┐
                       │ Normalizer    │ → window records
                       └──────┬────────┘
                              │ JSONL append
                              ▼
                       ┌───────────────┐
                       │ storage/*.jsonl
                       └──────┬────────┘
                              ▼
    ┌──────────────────────────────────────────────────────────┐
    │ Estimators & Optimizer                                   │
    │  • E_codex, E_claude, E_glm                              │
    │  • CI, ECOST, capacity gating                            │
    │  • bandit reward (quality-per-cost; optional)            │
    └──────────────────────────────────────────────────────────┘
```

**Primary data sources** (why):

- **`claude-monitor`** reads Claude’s local JSONL and already models 5-hour blocks, plan limits, and session math for **Claude Code**. Great for live and historical views.
- **`ccusage`** parses **Claude + Codex/ChatGPT** local data and can emit JSON/JSONL; it includes **5-hour block** analysis and cost estimates. We can treat it as a black-box CLI to get normalized rows quickly.
- **Your Claude integration** ensures **tracing on by default** (`claude-trace` + `c`, `o`, `so`, `h`), guaranteeing raw JSONL exists even when panes fail.

**Fallbacks** (only when needed):

- Text parsers for **Codex `/status`** and **Claude `/usage`** to handle immediate BEFORE/AFTER meters and edge cases you showed.

------

## 3) Data Schemas (JSONL)

### 3.1 `snapshots.jsonl` — meter snapshots (copy/paste)

```json
{
  "ts": "2025-10-19T21:00:06+08:00",
  "window_id": "W0-001",
  "provider": "codex|claude",
  "phase": "before|after",
  "meters": {
    "fiveh_pct": 1,
    "fiveh_resets": "13:01",
    "weekly_pct": 82,
    "weekly_resets": "21:29 on 19 Oct",
    "opus_pct": 0
  },
  "raw": "<exact block pasted>"
}
```

### 3.2 `glm_counts.jsonl` — GLM (Claude→z.ai) prompt usage

```json
{
  "ts": "2025-10-19T21:00:10+08:00",
  "window_id": "W0-001",
  "source": "ccusage|claude-monitor|trace-fallback",
  "prompts_used": 208,
  "prompts_cap": 2400,
  "notes": "GLM Max via ccusage blocks"
}
```

### 3.3 `windows.jsonl` — primary unit for estimators

```json
{
  "window_id": "W0-001",
  "start": "2025-10-19T21:00:00+08:00",
  "end":   "2025-10-20T02:00:00+08:00",
  "methodology_id": "M01-plan-build-review-fixed",
  "providers": {
    "codex":  {"delta_weekly_pp": 4, "delta_fiveh_pp": 34, "units": 3},
    "claude": {"delta_all_pp": 3,   "opus_pp": 0,          "units": 3},
    "glm":    {"prompts_used": 208, "cap": 2400,           "units": 2}
  },
  "quality": {"pass": 5, "fail": 1, "score": 0.83},
  "notes": []
}
```

------

## 4) Sources & Parsers

### 4.1 Primary bridges

- **Claude Code**
  - `claude-monitor --view session|daily --timezone <tz> --theme classic` → screen/log; parse its table to JSON (or ask it to log; it prints totals and block math we need).
  - `ccusage blocks --live --json` (or `daily --json`) → structured counts & 5-hour blocks.
- **Codex**
  - `ccusage` has a Codex/ChatGPT analyzer; when present, prefer that to derive per-session usage. Otherwise, use `/status` parser and your pasted block.

### 4.2 Fallback text parsers (already spec’d and now tested against your fixtures)

- **Codex `/status`**: wrap-tolerant regex; pulls `fiveh_pct`, `fiveh_resets`, `weekly_pct`, `weekly_resets`. Detect **“insufficient-data”** for ultra-narrow panes.
- **Claude `/usage`**: section chunking for **Current session**, **Current week (all models)**, **Current week (Opus)**; detect **“usage-not-loaded”** and instruct to send **`hi`** first (you showed it fixes the pane).

> We already provided Gherkin features + stub code; retain them and add *your new fixtures* (wide/narrow/very narrow). That keeps the parser robust as panes change.

------

## 5) Estimators, Reward, Capacity

- **Codex**: $E_{\text{codex}} = \frac{\sum U}{\sum \Delta W_{\text{weekly}}}$
- **Claude (all-models)**: $E_{\text{claude}} = \frac{\sum U}{\sum \Delta W_{\text{all}}}$
- **GLM (Max)**: prompts-based: $E_{\text{glm,p}} = \frac{\sum U}{\sum \text{prompts}}$

**Bandit reward (when you enable it)**

- Codex/Claude windows: $r = \frac{\text{quality_score}}{\epsilon + \Delta \text{pp}} - \lambda \cdot \text{continues}/K$
- GLM windows: $r = \frac{\text{quality_score}}{\epsilon + \text{prompts}}$
  (quality in [0,1], $\epsilon$ ≈ 0.5pp or 1 prompt; $\lambda$ ≈ 0.05)

**Safety margins**

- Use **R = 5 pp** buffer on weekly bars to avoid lockouts; GLM keep **≥10%** of block free.
- Add **+5 min lag** before AFTER reads (you observed panes can lag; this stabilizes ΔW).

------

## 6) Exact Commands & Runbook

> Assumes your aliases and tracing are in place (`c`, `o`, `so`, `h` via `claude-trace`), so Claude sessions are always logged.

### Install once

```bash
# Claude monitor (Python)
uv tool install claude-monitor
# Usage analyzer (Node/TS)
brew install ccusage
```

(You validated both; `claude-monitor --view daily` works on your machine.)

### BEFORE each window (both providers)

```bash
# Codex
codex /status  | tee >(tracker ingest codex --phase before --window "$WID" --stdin)
# Claude: *send a message first*, then /usage, else it may say "Failed to load"
claude -p <<<'hi'
printf '/usage\n' | claude | tee >(tracker ingest claude --phase before --window "$WID" --stdin)
```

### DURING window

- Work the fixed Week-0 methodology (same features for both).
- If GLM Max is used via Claude, collect **prompts**:

```bash
# preferred
ccusage blocks --json | tracker glm ccusage --window "$WID" --stdin
# fallback (rare): parse latest trace file (claude-trace) you opened
tracker glm trace --window "$WID" --path ~/.claude-trace/log-YYYY-...
```

(Your environment has tracing on by default, so fallback is always possible.)

### AFTER each window

```bash
sleep 300  # 5-min lag buffer
codex /status  | tee >(tracker ingest codex --phase after --window "$WID" --stdin)
printf '/usage\n' | claude | tee >(tracker ingest claude --phase after --window "$WID" --stdin)
tracker window finalize --window "$WID" --units <N> --quality <0..1>
```

------

## 7) Tests (BDD) — add your new fixtures

- **Codex `/status`**: add fixtures for:
  - **wide** 82/1 with “resets 21:29 on 19 Oct”
  - **narrow wrapped** (weekly and 5h percentages split across lines)
  - **very narrow** (no numbers → `insufficient-data`)
- **Claude `/usage`**: add fixtures for:
  - **wide** 90% all-models, 1% session, 0% Opus (your screenshot)
  - **narrow** bullet layout
  - **“Failed to load…”** and **“Status dialog dismissed”** until `hi` is sent

The Gherkin + step code I gave you earlier already cover these; drop the files into `tests/fixtures/...` and they’ll guard our parsers going forward.

------

## 8) Week-0 Protocol (fresh, aligned Sunday start)

**Start:** **Sun Oct 19, 21:00 (local)** with **100% weekly** on Codex & Claude.
**Objective:** 6–8 windows/provider; same task set; stop each provider at **≥95%** weekly.

### Schedule (sleep-friendly; :00 starts; both providers aligned)

- **W1** Sun 21:00–02:00 *(optional kickoff; if you prefer sleep, skip to W2)*
- **W2** Mon 09:00–14:00
- **W3** Mon 15:00–20:00
- **W4** Tue 09:00–14:00
- **W5** Tue 15:00–20:00
- **W6** Wed 09:00–14:00
- **W7** Wed 15:00–20:00
- **W8** Thu 09:00–14:00 *(optional; only if bars permit)*

**Contingencies**

- If **Codex** >95% after any window → stop Codex; continue Claude/GLM.
- If **Claude** >95% → stop Claude; continue Codex/GLM.
- If **both** approach caps → stop Week-0 early; you still have enough for first estimates.

------

## 9) Deliverables for Coding Agents (files & paths)

- **Parsers (fallbacks)**
  - `tracker/sources/codex.py` — parse `/status` with wrap-tolerant regex.
  - `tracker/sources/claude.py` — parse `/usage`; detect “usage-not-loaded”.
- **Bridges (primary)**
  - `tracker/sources/ccusage.py` — read `ccusage ... --json` and map to our schema.
  - `tracker/sources/claude_monitor.py` — read `claude-monitor` table or log to JSON, map blocks/tokens.
- **Normalizer & storage**
  - `tracker/normalize/windows.py` → build `windows.jsonl`
  - `tracker/storage/writer.py` → append-safe JSONL
- **Estimators**
  - `tracker/estimators/efficiency.py`, `ci.py`, `ecost.py`, `optimizer/capacity.py`, `optimizer/reward.py`
- **CLI**
  - `tracker/cli.py` with subcommands shown in §6
- **Tests**
  - `tests/bdd/features/*` + your fixtures under `tests/fixtures/{codex,claude}/`

------

## 10) Why `claude-monitor` + `ccusage` first (and parsers second)

- They already speak subscription usage, 5-hour blocks, and **local Claude logs**; less brittle than scraping terminal UIs.
- Your shell uses **`claude-trace` + aliases** so logs are always present; bridges will have stable data even when `/usage` glitches.

------

# Week-0 Run Checklist (copy/paste)

**Sat (prep)**

1. Ensure aliases/tracing work (`c`, `o`, `so`, `h`).
2. `uv tool install claude-monitor` · `brew install ccusage` (done once).
3. Put your BDD fixtures in `tests/fixtures/...` and run `pytest` — parsers green.

**Sun 20:45**

```bash
export WID=W0-001
tracker ingest codex --phase before --window "$WID" --paste   # then paste /status
tracker ingest claude --phase before --window "$WID" --paste  # send "hi", then /usage
```

**21:00–02:00 (optional W1)**

- Work the fixed methodology; collect GLM prompts with `ccusage ... --json`.

**02:00 (+5 min lag)**

```bash
tracker ingest codex --phase after --window "$WID" --paste
tracker ingest claude --phase after --window "$WID" --paste
tracker window finalize --window "$WID" --units <N> --quality <0..1>
```

**Mon/Tue**

- Repeat for **W2…W5** with aligned starts; watch warnings once bars cross 90–95%.

------

## Notes on your latest evidence (how we used it)

- **Narrow/very narrow panes** → parser raises **clear errors** (“widen terminal”, “send `hi` first”).
- **“Status dialog dismissed / Failed to load usage data”** → driver sends a single **`hi`** auto-prompt before `/usage`.
- **ccusage & claude-monitor output** → we treat as canonical for GLM prompts & Claude tokens/cost; fallback only when absent.

------

If you want, I can also generate **ready-to-run `pytest` BDD bundles** using the exact blocks in your message so your agents have green tests on day 1.
