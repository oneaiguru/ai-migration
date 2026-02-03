# Large Dataset Behavior & Performance Notes

## Current State (Before Stabilization)

### Problem: Anytime List with 3000+ Tasks

**Observed behavior:**
- Opening "Anytime" list takes 5-10+ seconds
- UI becomes unresponsive after opening
- Screen shows overlapping/corrupted text
- Keypresses (up/down/j/k) hang for multiple seconds
- Selection movement is jerky or frozen
- Status bar may be overwritten or invisible

**Root cause:**
`renderMainList()` in `src/tui/app.ts` renders ALL 3000+ tasks in a single string:
```typescript
this.tasks.forEach((task, i) => {
  // ... builds 3000-line string
  content += `${prefix} ${title}...\n`;
});
```

Blessed then tries to write all 3000 lines to the terminal buffer at once, causing:
- Excessive memory usage
- Slow string concatenation
- Terminal buffer overflow
- UI corruption

---

## Performance Baseline (Before Fix)

Test case: Anytime list with 3000 real tasks

| Metric | Value | Status |
|--------|-------|--------|
| Time to open list | 5-10s | ❌ Too slow |
| Keypress response | 1-5s | ❌ Unresponsive |
| Screen corruption | Yes | ❌ Broken |
| CPU usage | High (100%) | ❌ Not optimized |
| Memory used | ~50-100MB | ⚠️ Acceptable but high |
| Status bar visibility | No | ❌ Hidden |

---

## Target Behavior (After Stabilization)

### Expected improvements with windowed rendering

| Metric | Target | Status |
|--------|--------|--------|
| Time to open list | < 1s | ✅ Goal |
| Keypress response | < 500ms | ✅ Goal |
| Screen corruption | None | ✅ Goal |
| CPU usage | Low | ✅ Goal |
| Memory used | < 10MB | ✅ Goal |
| Status bar visibility | Always | ✅ Goal |
| Visible tasks per screen | 30-40 rows | ✅ Goal |

---

## Known Workarounds (Before Fix)

Until windowing is implemented:

### 1. Use Filters
- Open "Today" instead of "Anytime" (typically 50-200 tasks)
- Use search (`/`) to narrow down the list
- Use tag filter (`t`) to show subset of tasks

**Limitation:** Doesn't solve the underlying problem for power users

### 2. Smaller Account
- Only have real tasks in specific lists
- Keep "Anytime" empty or move old tasks out
- Accept degraded experience if you have many tasks

**Limitation:** Not viable for real Things accounts

### 3. Build a Separate Headless Tool
- Create a CLI tool for searching/filtering
- Use that instead of the TUI for large result sets
- TUI for browsing, CLI for heavy queries

**Limitation:** Extra work, not integrated

---

## Technical Details

### Current Rendering (All Tasks)
```
renderMainList() {
  let content = '';
  // ... header ...
  this.tasks.forEach((task, i) => {
    // Builds one line per task
    content += `${prefix} ${title}\n`;
  });
  // Content is now 3000+ lines
  this.mainList.setContent(content); // ← Blessed tries to render all
}
```

**Problem:** `content` is a 3000-line string. Blessed writes all to terminal buffer.

### Proposed Windowing
```
renderMainList() {
  // Calculate visible window
  const screenHeight = this.screen.height - 2; // Minus header/status
  const windowStart = this.visibleWindowStart;
  const windowSize = 40; // Or dynamic from screenHeight
  
  // Slice only visible tasks
  const visibleTasks = this.tasks.slice(
    windowStart,
    windowStart + windowSize
  );
  
  let content = '';
  // ... header ...
  visibleTasks.forEach((task, i) => {
    // Only 40 lines, not 3000
    content += `${prefix} ${title}\n`;
  });
  
  // Content is now ~40 lines
  this.mainList.setContent(content); // ← Much faster
}
```

**Benefit:** Content is ~40 lines instead of 3000. Blessed can render instantly.

---

## Scrolling Logic Changes

### Current (doesn't scale)
```typescript
screen.key(['down', 'j'], () => {
  if (this.selectedIndex < this.tasks.length - 1) {
    this.selectedIndex++;
  }
  this.render(); // Re-renders all 3000 tasks
});
```

### Proposed (windowed)
```typescript
screen.key(['down', 'j'], () => {
  if (this.selectedIndex < this.tasks.length - 1) {
    this.selectedIndex++;
  }
  
  // Auto-scroll window to keep selection visible
  const screenHeight = this.screen.height - 2;
  const windowSize = 40;
  
  if (this.selectedIndex >= this.visibleWindowStart + windowSize) {
    this.visibleWindowStart++; // Scroll down
  } else if (this.selectedIndex < this.visibleWindowStart) {
    this.visibleWindowStart--; // Scroll up
  }
  
  this.render(); // Re-renders only visible ~40 tasks
});
```

---

## Implementation Checklist

To implement windowing:

- [ ] Add `visibleWindowStart: number = 0` property to ThingsTUI
- [ ] Calculate `visibleWindowSize` dynamically from screen height
- [ ] Modify `renderMainList()` to slice `this.tasks`
- [ ] Update scroll key handlers (up/down/j/k/Page Up/Page Down)
- [ ] Keep selected task always within visible window
- [ ] Update status bar to show "N-M / Total" (visible range / total)
- [ ] Test with 3000+ Anytime tasks
- [ ] Add BDD scenarios for large lists (@stability tag)

---

## Acceptance Criteria (for Phase 4)

**Must have:**
1. Opening "Anytime" with 3000+ tasks: < 1 second
2. Every keypress response: < 500ms
3. No screen corruption or overlapping text
4. Status bar always visible and readable
5. Smooth scrolling (no visual artifacts)

**Nice to have:**
1. Pagination indicator ("showing 1-40 of 3000")
2. Performance info in status bar (optional)
3. Jump-to-task feature (Ctrl+G to jump to task N)

---

## Performance Testing

Once windowing is implemented, verify with:

```bash
# Open TUI with real Things data
npm start

# Navigate to Anytime (should be instant)
# Press 1 → Anytime

# Scroll down rapidly (should be responsive)
# Rapid j/k presses
# Watch keypress latency (should be < 500ms)

# Verify screen state
# Status bar should show correct count
# Selection should move smoothly
# No corruption or overlaps
```

---

## Future Optimizations (Nice to Have)

### Lazy Loading
- Don't fetch all 3000 tasks at startup
- Load in batches as user scrolls
- Reduces initial memory footprint

### Caching
- Cache rendered lines (5-10 at a time)
- Only re-render lines that changed
- Further reduce render time

### Jump to Task
- `Ctrl+G` to jump to task by index or search
- Useful for 3000+ item lists
- Example: "Jump to task 500?"

---

## References

- `src/tui/app.ts` - renderMainList() method (lines ~297-341)
- `features/anytime-large-lists.feature` - BDD spec for this behavior
- `docs/STACK_LIMITATIONS.md` - Why stdout inspection doesn't work
- `STABILITY_PHASE_PLAN.md` - Full plan for Phase 4
