# Week 0 Protocol — Dual-Provider Baseline Measurement

**Updated with v1.6-final requirements**

---

## 🎯 Objective

Establish empirical efficiency (features per capacity unit) for **Codex Pro** vs **Claude Pro** using controlled, identical methodology. Week 0 = baseline comparison.

**Success criteria:**
* ≥6 measurement windows per provider
* Variability (ΔW% coefficient of variation) < 30%
* Both providers measured without interference
* Clean data for Week 1 expansion

---

## 📅 Schedule (Sun Oct 19 — Thu Oct 23)

| Window | Start Time | Providers | Notes |
|--------|-----------|-----------|-------|
| W0-01 | Sun 21:00 | Both | Fresh start, 100% capacity |
| W0-02 | Mon 09:00 | Both | Morning run |
| W0-03 | Mon 15:00 | Both | Afternoon run |
| W0-04 | Tue 09:00 | Both | Mid-week check |
| W0-05 | Tue 15:00 | Both | Continue if <90% used |
| W0-06 | Wed 09:00 | Both | Continue if <90% |
| W0-07 | Wed 15:00 | Both | Optional extra window |
| W0-08 | Thu 09:00 | Both | Buffer window |

**Safety rules:**
* If either provider >95% utilization → **STOP** that provider
* If both providers >90% by Wed AM → **END Week 0 early**
* **Wait 5 minutes after window end** before AFTER reading (pane lag buffer)
* Keep 10pp (percentage points) weekly bar buffer unused

---

## 🔧 Fixed Methodology

**Work unit (U):** One feature implemented and BDD tests pass (~50 line spec)

**Pre-selected features:** 10 similar specs (prepared Saturday)

**Pipeline per feature:**
1. Planning (1 prompt) — "Read spec, propose approach"
2. Building (1-2 prompts) — "Implement until tests pass"
3. Review (1 prompt) — "Run tests, fix if needed"

**Model assignments:**
* **Codex Pro:** Use `gpt-5-codex` or `gpt-5` (High reasoning for reviews)
* **Claude Pro:** Use `Claude Sonnet 4.5` (think/ultrathink as needed)

**Controls:**
* Same feature set for both providers
* No file attachments >1MB
* Fresh chat session per window
* Standard prompt templates

---

## 📏 Measurement Protocol

### BEFORE Each Window

**Codex (ChatGPT Plus/CLI):**
```bash
WID="W0-01"  # update for each window
codex /status | tee >(tracker ingest codex --phase before --window $WID --stdin)
```

**Claude Pro (Desktop CLI):**
```bash
WID="W0-01"
# If pane shows "Failed to load usage data" or "Status dialog dismissed":
claude -p <<<'hi'  # Warm up the session first

# Then get usage:
claude -p
/usage  # Copy ENTIRE output

# Ingest:
tracker ingest claude --phase before --window $WID --stdin <<EOF
<PASTE CLAUDE /usage OUTPUT>
EOF
```

### DURING Window (5 hours active development)

Work through features on **both providers in parallel:**
* Terminal A: Codex session working on features
* Terminal B: Claude session working on features
* Log completed feature count for each

**If hit usage warnings:**
* "Approaching limit" → note and continue
* "Limit reached" → STOP that provider immediately

### AFTER Each Window

**Wait 5 minutes** after window end (for usage stats refresh), then:

**ChatGPT Plus/Codex:**
```bash
codex /status | tee >(tracker ingest codex --phase after --window $WID --stdin)
```

**Claude Pro:**
```bash
# Warm up if needed:
claude -p <<<'hi'

# Get usage:
claude -p
/usage

# Ingest:
tracker ingest claude --phase after --window $WID --stdin <<EOF
<PASTE CLAUDE /usage OUTPUT>
EOF
```

**Finalize window:**
```bash
tracker complete $WID \
  --claude-features <#completed_by_claude> \
  --codex-features <#completed_by_codex> \
  --glm-features 0
```

---

## 🔍 Spec Review Gate (Week 0)

**Panel (default: 2-of-3 approval required):**
1. gpt-5 (Reasoning: High)
2. Claude Sonnet 4.5 (Thinking: ultrathink)
3. GLM-4.6 (if available)

**Capacity guardrail:**
* If any weekly bar < 10pp remaining OR GLM block < 15% remaining:
  * Drop to **1-of-2** (gpt-5 High + Sonnet 4.5) to avoid quota dead-ends

**Tag specs with:**
```
xfeat::AUTH-01::W0-003::SPEC
```

---

## 📊 Data Collection

Each window produces:
* `data/week0/snapshots.jsonl` — raw before/after readings
* `data/week0/windows.jsonl` — aggregated results (features, capacity, efficiency)

**Manual backup:** After each day, copy raw `/status` outputs:
```bash
logs/w0-01-claude-before.txt
logs/w0-01-claude-after.txt
logs/w0-01-codex-before.txt
logs/w0-01-codex-after.txt
```

---

## 🚨 Contingency Plans

**Narrow terminal (Claude /status cut off):**
* Widen terminal to ≥80 columns and rerun
* If still fails: `tracker override claude --window $WID --weekly-pct 82`

**Claude usage not loading:**
* Type `hi` first, then `/usage`

**Provider hits cap early:**
* Continue with other provider through remaining windows
* Mark that provider maxed at N windows

**Both hit caps early:**
* Accept fewer windows (minimum 3 each for baseline)
* Extend into Week 1 to gather more data

---

## ✅ Week 0 Deliverables

**Data files:**
* `snapshots.jsonl`, `windows.jsonl`, `analysis.json`

**Example summary:**
```
Provider: Codex Pro
Windows: 6
ΣU (features): 18
ΣΔW (capacity used): 24pp
E_codex: 0.75 features/pp (95% CI: 0.68-0.82)
Cost: ~$0.065/feature

Provider: Claude Pro
Windows: 6
ΣU: 18 features
ΣΔW: 18pp
E_claude: 1.00 features/pp (95% CI: 0.91-1.09)
Cost: ~$0.046/feature

Conclusion: Claude Pro ~33% more efficient
```

**Decision for Week 1:** Based on results, decide:
* Keep both if complementary
* Drop less efficient if one dominates
* Consider Max upgrade if capacity was limiting
* Add GLM as third provider

---

## 📋 Week 1 Preview

**If Week 0 successful:**
* Subscribe to GLM by Sun 21:00 (aligned start)
* Run Week 1 with 3 providers
* Try 2-3 methodology variants
* Aim for elimination of weakest by end of Week 1

**If Week 0 had issues:**
* Debug tracker/parser over weekend
* Re-run baseline (Week 0.5)
* Extend timeline as needed

---

## 📞 Support

**Tracker CLI fails:**
* Check `data/week0/errors.log`
* Manually record before/after in spreadsheet as backup

**Provider behaves unexpectedly:**
* Document in `data/week0/anomalies.md` with timestamp
* Include screenshots

---

**Status:** Ready for Sunday 21:00 execution. All prep (specs, CLI tools) must be complete by Saturday evening.
