#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Deployment preparation script for iMessage Sender
"""

import os
import sys
import shutil
import argparse
import zipfile
import subprocess
import re
from datetime import datetime

# Files and directories to include in deployment
INCLUDE_FILES = [
    'config.py',
    'contact_manager.py',
    'gui.py',
    'imessage_sender.py',
    'logger.py',
    'message_template.py',
    'main-script.py',
    'setup.py',
    'requirements.txt',
    'README.md',
    'user-manual.md',
    'LICENSE'
]

# Directories to include in deployment
INCLUDE_DIRS = [
    'test_files'
]

# Files and directories to exclude from deployment
EXCLUDE_PATTERNS = [
    '__pycache__',
    '.DS_Store',
    '.git',
    '.idea',
    '.vscode',
    '*.pyc',
    '*.pyo',
    '*.pyd',
    '*.log',
    'venv',
    'env',
    '.env',
    'tests',
    'bdd-specs.md',
    'imessage-first-draft.md',
    'imessage-solution-proposal.md',
    'definition-of-done*',
    'gui-continued.py',  # This is part of the GUI, should be integrated before deployment
    'gui.txt',           # This is part of the GUI, should be integrated before deployment
]

# Metadata for the package
METADATA = {
    'name': 'iMessage Sender',
    'version': '1.0.0',
    'author': 'Михаил',
    'description': 'System for sending iMessages through macOS',
    'min_python_version': '3.7',
    'min_macos_version': '12.0'
}

# Basic file patterns
PYTHON_FILE_PATTERN = re.compile(r'\.py$')
DOC_FILE_PATTERN = re.compile(r'\.(md|txt|pdf|rst)$')

def should_include(path):
    """
    Check if a file or directory should be included in the deployment package
    
    Args:
        path (str): Path to check
        
    Returns:
        bool: True if it should be included, False otherwise
    """
    name = os.path.basename(path)
    
    # Check exclude patterns
    for pattern in EXCLUDE_PATTERNS:
        if pattern.startswith('*.'):
            # File extension pattern
            ext = pattern[1:]
            if name.endswith(ext):
                return False
        elif '*' in pattern:
            # Simple wildcard pattern
            regex = pattern.replace('*', '.*')
            if re.match(regex, name):
                return False
        else:
            # Exact match
            if name == pattern:
                return False
    
    return True

def get_version_from_files():
    """
    Extract version information from source files
    
    Returns:
        str: Version string or default if not found
    """
    version_pattern = re.compile(r'Версия: (\d+\.\d+\.\d+)')
    
    # Try to find version in several core files
    for file_path in ['config.py', 'contact_manager.py', 'imessage_sender.py']:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                match = version_pattern.search(content)
                if match:
                    return match.group(1)
    
    return METADATA['version']

def create_deployment_directory(target_dir, clean=True):
    """
    Create a deployment directory
    
    Args:
        target_dir (str): Target directory path
        clean (bool): Whether to clean existing directory
        
    Returns:
        str: Path to the created directory
    """
    # Ensure target directory exists
    if clean and os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    
    os.makedirs(target_dir, exist_ok=True)
    
    return target_dir

def copy_files_to_deployment(source_dir, target_dir):
    """
    Copy files from source to deployment directory
    
    Args:
        source_dir (str): Source directory
        target_dir (str): Target directory
        
    Returns:
        list: List of copied files
    """
    copied_files = []
    
    # Copy individual files
    for filename in INCLUDE_FILES:
        source_path = os.path.join(source_dir, filename)
        if os.path.exists(source_path):
            target_path = os.path.join(target_dir, filename)
            # Create target directory if needed
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            shutil.copy2(source_path, target_path)
            copied_files.append(target_path)
            print(f"Copied: {filename}")
        else:
            print(f"Warning: File not found: {filename}")
    
    # Copy directories
    for dirname in INCLUDE_DIRS:
        source_path = os.path.join(source_dir, dirname)
        if os.path.exists(source_path) and os.path.isdir(source_path):
            target_path = os.path.join(target_dir, dirname)
            # Create target directory
            os.makedirs(target_path, exist_ok=True)
            
            # Recursively copy files
            for root, dirs, files in os.walk(source_path):
                # Filter directories
                dirs[:] = [d for d in dirs if should_include(os.path.join(root, d))]
                
                # Create corresponding directories in target
                for d in dirs:
                    os.makedirs(os.path.join(target_path, os.path.relpath(os.path.join(root, d), source_path)), exist_ok=True)
                
                # Copy files
                for file in files:
                    if should_include(os.path.join(root, file)):
                        source_file = os.path.join(root, file)
                        target_file = os.path.join(target_path, os.path.relpath(source_file, source_path))
                        shutil.copy2(source_file, target_file)
                        copied_files.append(target_file)
            
            print(f"Copied directory: {dirname}")
        else:
            print(f"Warning: Directory not found: {dirname}")
    
    # Create data directories
    for data_dir in ['logs', 'templates', 'reports']:
        os.makedirs(os.path.join(target_dir, data_dir), exist_ok=True)
        print(f"Created data directory: {data_dir}")
    
    return copied_files

def create_zip_archive(source_dir, version, output_dir=None):
    """
    Create a ZIP archive of the deployment directory
    
    Args:
        source_dir (str): Source directory to zip
        version (str): Version string for the filename
        output_dir (str, optional): Output directory for the ZIP file
        
    Returns:
        str: Path to the created ZIP file
    """
    # Use source directory as output directory if not specified
    if output_dir is None:
        output_dir = os.path.dirname(source_dir)
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Create ZIP filename with version
    timestamp = datetime.now().strftime("%Y%m%d")
    zip_filename = f"imessage_sender_v{version}_{timestamp}.zip"
    zip_path = os.path.join(output_dir, zip_filename)
    
    # Create ZIP file
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Filter directories
            dirs[:] = [d for d in dirs if should_include(os.path.join(root, d))]
            
            # Add files
            for file in files:
                if should_include(os.path.join(root, file)):
                    file_path = os.path.join(root, file)
                    # Add file to ZIP with relative path
                    zipf.write(file_path, os.path.relpath(file_path, os.path.dirname(source_dir)))
    
    print(f"Created ZIP archive: {zip_path}")
    return zip_path

def check_file_encoding(file_path):
    """
    Check if a file is properly encoded in UTF-8
    
    Args:
        file_path (str): Path to the file
        
    Returns:
        bool: True if the file is valid UTF-8, False otherwise
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return True
    except UnicodeDecodeError:
        return False

