# Phase 4: Stabilization & Large Account Support

## Problem Statement

The Things TUI **breaks with real-world scale**:
- Opening "Anytime" with 3000+ tasks causes UI corruption
- Blessed/terminal stack writes directly to alternate buffer (cannot be inspected via stdout)
- No BDD coverage for large-list behavior
- Technical limitations are undocumented

**This phase locks in "sane" behavior for production-scale data.**

---

## Goals

✅ TUI remains **readable and responsive** with 3000+ tasks  
✅ **Document stack limitations** explicitly  
✅ **BDD coverage** for large-list scenarios  
✅ **Future-proof** for real Things.app accounts  

---

## Tasks

### 1. Document Stack Limitations & Known Issues

Create two files:

#### `docs/STACK_LIMITATIONS.md`
Explain:
- Why we use Blessed (terminal TUI library)
- How Blessed works (alternate screen buffer)
- **Why LLM code tools cannot "see" the TUI via stdout**
- How to test TUI behavior: use `ThingsTUITestable` harness, not stdout capture
- Recommendation: automated checks go through BDD + test harness

#### `docs/LARGE_DATASET_NOTES.md`
Document:
- What happens today when opening "Anytime" with 3000+ tasks
- Current symptoms: corrupted output, overlapping text, frozen UI, etc.
- Performance characteristics: time to open, keypress latency
- Known workarounds: filters, search, smaller subsets
- Target behavior after fix: stable screen, visible status bar, smooth scrolling

### 2. Add BDD Feature for Large Anytime Lists

**File:** `features/anytime-large-lists.feature`

```gherkin
Feature: Viewing a large Anytime list
  As a user with thousands of tasks
  I want the Anytime list to remain readable and responsive
  So that I can still use the TUI with my real data

  Background:
    Given Things TUI is running with real data
    And my Things database has at least 3000 tasks in the "Anytime" list

  @large-anytime @stability
  Scenario: Opening Anytime with thousands of tasks shows a stable screen
    When I navigate to the "Anytime" list
    Then the UI should not show corrupted or overlapping output
    And only a single screenful of tasks should be visible
    And the status bar should be visible and readable
    And the status bar should include the total task count for "Anytime"

  @large-anytime @stability
  Scenario: Scrolling down through a large Anytime list stays responsive
    Given I am viewing the "Anytime" list
    When I press Down 20 times
    Then the selected task should move down with each keypress
    And the list should scroll smoothly without visual artifacts
    And the status bar should remain visible and readable
    And no keypress should take longer than 500ms to respond

  @large-anytime @stability
  Scenario: Only the visible window of tasks is rendered
    Given I am viewing the "Anytime" list
    Then the number of tasks rendered on screen should be at most 40 rows
    And off-screen tasks should not be rendered in the DOM
    And the status bar should show "N/M" (visible/total) task count

  @large-anytime @stability
  Scenario: Truncation is clearly communicated if used
    Given I am viewing the "Anytime" list
    And there are more than 500 tasks in "Anytime"
    Then the status bar should indicate "showing first 500 of 3000"
    And scrolling down should still work within the visible window
```

### 3. Implement Virtualized/Windowed Rendering

**Current behavior:** Renders all 3000 tasks every time  
**Target behavior:** Render only visible ~30-40 rows

#### Implementation Steps

1. **In `src/tui/app.ts` - `renderMainList()` method:**
   - Calculate visible window (rows 0 to ~40 based on screen height)
   - Slice `this.tasks` to only render visible tasks
   - Keep `this.selectedIndex` global but adjust display index

2. **Key variables to add:**
   ```typescript
   protected visibleWindowStart: number = 0;
   protected visibleWindowSize: number = 40; // or dynamic from screen height
   
   // In renderMainList():
   const visibleTasks = this.tasks.slice(
     this.visibleWindowStart,
     this.visibleWindowStart + this.visibleWindowSize
   );
   ```

