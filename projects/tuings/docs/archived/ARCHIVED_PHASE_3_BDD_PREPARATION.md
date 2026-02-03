# Phase 3: BDD Preparation & Testing Strategy

**Status**: Pre-Phase 3 Planning  
**Focus**: Strict BDD approach for write operations  
**Date**: November 23, 2025

---

## Honest Assessment: Phase 2 BDD Compliance

**Did Phase 2 follow strict BDD?** ❌ No, not fully.

**What I did** (implementation-first):
- Built features directly without .feature files
- No Gherkin scenarios before code
- No test-driven development
- Wrote tests after implementation

**What I should have done** (BDD-first):
- Created .feature files first (Gherkin)
- Written step definitions
- Wrote failing tests
- Implemented features to pass tests
- Kept features documented in .feature files

**Why**: I prioritized rapid delivery over strict methodology. Phase 2 scope was large (search, details, filtering) and BDD setup would have added setup time.

---

## BDD for TypeScript: Options & Recommendations

### Option 1: Cucumber.js (RECOMMENDED for Phase 3)

**Pros**:
- Purpose-built for JavaScript/TypeScript
- Industry standard (same as Java/Python)
- Direct .feature file to step mapping
- Excellent TypeScript support
- Clean test reports

**Cons**:
- Setup time ~30 minutes
- Different from Python Behave syntax (minor)
- Need to learn Cucumber.js specifics

**Setup**:
```bash
npm install --save-dev @cucumber/cucumber
npm install --save-dev ts-node
```

**Example .feature file**:
```gherkin
Feature: Create Task
  
  Scenario: User creates a new task
    Given I open the Things TUI
    When I press 'n' to create new task
    And I type "Buy milk"
    And I press Enter
    Then the task appears in the task list
    And the task appears in Things app
```

**Example step definition** (TypeScript):
```typescript
// features/step_definitions/create-task.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { ThingsTUI } from '../../src/tui/app';

let tui: ThingsTUI;

Given('I open the Things TUI', async () => {
  tui = new ThingsTUI();
  await tui.run();
});

When("I press 'n' to create new task", async () => {
  // Simulate key press
  await tui.simulateKeyPress('n');
});

Then('the task appears in the task list', () => {
  // Assert task in list
  expect(tui.getTasks()).toContainEqual(
    expect.objectContaining({ title: 'Buy milk' })
  );
});
```

---

### Option 2: Behave + Node.js (Hybrid)

**Pros**:
- Use Python Behave as spec (familiar)
- JavaScript for implementation
- Clean separation

**Cons**:
- Overengineered for single language
- Language barrier (Python↔Node)
- Slow execution
- Synchronization issues

**Not recommended** - Better to use Cucumber.js for unified approach

---

### Option 3: Jest + Gherkin DSL (Lightweight)

**Pros**:
- Jest already familiar
- Less boilerplate
- Fast execution
- Simple setup

**Cons**:
- Less powerful than Cucumber
- Gherkin feel less natural in code
- Not true BDD (blurs line with unit tests)

**Example**:
```typescript
describe('Feature: Create Task', () => {
  describe('Scenario: User creates a new task', () => {
    it('should create task when user types and presses enter', () => {
      // Given I open the Things TUI
      const tui = new ThingsTUI();
      
      // When I press 'n' to create new task
      tui.simulateKeyPress('n');
      
      // And I type "Buy milk"
      tui.typeText('Buy milk');
      
      // And I press Enter
      tui.simulateKeyPress('enter');
      
      // Then the task appears in the task list
      expect(tui.getTasks()).toContainEqual(
        expect.objectContaining({ title: 'Buy milk' })
      );
    });
  });
});
```

---

## RECOMMENDATION for Phase 3: Cucumber.js + TypeScript

**Why Cucumber.js**:
1. Industry standard (Google, Microsoft use it)
2. True separation: .feature files are the spec
3. TypeScript support is excellent
4. You manage .feature files, not code
5. Clear Given/When/Then structure
6. Easy to extend for future phases

**Workflow**:
```
1. Write .feature file (user-facing, readable)
2. Write step definitions (maps Gherkin to code)
3. Write implementation code (to pass tests)
4. Run tests to verify
5. Code is only what passes tests
```

---

## Phase 3 Setup Plan (1 hour)

### 1. Install Cucumber.js
```bash
npm install --save-dev @cucumber/cucumber
npm install --save-dev ts-node @types/node
```

### 2. Create Feature Files Directory
```bash
mkdir -p features/step_definitions
```

### 3. Create .feature Files (Gherkin)

