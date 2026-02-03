# Skill: Transcript Split (Deterministic, Testable)

## Core Principle

**Split is lossless and reversible.**

```
INVARIANT: cat(split_1, split_2, ..., split_n) == original
```

---

## BDD Specification

### Feature: Transcript Split

```gherkin
Feature: Split transcript into multiple documents

  Background:
    Given original file "source.txt" with N lines
    And split specification with K documents
    And each doc has (start_line, end_line) range

  Scenario: Completeness - no content lost
    When I concatenate all split files in order
    Then result byte count equals original byte count
    And result line count equals original line count
    And diff shows zero differences

  Scenario: No gaps - every line appears
    Given line ranges [1-50], [51-144], [145-219], ...
    Then union of all ranges equals [1, N]
    And no line number is missing

  Scenario: No overlaps - no duplication
    Given line ranges for all K documents
    Then intersection of any two ranges is empty
    And total line count of splits equals N (not > N)

  Scenario: Order preserved
    When I read split file K
    Then lines appear in same order as in original
    And line 1 of split K equals line start_K of original

  Scenario: Metadata only in filename
    Given split file "03_20-05_32-04_regional_examples.txt"
    Then file content starts with original content (no headers added)
    And filename contains: doc_number, start_time, end_time, title
```

---

## Filename Convention

```
{NN}_{START}_{END}_{slug}.txt

Examples:
01_00-00_06-41_forecasting_demo.txt
02_06-41_20-05_data_strategy.txt
03_20-05_32-04_regional_examples.txt
04_32-04_45-10_technical_architecture.txt
05_45-10_56-46_product_strategy.txt
06_56-46_01-20-39_code_review.txt
07_01-20-39_01-42-45_audio_video.txt
08_01-57-16_01-58-20_course_scheduling.txt
```

**Parsing regex**: `^(\d{2})_([0-9-]+)_([0-9-]+)_(.+)\.txt$`

---

## Split Specification Format

```yaml
# split_spec.yaml
source: /path/to/source.txt
total_lines: 715
splits:
  - doc: 1
    title: forecasting_demo
    start_line: 1
    end_line: 50
    start_ts: "00:00"
    end_ts: "06:41"
  - doc: 2
    title: data_strategy
    start_line: 51
    end_line: 144
    start_ts: "06:41"
    end_ts: "20:05"
  # ... etc
```

---

## Verification Script

```bash
#!/bin/bash
# verify_split.sh

SOURCE="$1"
SPLIT_DIR="$2"

# Get original metrics
ORIG_LINES=$(wc -l < "$SOURCE")
ORIG_BYTES=$(wc -c < "$SOURCE")
ORIG_MD5=$(md5sum "$SOURCE" | cut -d' ' -f1)

# Concatenate all splits in order
cat "$SPLIT_DIR"/*.txt > /tmp/reconstructed.txt

# Get reconstructed metrics
RECON_LINES=$(wc -l < /tmp/reconstructed.txt)
RECON_BYTES=$(wc -c < /tmp/reconstructed.txt)
RECON_MD5=$(md5sum /tmp/reconstructed.txt | cut -d' ' -f1)

# Verify
echo "=== SPLIT VERIFICATION ==="
echo "Original:      $ORIG_LINES lines, $ORIG_BYTES bytes, md5=$ORIG_MD5"
echo "Reconstructed: $RECON_LINES lines, $RECON_BYTES bytes, md5=$RECON_MD5"

if [ "$ORIG_MD5" == "$RECON_MD5" ]; then
  echo "✅ PASS: Files are identical"
  exit 0
else
  echo "❌ FAIL: Files differ"
  diff "$SOURCE" /tmp/reconstructed.txt | head -20
  exit 1
fi
```

---

## Execution Algorithm

```python
def split_transcript(source_path, spec):
    """
    Split transcript according to spec.
    Returns list of output files.
    """
    with open(source_path) as f:
        lines = f.readlines()

    total_lines = len(lines)
    assert spec['total_lines'] == total_lines, "Line count mismatch"

    outputs = []
    covered = set()

    for split in spec['splits']:
        start = split['start_line'] - 1  # 0-indexed
        end = split['end_line']           # exclusive

        # Extract lines
        chunk = lines[start:end]

        # Track coverage
        for i in range(start, end):
            assert i not in covered, f"Overlap at line {i+1}"
            covered.add(i)

        # Build filename (metadata in name only)
        filename = f"{split['doc']:02d}_{split['start_ts'].replace(':','-')}_{split['end_ts'].replace(':','-')}_{split['title']}.txt"

        # Write raw content (no headers)
        with open(filename, 'w') as f:
            f.writelines(chunk)

        outputs.append(filename)

    # Verify completeness
    assert covered == set(range(total_lines)), "Gap in coverage"

    return outputs
```

---

## Test Cases

### Test 1: Concatenation Equals Original

```bash
# Given
SOURCE=/Users/m/Downloads/jury-en-EDITED-3-FIXED.txt
SPLITS=/Users/m/ai/docs/splits/

# When
cat $SPLITS/*.txt > /tmp/reconstructed.txt

# Then
diff $SOURCE /tmp/reconstructed.txt
# Expected: no output (files identical)
```

### Test 2: Line Count Match

```bash
# Given
ORIG_LINES=$(wc -l < $SOURCE)

# When
SPLIT_LINES=$(cat $SPLITS/*.txt | wc -l)

# Then
[ "$ORIG_LINES" -eq "$SPLIT_LINES" ]
# Expected: true
```

