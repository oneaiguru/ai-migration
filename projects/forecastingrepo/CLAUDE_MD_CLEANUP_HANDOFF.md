# Handoff: CLAUDE.md Cleanup

## Context

The personal `~/CLAUDE.md` has been moved to `/Users/m/ai/projects/forecastingrepo/CLAUDE.new.md` (173 lines, 4KB).

The original repo `CLAUDE.md` (10 lines, 453 bytes) is preserved intact.

## Task

Clean up `CLAUDE.new.md` and merge it into `CLAUDE.md`:

1. **From CLAUDE.new.md, keep only what's relevant for the forecasting project**:
   - Remove: Context self-monitoring (50% threshold stuff) - this is user-level, not project-specific
   - Remove: BDD+CE methodology - this is general process, not specific to this project
   - Keep: Any project-specific quick start / context that might be there

2. **From CLAUDE.md (original), keep**:
   - Data handling rules
   - Any project-specific conventions

3. **Create a clean CLAUDE.md** that combines:
   - Project-specific info from original
   - Only relevant content from .new.md
   - Under 1-2 KB total

4. **Delete CLAUDE.new.md** once merged

## Files

- Working dir: `/Users/m/ai/projects/forecastingrepo`
- Original: `CLAUDE.md` (10 lines, 453 bytes) - KEEP
- New: `CLAUDE.new.md` (173 lines, 4KB) - merge relevant parts, then delete
- Tasks dir: `docs-internal/archive/rolling-cutoff-demo/` (check if exists)

## Validation

After cleanup:
- `CLAUDE.md` should be lean and project-specific
- `CLAUDE.new.md` should be deleted
- Only forecasting-relevant content remains
