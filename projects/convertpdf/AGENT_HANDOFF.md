# PDF/DOCX to Markdown Conversion - Agent Handoff

## Current Status ✅

**Location**: `/Users/m/ai/projects/convertpdf/`

### Completed
- ✅ Russian DOCX converted: `Проверка_скрипта_колеса_основной_скрипт_1.md` (155KB, 60 images)
- ✅ English DOCX converted: `Проверка_скрипта_колеса_основной_скрипт_1 en-US.md` (99KB, 60 images)
- ✅ PDF extraction script: `pdf_extract_ultra_high_res.py` (ready to use)
- ✅ DOCX extraction script: `extract_docx_with_structure.py` (ready to use)

### Files Structure
```
/Users/m/ai/projects/convertpdf/
├── Проверка_скрипта_колеса_основной_скрипт_1.md
├── Проверка_скрипта_колеса_основной_скрипт_1 en-US.md
├── images/  (1.3MB - 60 images)
├── extract_docx_with_structure.py
├── pdf_extract_ultra_high_res.py
└── Проверка_скрипта_колеса_основной_скрипт_1_ultra_high_res_600dpi/ (older PDF extraction)
```

---

## Next Task: Add Page References to Markdown

### Goal
Add page number separators to markdown files so they can reference back to original PDF pages.

**Example format:**
```markdown
---
## 📄 Page 1
---

[content from page 1]

---
## 📄 Page 2
---

[content from page 2]
```

### Why This Matters
- Users can quickly jump to specific PDF pages
- Each markdown section shows its source page clearly
- Makes it easy to cross-reference with original document

### Implementation Strategy

#### For PDF-based extraction (already has page numbers):
1. **Modify `pdf_extract_ultra_high_res.py`**
   - Currently extracts pages 1-10 as separate images
   - Add markdown generation with page separators
   - Structure: Page Header → Text (if OCR'd) → Embedded Image → Page Footer

2. **Create page-aware markdown output**
   ```python
   # Pseudocode for modification
   for page_num in range(start, end + 1):
       md_output += "---\n"
       md_output += f"## 📄 Page {page_num}\n"
       md_output += "---\n\n"
       md_output += extracted_text_for_page
       md_output += f"![Page {page_num} Content](rendered_pages/page_{page_num:03d}_rendered_600dpi_*.png)\n\n"
   ```

#### For DOCX-based extraction (no inherent page numbers):
1. **Challenge**: DOCX files don't have "pages" - they're continuous
2. **Solution options**:
   - Option A: Estimate page breaks using content length
   - Option B: Track Word page breaks if present in XML
   - Option C: Use section/heading hierarchy as "pages"
   - **Recommended**: Option B - Extract `<w:br w:type="page"/>` from DOCX XML

3. **Implementation in `extract_docx_with_structure.py`**:
   ```python
   # Extract page breaks from DOCX XML
   # Look for: <w:br w:type="page"/>
   # Insert page markers in markdown at those positions
   ```

---

## Technical Details

### For User: Page Number Mapping

**Current State:**
- Russian version: 3071 lines of content, 60 images
- English version: Similar structure, 60 images
- Both share same image files

**Task:**
- Add page headers/footers
- Keep image references consistent
- Make markdown self-documenting

### Code Location References

**PDF Extraction** (`pdf_extract_ultra_high_res.py`):
- Lines 12-223: Core extraction logic
- Line 109: Text extraction point
- Line 122: Image extraction point
- Lines 195-210: Metadata generation
- **Modify**: Add markdown generation here

**DOCX Extraction** (`extract_docx_with_structure.py`):
- Lines 45-90: Image extraction from ZIP
- Lines 147-206: Content extraction
- **Modify**: Track page breaks during iteration

---

## Success Criteria

✅ Each markdown file has clear page separators
✅ Page numbers match source document
✅ Images remain embedded with correct paths
✅ Tables and structure preserved
✅ Can quickly find any section by page number
✅ Works for both PDF and DOCX sources

---

## Files to Modify

1. `pdf_extract_ultra_high_res.py` - Add markdown output with page markers
2. `extract_docx_with_structure.py` - Track and insert page breaks
3. Create unified CLI wrapper that handles both

---

## Quick Start for Next Agent

```bash
# Test PDF extraction with page markers
python3 pdf_extract_ultra_high_res.py "/path/to/file.pdf" 1 10 600

# Test DOCX extraction with page markers
python3 extract_docx_with_structure.py "/path/to/file.docx" .

# Both should now create markdown with page separators
```

---

## Not Implemented Yet
- ❌ Unified CLI utility (combines PDF + DOCX in one command)
- ❌ Page separator markdown integration
- ❌ Agent skill/hook configuration
- ❌ Automated page break detection for DOCX

---

**Token Cost**: This handoff created at ~8.5k tokens to preserve budget for implementation.
