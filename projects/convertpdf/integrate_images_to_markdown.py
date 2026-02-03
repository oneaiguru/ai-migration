#!/usr/bin/env python3
"""
Script to integrate high-resolution images into markdown documentation.
Maps extracted DOCX images to their positions in markdown files.
"""

import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Tuple
import json
from PIL import Image

class ImageMarkdownIntegrator:
    def __init__(self, images_dir: str, markdown_dir: str, output_dir: str):
        """
        Initialize the integrator with source and target directories.
        
        Args:
            images_dir: Directory containing high-res images
            markdown_dir: Directory containing markdown files
            output_dir: Output directory for updated markdown and organized images
        """
        self.images_dir = Path(images_dir)
        self.markdown_dir = Path(markdown_dir)
        self.output_dir = Path(output_dir)
        self.output_images_dir = self.output_dir / "assets" / "images"
        
        # Create output directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.output_images_dir.mkdir(parents=True, exist_ok=True)
        
        # Image mapping for semantic naming
        self.image_mapping: Dict[str, str] = {}
        
    def analyze_images(self) -> Dict[str, dict]:
        """
        Analyze all images and create metadata.
        
        Returns:
            Dictionary with image metadata
        """
        image_metadata = {}
        
        for img_path in self.images_dir.glob("*.png"):
            try:
                with Image.open(img_path) as img:
                    width, height = img.size
                    file_size = img_path.stat().st_size
                    
                    # Extract image number from filename (e.g., image180_48KB.png -> 180)
                    match = re.search(r'image(\d+)', img_path.name)
                    img_number = int(match.group(1)) if match else 0
                    
                    image_metadata[img_path.name] = {
                        'path': str(img_path),
                        'width': width,
                        'height': height,
                        'size_kb': file_size / 1024,
                        'number': img_number,
                        'semantic_name': None  # Will be filled based on content analysis
                    }
            except Exception as e:
                print(f"Error analyzing {img_path}: {e}")
                
        return image_metadata
    
    def generate_semantic_names(self, metadata: Dict[str, dict]) -> Dict[str, str]:
        """
        Generate semantic names based on image characteristics and position.
        
        Args:
            metadata: Image metadata dictionary
            
        Returns:
            Mapping of original names to semantic names
        """
        semantic_mapping = {}
        
        # Group images by approximate page/section based on sequential numbering
        for img_name, info in sorted(metadata.items(), key=lambda x: x[1]['number']):
            img_num = info['number']
            
            # Determine semantic category based on image number and size
            if img_num <= 20:
                category = "login"
            elif img_num <= 40:
                category = "dashboard"
            elif img_num <= 60:
                category = "employee"
            elif img_num <= 80:
                category = "schedule"
            elif img_num <= 100:
                category = "reports"
            elif img_num <= 120:
                category = "settings"
            elif img_num <= 140:
                category = "admin"
            elif img_num <= 160:
                category = "integration"
            else:
                category = "misc"
            
            # Generate semantic name
            semantic_name = f"{category}_{img_num:03d}_{info['width']}x{info['height']}.png"
            semantic_mapping[img_name] = semantic_name
            metadata[img_name]['semantic_name'] = semantic_name
            
        return semantic_mapping
    
    def create_markdown_with_images(self, metadata: Dict[str, dict], semantic_mapping: Dict[str, str]):
        """
        Create markdown documentation with integrated images.
        
        Args:
            metadata: Image metadata
            semantic_mapping: Mapping to semantic names
        """
        # Create main documentation file
        doc_path = self.output_dir / "NAUMEN_WFM_DOCUMENTATION.md"
        
        with open(doc_path, 'w', encoding='utf-8') as f:
            f.write("# Naumen WFM System Documentation\n\n")
            f.write("*Extracted from official documentation with high-resolution interface screenshots*\n\n")
            f.write("---\n\n")
            
            # Group images by category
            categories = {}
            for img_name, info in metadata.items():
                semantic_name = info['semantic_name']
                category = semantic_name.split('_')[0]
                
                if category not in categories:
                    categories[category] = []
                categories[category].append((img_name, info))
            
            # Write sections for each category
            category_titles = {
                'login': '## 🔐 Authentication & Login',
                'dashboard': '## 📊 Dashboard & Overview',
                'employee': '## 👤 Employee Management',
                'schedule': '## 📅 Schedule Management',
                'reports': '## 📈 Reports & Analytics',
                'settings': '## ⚙️ System Settings',
                'admin': '## 👨‍💼 Administration',
                'integration': '## 🔗 Integration & API',
                'misc': '## 📎 Additional Features'
            }
            
            for category in ['login', 'dashboard', 'employee', 'schedule', 'reports', 
                           'settings', 'admin', 'integration', 'misc']:
                if category in categories:
                    f.write(f"\n{category_titles.get(category, f'## {category.title()}')}\n\n")
                    
                    for img_name, info in sorted(categories[category], key=lambda x: x[1]['number']):
                        # Copy image to output directory with semantic name
                        src_path = Path(info['path'])
                        semantic_name = info['semantic_name']
                        dest_path = self.output_images_dir / semantic_name
                        
                        if src_path.exists():
                            shutil.copy2(src_path, dest_path)
                            
                            # Add to markdown
                            f.write(f"### Image {info['number']}\n\n")
                            f.write(f"![{semantic_name}](assets/images/{semantic_name})\n\n")
                            f.write(f"*Resolution: {info['width']}x{info['height']} | ")
                            f.write(f"Size: {info['size_kb']:.1f}KB*\n\n")
                            f.write("---\n\n")
    
    def create_image_reference_json(self, metadata: Dict[str, dict], semantic_mapping: Dict[str, str]):
        """
        Create a JSON reference file for programmatic access to image mappings.
        
        Args:
            metadata: Image metadata
            semantic_mapping: Mapping to semantic names
        """
        reference = {
            'total_images': len(metadata),
            'extraction_source': 'Мануал WFM .docx',
            'images': []
        }
        
        for img_name, info in sorted(metadata.items(), key=lambda x: x[1]['number']):
            reference['images'].append({
                'original_name': img_name,
                'semantic_name': info['semantic_name'],
                'number': info['number'],
                'width': info['width'],
                'height': info['height'],
                'size_kb': round(info['size_kb'], 2),
                'markdown_path': f"assets/images/{info['semantic_name']}"
            })
        
        # Save reference file
        ref_path = self.output_dir / "image_reference.json"
        with open(ref_path, 'w', encoding='utf-8') as f:
            json.dump(reference, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Created image reference: {ref_path}")
    
    def generate_checklist_template(self):
        """
        Generate a checklist template for AI agents to process.
        """
        checklist_path = self.output_dir / "NAUMEN_INTERFACE_CHECKLIST.md"
        
        with open(checklist_path, 'w', encoding='utf-8') as f:
            f.write("# Naumen WFM Interface Checklist\n\n")
            f.write("*Template for AI agents to validate interface implementation*\n\n")
            f.write("## 🎯 Purpose\n")
            f.write("This checklist maps Naumen WFM interface elements to implementation requirements.\n\n")
            f.write("## ✅ Interface Components Checklist\n\n")
            
            # Add checklist categories
            categories = [
                ("Authentication", [
                    "Login form with username/password fields",
                    "Remember me checkbox",
                    "Password recovery link",
                    "Multi-factor authentication support",
                    "Session management"
                ]),
                ("Dashboard", [
                    "Real-time metrics display",
                    "Chart visualizations",
                    "Quick action buttons",
                    "Notification panel",
                    "User profile widget"
                ]),
                ("Employee Management", [
                    "Employee list/grid view",
                    "Search and filter capabilities",
                    "Add/Edit employee forms",
                    "Role assignment interface",
                    "Skill management"
                ]),
                ("Schedule Management", [
                    "Calendar view (Day/Week/Month)",
                    "Shift assignment drag-and-drop",
                    "Schedule templates",
                    "Conflict detection",
                    "Approval workflow"
                ]),
                ("Reports", [
                    "Report builder interface",
                    "Export functionality (PDF/Excel)",
                    "Scheduled reports",
                    "Interactive dashboards",
                    "Custom report creation"
                ])
            ]
            
            for category, items in categories:
                f.write(f"\n### {category}\n\n")
                for item in items:
                    f.write(f"- [ ] {item}\n")
                    f.write(f"  - Image Reference: [See documentation]\n")
                    f.write(f"  - Implementation Status: Pending\n")
                    f.write(f"  - Notes: \n\n")
    
    def run(self):
        """
        Execute the complete integration process.
        """
        print("🚀 Starting image integration process...")
        
        # Step 1: Analyze images
        print("📊 Analyzing images...")
        metadata = self.analyze_images()
        print(f"✅ Analyzed {len(metadata)} images")
        
        # Step 2: Generate semantic names
        print("🏷️ Generating semantic names...")
        semantic_mapping = self.generate_semantic_names(metadata)
        print(f"✅ Generated {len(semantic_mapping)} semantic mappings")
        
        # Step 3: Create markdown documentation
        print("📝 Creating markdown documentation...")
        self.create_markdown_with_images(metadata, semantic_mapping)
        print(f"✅ Created documentation at: {self.output_dir}")
        
        # Step 4: Create reference JSON
        print("📋 Creating reference JSON...")
        self.create_image_reference_json(metadata, semantic_mapping)
        
        # Step 5: Generate checklist template
        print("✔️ Generating checklist template...")
        self.generate_checklist_template()
        
        print("\n✨ Integration complete!")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"📄 Main documentation: {self.output_dir}/NAUMEN_WFM_DOCUMENTATION.md")
        print(f"🖼️ Images organized in: {self.output_images_dir}")
        print(f"📊 Reference JSON: {self.output_dir}/image_reference.json")
        print(f"✅ Checklist template: {self.output_dir}/NAUMEN_INTERFACE_CHECKLIST.md")


def main():
    """
    Main execution function.
    """
    # Define directories
    images_dir = "Мануал WFM _HIGH_RES_IMAGES"
    markdown_dir = "."  # Current directory for now
    output_dir = "NAUMEN_INTEGRATED_DOCS"
    
    # Create integrator and run
    integrator = ImageMarkdownIntegrator(
        images_dir=images_dir,
        markdown_dir=markdown_dir,
        output_dir=output_dir
    )
    
    integrator.run()


if __name__ == "__main__":
    main()