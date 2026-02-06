# DIALEXT SPEC COMPLETION TRACKER
**Status: 42% Complete → Target: 100% Ready for Dev**

**Last Updated:** [DATE]  
**Owner:** [NAME]  
**Next Review:** [DATE]

---

## PHASE 1: CRITICAL DATA (Must do first | 3h 30m)
*These 3 items BLOCK developer from starting. Extract exact numbers from PDF.*

### Chart Data Extraction

- [ ] **Extract `/stats/time` – 24 hourly call counts (p.2)**
  - **Why:** Without real data, chart will show wrong call distribution
  - **Task:** Read hourly values from line graph (hours 1–23)
  - **Effort:** 30 min
  - **Output:** Replace 24 dummy numbers in Edit Plan section 1.2
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Extract `/reports/lagging` – 7 KPI percentages (p.22)**
  - **Why:** Metrics must show actual performance, not guesses
  - **Task:** Read bar lengths for: Обход (98%), Приветствие (95%), Назначение (48%), Актуализация (45%), Должность (40%), Выявление (28%), Обработка (18%)
  - **Effort:** 15 min
  - **Output:** Update 7 % values in section 1.4
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Extract `/reports/trends` – monthly data for 6 criteria (p.23)**
  - **Why:** 9 months × 6 lines = 54 data points; without them, trends are meaningless
  - **Task:** For each line, read 9 monthly values (May 2024–Jan 2025)
  - **Effort:** 45 min
  - **Output:** Replace 54 dummy numbers in section 1.5
  - **Status:** ⏳ Not started
  - **Notes:** _________________

### Rules & Groups Extraction

- [ ] **Extract rule keys + names + "Масштаб" from p.13 table**
  - **Why:** Rule evaluation is core logic; abbreviated names won't work in UI
  - **Task:** Transcribe RATE1, RATE2...RATE6 full descriptions + multiplier values for groups 1, 2, 3
  - **Effort:** 30 min
  - **Output:** Complete section 1.9 + 3.1 (replace "Приветс..." with full text)
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Extract group-to-tag mapping from p.15**
  - **Why:** Without this, tag filtering and grouping logic breaks
  - **Task:** List which tags (cold, warm, pushing, demo, skip...) belong to groups 0, 1, 2, 3, 11, 22
  - **Effort:** 15 min
  - **Output:** Complete section 3.3 table
  - **Status:** ⏳ Not started
  - **Notes:** _________________

### List Data Extraction

- [ ] **Extract manager names from p.9 (currently blurred)**
  - **Why:** UI shows generic "mgr_1" instead of "Ренаті", "Владимир" → looks broken
  - **Task:** Transcribe 7 manager names from manager filter table
  - **Effort:** 10 min (5 if names unreadable → note and skip)
  - **Output:** Update section 1.8 /api/managers
  - **Status:** ⏳ Not started | Readability: ☐ Clear ☐ Blurred
  - **Notes:** _________________

- [ ] **Extract deal source names from p.10 (currently blurred)**
  - **Why:** Source filter shows "source_1" → broken UX
  - **Task:** Transcribe 10+ source names from sources list
  - **Effort:** 15 min
  - **Output:** Update section 1.8 /api/deal-sources
  - **Status:** ⏳ Not started | Readability: ☐ Clear ☐ Blurred
  - **Notes:** _________________

---

### ✅ PHASE 1 COMPLETE WHEN:
- [x] All 7 checkbox items above are ☑️
- [x] Gap Analysis scorecard updated: "Chart Data" → ✅ 100%
- [x] All dummy numbers replaced with real PDF values
- [x] No "?" or "TBD" remaining in sections 1.2, 1.3, 1.4, 1.5, 1.8, 1.9, 3.3

**Phase 1 Sign-off:** _____ (Initials) | Date: _____

---

## PHASE 2: DESIGN SYSTEM (2h)
*After Phase 1. Affects visual fidelity but dev can use defaults if needed.*

