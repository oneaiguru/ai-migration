# Completion Persistence Handoff – Fix 2 Critical Issues

**Status**: 🔴 P1 + P2 Issues Blocking PR #43
**Branch**: feat/3.2-mark-complete
**Codex Comments**: 2 issues identified, exact fixes needed

---

## Quick Summary

Pressing 'c' marks tasks complete in memory only. Changes aren't persisted to Things, and UI assertions don't verify visual feedback.

**2 Issues:**
1. **P1**: Completion not saved to database (in-memory only, reverts on refresh)
2. **P2**: Step assertions don't check for visual indicators (strikethrough, grey)

---

## Files to Read (in order)

1. **`src/tui/app.ts`** (lines 615-624)
   - Current `toggleTaskCompletion()` - modifies in-memory only
   - No Things URL call, no reload

2. **`src/database/things-db.ts`** (search for `markTaskComplete` or similar)
   - Check if completion method exists
   - Look for URL scheme usage pattern

3. **`features/mark-complete.feature`** (all scenarios)
   - Read what behavior is expected
   - Understand each scenario requirement

4. **`features/step_definitions/common.steps.ts`** (lines 377-379)
   - Current weak assertion for "task shows completed indicator"
   - See how other assertions check visual state (e.g., strikethrough)

5. **`src/tui/components.ts`** (search for rendering logic)
   - Find where task display is rendered
   - Look for status check (status === 2)
   - Find strikethrough/grey styling logic

---

## Issue 1: P1 – Completion Not Persisted

### Problem
`toggleTaskCompletion()` at lines 615-624 in `src/tui/app.ts`:
- Changes `task.status = 2` in memory
- Doesn't call Things URL scheme
- Doesn't reload tasks from DB
- User refreshes → task reverts to status 0

### Root Cause
The method updates `this.tasks[index]` but never:
1. Calls Things URL to mark complete
2. Reloads from database
3. Syncs with Things app

### Fix Required

**File: `src/tui/app.ts`, lines 615-624**

Replace current:
```typescript
protected toggleTaskCompletion(index: number): void {
  const task = this.tasks[index];
  if (task) {
    // Toggle between active (0) and completed (2)
    const oldStatus = task.status;
    task.status = task.status === 0 ? 2 : 0;
    // Move selection to next task if completing
    if (task.status === 2 && index < this.tasks.length - 1) {
      this.selectedIndex = index + 1;
    }
  }
}
```

With:
```typescript
protected toggleTaskCompletion(index: number): void {
  const task = this.tasks[index];
  if (task) {
    const isCompleting = task.status === 0;
    
    // Call Things URL scheme to persist change
    if (isCompleting) {
      // Mark complete in Things
      this.db.markTaskComplete(task.id);
    } else {
      // Mark incomplete in Things
      this.db.markTaskIncomplete(task.id);
    }
    
    // Update in-memory state to match
    task.status = isCompleting ? 2 : 0;
    
    // Move selection to next task if completing
    if (isCompleting && index < this.tasks.length - 1) {
      this.selectedIndex = index + 1;
    }
    
    // Wait for Things to update database, then reload
    setTimeout(() => {
      this.loadTasks();
      this.render();
    }, 500);
  }
}
```

### Required Methods in `things-db.ts`

Check if these exist in `src/database/things-db.ts`. If not, add them:

```typescript
public markTaskComplete(taskId: string): void {
  const task = this.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  // Things URL scheme: things://complete?id=<taskId>
  const url = `things:///complete?id=${encodeURIComponent(taskId)}`;
  // macOS: open -a Things "${url}"
  // or use: exec(`open -a Things "${url}"`)
}

