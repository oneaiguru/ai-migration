# Ralph Loop Template

Reusable starter for the Ralph build loop (T/R/P/I). Derived from the aa repo.
Customize before first run.

Quick start
1. Read CUSTOMIZE_BEFORE_RUN.md and fill PROJECT_BRIEF.md, AGENTS.md, PROMPT_build.md, PROMPT_plan.md, IMPLEMENTATION_PLAN.md.
2. Run the plan loop once to seed the backlog: `./loop.sh plan 1`.
3. Run the build loop to create the first task (T): `./loop.sh 1`.
4. Run one role per loop; stop after each role.
5. Log work in docs/SESSION_HANDOFF.md and archive completed tasks in progress.md.

Files you will edit
- AGENTS.md: repo-specific commands and guardrails.
- PROJECT_BRIEF.md: single source of truth for repo context and goal.
- PROMPT_build.md: build loop rules and project goal.
- PROMPT_plan.md: plan loop rules and constraints.
- IMPLEMENTATION_PLAN.md: backlog and priorities.
- docs/SESSION_HANDOFF.md: loop handoff log.

Template sources
- docs/SOP/ralph_loop.md
- docs/SOP/loop_start.md
- docs/Tasks/README.md
- docs/Tasks/templates/*