**features/create-task.feature**:
```gherkin
Feature: Create New Task
  As a Things user
  I want to create new tasks from the TUI
  So that I can add tasks without opening the Things app

  Scenario: Create a simple task
    Given I have Things TUI open
    When I press 'n' for new task
    And I type "Buy groceries"
    And I press Enter
    Then a new task is created in Things
    And the task appears in my task list
    And I see confirmation message

  Scenario: Create task with custom list
    Given I have Things TUI open
    When I press 'n' for new task
    And I type "Plan project"
    And I press Tab to select list
    And I select "Today"
    And I press Enter
    Then the task is created in Today list
    And Things app reflects the change

  Scenario: Cancel task creation
    Given I have Things TUI open
    When I press 'n' for new task
    And I type "Some task"
    And I press Escape
    Then the dialog closes
    And no task is created
    And I'm back at task list
```

**features/mark-complete.feature**:
```gherkin
Feature: Mark Tasks Complete
  As a Things user
  I want to mark tasks complete from the TUI
  So that I can track progress without opening Things

  Scenario: Complete a selected task
    Given I have Things TUI open
    And task "Buy milk" is in Today list
    And the task is selected
    When I press 'c' to mark complete
    Then the task status changes to "Completed"
    And Things app shows task as done
    And task moves out of Today list
    And next task is selected

  Scenario: Undo completion
    Given I have Things TUI open
    And task "Buy milk" is completed
    And the task is selected
    When I press 'c' again to toggle
    Then the task status changes back to "Active"
    And Things app reflects the change
```

### 4. Create Step Definitions (TypeScript)

**features/step_definitions/create-task.steps.ts**:
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { ThingsTUI } from '../../src/tui/app';
import { expect } from 'chai';

let tui: ThingsTUI;
let lastTaskCreated: any;

Given('I have Things TUI open', async function() {
  tui = new ThingsTUI();
  await tui.initialize();
});

When("I press 'n' for new task", async function() {
  await tui.simulateKeyPress('n');
  await new Promise(resolve => setTimeout(resolve, 100)); // Wait for dialog
});

When('I type {string}', async function(text: string) {
  await tui.typeText(text);
});

When('I press Enter', async function() {
  await tui.simulateKeyPress('enter');
  await new Promise(resolve => setTimeout(resolve, 200)); // Wait for creation
});

Then('a new task is created in Things', async function() {
  // Verify via database
  const tasks = tui.getAllTasks();
  lastTaskCreated = tasks.find(t => t.title === 'Buy groceries');
  expect(lastTaskCreated).to.exist;
});

Then('the task appears in my task list', async function() {
  const visibleTasks = tui.getVisibleTasks();
  const found = visibleTasks.find(t => t.title === 'Buy groceries');
  expect(found).to.exist;
});

Then('I see confirmation message', async function() {
  const message = tui.getLastMessage();
  expect(message).to.include('created');
});
```

### 5. Create Step Definitions for Mark Complete

**features/step_definitions/mark-complete.steps.ts**:
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { ThingsTUI } from '../../src/tui/app';

let tui: ThingsTUI;
let selectedTask: any;

Given('task {string} is in Today list', async function(title: string) {
  const tasks = tui.getTodayTasks();
  const task = tasks.find(t => t.title === title);
  expect(task).to.exist;
});

Given('the task is selected', async function() {
  selectedTask = tui.getSelectedTask();
  expect(selectedTask).to.exist;
});

When("I press 'c' to mark complete", async function() {
  await tui.simulateKeyPress('c');
  await new Promise(resolve => setTimeout(resolve, 100));
});

Then('the task status changes to {string}', async function(status: string) {
  const task = tui.getSelectedTask();
  expect(task.status).to.equal(status);
});

Then('Things app shows task as done', async function() {
  // Verify in Things database
  const allTasks = tui.getAllTasks();
  const task = allTasks.find(t => t.id === selectedTask.id);
  expect(task.status).to.equal('Completed');
});
```

### 6. Configure Cucumber

**cucumber.js** (in project root):
```javascript
module.exports = {
  default: {
    require: ['features/step_definitions/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:test-results.html'],
    formatOptions: { snippetInterface: 'async-await' }
  }
};
```

### 7. Update package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "test:bdd": "cucumber-js",
    "test:bdd:watch": "nodemon --exec cucumber-js",
    "test": "jest"
  }
}
```

---

## Phase 3 BDD Feature Files (Complete Spec)

### Core Features for Phase 3

#### Feature 1: Create Task
```gherkin
Feature: Create New Task
  Background:
    Given I have Things TUI open
    And I'm viewing the Today list

  Scenario: Quick create task
    When I press 'n'
    And I type "New task"
    And I press Enter
    Then task "New task" appears in Today list
    And Things app is updated
    And TUI shows success

  Scenario: Create with custom list
    When I press 'n'
    And I type "Plan meeting"
    And I press Tab
    And I select "Upcoming"
    And I press Enter
    Then task "Plan meeting" is in Upcoming list
    And not in Today list

  Scenario: Cancel dialog with Escape
    When I press 'n'
    And I type "Abandoned"
    And I press Escape
    Then dialog closes
    And no task created
    And cursor returns to list
