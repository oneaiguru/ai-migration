# PROJECT_ASSESSMENT_PROGRESS.md

## Goal
Create a thin, repo-wide project inventory and a <=20-file “context pack” that an intermediate agent can read to prepare an Opus-ready assets overview (Opus has no filesystem access).

## Working Rules (Scout-Only)
- Prefer referencing selected full files over rewriting their contents.
- If a project is covered by a context-pack file, keep the catalog entry to 1–3 lines and point to that file.
- “Compaction” convention: if only summaries remain, the reader must load all files listed in the context pack to recover full detail.

## Outputs
- `docs/PROJECT_CATALOG.md` — thin pass across `projects/*` (all projects, minimal prose).
- `docs/CONTEXT_PACK_20_FILES.md` — curated <=20 files (paths + why each file matters).

## Plan
1. Thin-pass profile all `projects/*`
2. Write `docs/PROJECT_CATALOG.md`
3. Select <=20 high-signal files
4. Write `docs/CONTEXT_PACK_20_FILES.md`
5. Optional: add “extra folders” (wiki/replica/SUMMARYREPO) if they materially improve the <=20 pack

## Log
- 2026-01-01: Started thin-pass profiling of `projects/*` and began identifying candidate high-signal files.
- 2026-01-01: Drafted `docs/PROJECT_CATALOG.md` and selected a <=20 file “context pack” (see `docs/CONTEXT_PACK_20_FILES.md`).
- 2026-01-01: Ran a thin pass over `/Users/m/wiki` and `SUMMARYREPO` and recorded swap candidates in `docs/EXTRA_FOLDERS_CANDIDATES.md`.
