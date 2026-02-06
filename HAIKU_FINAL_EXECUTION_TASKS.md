# Final Execution Tasks for Haiku

**Status**: Completed (Transcript split + structured + indexed; raw 2025 data staged)
**Context**: Transcript split into 8 structured markdown files in `/Users/m/ai/docs/splits/`
**Index**: `/Users/m/ai/docs/INDEX.md`
**Non-demo transcripts**: moved to `/Users/m/Desktop/ai-non-demo-transcripts/`

---

## ⚠️ IMPORTANT: code_review_product_transcript.md Contains 3 Sections

The replacement file contains content for DOC #6, #7, AND #8:

| Section | Lines | Content | Replaces |
|---------|-------|---------|----------|
| DOC #6 | 1-304 | Code Review (01:00:21-01:20:39) | jury lines 403-541 |
| DOC #7 | 305-606 | Audio/Video (01:21:12-01:42:45) | jury lines 542-694 |
| DOC #8 | 607-630 | Course Scheduling (01:57:16-01:58:20) | jury lines 703-714 |

**DO NOT merge all 630 lines into DOC #6!**

---

## PRIORITY 1: Replace DOCs 6, 7, 8 with Cleaner Content

### 1A: Replace DOC #6 (Code Review)

**Task**: Merge jury intro (56:46-01:00:21) + code_review content (01:00:21-01:20:39)

**Result**: Completed — generated `/Users/m/ai/docs/splits/06_56-46_01-20-39_code_review.txt` (330 raw lines before structuring)

**Execute**:
```bash
# Step 1: Get jury portion (56:46 to ~01:00:21) - lines 377-402
sed -n '377,402p' /Users/m/Downloads/jury-en-EDITED-3-FIXED.txt > /tmp/doc6_jury.txt

# Step 2: Get ONLY DOC #6 portion from code_review (01:00:21-01:20:39) - lines 1-304
sed -n '1,304p' /Users/m/Downloads/code_review_product_transcript.md > /tmp/doc6_replacement.txt

# Step 3: Merge
cat /tmp/doc6_jury.txt /tmp/doc6_replacement.txt > /Users/m/ai/docs/splits/06_56-46_01-20-39_code_review.txt

# Step 4: Verify (expected: ~330 lines = 26 + 304)
wc -l /Users/m/ai/docs/splits/06_56-46_01-20-39_code_review.txt
```

**Expected**: ~330 lines

---

### 1B: Replace DOC #7 (Audio/Video)

**Task**: Replace with cleaner code_review content (SECTION 2)

**Result**: Completed — generated `/Users/m/ai/docs/splits/07_01-20-39_01-42-45_audio_video.txt` (302 raw lines before structuring)

**Execute**:
```bash
# Get DOC #7 portion from code_review - lines 305-606
sed -n '305,606p' /Users/m/Downloads/code_review_product_transcript.md > /Users/m/ai/docs/splits/07_01-20-39_01-42-45_audio_video.txt

# Verify (expected: 302 lines)
wc -l /Users/m/ai/docs/splits/07_01-20-39_01-42-45_audio_video.txt
```

**Expected**: 302 lines

---

### 1C: Replace DOC #8 (Course Scheduling)

**Task**: Replace with cleaner code_review content (SECTION 3)

**Result**: Completed — generated `/Users/m/ai/docs/splits/08_01-57-16_01-58-20_course_scheduling.txt` (24 raw lines before structuring)

**Execute**:
```bash
# Get DOC #8 portion from code_review - lines 607-630
sed -n '607,630p' /Users/m/Downloads/code_review_product_transcript.md > /Users/m/ai/docs/splits/08_01-57-16_01-58-20_course_scheduling.txt

# Verify (expected: 24 lines)
wc -l /Users/m/ai/docs/splits/08_01-57-16_01-58-20_course_scheduling.txt
```

**Expected**: 24 lines

---

### 1D: Verify All Replacements

```bash
echo "=== VERIFICATION ==="
for f in /Users/m/ai/docs/splits/*.txt; do
    printf "%-50s %s lines\n" "$(basename $f)" "$(wc -l < $f)"
done

echo ""
echo "Expected after replacement:"
echo "  01_*: 49 lines (unchanged)"
echo "  02_*: 93 lines (unchanged)"
echo "  03_*: 75 lines (unchanged)"
echo "  04_*: 84 lines (unchanged)"
echo "  05_*: 75 lines (unchanged)"
echo "  06_*: ~330 lines (26 jury + 304 code_review)"
echo "  07_*: 302 lines (code_review)"
echo "  08_*: 24 lines (code_review)"
```

---

## PRIORITY 2: Add Structure to Split Files

**Task**: Add markdown headers and section breaks to each document

**Reference**: Use section outlines from `/Users/m/ai/TRANSCRIPT_SPLIT_PLAN.md`

**For each document**:

1. Read the current file content
2. Add header at top: `# Title (timestamp range)`
3. Add section headers at appropriate points (match timestamps to content)
4. Add `## Raw Timestamps` section at end
5. Save back to same file

**Example structure**:
```markdown
# Forecasting Demo & Validation (00:00–06:41)

## Section 1: Container Site Selection (00:00–00:29)
[original content here]

## Section 2: Task Clarification (00:29–00:52)
[original content here]

...

---
## Raw Timestamps
Original timestamps: 00:00–06:41
Source: jury-en-EDITED-3-FIXED.txt lines 1-49
```