def verify_python_syntax(file_path):
    """
    Verify that a Python file has valid syntax
    
    Args:
        file_path (str): Path to the Python file
        
    Returns:
        bool: True if syntax is valid, False otherwise
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        compile(content, file_path, 'exec')
        return True
    except SyntaxError as e:
        print(f"Syntax error in {file_path}: {e}")
        return False
    except Exception as e:
        print(f"Error checking {file_path}: {e}")
        return False

def perform_quality_checks(deployment_files):
    """
    Perform quality checks on the deployed files
    
    Args:
        deployment_files (list): List of deployed files
        
    Returns:
        bool: True if all checks pass, False otherwise
    """
    all_passed = True
    
    for file_path in deployment_files:
        # Skip binary files
        if not os.path.isfile(file_path) or os.path.splitext(file_path)[1] in ['.pyc', '.pyo', '.pyd', '.so', '.dylib']:
            continue
        
        # Check file encoding
        if not check_file_encoding(file_path):
            print(f"Error: {file_path} is not valid UTF-8")
            all_passed = False
            continue
        
        # Check Python syntax for Python files
        if PYTHON_FILE_PATTERN.search(file_path):
            if not verify_python_syntax(file_path):
                all_passed = False
    
    return all_passed

def create_launch_script(deployment_dir):
    """
    Create a launch script in the deployment directory
    
    Args:
        deployment_dir (str): Deployment directory
        
    Returns:
        str: Path to the created script
    """
    script_path = os.path.join(deployment_dir, "start_imessage_sender.command")
    
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write('#!/bin/bash\n\n')
        f.write('# Launch script for iMessage Sender\n')
        f.write('# Generated by deployment script\n\n')
        
        f.write('# Change to script directory\n')
        f.write('cd "$(dirname "$0")"\n\n')
        
        f.write('# Check if Python is installed\n')
        f.write('if ! command -v python3 &> /dev/null; then\n')
        f.write('    echo "Error: Python 3 is not installed!"\n')
        f.write('    echo "Please install Python 3.7 or newer."\n')
        f.write('    exit 1\n')
        f.write('fi\n\n')
        
        f.write('# Check Python version\n')
        f.write('python_version=$(python3 -c "import sys; print(f\'{sys.version_info.major}.{sys.version_info.minor}\');")\n')
        f.write('if [[ "$(echo -e "${python_version}\\n3.7" | sort -V | head -n1)" != "3.7" ]]; then\n')
        f.write('    echo "Error: Python version must be 3.7 or newer!"\n')
        f.write('    echo "Current version: $python_version"\n')
        f.write('    exit 1\n')
        f.write('fi\n\n')
        
        f.write('# Check for requirements\n')
        f.write('if [ ! -f "requirements.txt" ]; then\n')
        f.write('    echo "Error: requirements.txt not found!"\n')
        f.write('    exit 1\n')
        f.write('fi\n\n')
        
        f.write('# Create virtual environment if it doesn\'t exist\n')
        f.write('if [ ! -d "venv" ]; then\n')
        f.write('    echo "Creating virtual environment..."\n')
        f.write('    python3 -m venv venv\n')
        f.write('    if [ $? -ne 0 ]; then\n')
        f.write('        echo "Error: Failed to create virtual environment!"\n')
        f.write('        exit 1\n')
        f.write('    fi\n')
        f.write('fi\n\n')
        
        f.write('# Activate virtual environment\n')
        f.write('source venv/bin/activate\n\n')
        
        f.write('# Install requirements\n')
        f.write('echo "Installing requirements..."\n')
        f.write('pip install -r requirements.txt\n')
        f.write('if [ $? -ne 0 ]; then\n')
        f.write('    echo "Error: Failed to install requirements!"\n')
        f.write('    exit 1\n')
        f.write('fi\n\n')
        
        f.write('# Launch the application\n')
        f.write('echo "Launching iMessage Sender..."\n')
        f.write('python3 gui.py\n')
    
    # Make the script executable
    os.chmod(script_path, 0o755)
    
    print(f"Created launch script: {script_path}")
    return script_path

def create_documentation(deployment_dir, version):
    """
    Create additional documentation files in the deployment directory
    
    Args:
        deployment_dir (str): Deployment directory
        version (str): Version string
        
    Returns:
        list: List of created files
    """
    created_files = []
    
    # Create CHANGELOG.md if it doesn't exist
    changelog_path = os.path.join(deployment_dir, "CHANGELOG.md")
    if not os.path.exists(changelog_path):
        with open(changelog_path, 'w', encoding='utf-8') as f:
            f.write(f"# Changelog for iMessage Sender\n\n")
            f.write(f"## Version {version} - {datetime.now().strftime('%Y-%m-%d')}\n\n")
            f.write("### Features\n\n")
            f.write("- Initial release\n")
            f.write("- Contact management (CSV, Excel, TXT)\n")
            f.write("- Template system with variables\n")
            f.write("- iMessage sending via AppleScript\n")
            f.write("- Logging and reporting\n")
            f.write("- Graphical user interface\n")
        
        created_files.append(changelog_path)
        print(f"Created: CHANGELOG.md")
    
    # Create INSTALL.md with installation instructions
    install_path = os.path.join(deployment_dir, "INSTALL.md")
    with open(install_path, 'w', encoding='utf-8') as f:
        f.write("# Installation Instructions\n\n")
        
        f.write("## System Requirements\n\n")
        f.write(f"- macOS {METADATA['min_macos_version']} or newer\n")
        f.write(f"- Python {METADATA['min_python_version']} or newer\n")
        f.write("- Internet connection for initial setup\n")
        f.write("- Active iMessage account in Messages.app\n\n")
        
        f.write("## Installation Steps\n\n")
        f.write("### Automatic Installation\n\n")
        f.write("1. Double-click the `start_imessage_sender.command` script\n")
        f.write("2. If prompted, allow the script to execute\n")
        f.write("3. The script will create a virtual environment and install all dependencies\n")
        f.write("4. Once setup is complete, the application will launch automatically\n\n")
        
        f.write("### Manual Installation\n\n")
        f.write("1. Open Terminal and navigate to the extracted folder:\n")
        f.write("   ```\n   cd /path/to/imessage_sender\n   ```\n\n")
        
        f.write("2. Create a virtual environment:\n")
        f.write("   ```\n   python3 -m venv venv\n   ```\n\n")
        
        f.write("3. Activate the virtual environment:\n")
        f.write("   ```\n   source venv/bin/activate\n   ```\n\n")
        
        f.write("4. Install dependencies:\n")
        f.write("   ```\n   pip install -r requirements.txt\n   ```\n\n")
        
        f.write("5. Launch the application:\n")
        f.write("   ```\n   python3 gui.py\n   ```\n\n")
        
        f.write("## Troubleshooting\n\n")
        f.write("- If you encounter permission errors, try running:\n")
        f.write("  ```\n  chmod +x start_imessage_sender.command\n  ```\n\n")
        
        f.write("- If Python is not found, make sure it's installed and in your PATH\n\n")
        
        f.write("- For more detailed instructions, see the user manual (user-manual.md)\n")
    
    created_files.append(install_path)
    print(f"Created: INSTALL.md")
    
    return created_files

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Deployment preparation script for iMessage Sender")
    parser.add_argument('--output', '-o', help="Output directory for deployment package")
    parser.add_argument('--version', '-v', help="Version number for the package")
    parser.add_argument('--no-zip', action='store_true', help="Skip creating ZIP archive")
    parser.add_argument('--clean', action='store_true', help="Clean output directory before deployment")
    args = parser.parse_args()
    
    # Get project directory (script's directory)
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)
    
    # Get version
    version = args.version or get_version_from_files()
    print(f"Preparing deployment for version {version}")
    
    # Set output directory
    if args.output:
        output_dir = args.output
    else:
        output_dir = os.path.join(project_dir, 'dist')
    
    # Create deployment directory
    deployment_dir = os.path.join(output_dir, f"imessage_sender_v{version}")
    deployment_dir = create_deployment_directory(deployment_dir, clean=args.clean)
    print(f"Created deployment directory: {deployment_dir}")
    
    # Copy files to deployment directory
    deployment_files = copy_files_to_deployment(project_dir, deployment_dir)
    
    # Create launch script
    create_launch_script(deployment_dir)
    
    # Create documentation
    doc_files = create_documentation(deployment_dir, version)
    deployment_files.extend(doc_files)
    
    # Perform quality checks
    if perform_quality_checks(deployment_files):
        print("All quality checks passed")
    else:
        print("Warning: Some quality checks failed")
    
    # Create ZIP archive
    if not args.no_zip:
        zip_path = create_zip_archive(deployment_dir, version, output_dir)
        print(f"\nDeployment package created successfully: {zip_path}")
    else:
        print(f"\nDeployment directory created successfully: {deployment_dir}")

if __name__ == "__main__":
    main()
