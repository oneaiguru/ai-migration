# Stack Limitations: Blessed TUI & Terminal Constraints

## Overview

The Things TUI uses **Blessed**, a Node.js library for building terminal user interfaces. This document explains how it works, what it can do, and what its limitations are.

---

## How Blessed Works

### Alternate Screen Buffer
- Blessed uses the terminal's **alternate screen buffer** (via ANSI escape codes)
- When you run `npm start`, Blessed takes over your terminal
- It draws a separate "screen" that doesn't interfere with scrollback history
- When you exit, your original terminal state is restored

### Direct Terminal Control
- Blessed writes directly to `/dev/tty` (or equivalent)
- It **does not** go through stdout/stderr in the traditional sense
- This gives full control over cursor position, colors, etc.

---

## Why This Matters for LLM Code Tools

### Problem: "Show Me the Screen" is Hard

When an LLM code tool (like Amp's code runner) tries to inspect the TUI:

```bash
npm start
# ... user navigates ...
# Tries to capture screen via stdout:
npm start 2>&1 | cat
```

**Result:** Garbage or nothing, because:
1. Blessed uses alternate buffer (separate from stdout)
2. Terminal escape codes are sent directly to `/dev/tty`
3. Stdout capture doesn't see the actual rendered UI

### Consequence

**You cannot use `console.log()` or stdout inspection to verify TUI behavior in automated tests.**

This is why the project has `ThingsTUITestable` — a **test harness** that:
- Loads the TUI class
- Calls methods directly (no terminal rendering)
- Queries state (`getVisibleTasks()`, `getSelectedTask()`, etc.)
- Allows BDD scenarios to inspect TUI data without rendering

---

## Testing the TUI

### ✅ What Works

**BDD + ThingsTUITestable:**
```typescript
// features/step_definitions/common.steps.ts
When('I press {string}', async function(key) {
  await this.tui.simulateKeyPress(key);
});

Then('the first task is selected', async function() {
  const selected = this.tui.getSelectedTask();
  expect(selected.title).to.equal('First Task');
});
```

This works because:
- No terminal rendering involved
- Methods called directly on TUI class
- State can be inspected programmatically

### ❌ What Doesn't Work

**Trying to "see" the screen:**
```bash
# This will NOT show the actual TUI
npm start | head -20
# Output: blank or corrupted
```

**Why:** Blessed isn't writing to stdout; it's writing to `/dev/tty`.

---

## Performance Implications

### Current Issue: 3000+ Tasks in Anytime

When rendering 3000+ tasks:
1. `renderMainList()` builds a 3000-line string
2. Blessed writes all 3000 lines to the alternate buffer
3. Terminal struggles to keep up
4. UI becomes unresponsive or corrupts

### Solution: Windowed Rendering

Render only the visible ~40 rows:
- Keep all 3000 tasks in memory
- Calculate which rows are visible on screen
- Render only those rows
- Update window position as user scrolls

This reduces terminal I/O by ~98% (3000 → 40 lines).

---

## Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| No stdout capture | Can't inspect TUI via scripts | Use `ThingsTUITestable` + BDD |
| Direct terminal I/O | Harder to debug | Use `ThingsTUITestable` logging |
| Alternate buffer | User can't see scrollback | Expected behavior for TUI apps |
| Full-screen rendering | Slow with 3000+ items | Implement windowing/virtualization |
| No easy "screenshot" | Can't save TUI state to file | Would need custom string renderer |

---

## Recommendations

### For Automated Testing
1. Use `ThingsTUITestable` harness for unit/integration tests
2. Use BDD + Gherkin for behavior verification
3. Do NOT try to capture terminal output

### For Manual Testing / UAT
1. Run `npm start` and use the app directly
2. Or, implement a **headless renderer** (see below)

### For Future LLM Integration
If you want LLM agents to be able to "see" and reason about TUI state:
- Create a **separate string-based renderer** (non-Blessed)
- This renderer outputs plain text to stdout
- LLM can inspect the output and understand layout
- Could be used for UAT, screenshot capture, etc.

Example structure:
```typescript
class HeadlessThingsTUI extends ThingsTUI {
  renderToString(): string {
    // Return plain-text version of screen
    // Can be inspected by scripts/LLM
  }
}
```

---

## Summary

- **Blessed** = powerful TUI library, but writes directly to terminal
- **Consequence** = can't inspect output via stdout (LLM limitation)
- **Solution** = use `ThingsTUITestable` harness for all automated testing
- **Future** = if needed, create headless renderer for LLM/script visibility

The TUI itself works great for manual use. The testing approach (BDD + harness) is the right pattern for this stack.
