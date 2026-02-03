#!/usr/bin/env python3
"""
Ultra High Resolution PDF Image Extraction
Based on PyMuPDF best practices for maximum quality
"""

import fitz  # PyMuPDF
import sys
from pathlib import Path
import json

def extract_ultra_high_resolution(pdf_path: Path, start: int, end: int, target_dpi: int = 600):
    """
    Extract images at ultra high resolution for readable text
    
    Args:
        pdf_path: Path to PDF file
        start: Start page (1-based)
        end: End page (1-based)
        target_dpi: Target DPI (600-1200 recommended for readable text)
    """
    doc = fitz.open(pdf_path)
    start = max(1, start)
    end = min(len(doc), end)
    
    # Create output directories
    out_dir = pdf_path.parent / f"{pdf_path.stem}_ultra_high_res_{target_dpi}dpi"
    images_dir = out_dir / "images"
    embedded_dir = out_dir / "embedded_images"
    rendered_dir = out_dir / "rendered_pages"
    
    out_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(exist_ok=True)
    embedded_dir.mkdir(exist_ok=True)
    rendered_dir.mkdir(exist_ok=True)
    
    extracted_images = []
    
    print(f"🎯 Extracting at {target_dpi} DPI for maximum text readability")
    print(f"📄 Processing pages {start} to {end}")
    print("")
    
    for page_num in range(start, end + 1):
        page = doc.load_page(page_num - 1)
        
        print(f"📖 Page {page_num}:")
        
        # Method 1: Extract embedded images at their ORIGINAL resolution
        image_list = page.get_images(full=True)
        
        if image_list:
            print(f"  Found {len(image_list)} embedded images")
            
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    # Extract at original quality
                    pix = fitz.Pixmap(doc, xref)
                    
                    # Check if we need to convert colorspace
                    if pix.n - pix.alpha > 3:  # CMYK or other colorspace
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    
                    # Save embedded image at original resolution
                    filename = f"page{page_num:03d}_embedded_img{img_index+1:02d}_{pix.width}x{pix.height}.png"
                    filepath = embedded_dir / filename
                    pix.save(str(filepath))
                    
                    file_size_kb = filepath.stat().st_size / 1024
                    
                    extracted_images.append({
                        'filename': filename,
                        'type': 'embedded_original',
                        'page': page_num,
                        'width': pix.width,
                        'height': pix.height,
                        'size_kb': file_size_kb,
                        'dpi': 'original'
                    })
                    
                    print(f"  ✅ Embedded: {filename} ({pix.width}×{pix.height}px, {file_size_kb:.1f}KB)")
                    
                    pix = None  # Free memory
                    
                except Exception as e:
                    print(f"  ❌ Failed to extract embedded image {img_index+1}: {e}")
        
        # Method 2: Render the ENTIRE page at ultra high DPI for readable text
        try:
            # Calculate zoom factor from DPI (72 is default PDF DPI)
            zoom_factor = target_dpi / 72.0
            
            # Create transformation matrix for high resolution
            mat = fitz.Matrix(zoom_factor, zoom_factor)
            
            # Render page at high resolution
            # Use alpha=False for smaller file size if transparency not needed
            pix = page.get_pixmap(matrix=mat, alpha=False)
            
            # Alternative method: Use dpi parameter directly (simpler)
            # pix = page.get_pixmap(dpi=target_dpi, alpha=False)
            
            filename = f"page{page_num:03d}_rendered_{target_dpi}dpi_{pix.width}x{pix.height}.png"
            filepath = rendered_dir / filename
            pix.save(str(filepath))
            
            file_size_kb = filepath.stat().st_size / 1024
            
            extracted_images.append({
                'filename': filename,
                'type': 'page_render',
                'page': page_num,
                'width': pix.width,
                'height': pix.height,
                'size_kb': file_size_kb,
                'dpi': target_dpi
            })
            
            print(f"  ✅ Page Render: {filename} ({pix.width}×{pix.height}px, {file_size_kb:.1f}KB, {target_dpi} DPI)")
            
            pix = None  # Free memory
            
        except Exception as e:
            print(f"  ❌ Failed to render page at high DPI: {e}")
        
        # Method 3: Extract specific image regions at high resolution if needed
        # This is useful if you know the coordinates of specific interface elements
        # You can use page.get_pixmap(clip=fitz.Rect(x0, y0, x1, y1), dpi=target_dpi)
        
        print("")
    
    # Create extraction report
    report = f"""# Ultra High Resolution Extraction Report

## Settings
- **Source**: {pdf_path.name}
- **Pages**: {start} to {end}
- **Target DPI**: {target_dpi}
- **Zoom Factor**: {target_dpi/72:.2f}x

## Results
- **Total Images**: {len(extracted_images)}
- **Embedded Images**: {len([img for img in extracted_images if img['type'] == 'embedded_original'])}
- **Page Renders**: {len([img for img in extracted_images if img['type'] == 'page_render'])}

## Resolution Analysis
"""
    
    # Group by resolution
    resolutions = {}
    for img in extracted_images:
        res_key = f"{img['width']}×{img['height']}"
        if res_key not in resolutions:
            resolutions[res_key] = []
        resolutions[res_key].append(img)
    
    for res, images in sorted(resolutions.items(), key=lambda x: int(x[0].split('×')[0]), reverse=True):
        report += f"- **{res}**: {len(images)} images\n"
    
    # Calculate average sizes
    embedded_sizes = [img['size_kb'] for img in extracted_images if img['type'] == 'embedded_original']
    render_sizes = [img['size_kb'] for img in extracted_images if img['type'] == 'page_render']
    
    if embedded_sizes:
        report += f"\n## Embedded Images\n"
        report += f"- Average Size: {sum(embedded_sizes)/len(embedded_sizes):.1f}KB\n"
        report += f"- Largest: {max(embedded_sizes):.1f}KB\n"
    
    if render_sizes:
        report += f"\n## Page Renders at {target_dpi} DPI\n"
        report += f"- Average Size: {sum(render_sizes)/len(render_sizes):.1f}KB\n"
        report += f"- Largest: {max(render_sizes):.1f}KB\n"
    
    report += f"""
## Quality Notes
- **{target_dpi} DPI**: {'Excellent for OCR and text readability' if target_dpi >= 600 else 'Good quality' if target_dpi >= 300 else 'Standard quality'}
- **Text Readability**: {'Excellent - all text should be clearly readable' if target_dpi >= 600 else 'Good' if target_dpi >= 300 else 'May have readability issues'}
- **File Sizes**: {'Very large but maximum quality' if target_dpi >= 600 else 'Moderate' if target_dpi >= 300 else 'Small'}

## Recommendations
- For readable text in UI screenshots: Use 600-1200 DPI
- For OCR processing: Use 300 DPI minimum, 600 DPI recommended
- For general viewing: 150-300 DPI is usually sufficient
- For print quality: 300-600 DPI

## File Structure
```
{out_dir.name}/
├── embedded_images/    # Original embedded images at native resolution
├── rendered_pages/     # Full pages rendered at {target_dpi} DPI
└── extraction_report.md
```
"""
    
    report_path = out_dir / "extraction_report.md"
    report_path.write_text(report)
    
    # Save metadata as JSON
    metadata = {
        'source_file': str(pdf_path),
        'pages': f"{start}-{end}",
        'target_dpi': target_dpi,
        'zoom_factor': target_dpi/72,
        'total_images': len(extracted_images),
        'images': extracted_images
    }
    
    metadata_path = out_dir / "metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\n✨ ULTRA HIGH RESOLUTION extraction complete!")
    print(f"📊 Target DPI: {target_dpi}")
    print(f"🖼️  Total Images: {len(extracted_images)}")
    print(f"📁 Output: {out_dir}")
    print(f"📋 Report: {report_path}")
    
    # Summary of largest images
    if extracted_images:
        largest = max(extracted_images, key=lambda x: x['width'] * x['height'])
        print(f"🔍 Largest Image: {largest['width']}×{largest['height']}px ({largest['size_kb']:.1f}KB)")
    
    return out_dir, extracted_images

