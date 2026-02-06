#!/bin/bash
# DETERMINISTIC TRANSCRIPT SPLIT
# Generated: 2025-12-27
# Verified line numbers from SPLIT_EXEC_SPEC.yaml

set -e  # Exit on any error

SOURCE="/Users/m/Downloads/jury-en-EDITED-3-FIXED.txt"
OUTDIR="/Users/m/ai/docs/splits"

# Verify source exists and has expected line count
LINES=$(wc -l < "$SOURCE")
if [ "$LINES" -ne 714 ]; then
    echo "❌ ERROR: Expected 714 lines, got $LINES"
    exit 1
fi
echo "✅ Source verified: 714 lines"

# Create output directory
mkdir -p "$OUTDIR"

# Execute splits with verified line numbers
echo "Splitting..."

sed -n '1,49p' "$SOURCE" > "$OUTDIR/01_00-00_06-41_forecasting_demo.txt"
echo "  Doc 1: lines 1-49 (49 lines)"

sed -n '50,142p' "$SOURCE" > "$OUTDIR/02_06-41_20-05_data_strategy.txt"
echo "  Doc 2: lines 50-142 (93 lines)"

sed -n '143,217p' "$SOURCE" > "$OUTDIR/03_20-05_32-04_regional_examples.txt"
echo "  Doc 3: lines 143-217 (75 lines)"

sed -n '218,301p' "$SOURCE" > "$OUTDIR/04_32-04_45-10_technical_architecture.txt"
echo "  Doc 4: lines 218-301 (84 lines)"

sed -n '302,376p' "$SOURCE" > "$OUTDIR/05_45-10_56-46_product_strategy.txt"
echo "  Doc 5: lines 302-376 (75 lines)"

sed -n '377,541p' "$SOURCE" > "$OUTDIR/06_56-46_01-20-39_code_review.txt"
echo "  Doc 6: lines 377-541 (165 lines)"

sed -n '542,694p' "$SOURCE" > "$OUTDIR/07_01-20-39_01-42-45_audio_video.txt"
echo "  Doc 7: lines 542-694 (153 lines)"

# Gap: lines 695-702 (8 lines) - intentionally skipped

sed -n '703,714p' "$SOURCE" > "$OUTDIR/08_01-57-16_01-58-20_course_scheduling.txt"
echo "  Doc 8: lines 703-714 (12 lines)"

echo ""
echo "=== VERIFICATION ==="

# Count lines in each split
TOTAL=0
for f in "$OUTDIR"/*.txt; do
    COUNT=$(wc -l < "$f")
    TOTAL=$((TOTAL + COUNT))
    echo "  $(basename $f): $COUNT lines"
done

echo ""
echo "Split total: $TOTAL lines"
echo "Gap (695-702): 8 lines"
echo "Expected: 714 lines"
echo "Actual sum: $((TOTAL + 8)) lines"

if [ $((TOTAL + 8)) -eq 714 ]; then
    echo "✅ PASS: Line count matches"
else
    echo "❌ FAIL: Line count mismatch"
    exit 1
fi

# Concatenation test (excluding gap)
echo ""
echo "=== CONCATENATION TEST ==="
cat "$OUTDIR"/0[1-7]*.txt "$OUTDIR"/08*.txt > /tmp/reconstructed.txt
RECON_LINES=$(wc -l < /tmp/reconstructed.txt)
echo "Reconstructed: $RECON_LINES lines (without gap)"

# Expected: 714 - 8 = 706 lines
if [ "$RECON_LINES" -eq 706 ]; then
    echo "✅ PASS: Reconstructed file has expected line count"
else
    echo "❌ FAIL: Expected 706 lines, got $RECON_LINES"
fi

echo ""
echo "=== DONE ==="
echo "Output directory: $OUTDIR"
ls -la "$OUTDIR"