3. **Scrolling logic:**
   - When user presses Down/Up, update both `selectedIndex` AND `visibleWindowStart`
   - Keep selected task always visible in the window
   - Auto-scroll window as needed

4. **Status bar update:**
   - Show: `"[visibleStart+1 to visibleStart+visibleSize] / totalTasks"` 
   - Or if truncated: `"showing first 500 of 3000"`

#### Acceptance Criteria

- Opening "Anytime" with 3000+ tasks: **immediate, no freeze**
- Keypress response: **< 500ms**
- Screen corruption: **zero**
- Status bar: **always visible and readable**
- Scrolling: **smooth and responsive**

### 4. Update AGENTS.md with Phase 4

Add to `AGENTS.md`:

```markdown
## Phase 4: Stabilization & Large Account Support (Current)

**Status:** In Progress  
**Focus:** Handle real-world accounts (3000+ tasks) without UI corruption  

**Key Files:**
- `src/tui/app.ts` - renderMainList() windowing
- `features/anytime-large-lists.feature` - BDD coverage
- `docs/STACK_LIMITATIONS.md` - Stack docs
- `docs/LARGE_DATASET_NOTES.md` - Known issues

**Success Criteria:**
- All `@stability` scenarios GREEN ✅
- No UI corruption with 3000+ Anytime tasks ✅
- Keypress response < 500ms ✅
- Coverage improved for TUI components ✅

**Next Phase:** Phase 3.4 (Edit Task) or Phase 4 (DB migration)
```

### 5. Record Final State

Update `PROGRESS.md`:

```markdown
## Phase 4: Stabilization (Current)

- [ ] 4.1 Document stack limitations
- [ ] 4.2 Add large-list BDD feature
- [ ] 4.3 Implement windowed rendering
- [ ] 4.4 All @stability scenarios GREEN
- [ ] 4.5 Update AGENTS.md + docs

Target: Handle 3000+ Anytime tasks gracefully
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Anytime 3000+ tasks opens | No freeze | TODO |
| Keypress response | < 500ms | TODO |
| Screen corruption | 0 instances | TODO |
| @stability scenarios | GREEN | TODO |
| TUI components coverage | > 20% | TODO |
| Docs complete | STACK_LIMITATIONS + LARGE_DATASET_NOTES | TODO |

---

## File Checklist

**Create:**
- [ ] `features/anytime-large-lists.feature`
- [ ] `docs/STACK_LIMITATIONS.md`
- [ ] `docs/LARGE_DATASET_NOTES.md`

**Modify:**
- [ ] `src/tui/app.ts` - renderMainList() windowing
- [ ] `AGENTS.md` - add Phase 4 section
- [ ] `PROGRESS.md` - update Phase 4 tasks

**Test:**
- [ ] `npm run test:bdd -- --tags="@stability"`
- [ ] `npm run test:coverage`
- [ ] `npm start` with real 3000+ Anytime tasks

---

## Context for Next Agent

**What broke:**  
When user opens "Anytime" with 3000+ tasks, Blessed tries to render all of them at once. The terminal buffer gets corrupted, the screen shows garbage, and keypresses hang.

**Why it happened:**  
`renderMainList()` builds a string with ALL 3000+ task lines, then passes to Blessed. Blessed writes all to buffer, terminal can't keep up.

**How to fix:**  
Render only visible window (~40 rows), keep full list in memory. Adjust `visibleWindowStart` during navigation.

**How to test:**  
Use BDD (@stability tag) + real Things database with 3000+ Anytime tasks. `ThingsTUITestable` harness will let you verify behavior without stdout inspection (Blessed makes that impossible).

---

## References

- `SESSION_SUMMARY_STYLING_REMOVAL.md` - Previous phase completion
- `NEXT_SESSION_HANDOFF_STYLING.md` - Styling phase notes
- `AGENTS.md` - Full project phases
- `src/tui/app.ts` - renderMainList() starting point
- `features/` - BDD test examples
