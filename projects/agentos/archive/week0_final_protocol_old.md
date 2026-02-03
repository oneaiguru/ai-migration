# Week 0 Protocol - Dual-Provider Baseline Measurement

## 🎯 Objective
Establish empirical efficiency (E) for Codex Pro and Claude Pro using identical methodology.

**Success criteria:**
- ≥6 windows per provider
- ΔW variance < 30% CV
- Both providers measured without interference
- Clean data for Week 1 expansion

---

## 📅 Schedule (Sun Oct 19 - Thu Oct 23)

| Window | Start Time | Providers | Notes |
|--------|-----------|-----------|-------|
| W0-01 | Sun 21:00 | Both | Fresh 100% bars |
| W0-02 | Mon 09:00 | Both | Daypart: morning |
| W0-03 | Mon 15:00 | Both | Daypart: afternoon |
| W0-04 | Tue 09:00 | Both | Mid-week check |
| W0-05 | Tue 15:00 | Both | Continue if <90% |
| W0-06 | Wed 09:00 | Both | Continue if <90% |
| W0-07 | Wed 15:00 | Both | Optional |
| W0-08 | Thu 09:00 | Both | Optional |

**Safety rules:**
- If either provider >95% → STOP that provider
- If both >90% → END Week 0 early (sufficient data)
- Always wait 5 min after window before AFTER read

---

## 🔧 Fixed Methodology

**Work unit (U):** One feature = BDD spec → passing tests

**Pre-selected features:** 10 similar specs (~50 lines Given/When/Then each)

**Pipeline per feature:**
```
1. Planning (1 prompt):  "Read spec, propose approach"
2. Building (1-2 prompts): "Implement to pass scenarios"
3. Review (1 prompt):    "Run tests, fix if needed"
```

**Model assignments:**
- Codex: `gpt-5-codex` reasoning low (all steps)
- Claude: `Sonnet 4.5` (all steps, no Opus)

**Controls:**
- Same features for both providers (or alternate A/B)
- No attachments >1MB
- Single conversation per window (fresh each window)
- Standard prompts (templates provided)

---

## 📝 Measurement Protocol

### BEFORE each window

**Codex:**
```bash
WID="W0-01"  # increment for each window
codex
# Wait for prompt, then:
/status
# Copy ENTIRE output (even if narrow)
# Paste into: tracker ingest codex --phase before --window $WID --paste
```

**Claude:**
```bash
# CRITICAL: Send a message first to load usage pane
claude -p
# Type: hi
# Then:
/usage
# Copy ENTIRE output
# Paste into: tracker ingest claude --phase before --window $WID --paste
```

### DURING window (5 hours)

Work through features sequentially on BOTH providers in parallel:
- Terminal A: Codex session
- Terminal B: Claude session  
- Count features completed (U) for each

**If you hit warnings:**
- "Approaching limit" → note it, continue
- "Limit reached" → STOP that provider immediately

### AFTER each window

**Wait 5 minutes** (bar update lag), then:

**Codex:**
```bash
codex
/status
# Copy output
# Paste into: tracker ingest codex --phase after --window $WID --paste
```

**Claude:**
```bash
claude
/usage
# Copy output  
# Paste into: tracker ingest claude --phase after --window $WID --paste
```

**Finalize:**
```bash
tracker window finalize --window $WID \
  --codex-units 3 \
  --claude-units 3 \
  --quality 1.0
```

---

## 📊 Data Collection

Each window generates:
- `snapshots.jsonl`: Before/after % readings
- `windows.jsonl`: Aggregated window record

**Manual backup:** Also save raw `/status` and `/usage` text in `logs/w0-XX-{codex,claude}-{before,after}.txt`

---

## 🚨 Contingency Plans

**Narrow terminal (Codex):**
- Widen to ≥70 cols
- Re-run `/status`
- If still fails, manually enter: `tracker override codex --window $WID --weekly-pct 82`

**Usage not loaded (Claude):**
- Send `hi` first
- Then `/usage`
- Always works after one message

**One provider hits cap:**
- Continue other provider through all windows
- We can still compute efficiency with asymmetric data

**Both hit caps early:**
- Accept fewer windows (minimum 3 per provider)
- Week 1 will fill gaps

---

## ✅ Week 0 Deliverables

**Data files:**
- `data/week0/snapshots.jsonl`
- `data/week0/windows.jsonl`
- `data/week0/analysis.json` (computed by tracker)

**Report (manual or automated):**
```
Provider: Codex Pro
Windows: 6
ΣU: 18 features
ΣΔW: 24 pp
E_codex: 0.75 features/pp (95% CI: 0.68-0.82)
ECOST: $0.065/feature

Provider: Claude Pro  
Windows: 6
ΣU: 18 features
ΣΔW: 18 pp
E_claude: 1.00 features/pp (95% CI: 0.91-1.09)
ECOST: $0.046/feature

Conclusion: Claude Pro 29% more efficient ($0.019 savings/feature)
```

**Decision for Week 1:**
Based on results above, either:
- Keep both (if complementary)
- Drop Codex (if Claude dominates)
- Upgrade Claude to Max (if capacity-constrained)
- Add GLM Max (if both are expensive)

---

## 🔄 Week 1 Preview

**If Week 0 successful:**
- Subscribe to GLM Max Sunday 21:00 (aligned reset)
- Run Week 1 with 3 providers
- Compare Codex vs Claude vs GLM
- Test 2-3 methodology variants
- Statistical elimination by Friday

**If Week 0 has issues:**
- Debug tracker/parsers
- Re-run with fixes
- Extend to Week 1.5 if needed

---

## 📞 Support

**If tracker CLI fails:**
- Check logs in `data/week0/errors.log`
- Manual fallback: use spreadsheet template
- Post in tracker repo issues

**If providers behave unexpectedly:**
- Document in `data/week0/anomalies.md`
- Include screenshots
- Will inform safety margins for Week 1

---

**Ready to execute:** Save this protocol, sync with your calendar for Sunday 21:00, prepare your feature specs, and ensure both CLI tools are installed and authenticated.
