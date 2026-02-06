# Final Documentation Package — Week 0 Ready

**Status:** Production-ready. All documents finalized.

---

## 📦 Core Documents (SAVE AS-IS)

### 1. PRD v1.6-final
**File:** `PRD_v1.6-final.md` (English)
**File:** `PRD_v1.6-final_RU.md` (Russian)
**Status:** ✅ Locked. No changes needed before Week 0.

**Key features:**
* Ground truth: GPT-5-Codex, Claude Max ×5/×20, GLM-4.6, Sonnet 4.5
* Simplified tags: `xfeat::` / `xproto::`
* Spec review panel: 2-of-3 with capacity guardrail
* 10pp weekly buffer rationale
* Terminology split: Codex Reasoning Levels ≠ Claude Thinking Levels
* GLM 4.6 ≈ 2× Air (guidance, validate in Week-0)

---

## 📋 Operational Documents (UPDATED)

### 2. Week 0 Protocol
**File:** `week0_final_protocol.md`
**Status:** ✅ Updated with v1.6 requirements

**Updates applied:**
* 5-minute wait after window end (explicit)
* Claude warm-up: `hi` if "Failed to load usage data"
* Spec review guardrail: 2-of-3 default, 1-of-2 when capacity tight
* Commit tag format: `xfeat::` / `xproto::`

### 3. Saturday Prep Checklist
**File:** `saturday_prep_checklist.md`
**Status:** ✅ Updated with v1.6 requirements

**Updates applied:**
* Commit tag format documented
* `claude-monitor --view daily` verified mode
* Churn exclusion via `xproto::` explained
* Quick reference section added

---

## 📚 Supporting Documents (SAVE AS-IS)

### 4. Spinoff Brief
**File:** `prd_spinoff_brief.md`
**Status:** ✅ Save as-is (good context)
**Optional:** Update examples to use `xfeat::`/`xproto::` tags (minor)

### 5. Revised Timeline
**File:** `revised_timeline.md`
**Status:** ✅ Save as-is
**Verify:** Sunday 21:00 start, 5h-aligned windows

---

## 📜 Patch History (ARCHIVE)

### 6. Patch Set v1.6
**File:** `PRD_v1.6_patches.md`
**Status:** ✅ Save as "Patch History"
**Purpose:** Documents 5 patches from v1.5-final → v1.6-final

### 7. Older Versions (Historical)
**Files:** 
* `critical_fixes_revised.md` (outdated, pre-ground-truth)
* `prd_v15_providers_corrected.md` (superseded by v1.6)
* `prd_v16_patches.txt`, `...-2.txt` (draft patches)

**Status:** 🗄️ Move to `archive/` folder
**Purpose:** Historical reference only

---

## 🎯 Quick Start Guide

**Sunday 20:30 (30 min before start):**

1. **Verify tools:**
```bash
which claude  # Should show wrapper
claude-monitor --view daily --help
ccusage --help
```

2. **Set window ID:**
```bash
export WID=W0-01
```

3. **Before window (20:50):**
```bash
# Codex
codex /status | tracker ingest codex --phase before --window $WID --stdin

# Claude (warm up first if needed)
claude -p <<<'hi'
claude -p  # then /usage
tracker ingest claude --phase before --window $WID --stdin
```

4. **Work window (21:00-02:00):**
* Process features using fixed methodology
* Tag commits: `xfeat::AUTH-01::W0-01::BUILD`

5. **After window (02:05):**
```bash
# Wait 5 minutes, then repeat before steps
codex /status | tracker ingest codex --phase after --window $WID --stdin
claude -p  # /usage
tracker ingest claude --phase after --window $WID --stdin

# Finalize
tracker complete $WID --claude-features 3 --codex-features 3 --glm-features 0
```

---

## 📂 Recommended Folder Structure

```
project-root/
├── docs/
│   ├── PRD_v1.6-final.md           ✅ Core spec (English)
│   ├── PRD_v1.6-final_RU.md        ✅ Core spec (Russian)
│   ├── PRD_v1.6_patches.md         ✅ Patch history
│   ├── week0_final_protocol.md     ✅ Operational guide
│   ├── saturday_prep_checklist.md  ✅ Setup guide
│   ├── prd_spinoff_brief.md        ✅ Context
│   └── revised_timeline.md         ✅ Schedule
│
├── archive/                        🗄️ Old versions
│   ├── critical_fixes_revised.md
│   ├── prd_v15_providers_corrected.md
│   └── prd_v16_patches-*.txt
│
├── data/week0/                     📊 Generated during Week 0
│   ├── snapshots.jsonl
│   ├── windows.jsonl
│   └── logs/
│
├── tracker/                        💻 Implementation
│   ├── sources/
│   ├── estimators/
│   ├── optimizer/
│   └── tests/
│
└── features/                       📝 BDD specs
    ├── AUTH-01-login.feature
    ├── AUTH-02-logout.feature
    └── ...
```

---

## ✅ Final Checklist

**Documents:**
- [x] PRD v1.6-final (English) — locked
- [x] PRD v1.6-final (Russian) — locked
- [x] Week 0 Protocol — updated
- [x] Saturday Prep — updated
- [x] Patch history — saved
- [x] Old versions — archived

**Operational:**
- [ ] Tools installed (claude-monitor, ccusage)
- [ ] Tracker built and tested
- [ ] 10 feature specs prepared
- [ ] Commit tags documented
- [ ] Calendar alarms set
- [ ] Data directories created

**Ready for Week 0:** Sunday 21:00 local time

---

## 🔑 Key Reminders

**Commit tags:**
* Regular work: `xfeat::<FeatureID>::<WindowID>::<Stage>`
* Prototypes: `xproto::<FeatureID>::<WindowID>::<Stage>`

**Safety margins:**
* 10pp weekly bar buffer (all providers)
* 15% GLM block buffer
* 5-minute post-window delay

**Spec review:**
* 2-of-3 default (gpt-5 High, Sonnet 4.5 ultrathink, GLM-4.6)
* 1-of-2 when capacity tight (<10pp or <15% GLM)

**Terminology:**
* Codex: Reasoning Levels (Minimal/Low/Medium/High)
* Claude: Thinking Levels (think/think hard/ultrathink)

---

**END Summary — All documents ready for Week 0**
