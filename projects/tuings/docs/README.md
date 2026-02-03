# Things TUI Documentation

Complete reference for the Things TUI Clone project.

## Product Documentation

Learn how Things.app works and how features map to the TUI:

- **[Core Features](./product/core-features/)** - Tags, shortcuts, scheduling, search, notes (7 docs)
- **[Data Export](./product/data-export/)** - Database structure, AppleScript, URL schemes (3 docs)
- **[User Experience](./product/user-experience/)** - Workflows, prioritization, patterns (5 docs)
- **[Reference](./product/reference/)** - Markdown guide, AppleScript PDF (2 files)

## Analysis & Planning

Strategy documents and database reference:

- **[PROMPT.md](./analysis/PROMPT.md)** - Current project requirements (SOURCE OF TRUTH)
- **[DATABASE_EXTRACTION_GUIDE.md](./analysis/DATABASE_EXTRACTION_GUIDE.md)** - SQL queries, database schema
- **[Archived Analysis](./analysis/)** - Session 1 strategy documents

## Visual Reference

- **[Screenshots](./screenshots/)** - 25 UI mockups and workflows
- **[Screenshot Index](./screenshots/SCREENSHOT_INDEX.md)** - Categorized guide

## External References

- **[Reference Repositories](./REFERENCE_REPOS.md)** - GitHub links to external MCP implementations
- **[Archived Documents](./archived/)** - Session notes and historical planning

## Quick Links

- **Getting Started**: See main README.md
- **Development Workflow**: See ../AGENTS.md
- **Feature Progress**: See ../PROGRESS.md
- **PR Workflow**: See ../PULL_REQUEST_WORKFLOW.md
- **BDD Methodology**: See ../BDD_LINEAR_DEVELOPMENT.md

---

**Archive Strategy**: All archived files use `ARCHIVED_` prefix for easy grepping:
```bash
grep -r "ARCHIVED_" docs/
find docs/archived -name "ARCHIVED_*"
```
