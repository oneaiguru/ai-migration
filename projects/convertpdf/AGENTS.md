# PDF/DOCX to Markdown with Page References

## Purpose
Convert PDF and DOCX documents to structured markdown with:
- All embedded images extracted and properly referenced
- Page break markers for easy navigation back to source documents
- Table structure preservation
- Heading levels detection (supports English and Russian)

## Key Features
- Page separators (`## 📄 Page N`) for document navigation
- XML-based page break detection for DOCX files
- High-resolution image extraction from DOCX media folders
- Relative image path embedding for portability
- Support for multilingual documents

## Usage

### Convert DOCX to Markdown with Page References
```bash
python3 extract_docx_with_structure.py "/path/to/document.docx" [output_directory]
```

### Example
```bash
cd /Users/m/ai/projects/convertpdf
python3 extract_docx_with_structure.py "/Users/m/Downloads/document.docx" .
```

**Output:**
- `document.md` - Markdown with page separators and embedded images
- `images/` - Folder with all extracted images
- `IMAGE_INDEX.md` - Visual index of all extracted images

## Page Reference Format
Each page is marked with:
```markdown
---
## 📄 Page N
---
```

This makes it easy to:
- Jump to specific pages in the markdown
- Cross-reference with original PDF/DOCX
- Navigate large documents efficiently

## Requirements
- `python-docx` - For DOCX parsing
- `PyMuPDF (fitz)` - For PDF processing
- `zipfile` - Standard library (for DOCX as ZIP)
- Python 3.7+

## Installation
```bash
pip install python-docx PyMuPDF
```

## Files Included
- `extract_docx_with_structure.py` - Main DOCX → Markdown converter with page breaks
- `pdf_extract_ultra_high_res.py` - PDF → PNG + metadata converter (600 DPI)
- `AGENT_HANDOFF.md` - Implementation notes for future enhancements
