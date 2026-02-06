# SOP – Browser-Agent Stage 6 UAT Workflow

This SOP documents how to run Stage 6 AI UAT with ChatGPT’s browsing/agent mode. The goal is to confirm production behaviour on the latest Vercel build against the legacy reference without touching code or attempting remote Playwright runs. The browser agent can only interact with publicly reachable deployments (Vercel preview/prod); it has **no access** to local file systems, tunnels, or our development VMs. Always deploy first, then hand the public URL to the agent. After every production deploy, create or refresh a timestamped prompt file under `ai-uat/` (e.g. `ai-uat-agent-tasks/2025-10-08_stage6_agent_prompt.txt`) and paste that single message into the ChatGPT session.

## Single Prompt Contents
The prompt file should include:

1. Purpose: compare the latest production build (`nsp559gx9`) with the legacy reference (`7b28yt9nh`) using the Stage 6 checklist.
2. URLs to open: latest production and legacy reference.
3. Explicit instruction to view the pages in the browser UI (no shell/HTML dumps) and cover the Stage 6 change list (import modal copy, bulk-edit team dropdown, tag manager highlight, KPI rounding).
4. Instructions to log pass/fail notes in the checklist and summarise outcomes in the handoff/TODO docs.
5. Guardrails: manual verification only; no Playwright; do not alter numbering; stop if blocked.

## Handling Blockers
If the agent reports an external blocker (e.g., DNS/network failure), capture the message in:
- `docs/Tasks/stage-6-ai-uat-checklist.md` (note the section and timestamp)
- `docs/SESSION_HANDOFF.md` (Stage 6 log)
- `docs/TODO_AGENT.md` (add a rerun reminder)

Do **not** attempt to “fix” the blocker by hacking new configs or hitting production with automated tests—wait for the environment issue to be resolved and rerun the checklist.

## After Successful UAT
Once manual comparisons pass:
1. Run local validations: `npm run build` and `npm run test -- --project=chromium --workers=1 --grep "Import"`.
2. Deploy via `vercel deploy --prod --yes`.
3. Update `docs/SESSION_HANDOFF.md` with the new URL and mark TODO items complete.

The single-prompt approach keeps context tight, prevents redundant status summaries, and avoids the erroneous Playwright-on-production attempts we observed.
