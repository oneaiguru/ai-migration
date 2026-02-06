#!/usr/bin/env python3
"""
Extract text and images from DOCX with proper structure and placement.
Creates markdown with images in their correct document positions.
"""

import os
import re
import shutil
from pathlib import Path
from typing import List, Dict, Tuple
import zipfile
from docx import Document
from docx.document import Document as DocumentType
from docx.text.paragraph import Paragraph
from docx.table import Table, _Cell
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
import xml.etree.ElementTree as ET

class DocxStructuredExtractor:
    def __init__(self, docx_path: str, output_dir: str):
        """
        Initialize extractor with DOCX file and output directory.
        
        Args:
            docx_path: Path to DOCX file
            output_dir: Output directory for markdown and images
        """
        self.docx_path = Path(docx_path)
        self.output_dir = Path(output_dir)
        self.images_dir = self.output_dir / "images"
        
        # Create output directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.images_dir.mkdir(parents=True, exist_ok=True)
        
        # Load document
        self.doc = Document(docx_path)
        
        # Image counter for naming
        self.image_counter = 0
        self.image_mapping = {}
        
    def extract_images_from_docx(self) -> Dict[str, str]:
        """
        Extract all images from DOCX and map their relationships.
        
        Returns:
            Dictionary mapping relationship IDs to image paths
        """
        image_rels = {}
        
        # Extract images from DOCX (which is a ZIP file)
        with zipfile.ZipFile(self.docx_path, 'r') as zip_ref:
            # Parse relationships to map image IDs
            rels_path = 'word/_rels/document.xml.rels'
            if rels_path in zip_ref.namelist():
                rels_content = zip_ref.read(rels_path)
                rels_tree = ET.fromstring(rels_content)
                
                # Find all image relationships
                for rel in rels_tree:
                    rel_id = rel.get('Id')
                    rel_type = rel.get('Type')
                    target = rel.get('Target')
                    
                    if rel_type and 'image' in rel_type:
                        # Extract the actual image
                        if target.startswith('media/'):
                            image_path = f'word/{target}'
                        else:
                            image_path = f'word/media/{target}'
                            
                        if image_path in zip_ref.namelist():
                            # Extract and save image
                            self.image_counter += 1
                            ext = Path(target).suffix
                            new_name = f"image_{self.image_counter:03d}{ext}"
                            output_path = self.images_dir / new_name
                            
                            # Extract image
                            image_data = zip_ref.read(image_path)
                            with open(output_path, 'wb') as f:
                                f.write(image_data)
                            
                            image_rels[rel_id] = new_name
                            print(f"Extracted: {new_name} (from {target})")
        
        return image_rels
    
    def get_paragraph_images(self, paragraph: Paragraph) -> List[str]:
        """
        Get images embedded in a paragraph.

        Args:
            paragraph: Paragraph object

        Returns:
            List of image filenames in this paragraph
        """
        images = []

        # Parse the paragraph XML to find images
        para_xml = paragraph._element.xml

        # Look for drawing elements (images)
        if 'w:drawing' in para_xml or 'pic:pic' in para_xml:
            # Find relationship IDs in the XML
            for match in re.finditer(r'r:embed="(rId\d+)"', para_xml):
                rel_id = match.group(1)
                if rel_id in self.image_mapping:
                    images.append(self.image_mapping[rel_id])

        return images

    def detect_page_break(self, paragraph: Paragraph) -> bool:
        """
        Detect if paragraph contains a page break marker.
        Looks for <w:br w:type="page"/> in paragraph XML.

        Args:
            paragraph: Paragraph object

        Returns:
            True if paragraph contains page break, False otherwise
        """
        para_xml = paragraph._element.xml
        # Check for page break marker in Word XML format
        return 'w:type="page"' in para_xml or 'w:br w:type="page"' in para_xml
    
    def process_table(self, table: Table) -> str:
        """
        Convert table to markdown format.
        
        Args:
            table: Table object
            
        Returns:
            Markdown representation of table
        """
        md_lines = []
        
        # Process each row
        for i, row in enumerate(table.rows):
            row_data = []
            for cell in row.cells:
                # Get cell text
                cell_text = cell.text.strip().replace('\n', ' ')
                row_data.append(cell_text)
            
            # Create markdown table row
            md_lines.append('| ' + ' | '.join(row_data) + ' |')
            
            # Add header separator after first row
            if i == 0:
                separator = '|' + '|'.join([' --- ' for _ in row_data]) + '|'
                md_lines.append(separator)
        
        return '\n'.join(md_lines)
    
    def extract_structured_content(self) -> str:
        """
        Extract content preserving structure with images in correct positions.
        Includes page break markers for document navigation.

        Returns:
            Markdown content with properly placed images and page separators
        """
        # First extract all images and create mapping
        self.image_mapping = self.extract_images_from_docx()

        markdown_lines = []
        markdown_lines.append(f"# {self.docx_path.stem}\n")
        markdown_lines.append("*Extracted with structure and high-resolution images*\n")
        markdown_lines.append("---\n")

        current_section = None
        current_page = 1
        page_started = False

        # Add first page header
        markdown_lines.append(f"\n---\n")
        markdown_lines.append(f"## 📄 Page {current_page}\n")
        markdown_lines.append(f"---\n\n")
        page_started = True

        # Process document element by element
        for element in self.doc.element.body:
            # Check if element is paragraph
            if isinstance(element, CT_P):
                para = Paragraph(element, self.doc)

                # Check for page break BEFORE processing paragraph content
                if self.detect_page_break(para):
                    current_page += 1
                    markdown_lines.append(f"\n---\n")
                    markdown_lines.append(f"## 📄 Page {current_page}\n")
                    markdown_lines.append(f"---\n\n")
                    page_started = True
                    continue  # Skip the page break paragraph itself

                # Skip empty paragraphs
                if not para.text.strip():
                    # Check for images even in "empty" paragraphs
                    images = self.get_paragraph_images(para)
                    for img in images:
                        markdown_lines.append(f"\n![{img}](images/{img})\n")
                    continue

                # Detect heading levels
                if para.style.name:
                    if 'Heading 1' in para.style.name or 'Заголовок 1' in para.style.name:
                        markdown_lines.append(f"\n## {para.text.strip()}\n")
                        current_section = para.text.strip()
                    elif 'Heading 2' in para.style.name or 'Заголовок 2' in para.style.name:
                        markdown_lines.append(f"\n### {para.text.strip()}\n")
                    elif 'Heading 3' in para.style.name or 'Заголовок 3' in para.style.name:
                        markdown_lines.append(f"\n#### {para.text.strip()}\n")
                    else:
                        # Regular paragraph
                        markdown_lines.append(f"{para.text.strip()}\n")
                else:
                    # No style - treat as regular paragraph
                    markdown_lines.append(f"{para.text.strip()}\n")

                # Check for images in this paragraph
                images = self.get_paragraph_images(para)
                for img in images:
                    markdown_lines.append(f"\n![{img}](images/{img})\n")
                    markdown_lines.append(f"*Image: {img}*\n")

            # Check if element is table
            elif isinstance(element, CT_Tbl):
                table = Table(element, self.doc)
                table_md = self.process_table(table)
                markdown_lines.append(f"\n{table_md}\n")

        return '\n'.join(markdown_lines)
    
    def create_visual_index(self):
        """
        Create a visual index of all images with thumbnails.
        """
        index_path = self.output_dir / "IMAGE_INDEX.md"
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write("# Image Index - Naumen WFM Documentation\n\n")
            f.write("*Visual index of all extracted images*\n\n")
            
            # List all images
            images = sorted(self.images_dir.glob("*"))
            
            f.write(f"**Total Images**: {len(images)}\n\n")
            
            for img_path in images:
                f.write(f"### {img_path.name}\n")
                f.write(f"![{img_path.name}](images/{img_path.name})\n\n")
                f.write("---\n\n")
    
    def run(self):
        """
        Execute the complete extraction process.
        """
        print("📚 Starting structured extraction from DOCX...")

        # Extract structured content with images
        print("📝 Extracting text and structure...")
        markdown_content = self.extract_structured_content()

        # Save main documentation with the actual docx filename
        doc_path = self.output_dir / f"{self.docx_path.stem}.md"
        with open(doc_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"✅ Created main documentation: {doc_path}")
        
        # Create visual index
        print("🖼️ Creating visual index...")
        self.create_visual_index()
        print(f"✅ Created image index: {self.output_dir}/IMAGE_INDEX.md")
        
        # Copy high-res images if they exist
        high_res_dir = Path("Мануал WFM _HIGH_RES_IMAGES")
        if high_res_dir.exists():
            print("📋 Integrating high-resolution images...")
            
            # Create mapping between extracted and high-res images
            for hr_img in high_res_dir.glob("*.png"):
                # Extract number from high-res image name
                match = re.search(r'image(\d+)', hr_img.name)
                if match:
                    img_num = int(match.group(1))
                    
                    # Find corresponding extracted image
                    for ext_img in self.images_dir.glob(f"image_{img_num:03d}.*"):
                        # Replace with high-res version
                        shutil.copy2(hr_img, ext_img)
                        print(f"  Replaced with high-res: {ext_img.name}")
        
        print(f"\n✨ Extraction complete!")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"📄 Main document: {doc_path}")
        print(f"🖼️ Images: {self.images_dir}")
        print(f"📑 Image index: {self.output_dir}/IMAGE_INDEX.md")


def main():
    """
    Main execution function.
    """
    import sys

    # Parse command line arguments
    if len(sys.argv) < 2:
        print("DOCX to Markdown with Images Converter")
        print("=" * 40)
        print("\nUsage: python extract_docx_with_structure.py <docx_path> [output_dir]\n")
        print("Arguments:")
        print("  docx_path    Path to DOCX file (required)")
        print("  output_dir   Output directory (optional, default: {docx_name}_extracted/)\n")
        print("Examples:")
        print("  python extract_docx_with_structure.py document.docx")
        print("  python extract_docx_with_structure.py document.docx output_folder\n")
        sys.exit(1)

    docx_file = sys.argv[1]

    # Generate default output dir from docx filename if not provided
    if len(sys.argv) > 2:
        output_dir = sys.argv[2]
    else:
        docx_path = Path(docx_file)
        output_dir = str(docx_path.parent / f"{docx_path.stem}_extracted")

    if not Path(docx_file).exists():
        print(f"❌ Error: {docx_file} not found!")
        sys.exit(1)

    extractor = DocxStructuredExtractor(
        docx_path=docx_file,
        output_dir=output_dir
    )

    extractor.run()


if __name__ == "__main__":
    main()