---
name: message-file-splitter
description: Split large agent or chat markdown files that embed multiple file contents into extracted files plus interstitial garbage segments, generate a manifest for lossless recomposition, and validate code fence integrity. Use when parsing long message dumps into filesystem files and verifying reconstruction.
---

# Message File Splitter

## Quick start
1. Scan for fence issues: `python skills/message-file-splitter/scripts/message_split.py scan --input /path/to/message.md`
2. Decide header patterns (default or config file).
3. Split: `python skills/message-file-splitter/scripts/message_split.py split --input /path/to/message.md --out-dir /tmp/split_out`
4. Verify: `python skills/message-file-splitter/scripts/message_split.py verify --input /path/to/message.md --manifest /tmp/split_out/manifest.json`
5. Manually review extracted files under `/tmp/split_out/files` and move or apply as needed.

## Workflow
1. Inspect the message file and identify how file paths are labeled.
2. Use `scan` to catch broken or mixed fences (``` vs ~~~). Fix before splitting.
3. Update header regexes if the defaults do not match your file separators.
4. Run `split` to create:
   - `files/` extracted file contents
   - `segments/` literal interstitial parts
   - `manifest.json` for recomposition
5. Run `verify` and ensure byte-for-byte match.
6. Review extracted file paths and folder structure before integrating into a repo.

## Header patterns
Defaults (override with `--header-regex` or `--config`):
- `^###\\s*FILE:\\s*(?P<path>.+)$`
- `^##\\s*FILE:\\s*(?P<path>.+)$`
- `^#\\s*FILE:\\s*(?P<path>.+)$`
- `^//\\s*FILE:\\s*(?P<path>.+)$`
- `^--\\s*FILE\\s*:\\s*(?P<path>.+)$`
- `^FILE:\\s*(?P<path>.+)$`

Avoid overly generic patterns (like `^path:`) to prevent false positives inside code blocks.

## Config file (optional)
Use JSON (no dependencies). YAML is supported only if `pyyaml` is installed.

Example `split_config.json`:
```json
{
  "header_regexes": [
    "^###\\\\s*FILE:\\\\s*(?P<path>.+)$",
    "^FILE:\\\\s*(?P<path>.+)$"
  ],
  "strip_prefix": "/Users/m/ai/",
  "files_dir": "files",
  "segments_dir": "segments"
}
```

## Output structure
- `manifest.json`: ordered segments with paths used to recompose
- `files/`: extracted file contents at normalized paths
- `segments/`: garbage text between file blocks (including headers and fences)

## Success criteria
- `verify` reports identical byte count and checksum
- No missing or duplicated content after recomposition
- Extracted files live in expected folders under `files/`
