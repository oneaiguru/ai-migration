# Archived Documents

Historical documentation from Session 1 and project planning phases.

## What's Here

All files in this directory use the `ARCHIVED_` prefix and represent:
- Session handoff notes (Sessions 1-3)
- Planning documents (before current BDD approach)
- Verification checklists (from old phases)
- Historical summaries

## Current vs. Archived

| File | Status | Use |
|------|--------|-----|
| PROMPT.md | Current | Source of truth (in ../analysis/) |
| PROGRESS.md | Current | Active backlog (in ../) |
| BDD_LINEAR_DEVELOPMENT.md | Current | Active methodology (in ../) |
| ARCHIVED_* | Historical | Reference/context only |

## Finding Archived Files

```bash
# List all archived files
find . -name "ARCHIVED_*"

# Search in archived files
grep -r "keyword" . --include="ARCHIVED_*"

# Exclude archived from search
grep -r "keyword" .. --exclude-dir=archived
```

## Archive Notes

Some files like `ARCHIVED_DOCUMENTATION_PLAN.md` and `ARCHIVED_IMPLEMENTATION_ROADMAP.md` have partial value:

- **DOCUMENTATION_PLAN.md**: Parts 1-4, 6 remain useful (database reference)
- **IMPLEMENTATION_ROADMAP.md**: Old Python/Textual plan (completely superseded)

See file headers for notes on what's outdated.

---

**Last Updated**: November 23, 2025 (Session 1 completion)
