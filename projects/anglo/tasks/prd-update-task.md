# Task: PRD Update from prdupd.txt

Goal
- Create a new PRD version from the provided update file, while preserving the current PRD.

Files
- Source update: prdupd.txt (provided update file)
- Current PRD (keep unchanged): projects/anglo/PRD_Enhanced.md
- New PRD version (create): projects/anglo/PRD_Enhanced_v1_1.md

Versioning rules
- projects/anglo/PRD_Enhanced.md = current baseline (v1.0).
- projects/anglo/PRD_Enhanced_v1_1.md = new updated version from prdupd.txt.
- Future updates: increment suffix (v1_2, v1_3, etc). Do not overwrite prior versions.

Steps
1) Copy the update file into the repo and rename it:
   - cp <path-to-prdupd.txt> projects/anglo/PRD_Enhanced_v1_1.md
2) Edit projects/anglo/PRD_Enhanced_v1_1.md to fully apply the updates from prdupd.txt.
3) Do not change projects/anglo/PRD_Enhanced.md.
4) Keep scope limited to projects/anglo/PRD_Enhanced_v1_1.md only.

Commit
- Commit message: docs(anglo): add PRD v1.1 from prdupd

Notes
- This task is intended to run in parallel with other phase-task edits, so avoid touching any task files.