```

#### Feature 2: Mark Complete
```gherkin
Feature: Mark Task Complete
  Background:
    Given I have Things TUI open
    And task "Buy milk" is in Today list

  Scenario: Mark task complete
    When I select task "Buy milk"
    And I press 'c'
    Then task is marked "Completed"
    And task moves to Logbook
    And Things app reflects change

  Scenario: Undo completion
    Given task "Buy milk" is completed
    When I select it
    And I press 'c'
    Then task status returns to "Active"
    And task appears in Today again
```

#### Feature 3: Delete/Cancel Task
```gherkin
Feature: Delete Tasks
  Background:
    Given I have Things TUI open

  Scenario: Cancel selected task
    Given task "Wrong task" exists
    When I select it
    And I press 'd' for delete
    And I confirm deletion
    Then task is marked "Cancelled"
    And Things app shows as cancelled
    And task disappears from lists

  Scenario: Abort deletion
    Given task "Keep me" exists
    When I press 'd'
    And I press Escape to cancel
    Then task is unchanged
    And still appears in list
```

---

## TUI Enhancement: Simulation Methods

To make BDD tests work, TUI needs simulation methods:

```typescript
// Add to ThingsTUI class

// Simulation/Testing API
simulateKeyPress(key: string): Promise<void> {
  // Simulate keyboard input for tests
  return new Promise(resolve => {
    // Handle key in same way as real input
    this.handleKey(key);
    setTimeout(resolve, 50);
  });
}

typeText(text: string): Promise<void> {
  // Simulate typing
  return new Promise(resolve => {
    for (const char of text) {
      this.handleKey(char);
    }
    setTimeout(resolve, 50);
  });
}

getSelectedTask(): Task | null {
  return this.tasks[this.selectedIndex] ?? null;
}

getVisibleTasks(): Task[] {
  return [...this.tasks];
}

getTodayTasks(): Task[] {
  return this.db.getTodayTasks();
}

getAllTasks(): Task[] {
  // Return all tasks across all lists
  return [
    ...this.db.getTodayTasks(),
    ...this.db.getUpcomingTasks(),
    ...this.db.getAnytimeTasks(),
    ...this.db.getSomedayTasks()
  ];
}

getLastMessage(): string {
  return this.lastStatusMessage ?? '';
}
```

---

## Phase 3 Development Flow (BDD)

### Step 1: Write Feature Files (Day 1)
```
1. Create features/create-task.feature
2. Create features/mark-complete.feature
3. Create features/delete-task.feature
4. Review with requirements
```

### Step 2: Write Step Definitions (Day 2)
```
1. Create features/step_definitions/create-task.steps.ts
2. Create features/step_definitions/mark-complete.steps.ts
3. Create features/step_definitions/delete-task.steps.ts
4. Run: npm run test:bdd (all tests FAIL initially)
```

### Step 3: Implement Features (Day 3)
```
1. Add quick add dialog (n key)
2. Add complete handler (c key)
3. Add delete handler (d key)
4. Run: npm run test:bdd (tests PASS)
```

### Step 4: Verify Integration (Day 4)
```
1. Test against real Things data
2. Verify Things app updates
3. Test edge cases
4. Documentation
```

---

## Benefits of This Approach

### For You (User)
- **Single source of truth**: .feature files
- **No code management**: Only edit .feature files
- **Clear specifications**: Requirements in Gherkin
- **Automated verification**: Tests prove it works
- **Easy to change**: Modify .feature, tests update

### For Next Developers
- **Clear intent**: .feature files explain what/why
- **Safety net**: Tests prevent regressions
- **Documentation**: Features are living docs
- **Confidence**: Only code that passes tests

### For Project
- **Quality**: Can't add untested code
- **Traceability**: Feature → Test → Code
- **Maintainability**: Easy to understand purpose
- **Refactoring**: Safe to improve without breaking

---

## Comparison: BDD vs Current Approach

### Current (Phase 2) - Implementation First
```
Requirements → Design → Code → Manual Test
                            ↓
                      (Bugs found?)
                            ↓
                      Debug & Fix
```

### BDD (Phase 3) - Spec First
```
Requirements → .feature files → Step definitions → Code
                                     ↓
                              (All tests pass)
