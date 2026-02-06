# Troubleshooting Guide

## "I don't know which SOP to follow"
**Symptom**: Confused about process for current task

**Solution**:
1. Check `docs/START_HERE.md` decision tree
2. Look at PROGRESS.md for active plan
3. Your role determines your entry point:
   - Scout? → Read `code-change-plan-sop.md` (Exploration section)
   - Planner? → Read `code-change-plan-sop.md` (Planning section)  
   - Executor? → Read `plan-execution-sop.md`
   - UAT? → Read `uat-delta-walkthrough-sop.md`

---

## "The plan I need to execute references files that don't exist"
**Symptom**: Plan has outdated file paths

**Solution**:
1. Check if files moved: `git log --all --follow -- <old-path>`
2. Search for content: `grep -r "key function name" src/`
3. If truly missing:
   - Document in SESSION_HANDOFF.md under "🚧 Blockers"
   - Switch PROGRESS.md status to "Blocked"
   - Hand off to Planner for plan revision

---

## "Tests are failing but the plan says they should pass"
**Symptom**: Validation step fails unexpectedly

**Solution**:
1. Check if you're on the right branch: `git branch --show-current`
2. Verify dependencies: `npm ci` (clean install)
3. Check for conflicting changes: `git log --oneline -5`
4. Run single test: `npm run test -- --grep "specific test name"`
5. If still failing:
   - Capture test output: `npm run test &> test-failure.log`
   - Document in SESSION_HANDOFF.md
   - Mark plan step as "Failed" with evidence
   - Hand off to original Planner

---

## "I made changes but they're not visible in the deployed preview"
**Symptom**: Changes don't appear after deployment

**Solution**:
1. Verify commit pushed: `git log origin/main --oneline -3`
2. Check Vercel deployment status: `vercel ls`
3. Clear browser cache: Hard refresh (Cmd+Shift+R)
4. Check if feature is behind flag: Review `src/utils/featureFlags.ts`
5. Verify correct build: Check `package.json` version matches deployed version

---

## "The AI-docs references in the plan don't make sense"
**Symptom**: Plan cites `ai-docs/` files that seem unrelated

**Solution**:
1. Read the Scout's discovery doc to understand context
2. Check `ai-docs/MANIFEST.md` for current structure
3. If truly wrong:
   - Document in SESSION_HANDOFF.md  
   - Send back to Scout for re-discovery
   - Update `docs/System/ai-docs-index.md` if structure changed

---

## "I'm stuck in a Scout→Planner→Scout loop"
**Symptom**: Plans keep getting rejected and sent back

**Solution**:
1. Schedule a sync meeting (don't iterate async)
2. Create a "working session" doc:
   ```markdown
   # Working Session: [Issue]
   Participants: Scout, Planner, (Executor)
   
   ## What we agree on:
   - [List uncontroversial facts]
   
   ## What we disagree on:
   - [List specific disagreements]
   
   ## Decisions made:
   - [Document consensus]
   ```
3. Update relevant SOPs if process is broken

---

## "Documentation is out of sync with reality"
**Symptom**: SOPs describe steps that don't match current workflow

**Solution**:
1. Document the delta in SESSION_HANDOFF.md:
   ```
   ### 📝 SOP Update Needed
   - Doc: `docs/SOP/X.md`
   - Current step: "Do Y"
   - Reality: "We actually do Z now"
   - Reason: [Why it changed]
   ```
2. Create a task: "Update SOP: X"
3. Follow fast-path process (docs changes)
4. Don't let it linger >1 week

---

## "I'm spending more time documenting than executing"
**Symptom**: Handoff updates take longer than the work

**Solution**:
1. Use the templates in `artifacts/` (handoff, validation, plan)
2. Set a timer: 15 min max for handoff entry
3. Focus on essentials:
   - What changed (file:line)
   - What to do next
   - Any blockers
4. If still too slow, propose a simplified template

---

## "Plan says 'Executor updates PROGRESS.md' but I'm the Executor and don't know what to write"
**Symptom**: Unclear handoff expectations

**Solution**:
Standard PROGRESS.md update:
```markdown
## Phase [N]: [Name]
Status: In Progress → [Completed | Blocked | Ready for UAT]
Last Updated: YYYY-MM-DD
Owner: [Your name/role]

Recent Changes:
- [Thing 1 with file reference]
- [Thing 2 with file reference]

Next Actions:
- [Specific next step]
```

---

## Emergency Contacts
- Process questions → Check `docs/System/context-engineering.md`
- Technical blockers → Check PROGRESS.md for current owner
- Urgent issues → [Add escalation contact]
