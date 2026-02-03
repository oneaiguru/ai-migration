# Context Engineering Workflow
## Research-Plan-Implement with Human Gates

The most effective teams converge on a three-phase workflow, each optimized for compression and human review. Each phase has an explicit human review gate before proceeding.

---

## The Framework Overview

```
Phase 1: Research
  ↓ (generate research.md)
  ↓
HUMAN REVIEW GATE ← Can be rejected/revised
  ↓ (if approved)
  ↓
Phase 2: Planning
  ↓ (generate plan.md with code snippets)
  ↓
HUMAN REVIEW GATE ← Can be rejected/revised
  ↓ (if approved)
  ↓
Phase 3: Implementation
  ↓ (execute plan step-by-step)
  ↓
FINAL REVIEW ← Verify build passes, tests pass
```

**Why this structure prevents wasted work**: If research is wrong, stop before planning. If planning is flawed, stop before implementation. Don't compound errors.

---

## Phase 1: Research - Understand the System

### Goal
Answer "How does this work?" without touching code.

### What Happens
- Agent explores codebase systematically
- Finds relevant files and their interactions
- Documents current state of the feature/area
- Does NOT suggest changes or make modifications

### Research Principles
- Keep things objective (no architectural opinions)
- Document facts, not interpretations
- Avoid implementation planning
- Research is compression of truth
- Goal: Human can understand the system from the markdown

### How to Invoke Research

Use focused steering to prevent agent from researching the entire codebase:

```
/research_codebase I'm implementing SCM provider integration—
specifically how Jira, Linear, and GitHub integrations work 
with our current system. Find and document:

- Where provider configs are stored
- How providers are initialized  
- What methods/interfaces they implement
- Edge cases and error handling patterns
- Test files that show current behavior
```

This focused steering keeps the agent objective and in the smart zone.

### Research Output Example

```markdown
## SCM Provider Integration - Current State

### Provider Configuration
File: src/config/providers/scm.ts (lines 12-47)
- Providers registered in PROVIDER_REGISTRY object
- Keys: 'jira', 'linear', 'github'
- Each provider requires: name, baseUrl, auth type

### Initialization Flow
File: src/services/scm/factory.ts (lines 89-156)
1. getProvider() called with provider name
2. Config loaded from config/providers/scm.ts
3. Provider class instantiated (polymorphic)
4. Returns provider instance

### Provider Interface
File: src/types/provider.ts (lines 1-34)
All providers implement:
- connect(config): Promise<boolean>
- getIssues(filters): Promise<Issue[]>
- createIssue(data): Promise<Issue>
- updateIssue(id, changes): Promise<Issue>

### Test Patterns
File: tests/providers/*.test.ts
- Mock config setup (lines 8-15)
- Mocked HTTP responses (lines 20-45)
- Interface compliance assertions

### Edge Cases Found
- Linear: Project key required for URL construction
- Jira: Duplicate issue key handling (custom field)
- GitHub: PAT token validation on connect
```

### Context Consumption
Moderate (file reads, targeted searches)

### Output Expectations
- **research.md**: 300-1000 lines
- If <100 lines: haven't understood the system
- If >2000 lines: documenting implementation details instead of understanding

### Research Complete Checklist
- [ ] Can someone unfamiliar with this code understand how it works?
- [ ] Are file paths and line numbers specific?
- [ ] Are edge cases documented?
- [ ] Is anything subjective or opinionated?
- [ ] Does this answer the original research question?

---

## Phase 2: Planning - How We'll Fix It

### Goal
Outline exact steps before implementing. Include actual code snippets.

### What Happens
- Takes research output + requirements/bug report
- Creates step-by-step plan with specific file changes
- Includes actual code snippets of what will change
- Specifies test strategy after each change
- Human reviews for correctness before implementation

### Planning Principles
- Be explicit about implementation steps (no hand-waving)
- Include filenames, line numbers, and code snippets
- Specify test strategy after each change
- Planning is leverage through compression of intent
- Code snippets prevent hallucination

### Example Plan