### Typography & Colors

- [ ] **Extract primary button color (HEX) from "ПРИМЕНИТЬ" button (p.2)**
  - **Why:** All primary actions use this color; without it, buttons look wrong
  - **Task:** Screenshot button → use color picker tool → record HEX + RGB
  - **Effort:** 10 min
  - **Output:** Update section 0.6 "Primary Action" field
  - **Current:** "?" | **Target:** #XXXXXX
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Extract secondary button color from "Сохранить" button (p.7 or similar)**
  - **Why:** Secondary actions need distinct color
  - **Task:** Same as above (color picker)
  - **Effort:** 10 min
  - **Output:** Update section 0.6 "Secondary" field
  - **Current:** "?" | **Target:** #XXXXXX
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Identify font family from page header/forms**
  - **Why:** Wrong font breaks entire design feel
  - **Task:** Screenshot form header (e.g., "Интерфейс администрирования") → identify in Font Inspector or similar
  - **Effort:** 15 min
  - **Output:** Update section 0.1 Typography table (Font Family column)
  - **Current:** "?" | **Target:** Helvetica / Arial / Roboto / [other]
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Measure font sizes: h1, h2, body, small, button from screenshots**
  - **Why:** Incorrect sizes break layout & readability
  - **Task:** Use browser DevTools / screenshot ruler to measure pixels
  - **Effort:** 20 min
  - **Output:** Update section 0.1 all font size rows
  - **Status:** ⏳ Not started
  - **Notes:** _________________

### Spacing & Dimensions

- [ ] **Measure base spacing unit (4px vs 8px) from form padding**
  - **Why:** Controls ALL spacing; wrong value = layout 2x off
  - **Task:** Measure padding around input in p.4 or p.6 form
  - **Effort:** 10 min
  - **Output:** Update section 0.2 Spacing Scale (confirm xs=4px or xs=8px)
  - **Current:** "4px or 8px?" | **Target:** Confirmed
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Measure border radius from inputs, buttons, cards**
  - **Why:** Missing radius = flat, broken feel
  - **Task:** Screenshot input field → measure corner radius
  - **Effort:** 10 min
  - **Output:** Update section 0.3 Border Radius table
  - **Current:** "?" for all | **Target:** 0px / 2px / 4px / 6px (per element)
  - **Status:** ⏳ Not started
  - **Notes:** _________________

### Icons & Misc

- [ ] **Confirm icon set (Lucide vs Material vs custom SVG) from sidebar (p.25)**
  - **Why:** If icon library is wrong, all icons break
  - **Task:** Look at Bitrix 24 sidebar → check icon style → cross-reference with standard libraries
  - **Effort:** 10 min
  - **Output:** Update section 0.7 "Assumed Icon Library"
  - **Current:** "Assumed: Lucide React" | **Target:** Confirmed: [Lucide / Material / Custom]
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Confirm thousands separator format (80k vs 80 000) from p.2 chart**
  - **Why:** Affects all large numbers in charts & tables
  - **Task:** Read chart axis labels → note format
  - **Effort:** 5 min
  - **Output:** Update section 0.8 "Thousands separator"
  - **Current:** "space or comma?" | **Target:** space / dot / k-notation
  - **Status:** ⏳ Not started
  - **Notes:** _________________

---

### ✅ PHASE 2 COMPLETE WHEN:
- [x] All 8 checkbox items above are ☑️
- [x] Gap Analysis scorecard updated: "Tokens" → ✅ 100%
- [x] Section 0 (Design System) has zero "?" remaining
- [x] All HEX codes, font names, sizes confirmed

**Phase 2 Sign-off:** _____ (Initials) | Date: _____

---

## PHASE 3: FORMS & UI DETAILS (1h)
*Polish; dev can work around these but they improve completeness.*

