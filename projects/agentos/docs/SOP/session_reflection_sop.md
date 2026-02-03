# SOP — Session Reflection & TLDR Storage

Purpose
- Capture a concise, operator-ready reflection (TLDR) after each session and store it in-repo so the next agent starts from a single, reliable summary. Tie the TLDR to plans, ledgers, and BDD outputs.

When
- At the end of every session, after validations and before drafting the next-session plan.

Where to Store
- Path: `docs/SessionReports/<YYYY-MM-DD>_TLDR.md`
- Index: Append the filename and brief note to `progress.md` and reference it in `docs/SESSION_HANDOFF.md`.

Required Contents
- TL;DR bullets (what changed, why)
- Token budget vs actual (if available)
- Features shipped (link scenarios)
- Open risks/blockers
- Pointers to plans/next steps

Checklist
1) Save TLDR to `docs/SessionReports/<date>_TLDR.md` (this session’s date).
2) Add a short entry to `progress.md` only for non‑routine outcomes (new decisions, deltas, exceptions). Do not re‑log routine SOP steps (UAT checks, TLDR ingestion, standard board/brief updates).
3) Update `docs/SESSION_HANDOFF.md` with a “Reflection” pointer.
4) Update ledgers (tokens/churn/features) if maintained in CSV form. For churn, append a row to
   `docs/Ledgers/Churn_Ledger.csv` using the `commit_start`/`commit_end` hashes recorded earlier and the
   diff statistics produced by `tracker churn`.
5) Draft the next-session plan under `plans/` (see `docs/SOP/next_session_planning_sop.md`).
6) Prepare the Next Agent brief and session board per `docs/SOP/next_agent_brief_sop.md`:
   - Create/update `docs/CurrentPlan/<NNN>_Agent_Brief.md` and `docs/CurrentPlan/<NNN>_PRO_TLDR.md` (sequential numbering).
   - Create/update `docs/SessionBoards/<NNN>_board.md` pointing at the Ready-Next block.
   - Link the new brief/board from `docs/SESSION_HANDOFF.md` and `progress.md`.
7) External TLDR ingestion (ask, then process): confirm with the operator whether to ingest `/Users/m/Desktop/TLDR.markdown`. If approved, process per `docs/SOP/external_tldr_ingestion_sop.md` — copy to `docs/CurrentPlan/<NNN>_PRO_TLDR.md` (sequential), extract actions into the brief/board/tasks, and add links to `docs/SESSION_HANDOFF.md`. Do not add a separate `progress.md` entry if this is routine ingestion without special notes.
8) Review bundle (for quick human review): copy all files changed this session into a flat review folder under Downloads.
   - Path: `/Users/m/Downloads/agentos_tmp_review`
   - Suggested command:
     ```bash
     REVIEW_DIR="$HOME/Downloads/agentos_tmp_review"
     mkdir -p "$REVIEW_DIR"
     git diff --name-only HEAD~4..HEAD | sed '/^$/d' > /tmp/agentos_changed_files.txt
     while IFS= read -r f; do [ -f "$f" ] && mkdir -p "$REVIEW_DIR/$(dirname "$f")" && cp "$f" "$REVIEW_DIR/$(dirname "$f")/"; done < /tmp/agentos_changed_files.txt
     { echo "Changed files (HEAD~4..HEAD):"; cat /tmp/agentos_changed_files.txt; echo; echo "Commit summaries:"; git --no-pager log -n 4 --pretty=format:'%h %ad %s' --date=iso; } > "$REVIEW_DIR/review_manifest.txt"
     ```
   - Preserve relative paths so reviewers can click into familiar locations. Overwrite previous bundle each session.

Minimal Logging Policy
- Progress and handoff documents should capture net changes, decisions, and exceptions—avoid repeating routine SOP steps each session.
- Examples of items to skip in `progress.md`: running the UAT opener, copying standard TLDRs/briefs/boards, routine alias snapshots. Include these only when there is an exception, failure, or a notable deviation.

Notes
- Keep docs flat; no deep nesting. Use clear dates and filenames.
- TLDRs may include line-anchored citations where useful: `path:Lstart–Lend`.
