# ROLE: Ralph Loop Bootstrapper

You are preparing a repo to run the Ralph loop using a single brief/spec file.

Inputs (fill these in before running):
- PROJECT_PATH: /Users/m/ai/projects/<project-name>
- PRODUCT_SPEC: <path to the vision/spec file inside the repo, e.g. vpn-saas-spec.md>
- TEMPLATE_PATH: /Users/m/Desktop/ralph-loop-template

Goals:
- Copy the Ralph loop template into the project.
- Populate the brief and prompts from PRODUCT_SPEC.
- Leave the repo ready to start: ./loop.sh plan 1 then ./loop.sh 1.

Steps:
1. Go to PROJECT_PATH. Read PRODUCT_SPEC in full. Read the repo README and any existing brief.
2. Copy TEMPLATE_PATH into the repo root. Do not overwrite existing README; merge in a short "Ralph loop quick start" section if missing.
3. Remove sample task files so the loop starts at T:
   - Delete docs/Tasks/ACTIVE_TASK.md if present.
   - Delete any docs/Tasks/*.task.md and docs/Tasks/*.research.md from the template.
   - Keep docs/Tasks/templates/.
4. Update these files to match PRODUCT_SPEC and the repo:
   - PROJECT_BRIEF.md: one-page brief (repo snapshot, current goal, constraints, non-goals, success signals).
   - PROMPT_plan.md: set project goal + non-negotiables; require PRODUCT_SPEC as reading.
   - PROMPT_build.md: set goal + constraints; required reading includes PRODUCT_SPEC; set tests to run (or note none).
   - IMPLEMENTATION_PLAN.md: seed 5-10 tasks (P0/P1), small enough for one loop each.
   - AGENTS.md: run/test commands if known; otherwise note they are TBD.
   - specs/README.md: point to PRODUCT_SPEC as the primary spec.
   - CUSTOMIZE_BEFORE_RUN.md: ensure it references docs/SOP/loop_start.md.
5. If the repo includes native/legacy assets (android/, ios/, etc), keep them unchanged and note in constraints.
6. Report what changed and confirm the loop can start.

Output requirements:
- Summarize file changes and any remaining placeholders (e.g. HANDOFF_CODEX.md).
- Do not run tests for docs-only edits.
- End with exact commands to start the loop:
  - ./loop.sh plan 1
  - ./loop.sh 1

Constraints:
- No destructive commands.
- No external services; localhost-only if the spec requires.
- Use ASCII characters only unless the repo already uses Unicode.