- [ ] **Transcribe all 30+ topics from p.18 Report Filter grid**
  - **Why:** Filter options incomplete → user can't filter
  - **Task:** Copy-paste all checkbox labels from p.18 topics grid
  - **Effort:** 20 min
  - **Output:** Expand "..." in section 2.8 Report Filter (topics section)
  - **Status:** ⏳ Not started
  - **Count so far:** 25 topics listed, need all 30+
  - **Notes:** _________________

- [ ] **Extract full transcript from call detail page (p.21, right column)**
  - **Why:** Transcript snippet incomplete → call detail looks broken
  - **Task:** Transcribe 20+ lines of dialogue from p.21 right panel
  - **Effort:** 15 min
  - **Output:** Update section 1.7 Call Detail `"transcription"` field
  - **Current:** "Алю. Да. Егор..." (truncated) | **Target:** Full 20+ line transcript
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Confirm Privacy Type options (Private/Public/Domain-only?) from p.5**
  - **Why:** If third option wrong, users can't set correct privacy
  - **Task:** Check section 0.6 or form visual for all Type dropdown options
  - **Effort:** 5 min
  - **Output:** Update section 2.5 Privacy Settings Form (Dropdown options)
  - **Current:** "Private, Public, Domain-only (?)" | **Target:** Confirmed
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Extract full rule descriptions (not abbreviated "Приветс...")**
  - **Why:** Abbreviated names unclear in UI
  - **Task:** Expand all rule names from p.13 table (currently "Приветс...", "Выявлен...", etc.)
  - **Effort:** 15 min
  - **Output:** Update section 1.9 /api/rules full names
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Confirm button label capitalization/case across all pages**
  - **Why:** Inconsistent case (ПРИМЕНИТЬ vs Сохранить) looks unprofessional
  - **Task:** Check p.2, p.4, p.6, p.7, p.12, etc. for button text → establish rule
  - **Effort:** 10 min
  - **Output:** Update section 4.3 Standardized Button Labels
  - **Status:** ⏳ Not started
  - **Notes:** _________________

---

### ✅ PHASE 3 COMPLETE WHEN:
- [x] All 5 checkbox items above are ☑️
- [x] Gap Analysis scorecard updated: "Forms & Filters" → ✅ 100%
- [x] All "..." and abbreviations expanded
- [x] All "?" replaced with confirmed values

**Phase 3 Sign-off:** _____ (Initials) | Date: _____

---

## PHASE 4: VERIFICATION & SIGN-OFF (30 min)
*Final quality check before handing to developer.*

- [ ] **Cross-check all extracted numbers against PDF**
  - **Why:** Single typo cascades into broken feature
  - **Task:** For each data point extracted in Phases 1–3, verify against original PDF
  - **Effort:** 20 min
  - **Checklist:**
    - [ ] 24 hourly values match p.2 graph
    - [ ] 7 KPI % match p.22 bars
    - [ ] 54 monthly values match p.23 lines
    - [ ] Manager names spelled correctly
    - [ ] Source names spelled correctly
    - [ ] Rule keys match p.13
    - [ ] Group mappings match p.15
  - **Status:** ⏳ Not started
  - **Notes:** _________________

- [ ] **Verify no typos remain: "должимает"→"дожимает", "Ренaта"→"Рената", "Долженость"→"Должность"**
  - **Why:** Typos propagate into code comments & error messages
  - **Task:** Search entire Edit Plan for these typos → replace all
  - **Effort:** 5 min
  - **Status:** ⏳ Not started
  - **Count found:** _____ | **Count fixed:** _____
  - **Notes:** _________________

- [ ] **Check that all "ACTION" items in Edit Plan are resolved**
  - **Why:** Leftover "ACTION: [ ]" items mean spec is incomplete
  - **Task:** Search Edit Plan for "ACTION:" → count → verify each done
  - **Effort:** 5 min
  - **Total ACTION items in plan:** ~40 | **Completed:** _____/_____
  - **Status:** ⏳ Not started
  - **Notes:** _________________