```markdown
## Plan: Add Bash Icon Display to Message Stream

### Context
Current: ConversationContent.tsx shows generic wrench icon for all tool outputs
Desired: Show terminal icon for Bash commands (matches modal behavior)

### Step 1: Add Icon Mapping
File: ConversationContent.tsx, after line 76

BEFORE:
const defaultIcon = <wrench />

AFTER:
const iconMap = {
  bash: <Terminal />,
  python: <FileCode />,
  default: <wrench />
}

TEST: Build succeeds, no type errors

### Step 2: Update Event Display
File: ConversationContent.tsx, line 103

Change:
const display = eventToDisplayObject(event)

To:
const display = eventToDisplayObject(event, { iconMap })

Then update eventToDisplayObject function (line 76) to accept iconMap parameter

TEST: npm test ConversationContent.spec.tsx passes

### Step 3: Manual Verification
- Browser: Execute /bash echo "test"
- Verify: Terminal icon displays in stream
- Verify: Wrench icon shows for other tools
- Verify: Modal still works (regression check)
```

### Context Consumption
Low (mostly reasoning about existing research)

### Output Expectations
- **plan.md**: 300-1000 lines
- Include filenames and line numbers
- Include code snippets (not pseudocode)
- Include test strategy for each step

### Plan Complete Checklist
- [ ] Could another developer execute this plan without asking questions?
- [ ] Are all changes specific (not "improve X" but "modify lines 45-50")?
- [ ] Are code snippets copy-paste ready?
- [ ] Is test strategy clear?
- [ ] Does this match the research findings?

### Beware of Dopamine Flywheels

Watch out for tools that just spew out markdown files to make you feel productive. Generating documentation feels good. It releases dopamine. But if that documentation isn't tied to real human review and decision-making, it's just producing the illusion of progress.

The compaction process should feel intentional and slightly tedious—because you're doing the hard thinking work that actually matters.

---

## Phase 3: Implementation - Execute the Plan

### Goal
Follow the plan exactly. No creativity. Mechanical execution.