public markTaskIncomplete(taskId: string): void {
  const task = this.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  // Things URL scheme: things://incomplete?id=<taskId>
  const url = `things:///incomplete?id=${encodeURIComponent(taskId)}`;
  // exec(`open -a Things "${url}"`)
}
```

---

## Issue 2: P2 – Step Assertions Don't Verify UI

### Problem
Step at lines 377-379 in `features/step_definitions/common.steps.ts`:
```typescript
Then('task shows completed indicator', async function() {
  const content = context.tui!.getMainListContent();
  expect(content).to.exist;
});
```

- Only checks if content exists
- Doesn't verify strikethrough, grey color, or any visual change
- Test passes even if no indicator rendered

### Root Cause
Assertion is too weak. Should check:
1. Task text has strikethrough styling
2. Task is greyed out
3. Status changed in detail view

### Fix Required

**File: `features/step_definitions/common.steps.ts`, lines 377-379**

Replace with:
```typescript
Then('task shows completed indicator', async function() {
  const task = context.tui!.getSelectedTask();
  expect(task).to.exist;
  expect(task!.status).to.equal(2); // Verify status is 2 (completed)
  
  // Check main list content includes visual indicator
  const content = context.tui!.getMainListContent();
  expect(content).to.include('✓'); // or whatever strikethrough symbol used
  // or expect(content).to.match(/strikethrough|grey|inactive/);
});
```

### Also Update Detail View Assertion

Find step: "task shows completed indicator in detail view" or similar

Should check:
```typescript
Then('completed task shows visual distinction', async function() {
  const detail = context.tui!.getDetailViewContent();
  expect(detail).to.exist;
  
  // Verify "Completed" text appears
  expect(detail).to.include('Completed');
  
  // Verify not "Cancelled" or "Active"
  expect(detail).not.to.include('Active');
});
```

---

## Testing Plan

After fixes:

1. **Unit test the persistence**
   ```bash
   npm run test:bdd -- --tags="@leaf_3_2"
   # Should see all 7 mark-complete scenarios passing
   ```

2. **Verify persistence works**
   ```bash
   # Open Things app alongside
   npm run test:bdd -- --tags="mark-complete"
   # Watch for "marked complete" flows
   # Task should NOT revert on refresh
   ```

3. **Check all scenarios pass**
   ```bash
   npm run test:bdd
   # All 38+ scenarios should pass
   ```

4. **Check coverage maintained**
   ```bash
   npm run test:coverage
   # Should be ≥ 47% (no regression)
   ```

---

## Exact File Changes Summary

| File | Lines | Change | Type |
|------|-------|--------|------|
| src/tui/app.ts | 615-624 | Replace toggleTaskCompletion() with DB calls | P1 Fix |
| src/database/things-db.ts | (new) | Add markTaskComplete() and markTaskIncomplete() | P1 Support |
| features/step_definitions/common.steps.ts | 377-379 | Replace weak assertion with strong checks | P2 Fix |
| features/step_definitions/common.steps.ts | (search) | Update other completion indicators | P2 Follow-up |

---

## Checklist for Next Agent

- [ ] Read files in order listed above
- [ ] Understand issue 1: in-memory vs. persisted
- [ ] Understand issue 2: weak assertions
- [ ] Implement P1 fix: toggleTaskCompletion with URL scheme
- [ ] Implement P1 support: markTaskComplete/Incomplete methods
- [ ] Implement P2 fix: strengthen step assertions
- [ ] Run `npm run test:bdd -- --tags="@leaf_3_2"` → all pass
- [ ] Run `npm run test:bdd` → all pass, no regressions
- [ ] Run `npm run test:coverage` → maintained
- [ ] Commit with message referencing both Codex issues
- [ ] Add comment to PR #43 with fixes done
- [ ] Trigger `@codex review` as final comment

---

## Architecture Context

The Things app uses URL scheme for writes:
- `things:///complete?id=<taskId>` → marks complete
- `things:///incomplete?id=<taskId>` → marks incomplete

After calling URL, wait ~500ms for Things to update its database, then reload from our DB with `loadTasks()`.

This is the correct pattern: **read from DB, write via URL scheme, reload from DB**.

---

**Prepared for**: Next agent (Session 5)
**Status**: Ready to implement
**Effort**: 2-3 hours
