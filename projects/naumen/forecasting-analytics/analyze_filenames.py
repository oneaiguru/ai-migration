#!/usr/bin/env python3
"""
Script to analyze intended file names from TypeScript/TSX component files
by reading the first line comments and comparing with actual file names.
"""

import os
import re
from pathlib import Path

def analyze_file_names(directory_path):
    """Analyze intended vs actual file names in the given directory."""
    
    results = []
    
    # Get all .ts and .tsx files
    for file_path in Path(directory_path).glob('**/*.ts*'):
        if file_path.is_file():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    first_line = f.readline().strip()
                
                # Extract intended path from comment
                intended_path = None
                if first_line.startswith('//') and ('src/components' in first_line or 'components/' in first_line):
                    # Extract path from comment like: // /Users/m/Documents/.../src/components/forecasting/ComponentName.tsx
                    match = re.search(r'(src/components.*?\.tsx?)', first_line)
                    if match:
                        intended_path = match.group(1)
                    else:
                        # Try to extract just the filename
                        match = re.search(r'([A-Z][a-zA-Z]*\.tsx?)', first_line)
                        if match:
                            intended_path = f"src/components/forecasting/{match.group(1)}"
                
                # Get actual relative path
                actual_path = str(file_path).replace(str(Path(directory_path).parent.parent), '')
                if actual_path.startswith('/'):
                    actual_path = actual_path[1:]
                
                results.append({
                    'actual_file': file_path.name,
                    'actual_path': actual_path,
                    'intended_path': intended_path,
                    'first_line': first_line,
                    'matches': intended_path and intended_path.endswith(file_path.name) if intended_path else False
                })
                
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
    
    return results

def print_analysis(results):
    """Print the analysis results in a readable format."""
    
    print("=" * 80)
    print("FILE NAME ANALYSIS - Intended vs Actual")
    print("=" * 80)
    
    mismatches = []
    matches = []
    
    for result in results:
        if result['intended_path']:
            if result['matches']:
                matches.append(result)
            else:
                mismatches.append(result)
        else:
            print(f"\n❓ NO INTENDED PATH FOUND:")
            print(f"   File: {result['actual_file']}")
            print(f"   Path: {result['actual_path']}")
            print(f"   First line: {result['first_line'][:100]}...")
    
    print(f"\n✅ CORRECT NAMES ({len(matches)}):")
    print("-" * 40)
    for result in matches:
        print(f"   ✓ {result['actual_file']}")
        if result['intended_path']:
            print(f"     Intended: {result['intended_path']}")
        print()
    
    print(f"❌ MISMATCHED NAMES ({len(mismatches)}):")
    print("-" * 40)
    for result in mismatches:
        print(f"   ✗ {result['actual_file']}")
        print(f"     Actual:   {result['actual_path']}")
        print(f"     Intended: {result['intended_path']}")
        print(f"     First line: {result['first_line'][:80]}...")
        print()
    
    # Generate rename commands
    if mismatches:
        print("🔧 SUGGESTED RENAME COMMANDS:")
        print("-" * 40)
        for result in mismatches:
            if result['intended_path']:
                intended_name = Path(result['intended_path']).name
                if intended_name != result['actual_file']:
                    current_path = f"/Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/{result['actual_path']}"
                    new_path = str(Path(current_path).parent / intended_name)
                    print(f"mv '{current_path}' '{new_path}'")

def main():
    """Main function to run the analysis."""
    
    forecasting_dir = "/Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting"
    
    if not os.path.exists(forecasting_dir):
        print(f"Directory not found: {forecasting_dir}")
        return
    
    print(f"Analyzing files in: {forecasting_dir}")
    results = analyze_file_names(forecasting_dir)
    print_analysis(results)
    
    print("\n" + "=" * 80)
    print(f"SUMMARY: Analyzed {len(results)} files")
    print("=" * 80)

if __name__ == "__main__":
    main()