---

### ✅ PHASE 4 COMPLETE WHEN:
- [x] All 3 verification checkboxes above are ☑️
- [x] Gap Analysis scorecard shows: **100% Complete** across all categories
- [x] Edit Plan has zero "?" and zero unchecked ACTION items
- [x] Ready to hand to developer

**Phase 4 Sign-off:** _____ (Initials) | Date: _____

---

## DEVELOPER HANDOFF CHECKLIST
*Only check after Phases 1–4 complete.*

- [ ] **Spec package includes:**
  - [ ] EDIT_PLAN_Dialext_Documentation.md (sections 0–4 complete)
  - [ ] GAP_ANALYSIS_Requirements_vs_Coverage.md (all items ✅)
  - [ ] This tracker (all phases ✅ signed off)
  - [ ] Screenshots folder (referenced pages: 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 25, 26)

- [ ] **Developer briefing prepared:**
  - [ ] 30-min intro call scheduled with dev
  - [ ] Explained scoring algorithm (section 3.1)
  - [ ] Walked through data flow (section 1)
  - [ ] Clarified any ambiguous form logic

- [ ] **All extracted files exported:**
  - [ ] JSON mock data (from section 1) saved as `/api/mock-data.json`
  - [ ] Design tokens (from section 0) saved as `/design-tokens.json` or CSS file
  - [ ] Copied to project repo or shared drive

- [ ] **Go/No-Go decision:**
  - ☐ **GO:** Spec is 100% complete, no gaps. Dev can start immediately.
  - ☐ **NO-GO:** Spec still has gaps. List blockers:
    ```
    1. _________________________
    2. _________________________
    3. _________________________
    ```

**Handoff Approved By:** _____________ (Manager) | Date: _____

**Dev Start Date:** _____________ | Estimated completion: _____

---

## NOTES & PROGRESS LOG

### Week of [DATE]:
```
Monday:   Phase 1 – Chart data extraction
          ✓ /stats/time (24 values) done
          → Working on /reports/lagging
          
Tuesday:  Phase 1 continued
          ✓ /reports/lagging (7 values) done
          → Starting /reports/trends (54 values)
          
Wednesday: Phase 1 complete
          ✓ All numbers extracted
          → Review against PDF (no discrepancies found)
          
Thursday: Phase 2 – Design system
          ✓ Button colors done
          → Font family: [Helvetica Neue]
          
Friday:   Phase 2 complete, Phase 3 started
          ✓ Button colors, fonts, spacing confirmed
          → Topics grid transcription 80% done
```

**Issues encountered:**
- Manager names (p.9) too blurred to read → skipped, using IDs
- p.23 line chart legend colors hard to match → extracted best guess
- Some rule names abbreviated in PDF → expanded from context

**Questions for stakeholder:**
- 1. Should we use manager IDs if names unreadable?
- 2. Is there a hi-res version of p.9-10 with unblurred names?
- 3. Confirm: Is Privacy Type dropdown supposed to have 3 or 4 options?

---

## QUICK STATUS SUMMARY

**Fill this in daily and share with team:**

| Phase | Tasks | Done | Total | % | Status |
|-------|-------|------|-------|---|--------|
| 1: Data | ? | 0 | 7 | 0% | ⏳ Not started |
| 2: Design | ? | 0 | 8 | 0% | ⏳ Blocked by Phase 1 |
| 3: Forms | ? | 0 | 5 | 0% | ⏳ Blocked by Phase 1 |
| 4: Verify | ? | 0 | 3 | 0% | ⏳ Blocked by Phases 1–3 |
| **OVERALL** | **23 tasks** | **0** | **23** | **0%** | **Starting now** |

**Target Completion:** [DATE] → **Estimated effort: 7 hours over 1–2 days**

---

**Questions?** Post in: _____________ (Slack channel / email / doc comments)

**Contact:** _____________ (Who owns this tracker)
