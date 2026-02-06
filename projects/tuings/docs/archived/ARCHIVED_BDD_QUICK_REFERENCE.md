# BDD with Cucumber.js + TypeScript - Quick Reference

**TL;DR**: Write .feature files in Gherkin, Cucumber generates tests, you implement code.

---

## The Strict BDD Flow

```
1. YOU write .feature file (readable, user-focused)
   └─ "Feature: Create Task"
   └─ "Scenario: User creates task via 'n' key"
   └─ "Given I have Things TUI open"
   └─ "When I press 'n' and type 'Buy milk' and press Enter"
   └─ "Then task 'Buy milk' exists in database"

2. AGENT generates step definitions (glue code)
   └─ Maps Gherkin to test code
   └─ Each Given/When/Then → function

3. AGENT writes implementation (actual features)
   └─ Code to pass the tests
   └─ No untested code allowed

4. TESTS RUN → All tests pass or code fails
   └─ No guessing if it works
   └─ Coverage proof
```

---

## One-Minute Setup

```bash
# 1. Install
npm install --save-dev @cucumber/cucumber ts-node

# 2. Create directories
mkdir -p features/step_definitions

# 3. Create cucumber.js config
cat > cucumber.js << 'EOF'
module.exports = {
  default: {
    require: ['features/step_definitions/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar']
  }
};
EOF

# 4. Add to package.json scripts
# "test:bdd": "cucumber-js"

# 5. Done!
```

---

## .feature File Template

```gherkin
Feature: Clear feature name
  Scenario: Specific behavior
    Given initial state
    When action happens
    Then expected outcome
```

**Example**:
```gherkin
Feature: Create Task
  Scenario: Quick create via 'n' key
    Given I have Things TUI open
    When I press 'n'
    And I type "Buy groceries"
    And I press Enter
    Then task "Buy groceries" exists
```

---

## Step Definition Template (TypeScript)

```typescript
import { Given, When, Then } from '@cucumber/cucumber';

Let state: any = {};

Given('initial state', async function() {
  // Setup
  state.tui = new ThingsTUI();
});

When('action happens', async function() {
  // Do something
  await state.tui.doSomething();
});

Then('expected outcome', async function() {
  // Assert
  expect(state.result).toBe('expected');
});
```

---

## Key Commands

```bash
# Run all tests
npm run test:bdd

# Run specific feature
npm run test:bdd -- features/create-task.feature

# Run specific scenario
npm run test:bdd -- features/create-task.feature -n "Quick create"

# Watch mode
npm run test:bdd:watch

# With reports
npm run test:bdd -- --format html:test-results.html
```

---

## Gherkin Keywords

| Keyword | Purpose | Example |
|---------|---------|---------|
| Feature | Feature title | `Feature: Create Task` |
| Scenario | Test case | `Scenario: User creates task` |
| Given | Setup/context | `Given TUI is open` |
| When | Action | `When user presses 'n'` |
| Then | Assertion | `Then task exists` |
| And | Additional step | `And I type "text"` |
| But | Negative case | `But error message appears` |
| Background | Setup for all | Runs before each scenario |

---

## Phase 3 Features (What to Write)

### Feature 1: Create Task
```
.feature file: features/create-task.feature
Scenarios:
  - Quick create with 'n' key
  - Create with custom list selection
  - Cancel with Escape
  - Verify in Things app
```

### Feature 2: Mark Complete
```
.feature file: features/mark-complete.feature
Scenarios:
  - Mark task complete with 'c' key
  - Task moves to Logbook
  - Things app reflects change
  - Undo completion
```

### Feature 3: Move Task
```
.feature file: features/move-task.feature
Scenarios:
  - Move task to different list
  - Move with keyboard shortcuts
  - Things app reflects change
```

---

## Testing Your TUI

### Add Simulation Methods to TUI

```typescript
// Make testable
simulateKeyPress(key: string): Promise<void>
typeText(text: string): Promise<void>
getSelectedTask(): Task
getVisibleTasks(): Task[]
getAllTasks(): Task[]
getLastMessage(): string
```

### Step Definition Patterns

```typescript
// Pattern: Setup state
Given('Things TUI is open', async function() {
  this.tui = new ThingsTUI();
  await this.tui.initialize();
});

// Pattern: Perform action
When('user presses {string}', async function(key: string) {
  await this.tui.simulateKeyPress(key);
});

// Pattern: Assert result
Then('task {string} exists', async function(title: string) {
  const task = this.tui.getAllTasks().find(t => t.title === title);
  expect(task).toBeDefined();
});
```

---

## Example: Complete Feature

### features/create-task.feature
```gherkin
Feature: Create New Task
  Background:
    Given Things TUI is running

  Scenario: Create task with 'n' key
    When user presses 'n'
    And user types "Buy groceries"
    And user presses Enter
    Then task "Buy groceries" exists in database
    And task appears in Things app
    And task is in current list

  Scenario: Cancel creation with Escape
    When user presses 'n'
    And user types "Don't create"
    And user presses Escape
    Then dialog closes
    And no new task created
    And cursor back at list
```

