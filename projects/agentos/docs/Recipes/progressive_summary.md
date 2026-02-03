# Recipe — Progressive Line-Indexed Summary

## Why
Make large docs scannable and auditable with `L`-indexed navigation.

## Steps
1. Run NAV generator (once implemented) or manually note headings:
   - For each line with `#`, record `L<number>: heading`
2. Write summary file: `docs/Archive/<name>_summary.md`
   - Sections: Navigation Index (L markers), Highlights (bullets with `path:Lstart–Lend`), Next Actions, Related tasks
3. Cross-link summary from `docs/Archive/README.md` and curation task

## Edge Cases
- Adjust line numbers if headings shift; use editor to jump (`:<line>`)
- Use `path:Lstart–Lend` citations to support progressive reading

## Related
- Backlog: `docs/Backlog/progressive_nav_generator.md`
- Recipe example: `docs/SessionReports/2025-10-19_Ideas.md`
