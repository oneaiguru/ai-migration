# SOP — Brainstorming & Backlog Capture (v1)

1. **Capture raw ideas**
   - Start a dated file under `docs/SessionReports/<YYYY-MM-DD>_Ideas.md`
   - Dump everything in bullet form; group by theme (telemetry, automation, stats, ops, docs)
2. **Triage & classify**
   - Label each idea as High/Medium/Low leverage; note dependencies or quick wins
   - Move candidates to backlog specs (`docs/Backlog/*.md`)
3. **Spec stub**
   - For each selected idea, create a stub spec with sections: Why, Contracts, Acceptance, Token Budget, Steps, Diagram
4. **Token budget**
   - Estimate cost (chars/4 heuristic or reuse known comps) and add to spec for planning
5. **Plan integration**
   - Update `plans/<date>_next_session.plan.md` with the new tasks and budgets
6. **Validate**
   - Ensure no placeholders remain (DoD compliance); references to contracts/anti-patterns added
7. **Communicate**
   - Log summarised decisions/risks in `docs/SessionReports/<date>_{Decisions,Risks}.md`
   - Update `progress.md` and `docs/SESSION_HANDOFF.md`

Quick Template
```markdown
- Theme: Telemetry
  - Idea: Unified timeline builder
    - Why:
    - Dependencies:
    - Token Budget:
    - Next Steps:
```