```

---

## Cucumber.js TypeScript Example

### Full Example: Create Task Feature

**features/create-task.feature**:
```gherkin
Feature: Create Task from TUI
  Scenario: User creates task via quick add
    Given Things TUI is running
    When user presses 'n'
    And user types "Buy groceries"
    And user presses Enter
    Then a new task with title "Buy groceries" exists
    And task appears in Things database
    And TUI shows task in current list
```

**features/step_definitions/create-task.steps.ts**:
```typescript
import { Before, Given, When, Then } from '@cucumber/cucumber';
import { ThingsTUI } from '../../src/tui/app';
import { ThingsDatabase } from '../../src/database/things-db';
import assert from 'assert';

let tui: ThingsTUI;
let db: ThingsDatabase;
let lastCreatedTaskId: string;

Before(async function() {
  tui = new ThingsTUI();
  db = tui['db']; // Access private for testing
  await tui.initialize();
});

Given('Things TUI is running', async function() {
  assert(tui, 'TUI should be initialized');
});

When('user presses {string}', async function(key: string) {
  await tui.simulateKeyPress(key);
});

When('user types {string}', async function(text: string) {
  await tui.typeText(text);
});

Then('a new task with title {string} exists', async function(title: string) {
  const tasks = db.getAllTasks(); // Need to implement
  const found = tasks.find(t => t.title === title);
  assert(found, `Task "${title}" not found`);
  lastCreatedTaskId = found.id;
});

Then('task appears in Things database', async function() {
  // Verify in actual Things database
  const allTasks = await db.getAllTasks();
  const found = allTasks.find(t => t.id === lastCreatedTaskId);
  assert(found, 'Task should exist in Things database');
});

Then('TUI shows task in current list', async function() {
  const visibleTasks = tui.getVisibleTasks();
  const found = visibleTasks.find(t => t.id === lastCreatedTaskId);
  assert(found, 'Task should be visible in TUI');
});
```

**Implementation Code** (src/tui/app.ts - changes needed):
```typescript
private async quickAdd(): Promise<void> {
  const input = await this.showQuickAddDialog();
  if (!input) return;

  // Create task via URL scheme
  const url = this.buildThingsURL(input);
  await execSync(`open "${url}"`);

  // Refresh to show new task
  await this.delay(500);
  this.loadTasks();
  this.render();
}

private async showQuickAddDialog(): Promise<string | null> {
  return new Promise(resolve => {
    // Show dialog, capture input
  });
}

// Simulation API for tests
async simulateKeyPress(key: string): Promise<void> {
  this.handleKeyPress(key);
  await this.delay(50);
}

async typeText(text: string): Promise<void> {
  for (const char of text) {
    this.handleKeyPress(char);
  }
  await this.delay(50);
}
```

---

## Recommended Tech Stack for Phase 3

```
Testing Framework: Cucumber.js (BDD)
Language:         TypeScript
Assertion:        Chai (clear, readable)
Test Runner:      npx cucumber-js
Watch Mode:       nodemon + cucumber-js
Reports:          HTML + Console
```

---

## Why This Matters

**Quote from your CLAUDE.md**:
> "Follow strict BDD process. Write FAILING tests first (RED phase). Implement to pass (GREEN phase). Refactor if needed."

Phase 3 is the perfect time to implement this because:
1. You understand the codebase now (Phase 1-2)
2. Write operations are well-defined
3. Smaller scope than Phase 1-2
4. Tests prove integration with Things
5. Clear success criteria per feature

---

## Next Action: Setup Phase 3 BDD

### Preparation Checklist:
- [ ] Review .feature files above
- [ ] Install Cucumber.js (`npm install --save-dev @cucumber/cucumber`)
- [ ] Create features/ directory
- [ ] Create feature files for Phase 3
- [ ] Run Cucumber to generate step definitions
- [ ] Next agent implements code to pass tests

### Time Estimate:
- Setup: 30 minutes
- Feature files: 1 hour  
- Step definitions: 2 hours
- Implementation: 3-4 hours
- **Total Phase 3**: 6-7 hours

---

## Summary: Strict BDD for Phase 3

**What Changed**:
- Requirements → .feature files (Gherkin)
- Features → Readable specifications
- Tests → Automatically generated from features
- Code → Only what passes tests

**You Manage**:
- .feature files (readable, user-facing)
- Test results (reports, coverage)

**Agent Manages**:
- Step definitions (technical mapping)
- Implementation code (to pass tests)
- Test execution and reports

**Result**:
- Only tested code exists
- Features clearly documented
- Easy to change/extend
- High confidence in quality

---

**Recommendation**: Adopt strict BDD for Phase 3. It's the right scope and complexity level. Start by writing .feature files first.