def main():
    if len(sys.argv) < 2:
        print("Ultra High Resolution PDF Image Extractor")
        print("=========================================")
        print("")
        print("Usage: python pdf_extract_ultra_high_res.py <pdf_path> [start_page] [end_page] [dpi]")
        print("")
        print("Examples:")
        print("  python pdf_extract_ultra_high_res.py 'document.pdf' 1 5 600")
        print("  python pdf_extract_ultra_high_res.py 'document.pdf' 1 10 1200")
        print("")
        print("DPI Recommendations:")
        print("  300 DPI - Minimum for readable text")
        print("  600 DPI - Recommended for UI screenshots with text")
        print("  1200 DPI - Maximum quality (very large files)")
        print("")
        sys.exit(1)
    
    pdf_path = Path(sys.argv[1])
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    end = int(sys.argv[3]) if len(sys.argv) > 3 else start + 4
    target_dpi = int(sys.argv[4]) if len(sys.argv) > 4 else 600
    
    if not pdf_path.exists():
        print(f"❌ Error: File '{pdf_path}' not found")
        sys.exit(1)
    
    if target_dpi < 150:
        print(f"⚠️  Warning: {target_dpi} DPI is very low. Text may be unreadable.")
        print("Recommended: 600 DPI for readable text in UI screenshots")
    elif target_dpi > 1200:
        print(f"⚠️  Warning: {target_dpi} DPI will create very large files.")
    
    out_dir, extracted_images = extract_ultra_high_resolution(pdf_path, start, end, target_dpi)
    
    print(f"\n✅ Ready for UI replication with readable text!")

if __name__ == "__main__":
    main()