### What Happens
- Agent follows plan step-by-step
- Makes exact changes specified
- Runs tests after each change
- Reports success/failure
- If blocked, escalates to human (doesn't deviate)

### The Implementation Principle

> "If properly planned, the implementation is easy and expected."

If implementation reveals surprises, your plan was incomplete. This is valuable feedback—it means you need to revise and re-plan, not hack around it.

### Context Consumption
Low (plan drives decisions, no research needed)

### Implementation Success Criteria

Implementation isn't done until verified:

**Automated Verification**:
- Type checking passes: `make check`
- Linting passes: `make lint`
- Build completes: `make build`
- Test suite passes: `npm test`

**Manual Verification**:
- Feature works as expected
- No regressions in related areas
- UI/UX matches requirements
- Error cases handled gracefully

### The Updated TODOs Pattern

During implementation, maintain an "Updated TODOs" section showing progress:

```markdown
## Step 1: Add Icon Mapping
COMPLETE

## Updated TODOs

Now I'm implementing the icon mapping parameter...

---

> npm test ConversationContent.spec.tsx
PASS: 5 tests, 0 failures

## Updated TODOs

Perfect! Icon mapping works. Moving to Step 2...
```

This pattern provides visibility into forward progress and prevents confusion about status.

### Implementation Complete Checklist
- [ ] All steps from plan completed
- [ ] All tests passing
- [ ] No emergencies or workarounds
- [ ] Code reviewed and ready
- [ ] Matches requirements

---

## Complexity Scaling

Not every task needs full Research-Plan-Implement.

### The Investment Curve

**Button color change**
→ Just talk to the agent
→ No research/plan needed

**Simple feature (single file)**
→ Quick research + small plan
→ 30 min total

**Medium feature (2-3 files, one area)**
→ Research + structured plan
→ 1-2 hours total

**Complex feature (multiple areas, 5+ files)**
→ Full research-plan-implement cycle
→ Multiple researches if needed
→ 3-8 hours total

**Architectural change (entire system)**
→ Multiple specialized sub-agents
→ Staged research phases
→ Peer review at plan stage
→ 8+ hours or human-led

### Decision Tree

1. Know the system well? → Skip research, go to planning
2. Simple isolated change? → Minimal plan, execute
3. Complex cross-system? → Full research-plan-implement
4. Don't understand the impact? → Do the research first

---

## Human Review Gates - The Leverage Points

Review effort should be highest at the beginning, lowest at the end.

### Cost Hierarchy
- **Bad Research** = 1000s of bad lines of code (compounds downstream)
- **Bad Plan** = 10s-100s of bad lines of code (wrong approach)
- **Bad Implementation** = 1 bad line (mechanical fix, takes 1 minute)

**Your time belongs on research and plan review, not code review.**

### Research Review Checklist
- [ ] Does this match the actual system?
- [ ] Are edge cases documented?
- [ ] Is anything subjective?
- [ ] Is this complete enough to plan from?

Takes: 10-15 minutes per research doc
Impact: Prevents 4+ hours of wasted implementation work

### Plan Review Checklist
- [ ] Are the steps in the right order?
- [ ] Are code snippets correct?
- [ ] Is the test strategy complete?
- [ ] Would this approach work?

Takes: 15-20 minutes per plan doc
Impact: Prevents 2+ hours of implementation rework

### Code Review Checklist
- [ ] Tests passing?
- [ ] Matches plan?
- [ ] No obvious bugs?

Takes: 5-10 minutes
Impact: Catches typos, not architecture problems

---

## Sub-Agents for Compression

For complex codebases, use specialized sub-agents to keep parent context fresh:

### How It Works

Parent agent task: "Find where the notification system handles user preferences"

Instead of parent agent searching 80k tokens:

1. Spawn specialized subagent with fresh context
2. Give it specific task: "Find how notificationPrefs are queried"
3. Subagent uses full smart zone just for searching/reading
4. Returns: "File: src/services/notifications/preferences.ts:42-89"
5. Parent gets 100-token summary instead of 50k tokens

**Result**: Parent agent still has 130k+ tokens available for implementation

### Ideal Subagent Response
- 100-500 tokens
- Specific file paths and line numbers
- Exact code location, not exploration narrative
- Ready for parent to use immediately

### Sub-Agent Specializations
- **Codebase Locator**: Finds relevant files by pattern matching
- **Codebase Analyzer**: Understands relationships and dependencies
- **Pattern Finder**: Identifies implementation patterns and conventions
- **Main Orchestrator**: Synthesizes findings into structured research.md

---

## Real World Example: BAML (7 Hours, 35k Lines)

### The Challenge
- Target: Major feature in 300k-line Rust codebase
- Duration: 7 hours of continuous work
- Complexity: Feature implementation with zero slop

### What Happened

**First attempt** (Wrong):
- Direct implementation without research
- Generated code, wrong approach
- Context spiraled, threw it away

**Second attempt** (Right):
- Research phase: understood type system and feature composition
- Plan phase: step-by-step with code snippets
- Implementation phase: executed methodically, tests passed

### Result
- 35k lines shipped (mostly codegen for test files)
- Core logic validated
- PR merged without notes
- Zero rework

### Why It Worked
The team didn't ask AI to "build a feature." They built a compressing framework that:
1. Kept everyone aligned
2. Kept the model in the smart zone throughout
3. Prevented compounding errors

---

## Workflow Complete Checklist

Before starting any feature:
- [ ] Understand: Greenfield or brownfield?
- [ ] Understand: How many people need to stay aligned?
- [ ] Understand: What complexity level?
- [ ] Execute: Research phase (with human feedback)
- [ ] Execute: Plan phase (with human approval)
- [ ] Execute: Implementation phase
- [ ] Verify: All tests passing
- [ ] Document: What was learned

---

## The Critical Insight

The hard work of thinking can't be outsourced to AI, only amplified by it.

Research and planning ARE the thinking. Implementation is mechanical.

If you delegate all thinking to the agent, you'll amplify nothing but your own confusion.

Master this workflow, and you solve hard problems. Skip it, and you spiral on simple ones.
