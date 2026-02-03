# UAT Testing - Things TUI

## Overview

The Things TUI now supports **dual-mode operation**:
1. **Interactive mode** - Classic blessed terminal UI (existing)
2. **Non-interactive mode** - Automated test runner for CI/CD and UAT

## Non-Interactive Mode

### Architecture

```
StateCapture (src/tui/state-capture.ts)
├── capture(tui) → UIState
├── renderAsText(state) → Human-readable output
└── renderAsJSON(state) → Machine-readable JSON

TestRunner (src/cli/test-runner.ts)
├── runNonInteractive(scenario, keys, expectations)
│   ├── Initialize TUI
│   ├── Capture initial state
│   ├── Execute key sequence
│   ├── Capture state after each key
│   └── Verify expectations
└── runScenarios() → UAT Summary
```

### UI State Object

```typescript
interface UIState {
  mode: 'list' | 'detail' | 'search' | 'tag-filter' | 'quick-add';
  currentList: string;
  visibleTasks: Task[];
  selectedIndex: number;
  selectedTask: Task | null;
  filterState: { tags: string[] };
  statusBar: string;
  mainListContent: string;        // Rendered list view
  detailContent: string | null;   // Rendered detail view
  timestamp: number;
}
```

## Usage

### Run Built-in UAT Scenarios

```bash
npm run test:uat
```

Output shows:
- Initial state
- State after each key press
- Pass/fail for each scenario
- Summary of issues

### Run Custom Scenario

```bash
npm run test:uat 'Scenario Name' key1 key2 key3...
```

Example:
```bash
npm run test:uat 'Navigate and open detail' 1 down down enter escape
```

Output shows:
```
======================================================================
Scenario: Navigate and open detail
Keys: 1 down down enter escape
======================================================================

============================================================
Step: Initial
============================================================
Mode: list
List: Today (87 tasks)
Selected: [0] → first task

Tasks:
► [ ] first task
  [ ] second task
  [ ] third task

Status: Today (87 tasks) | Press '/' to search, 't' for tags

============================================================
Step: After key '1'
============================================================
[same format with updated state]

[continues for each key...]

✓ PASS: Navigate and open detail
```

### Built-in Scenarios

1. **Navigate Today list - select task 2**
   - Keys: `1 down down`
   - Verifies: Selection moves to index 2

2. **Open detail view and close**
   - Keys: `1 down enter escape`
   - Verifies: Mode changes to 'detail' then back to 'list'

3. **Switch to Upcoming list**
   - Keys: `2`
   - Verifies: currentList changes to 'upcoming'

4. **Mark task complete with c key**
   - Keys: `1 down c`
   - Verifies: selectedTask.status becomes 2 (completed)

## For Next Session

### Expand UAT Coverage

Add scenarios for:
- [ ] Search functionality (press `/`, type query)
- [ ] Tag filtering (press `t`, select tags)
- [ ] Quick-add task (press `n`, type title, Enter)
- [ ] Move between lists (press `m`, select destination) - Phase 3.3
- [ ] Edit task (press `e`, modify title/notes)

### Integrate with CI/CD

```bash
# In GitHub Actions / CI pipeline
npm run test:uat
echo "Exit code: $?"
```

Exit code 0 = all scenarios passed  
Exit code 1 = one or more scenarios failed

### State Regression Testing

Save state snapshots and compare:

```typescript
// Save
JSON.stringify(state, null, 2) → file

// Compare on next run
diff(savedState, currentState) → regression report
```

### Performance Metrics

Track key-to-render time:

```typescript
const before = state.timestamp;
// press key
const after = newState.timestamp;
const latency = after - before;
```

## Architecture Benefits

✅ **Testable without terminal** - Works in GitHub Actions, Docker, headless  
✅ **Deterministic output** - Same input = same output  
✅ **State snapshots** - Compare before/after for regression testing  
✅ **UAT automation** - Run hundreds of scenarios in seconds  
✅ **CI/CD integration** - Part of automated test suite  
✅ **Human readable** - See exactly what the user sees  

## Example: Custom Test Script

```bash
#!/bin/bash
# uat-smoke-test.sh

echo "Running smoke tests..."

npm run test:uat 'Navigate Today' 1 down down || exit 1
npm run test:uat 'Open detail view' 1 enter escape || exit 1
npm run test:uat 'Switch lists' 2 3 4 1 || exit 1
npm run test:uat 'Mark complete' 1 down c || exit 1

echo "✓ All smoke tests passed"
```

Run with: `bash uat-smoke-test.sh`

## Next Steps

1. Expand built-in scenarios to cover all Phase 2-3 features
2. Create regression test snapshot database
3. Integrate into GitHub Actions CI/CD
4. Add performance benchmarking
5. Create automated UAT reporting dashboard
