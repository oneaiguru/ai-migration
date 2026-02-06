#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script to prepare the iMessage Sender for deployment
"""

import os
import sys
import shutil
import argparse
import subprocess
from datetime import datetime

# Get the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run_tests():
    """Run all unit tests"""
    print("Running tests...")
    test_script = os.path.join(project_root, 'test_cli.py')
    
    try:
        result = subprocess.run(
            [sys.executable, test_script],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        print("✅ Tests completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print("❌ Tests failed:")
        print(e.stdout)
        print(e.stderr)
        return False


def create_deployment_package(output_dir, version):
    """Create a deployment package"""
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Create the package directory name
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    package_name = f"imessage_sender_v{version}_{timestamp}"
    package_dir = os.path.join(output_dir, package_name)
    
    # Create the package directory
    os.makedirs(package_dir)
    
    # Files to include in the package
    include_files = [
        'contact_manager.py',
        'message_template.py',
        'imessage_sender.py',
        'logger.py',
        'config.py',
        'setup.py',
        'requirements.txt',
        'readme (1).md',
        'user-manual.md'
    ]
    
    # Create directories
    os.makedirs(os.path.join(package_dir, 'templates'), exist_ok=True)
    os.makedirs(os.path.join(package_dir, 'docs'), exist_ok=True)
    
    # Copy files
    for file in include_files:
        source_path = os.path.join(project_root, file)
        if os.path.exists(source_path):
            if file == 'readme (1).md':
                # Rename readme file
                dest_path = os.path.join(package_dir, 'README.md')
            elif file == 'user-manual.md':
                # Move user manual to docs directory
                dest_path = os.path.join(package_dir, 'docs', 'user-manual.md')
            else:
                dest_path = os.path.join(package_dir, file)
            
            # Copy the file
            shutil.copy2(source_path, dest_path)
            print(f"Copied {file} to {dest_path}")
    
    # Create sample template files
    template_dir = os.path.join(package_dir, 'templates')
    create_sample_templates(template_dir)
    
    # Create a zip archive
    archive_path = os.path.join(output_dir, f"{package_name}.zip")
    shutil.make_archive(
        os.path.splitext(archive_path)[0],  # Base name (without extension)
        'zip',                              # Format
        package_dir                         # Root directory to archive
    )
    
    print(f"\n✅ Deployment package created: {archive_path}")
    return archive_path


def create_sample_templates(template_dir):
    """Create sample template files"""
    # Sample template 1 - Basic
    basic_template_path = os.path.join(template_dir, 'basic_template.txt')
    with open(basic_template_path, 'w', encoding='utf-8') as f:
        f.write("""Hello, {{ name }}!

We would like to inform you about {{ event }}.

Best regards,
{{ company }}
""")
    
    # Sample template 2 - Reminder
    reminder_template_path = os.path.join(template_dir, 'reminder_template.txt')
    with open(reminder_template_path, 'w', encoding='utf-8') as f:
        f.write("""Dear {{ name }},

This is a friendly reminder about {{ event }} scheduled for {{ date }}.

Please confirm your attendance.

Best regards,
{{ company }}
{{ phone }}
""")
    
    # Sample template 3 - Marketing
    marketing_template_path = os.path.join(template_dir, 'marketing_template.txt')
    with open(marketing_template_path, 'w', encoding='utf-8') as f:
        f.write("""Hello {{ name }}!

We're excited to announce {{ product }} is now available with a special {{ discount }} discount.

Use promocode: {{ promocode }}

Valid until: {{ date }}

Best regards,
{{ company }}
""")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Prepare iMessage Sender for deployment')
    parser.add_argument('--output', '-o', default='dist', help='Output directory for the deployment package')
    parser.add_argument('--version', '-v', default='1.0.0', help='Version number')
    parser.add_argument('--skip-tests', action='store_true', help='Skip running tests')
    
    args = parser.parse_args()
    
    # Make output path absolute if it's relative
    output_dir = args.output
    if not os.path.isabs(output_dir):
        output_dir = os.path.join(project_root, output_dir)
    
    # Run tests if not skipped
    if not args.skip_tests:
        if not run_tests():
            print("\n⚠️ Tests failed. Continue with deployment? (y/n): ", end='')
            if input().lower() != 'y':
                print("Deployment cancelled.")
                sys.exit(1)
    
    # Create deployment package
    create_deployment_package(output_dir, args.version)
