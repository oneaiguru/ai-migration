# Progressive Line-Indexed Summaries

**Reference Example:** `/Users/m/Desktop/SUMMARYREPO/F/docs/EXPERIMENTAL_LINED_SUMMARY_3k.md`

## Key Traits
- Provide a quick navigation index using `L<line_number>` markers.
- Bullet summaries cite line ranges (e.g., `L28-33`) so readers can jump directly to source context.
- Intended for large reports where full reading is costly; enables targeted follow-up.

## Why We Adopt It
- Fits the autonomous long-session goal: next agents can focus on high-signal sections without rereading entire reports.
- Works with simple shell commands (`sed`, `grep`) or editor line navigation.

## How to Use in Archive Curation
1. Read the source document end-to-end.
2. Build an index of major headings / findings with approximate line numbers.
3. Produce a bullet summary referencing those line ranges.
4. Link back to the original file and indicate whether it lives in `docs/Archive/` or elsewhere.
5. Record the summary file path in `docs/Tasks/archive_curation.md` and update the archive README.

## Template
```
# <Report Title> — Line-Indexed Summary
Source: <path>

## Navigation Index
L1: ...
L10: ...

## Highlights
• L1-5: ...
• L10-18: ...

## Next Actions
- ...
```

## Next Steps
- Apply this format when summarizing the remaining deep-research reports listed in `docs/Tasks/archive_curation.md`.
- Update the methodology index (`docs/System/methodologies/README.md`) to include this workflow.
