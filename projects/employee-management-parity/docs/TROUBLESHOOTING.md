# Troubleshooting Guide (Repo-Specific)

Can’t find the right SOP?
1) Start here: `docs/START_HERE.md`
2) Check `PROGRESS.md` for active plan/role
3) Roles → SOPs:
   - Scout/Planner: `docs/SOP/code-change-plan-sop.md`
   - Executor: `docs/SOP/plan-execution-sop.md`
   - UAT: `docs/SOP/uat-delta-walkthrough-sop.md` or `docs/SOP/ui-walkthrough-checklist.md`

Plan references paths that don’t exist?
1) `git log --all --follow -- <old-path>`
2) `rg -n "symbol or title" src/`
3) If missing: log in `docs/SESSION_HANDOFF.md` (Blockers), mark `PROGRESS.md` → Blocked, return to Planner.

Tests fail but plan says they pass?
1) Confirm branch: `git branch --show-current`
2) Clean install: `npm ci`
3) Run one test: `npm run test -- --grep "name"`
4) Attach output to handoff; ping Planner if mismatch persists.

Deployed preview doesn’t show changes?
1) Verify commit pushed: `git log origin/main --oneline -3`
2) Check Vercel: `vercel ls`
3) Hard refresh; check feature flags if used

AI‑docs pointers look wrong?
1) Read the Scout discovery
2) Cross‑check `docs/System/ai-docs-index.md`
3) If wrong, note in handoff and request re‑discovery

Spinning in Scout↔Planner loop?
1) Create a “Working Session” doc to capture consensus and decisions
2) Update the relevant SOP with any process fix

Docs out of sync with reality?
1) Add an “SOP Update Needed” note in `docs/SESSION_HANDOFF.md`
2) File a task to update the doc; use fast‑path

Emergency Contacts
- Process: `docs/System/context-engineering.md`
- Current owner: see `PROGRESS.md`