### features/step_definitions/create-task.steps.ts
```typescript
import { Given, When, Then, Before } from '@cucumber/cucumber';
import { ThingsTUI } from '../../src/tui/app';
import { expect } from 'chai';

let tui: ThingsTUI;

Before(async function() {
  tui = new ThingsTUI();
  await tui.initialize();
});

Given('Things TUI is running', async function() {
  expect(tui).to.exist;
});

When('user presses {string}', async function(key: string) {
  await tui.simulateKeyPress(key);
});

When('user types {string}', async function(text: string) {
  await tui.typeText(text);
});

Then('task {string} exists in database', async function(title: string) {
  const tasks = tui.getAllTasks();
  const found = tasks.find(t => t.title === title);
  expect(found).to.exist;
});

Then('task appears in Things app', async function() {
  // Verify in real Things database
  const db = new ThingsDatabase();
  const tasks = db.getAllTasks();
  expect(tasks.length).to.be.greaterThan(0);
});

Then('task is in current list', async function() {
  const visible = tui.getVisibleTasks();
  expect(visible.length).to.be.greaterThan(0);
});
```

### Implementation (src/tui/app.ts)
```typescript
// Implement to make tests pass
private async quickAdd(): Promise<void> {
  const title = await this.showAddDialog();
  if (!title) return;
  
  // Create task
  const taskUrl = this.buildThingsURL({ title });
  await execSync(`open "${taskUrl}"`);
  
  // Refresh
  await this.delay(500);
  this.loadTasks();
  this.render();
}

// Testing API
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

getVisibleTasks(): Task[] {
  return [...this.tasks];
}

getAllTasks(): Task[] {
  return [
    ...this.db.getTodayTasks(),
    ...this.db.getUpcomingTasks(),
    ...this.db.getAnytimeTasks(),
    ...this.db.getSomedayTasks()
  ];
}
```

---

## Verify It Works

```bash
# 1. Install and setup
npm install --save-dev @cucumber/cucumber ts-node chai @types/chai

# 2. Create features/create-task.feature (from example above)

# 3. Create features/step_definitions/create-task.steps.ts (from example above)

# 4. Run tests
npm run test:bdd

# Expected output:
# ✓ Things TUI is running
# ✓ user presses 'n'
# ✓ user types "Buy groceries"
# ✓ user presses Enter
# ✓ task "Buy groceries" exists in database
# ✓ task appears in Things app
# ✓ task is in current list
#
# 1 scenario, 7 steps, 7 passed
```

---

## You vs Agent Responsibilities

### You (User)
```
✅ Write .feature files (Gherkin - readable)
✅ Review test results
✅ Change requirements (update .feature files)
✅ Decide what features to build
❌ Write step definitions (too technical)
❌ Write implementation code (flows from tests)
```

### Agent (Developer)
```
❌ Write .feature files (you own requirements)
✅ Write step definitions (glue code)
✅ Write implementation code (to pass tests)
✅ Run and report tests
✅ Handle technical details
```

---

## Common Patterns

### Pattern: Given/When/Then Structure
```gherkin
Given <precondition - what must be true first>
When <action - what the user does>
Then <assertion - what should be true after>
```

### Pattern: Background for Setup
```gherkin
Feature: Something
  Background:
    Given database is initialized
    And user is logged in
    
  Scenario: One test
    When user does X
    Then Y happens
    
  Scenario: Another test
    When user does X
    Then Z happens
```

### Pattern: Multiple Steps
```gherkin
When user presses 'n'
And user types "task title"
And user presses Enter
Then task is created
```

---

## Red/Green/Refactor (BDD Cycle)

### 1. RED: Write Test (Fails)
```bash
$ npm run test:bdd
✗ task "Buy milk" exists
  Error: Task not found
```

### 2. GREEN: Write Code (Passes)
```bash
$ npm run test:bdd
✓ task "Buy milk" exists
```

### 3. REFACTOR: Improve (Still Passes)
```bash
$ npm run test:bdd
✓ task "Buy milk" exists
(code is cleaner, same behavior)
```

---

## Phase 3 Checklist

- [ ] Install Cucumber.js
- [ ] Create features/ directory
- [ ] Write features/create-task.feature
- [ ] Write features/mark-complete.feature
- [ ] Write step definitions
- [ ] Run `npm run test:bdd` (all fail initially)
- [ ] Implement code
- [ ] Run `npm run test:bdd` (all pass)
- [ ] Verify in Things app
- [ ] Document results

---

## Resources

- Cucumber.js docs: https://github.com/cucumber/cucumber-js
- Gherkin syntax: https://cucumber.io/docs/gherkin/
- BDD best practices: https://cucumber.io/docs/bdd/

---

**Key Point**: You write requirements in .feature files, tests are automatic, code implements features. No untested code. Simple.

