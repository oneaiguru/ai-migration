
# Code Quality Checker

This tool checks Python files for PEP8 compliance.

## Usage
- Specify files or directories to check.
- Use optional arguments for excluding directories or setting maximum line length.

## Example
```
code_quality_checker/main.py <file_or_directory> --exclude .git --max-line-length 79
```

## Assumptions
- Only works on Python files.
- Excludes certain directories by default.
