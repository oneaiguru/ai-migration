# EXTRA_FOLDERS_CANDIDATES.md

## Purpose
Thin scout pass over “extra folders” outside `projects/` to avoid missing high-signal assets. This does not expand the <=20 context pack unless a swap is explicitly made.

## Inventory (counts)
- `/Users/m/wiki`: ~381 markdown files
- `/Users/m/Documents/_move_back/desktop_fiols/New Folder With Items 5/SUMMARYREPO`: ~305 markdown/txt files

## High-signal candidates (not in the <=20 pack yet)

### Wiki (`/Users/m/wiki`)
- `/Users/m/wiki/dotfiles/ClaudeMITM-Flow.md` — detailed operational flow diagrams + commands for Claude proxy routing (includes Z.ai offload lane).
- `/Users/m/wiki/dotfiles/ClaudeProxy-QuickStart.md` — shortest “bring-up” runbook for proxy usage + log proofs.
- `/Users/m/wiki/ARCHIVARIUS_WIKI_PLUGIN.md` — blueprint for treating a wiki as L1/L2/L3 memory with query/update/navigation interfaces.
- `/Users/m/wiki/inbox/proxy2AGI.markdown` — rough (ASR-ish) but conceptually dense notes on “trajectory value capture + incentives + provenance” (more vision than implementation).
- `/Users/m/wiki/patterns/ParallelAgents.md` — patterns for running multiple agents in parallel (process/ops knowledge).

### SUMMARYREPO (`/Users/m/Documents/_move_back/desktop_fiols/New Folder With Items 5/SUMMARYREPO`)
- `/Users/m/Documents/_move_back/desktop_fiols/New Folder With Items 5/SUMMARYREPO/SESSION_COMPLETION_SUMMARY.md` — KB-based compaction system for summaries with hooks/BDD validation (context hygiene tooling, not product code).
- `/Users/m/Documents/_move_back/desktop_fiols/New Folder With Items 5/SUMMARYREPO/CURRENT_SYSTEM/CLAUDE.md` — pointers to where the “active implementation” lives inside that repository’s structure.
- `/Users/m/Documents/_move_back/desktop_fiols/New Folder With Items 5/SUMMARYREPO/.claude/UPDATE_INSTRUCTIONS.md` — detailed update instructions for a file-processing hook (note: file header says KB supersedes token-based naming).

## Recommendation
- Keep the <=20 pack as-is for the Opus “asset proof” workflow; treat wiki/SUMMARYREPO as Pack v2 candidates unless the intermediate agent needs more depth on proxy operations or trajectory monetization narrative.
