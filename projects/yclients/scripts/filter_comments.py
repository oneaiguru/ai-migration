#!/usr/bin/env python3
"""
Comment Language Filter - Strips one language, keeps the other.

Usage:
    python scripts/filter_comments.py --keep=ru src/parser/*.py
    python scripts/filter_comments.py --keep=en src/parser/*.py

This script processes files with bilingual comment markers:
    # @lang:en English comment
    # @lang:ru Русский комментарий

And removes the comments for the language NOT specified in --keep.
"""

import re
import sys
import argparse
from pathlib import Path
from typing import List


def filter_file_comments(content: str, keep_lang: str = 'ru') -> str:
    """
    Filter comments to keep only specified language.

    Args:
        content: File content
        keep_lang: Language to keep ('en' or 'ru')

    Returns:
        Filtered content
    """
    if keep_lang not in ('en', 'ru'):
        raise ValueError(f"Invalid language: {keep_lang}. Must be 'en' or 'ru'")

    remove_lang = 'en' if keep_lang == 'ru' else 'ru'
    lines = content.split('\n')
    filtered_lines = []

    for line in lines:
        # Check if line has language marker
        if f'# @lang:{remove_lang}' in line:
            # Skip this line entirely (remove the comment)
            continue
        elif f'# @lang:{keep_lang}' in line:
            # Keep the comment but remove the marker
            cleaned_line = line.replace(f'# @lang:{keep_lang} ', '# ')
            cleaned_line = cleaned_line.replace(f'# @lang:{keep_lang}', '# ')
            filtered_lines.append(cleaned_line)
        else:
            # Keep lines without markers as-is
            filtered_lines.append(line)

    return '\n'.join(filtered_lines)


def process_files(file_paths: List[str], keep_lang: str = 'ru', dry_run: bool = False):
    """
    Process multiple files.

    Args:
        file_paths: List of file paths to process
        keep_lang: Language to keep ('en' or 'ru')
        dry_run: If True, only show what would be done
    """
    for file_path_str in file_paths:
        file_path = Path(file_path_str)

        if not file_path.exists():
            print(f"❌ File not found: {file_path}")
            continue

        if not file_path.is_file():
            print(f"⏭️  Skipping directory: {file_path}")
            continue

        try:
            # Read original content
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()

            # Filter comments
            filtered_content = filter_file_comments(original_content, keep_lang)

            # Check if changes were made
            if original_content == filtered_content:
                print(f"⏭️  No changes needed: {file_path}")
                continue

            if dry_run:
                print(f"📝 Would filter: {file_path} (keep {keep_lang})")
                # Show diff preview
                orig_lines = original_content.split('\n')
                filt_lines = filtered_content.split('\n')
                if len(orig_lines) != len(filt_lines):
                    print(f"   Lines: {len(orig_lines)} → {len(filt_lines)}")
            else:
                # Write filtered content back
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(filtered_content)
                print(f"✅ Filtered: {file_path} (kept {keep_lang})")

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Filter code comments to keep only specified language'
    )
    parser.add_argument(
        'files',
        nargs='+',
        help='Files to process (supports wildcards)'
    )
    parser.add_argument(
        '--keep',
        choices=['en', 'ru'],
        default='ru',
        help='Language to keep (default: ru)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )

    args = parser.parse_args()

    # Expand wildcards
    file_paths = []
    for pattern in args.files:
        if '*' in pattern or '?' in pattern:
            file_paths.extend(str(p) for p in Path('.').glob(pattern))
        else:
            file_paths.append(pattern)

    if not file_paths:
        print("❌ No files found")
        sys.exit(1)

    print(f"Processing {len(file_paths)} file(s), keeping {args.keep} comments...")
    if args.dry_run:
        print("(DRY RUN - no changes will be made)\n")

    process_files(file_paths, args.keep, args.dry_run)


if __name__ == '__main__':
    main()