**Files to structure** (in order):
1. `01_00-00_06-41_forecasting_demo.txt`
2. `02_06-41_20-05_data_strategy.txt`
3. `03_20-05_32-04_regional_examples.txt`
4. `04_32-04_45-10_technical_architecture.txt`
5. `05_45-10_56-46_product_strategy.txt`
6. `06_56-46_01-20-39_code_review.txt`
7. `07_01-20-39_01-42-45_audio_video.txt`
8. `08_01-57-16_01-58-20_course_scheduling.txt`

**Result**: Completed — all 8 files now have:
- `# Title (timestamp range)`
- Section headers aligned to `/Users/m/ai/TRANSCRIPT_SPLIT_PLAN.md`
- `## Raw Timestamps` at end

---

## PRIORITY 3: Create Master Index

**Task**: Create `/Users/m/ai/docs/INDEX.md`

**Content to include**:

```markdown
# Transcript Documentation Index

## Quick Navigation

| Doc | Title | Timestamps | Lines |
|-----|-------|------------|-------|
| 1 | Forecasting Demo | 00:00–06:41 | 49 |
| 2 | Data Strategy | 06:41–20:05 | 93 |
| 3 | Regional Examples | 20:05–32:04 | 75 |
| 4 | Technical Architecture | 32:04–45:10 | 84 |
| 5 | Product Strategy | 45:10–56:46 | 75 |
| 6 | Code Review Product | 56:46–01:20:39 | ~330 |
| 7 | Audio/Video Equipment | 01:20:39–01:42:45 | 302 |
| 8 | Course Scheduling | 01:57:16–01:58:20 | 24 |

## Timeline

[ASCII timeline showing coverage]

## Document Descriptions

[Brief description of each document's purpose and audience]

## Files

Location: `/Users/m/ai/docs/splits/`
```

---

## PRIORITY 4: Add Follow-up Note (2025 Data Export Issue)

**Task**: Append the important Jury follow-up about the 2025 volumes export failure to the relevant transcript doc.

**Result**: Completed — added to `/Users/m/ai/docs/splits/02_06-41_20-05_data_strategy.txt`:

> Jury Gerasimov, [2025-12-04 21:45]  
> "Hi. Exporting volumes for all of 2025 fails with an error. I was able to export January through May (inclusive)."

Note: We still need the rest of 2025 for testing to validate forecasts beyond the shared window.

---

## PRIORITY 5: Stage Raw Data Jury Sent (Git-Ignored) + Plan Integration

**Data received** (local):
- `/Users/m/Downloads/data/Отчет_по_объемам_с_01_01_2025_по_31_05_2025,_для_всех_участков.csv`

**Staged copy** (git-ignored):
- `/Users/m/ai/projects/forecastingrepo/data/raw/exports/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv`
  - Ignored by `/Users/m/ai/projects/forecastingrepo/.gitignore` (`data/raw/`)

**Annotation + integration plan**:
- `/Users/m/ai/projects/forecastingrepo/docs/data/JURY_VOLUMES_2025_JAN_MAY.md`
- Updated `/Users/m/ai/projects/forecastingrepo/docs/data/DATA_INVENTORY.md`

**Ingestion result**:
- Appended 1,042,648 daily rows (2025-01-01 → 2025-05-31) into `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv`.
- Appended 1,987 new site registry rows (blank `bin_count`/`bin_size_liters`) into `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv`.
- Verification: max date now 2025-05-31; 2025 rows = 1,042,648.

**Reference command (full re-merge if needed later)**:
```bash
cd /Users/m/ai/projects/forecastingrepo
python3 scripts/convert_volume_report.py \
  --input data/raw/exports/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv \
  --output-service data/sites/sites_service.csv \
  --output-registry data/sites/sites_registry.csv
```

---

## PRIORITY 6: Move Non-Demo Transcripts Out of Repo

**Task**: Move transcripts unrelated to the Jury forecasting demo (code review product, audio/video production, course scheduling) out of the AI repo.

**Result**: Completed — moved to `/Users/m/Desktop/ai-non-demo-transcripts/`:
- `06_56-46_01-20-39_code_review.txt`
- `07_01-20-39_01-42-45_audio_video.txt`
- `08_01-57-16_01-58-20_course_scheduling.txt`

**Index update**: `/Users/m/ai/docs/INDEX.md` now lists only demo docs (01-05) and points to the Desktop folder for non-demo files.

---

## Success Criteria

### Priority 1 Complete:
- [x] DOC #6: 330 raw lines (jury 26 + code_review 304)
- [x] DOC #7: 302 raw lines (code_review SECTION 2)
- [x] DOC #8: 24 raw lines (code_review SECTION 3)
- [x] All raw line counts verified

### Priority 2 Complete:
- [x] All 8 files have markdown headers
- [x] Section breaks added where timestamps change
- [x] Raw timestamps section at end of each

### Priority 3 Complete:
- [x] INDEX.md created
- [x] All demo docs listed (01-05)
- [x] Timeline view included (demo range)

### Priority 6 Complete:
- [x] Non-demo transcripts moved to Desktop
- [x] Index updated to reflect relocation

---

## Key Numbers to Remember

| Source File | Total Lines |
|-------------|-------------|
| jury-en-EDITED-3-FIXED.txt | 714 |
| code_review_product_transcript.md | 630 |

| code_review Sections | Lines |
|---------------------|-------|
| DOC #6 content | 1-304 (304 lines) |
| DOC #7 content | 305-606 (302 lines) |
| DOC #8 content | 607-630 (24 lines) |

---

**Estimated Time**: ~90 minutes total
- Priority 1: 15 min (bash commands)
- Priority 2: 60 min (structure 8 files)
- Priority 3: 15 min (create index)
