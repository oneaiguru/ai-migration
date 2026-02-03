# AGENTS.md - Things TUI Project Development Workflow

## Project Overview
- **Name**: Things MCP Server + TUI Clone
- **Status**: Phase 2 Complete - BDD Retrofit & Code Coverage
- **Technology Stack**: TypeScript + Blessed TUI + Cucumber.js BDD
- **Location**: `/Users/m/ai/projects/uahis`

## Development Phases

### Phase 1: TUI Architecture (Completed)
- Built TypeScript-based Terminal UI with Blessed library
- Implemented core TUI features: task navigation, filtering, selection
- Created testable TUI interface for BDD

### Phase 2: BDD Retrofit & Code Coverage (Current - Complete)
- **Feature Files**: 5 retrofitted feature files with 38 scenarios
  - `features/search-tasks.feature` (7 scenarios)
  - `features/view-task-details.feature` (7 scenarios)
  - `features/filter-by-tags.feature` (7 scenarios)
  - `features/navigate-lists.feature` (8 scenarios)
  - `features/select-tasks.feature` (9 scenarios)

- **Step Definitions**: All steps in `features/step_definitions/common.steps.ts`
- **Coverage**: 45.78% statement coverage (472/1031 statements)
- **Test Status**: 38 scenarios (2 passed, 15 failed, 2 ambiguous, 19 undefined)

### Phase 3: Strict BDD Development (Planned)
- New features will follow strict RED→GREEN→REFACTOR cycle
- Write failing tests first, then implement
- Achieve 100% coverage on new code

## Commands

### Development
```bash
npm run build          # Compile TypeScript to dist/
npm run start          # Start the server
npm run test:bdd       # Run BDD tests with Cucumber
npm run test:bdd:watch # Watch mode for tests
npm run test:coverage  # Generate code coverage report
```

### Testing Workflow
1. **RED Phase**: Write feature file + step definitions (failing tests)
2. **GREEN Phase**: Implement code to pass tests
3. **REFACTOR Phase**: Improve code while keeping tests passing

## Code Coverage

### Current Metrics (after Phase 2)
```
Statements : 45.78% (472/1031)
Branches   : 80.61% (79/98)
Functions  : 59.72% (43/72)
Lines      : 45.78% (472/1031)
```

### Areas with Coverage
- **Database** (65.46% coverage) - things-db.js showing good coverage
- **TUI App** (50.79% coverage) - core TUI functionality covered
- **Components** (12.56% coverage) - needs more test coverage

### Areas Needing Coverage
- **Components** (12.56%) - Render methods and UI logic not well tested
- **Utils** (0%) - Path utilities untested
- **Types** (0%) - Type definitions don't need coverage

## BDD Test Patterns

### Step Definition Structure
All steps use `ThingsTUITestable` class for:
- Key press simulation
- UI state queries
- Assertion validation

Example:
```typescript
Then('status bar shows {string}', async function(text: string) {
  const status = context.tui!.getStatusBar();
  expect(status).to.include(text);
});
```

### Feature File Format
```gherkin
Feature: Feature Name
  Background:
    Given Things TUI is running
    And [preconditions]
  
  Scenario: What should happen
    When [user action]
    Then [expected result]
```

## TestableUI Interface

The `ThingsTUITestable` class in `src/tui/app.ts` provides:
- `initialize()` - Start TUI for testing
- `pressKey(key)` - Simulate key press
- `getVisibleTasks()` - Get rendered tasks
- `getSelectedTask()` - Get current selection
- `getStatusBar()` - Get status bar text
- `isDetailViewVisible()` - Check detail panel visibility

## Gherkin Syntax Notes

**Special Characters**: Use words instead of symbols
- ✅ `"5" slash "10"` instead of `"5/10"`
- ✅ `"item" and "other"` instead of `"item & other"`
- Escape slash: `'\/'` if necessary

## Coverage Report

View HTML coverage report after running:
```bash
npm run test:coverage
open coverage/index.html
```

## Continuous Testing

Watch mode for development:
```bash
npm run test:bdd:watch
```

## Undefined Steps

Check cucumber output for undefined steps:
```
? When I select it
    Undefined. Implement with the following snippet:
    
    When('I select it', async function () {
      // Write code here...
    });
```

Implement in `features/step_definitions/common.steps.ts` following existing patterns.

## Next Session Instructions

1. **Continue from Phase 2 coverage** (45.78%)
2. **Phase 3 starts with strict BDD**:
   - Start with failing tests
   - Implement features
   - Achieve GREEN tests
   - Improve coverage
3. **Priority areas**:
   - Components module (12.56%)
   - Undefined steps in feature files
   - Path utilities (0% coverage)

## Important Files

- `/Users/m/ai/projects/uahis/features/` - Feature files
- `/Users/m/ai/projects/uahis/features/step_definitions/common.steps.ts` - All step definitions
- `/Users/m/ai/projects/uahis/src/tui/app.ts` - ThingsTUITestable class
- `/Users/m/ai/projects/uahis/.c8rc.json` - Code coverage configuration
- `/Users/m/ai/projects/uahis/cucumber.cjs` - Cucumber configuration

## Session Handoff

Save current progress with:
```
Coverage Report: 45.78% statements
Running Tests: 38 scenarios total
Test Config: cucumber.cjs + .c8rc.json
Step Defs: All in common.steps.ts
```

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