### Test 3: No Overlap Check

```bash
# Given split spec with ranges
# [1-50], [51-144], [145-219], [220-302], [303-378], [379-541], [542-689], [703-715]

# When we sum all ranges
TOTAL=$((50 + 94 + 75 + 83 + 76 + 163 + 148 + 13))
# = 702

# Then total should equal original line count
# BUT: there's a gap 690-702 (the 01:42:45 to 01:57:16 gap!)
# This must be handled explicitly
```

### Test 4: Boundary Timestamps Match Content

```bash
# Given split 01_00-00_06-41_forecasting_demo.txt
# When I read first line
head -1 $SPLITS/01_*.txt
# Then it should contain "00:00" timestamp

# When I read last content line
tail -2 $SPLITS/01_*.txt | head -1
# Then it should be content from around 06:41 timestamp
```

---

## Handling Special Cases

### Case 1: Gap in Source (01:42:45 → 01:57:16)

The original has a ~15 minute gap. Options:

**Option A: Explicit gap file**
```
07_01-20-39_01-42-45_audio_video.txt
GAP_01-42-45_01-57-16_no_content.txt  # Empty or marker
08_01-57-16_01-58-20_course_scheduling.txt
```

**Option B: Adjust line ranges to skip gap**
```yaml
- doc: 7
  start_line: 541
  end_line: 700   # Ends before gap
- doc: 8
  start_line: 703  # Starts after gap (lines 701-702 are the gap)
  end_line: 715
```

**Verification**: Sum of split lines + gap lines = original lines

### Case 2: Replacement Content (code_review file)

When replacing section with updated content:

```yaml
# Original jury file: 715 lines
# Replacement: lines 376-715 replaced with code_review_product_transcript.md

# Step 1: Extract non-replaced portion
head -375 jury-en-EDITED-3-FIXED.txt > part1.txt

# Step 2: Get replacement content (strip any markdown headers)
tail -n +X code_review_product_transcript.md > part2.txt

# Step 3: Merge
cat part1.txt part2.txt > merged_source.txt

# Step 4: Verify merge has expected structure
# Then split merged_source.txt according to spec
```

---

## Corrected Split Spec for This Task

```yaml
source: jury-en-EDITED-3-FIXED.txt
total_lines: 715
gap_lines: [701, 702]  # Lines between 01:42:45 and 01:57:16

splits:
  - doc: 1
    title: forecasting_demo
    start_line: 1
    end_line: 50
    start_ts: "00:00"
    end_ts: "06:41"

  - doc: 2
    title: data_strategy
    start_line: 51
    end_line: 144
    start_ts: "06:41"
    end_ts: "20:05"

  - doc: 3
    title: regional_examples
    start_line: 145
    end_line: 219
    start_ts: "20:05"
    end_ts: "32:04"

  - doc: 4
    title: technical_architecture
    start_line: 220
    end_line: 302
    start_ts: "32:04"
    end_ts: "45:10"

  - doc: 5
    title: product_strategy
    start_line: 303
    end_line: 378
    start_ts: "45:10"
    end_ts: "56:46"

  - doc: 6
    title: code_review
    start_line: 379
    end_line: 540
    start_ts: "56:46"
    end_ts: "01:20:39"
    note: "Replace with code_review_product_transcript.md content"

  - doc: 7
    title: audio_video
    start_line: 541
    end_line: 700
    start_ts: "01:20:39"
    end_ts: "01:42:45"

  - doc: 8
    title: course_scheduling
    start_line: 703
    end_line: 715
    start_ts: "01:57:16"
    end_ts: "01:58:20"

verification:
  - sum(all end_line - start_line + 1) + gap_lines == total_lines
  - cat(all_splits) == original OR cat(all_splits) == merged_with_replacement
```

---

## Quick Verification Commands

```bash
# Count lines in original
wc -l jury-en-EDITED-3-FIXED.txt
# Expected: 715

# After split, verify
cat splits/*.txt | wc -l
# Expected: 715 (or 713 if gap excluded)

# MD5 check
md5sum jury-en-EDITED-3-FIXED.txt
cat splits/*.txt | md5sum
# Should match (if no replacement)

# If replacement was applied:
# Create expected_merged.txt first, then compare against that
```

---

## Haiku Instructions (Deterministic)

```
1. READ this spec file first
2. CREATE split_spec.yaml with exact line numbers
3. VERIFY line numbers by checking timestamps at boundaries:
   - grep -n "^06:41$" source.txt  → should match doc1 end_line
   - grep -n "^20:05$" source.txt  → should match doc2 end_line
4. EXECUTE split using sed/head/tail:
   - sed -n '1,50p' source.txt > 01_00-00_06-41_forecasting_demo.txt
   - sed -n '51,144p' source.txt > 02_06-41_20-05_data_strategy.txt
   - ... etc
5. RUN verification:
   - cat splits/*.txt > reconstructed.txt
   - diff source.txt reconstructed.txt
6. REPORT pass/fail with line counts
```

---

## Success Criteria

```
✅ cat(all_splits) produces identical file to source
✅ Each split filename contains: doc#, start_ts, end_ts, title
✅ No content added to split files (pure extraction)
✅ Line count verification passes
✅ MD5/checksum verification passes
✅ No overlaps (each line in exactly one split)
✅ No gaps (unless explicitly documented as gap_lines)
```
