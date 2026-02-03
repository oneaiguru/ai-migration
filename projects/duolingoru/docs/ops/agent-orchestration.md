# Agent Orchestration System for DuolingoRU

## Philosophy: BDD-First, Verify-Everything, Clean Handoffs

Based on Anthropic's long-running agent research, adapted for strict BDD workflow.

---

## 1. Project Structure with BDD

```
duolingoru/
├── .agent/                          # Agent coordination files
│   ├── manifest.json                # Master task list (JSON, not MD!)
│   ├── progress.json                # Completed work log
│   ├── current-agent.json           # Who's working on what
│   └── verification-report.json     # Test results
├── features/                        # BDD .feature files (Gherkin)
│   ├── onboarding/
│   │   ├── anonymous-start.feature
│   │   ├── placement-test.feature
│   │   └── account-upgrade.feature
│   ├── lessons/
│   │   ├── start-lesson.feature
│   │   ├── exercise-translate.feature
│   │   ├── exercise-listen.feature
│   │   └── complete-lesson.feature
│   ├── gamification/
│   │   ├── streak.feature
│   │   ├── xp-earning.feature
│   │   └── leaderboard.feature
│   └── payments/
│       ├── premium-upgrade.feature
│       └── mir-payment.feature
├── apps/
│   ├── pwa/
│   └── api/
├── packages/
│   ├── lesson-engine/
│   ├── content/
│   └── types/
└── scripts/
    ├── init.sh                      # Environment setup
    ├── verify.sh                    # Run all verifications
    └── agent-start.sh               # Agent bootstrap script
```

---

## 2. The Manifest: `manifest.json`

This is the **source of truth** for all work. Agents read from this, never delete/modify structure - only update status, verification, and completed_* fields.

```json
{
  "project": "duolingoru",
  "version": "0.1.0",
  "created": "2026-01-04T00:00:00Z",
  "last_updated": "2026-01-04T00:00:00Z",
  
  "phases": [
    {
      "id": "phase_01_scaffold",
      "name": "Project Scaffold",
      "status": "in_progress",
      "tasks": [
        {
          "id": "scaffold_001",
          "name": "Initialize monorepo with pnpm",
          "type": "scaffold",
          "model": "haiku",
          "priority": 1,
          "status": "done",
          "feature_file": null,
          "verification": {
            "type": "script",
            "command": "pnpm install && pnpm run typecheck",
            "passed": true,
            "last_run": "2026-01-04T01:00:00Z"
          },
          "artifacts": [
            "package.json",
            "pnpm-workspace.yaml",
            "tsconfig.base.json"
          ],
          "completed_by": "agent_session_001",
          "completed_at": "2026-01-04T01:00:00Z"
        },
        {
          "id": "scaffold_002",
          "name": "Create PWA app shell",
          "type": "scaffold",
          "model": "haiku",
          "priority": 2,
          "status": "pending",
          "depends_on": ["scaffold_001"],
          "feature_file": null,
          "verification": {
            "type": "script",
            "command": "pnpm -C projects/anglo/apps/pwa build && test -f projects/anglo/apps/pwa/dist/index.html",
            "passed": false,
            "last_run": null
          },
          "artifacts": [
            "projects/anglo/apps/pwa/package.json",
            "projects/anglo/apps/pwa/vite.config.ts",
            "projects/anglo/apps/pwa/src/main.tsx",
            "projects/anglo/apps/pwa/src/App.tsx"
          ],
          "completed_by": null,
          "completed_at": null
        }
      ]
    },
    {
      "id": "phase_02_engine",
      "name": "Lesson Engine Core",
      "status": "blocked",
      "blocked_by": "phase_01_scaffold",
      "tasks": [
        {
          "id": "engine_001",
          "name": "Define core types (Course, Unit, Lesson, Exercise)",
          "type": "types",
          "model": "haiku",
          "priority": 1,
          "status": "pending",
          "feature_file": null,
          "verification": {
            "type": "typecheck",
            "command": "cd packages/lesson-engine && pnpm typecheck",
            "passed": false
          },
          "artifacts": [
            "packages/lesson-engine/src/models/index.ts"
          ]
        },
        {
          "id": "engine_002",
          "name": "Implement grading logic",
          "type": "feature",
          "model": "sonnet",
          "priority": 2,
          "status": "pending",
          "depends_on": ["engine_001"],
          "feature_file": "features/lessons/grading.feature",
          "verification": {
            "type": "bdd",
            "command": "pnpm test:bdd",
            "passed": false
          },
          "artifacts": [
            "packages/lesson-engine/src/grading/grade.ts",
            "packages/lesson-engine/src/grading/fuzzy-match.ts"
          ]
        }
      ]
    },
    {
      "id": "phase_03_features",
      "name": "User Features (BDD-Driven)",
      "status": "blocked",
      "blocked_by": "phase_02_engine",
      "tasks": [
        {
          "id": "feat_001",
          "name": "Anonymous user can start first lesson",
          "type": "feature",
          "model": "sonnet",
          "priority": 1,
          "status": "pending",
          "feature_file": "features/onboarding/anonymous-start.feature",
          "bdd_scenarios": [
            {
              "name": "User opens app for first time",
              "status": "red",
              "steps": 5
            },
            {
              "name": "User taps Start Learning",
              "status": "red",
              "steps": 4
            },
            {
              "name": "User completes first exercise",
              "status": "red",
              "steps": 6
            }
          ],
          "verification": {
            "type": "bdd",
            "command": "pnpm test:bdd",
            "passed": false,
            "scenarios_passed": 0,
            "scenarios_total": 3
          },
          "artifacts": []
        },
        {
          "id": "feat_002",
          "name": "User earns XP after completing exercise",
          "type": "feature",
          "model": "sonnet",
          "priority": 2,
          "status": "pending",
          "depends_on": ["feat_001"],
          "feature_file": "features/gamification/xp-earning.feature",
          "bdd_scenarios": [
            {
              "name": "Correct answer awards 10 XP",
              "status": "red",
              "steps": 4
            },
            {
              "name": "Incorrect answer awards 0 XP",
              "status": "red",
              "steps": 4
            },
            {
              "name": "Lesson completion bonus XP",
              "status": "red",
              "steps": 5
            }
          ],
          "verification": {
            "type": "bdd",
            "command": "pnpm test:bdd",
            "passed": false
          }
        }
      ]
    }
  ],
  
  "architecture_decisions": [
    {
      "id": "adr_001",
      "title": "React + Vite for PWA",
      "status": "accepted",
      "review_model": "opus",
      "reviewed": true
    },
    {
      "id": "adr_002", 
      "title": "TypeScript full-stack",
      "status": "accepted",
      "review_model": "opus",
      "reviewed": true
    }
  ]
}
```

---

## 3. BDD Feature Files (Gherkin)

Each feature task references a `.feature` file. Agents must:
1. **Read the feature file first** (understand acceptance criteria)
2. **Write step definitions** (red)
3. **Implement code** (make green)
4. **Verify all scenarios pass** before marking done

### Example: `features/onboarding/anonymous-start.feature`

```gherkin
Feature: Anonymous User Start
  As a new user
  I want to start learning without creating an account
  So that I can try the app before committing

  Background:
    Given the app is running
    And I have not used the app before
    And I have no account

  @smoke @critical
  Scenario: User opens app for first time
    When I open the app
    Then I should see the welcome screen
    And I should see "Учи английский" text
    And I should see a "Начать" button
    And I should NOT see a login prompt

  @smoke
  Scenario: User taps Start Learning
    Given I am on the welcome screen
    When I tap the "Начать" button
    Then I should see the first lesson
    And a device ID should be generated
    And the device ID should be stored locally

  Scenario: User completes first exercise
    Given I am on the first lesson
    And I see a translate exercise
    When I select the correct answer
    Then I should see a success animation
    And I should earn 10 XP
    And my progress should be saved locally
```

### Example: `features/lessons/grading.feature`

```gherkin
Feature: Exercise Grading
  As the lesson engine
  I need to grade user answers correctly
  So that users get accurate feedback

  @unit
  Scenario Outline: Exact match grading
    Given an exercise with correct answer "<correct>"
    When the user submits "<answer>"
    Then the grade should be "<result>"

    Examples:
      | correct | answer  | result    |
      | hello   | hello   | correct   |
      | hello   | Hello   | correct   |
      | hello   | helo    | incorrect |
      | hello   | hellp   | typo      |

  @unit
  Scenario: Fuzzy match for minor typos
    Given an exercise with correct answer "beautiful"
    And typo tolerance is enabled
    When the user submits "beatiful"
    Then the grade should be "typo"
    And the feedback should show the correct spelling

  @unit
  Scenario: Multiple correct answers
    Given an exercise with correct answers ["mom", "mum", "mother"]
    When the user submits "mum"
    Then the grade should be "correct"
```

---

## 4. Agent Types and Model Selection

| Agent Type | Model | When to Use |
|------------|-------|-------------|
| **Initializer** | Opus | First run only - sets up manifest, features, architecture |
| **Architect/Reviewer** | Opus | ADR review, complex design decisions, phase planning |
| **Feature Agent** | Sonnet | BDD feature implementation (most common) |
| **Scaffold Agent** | Haiku | Simple file generation, boilerplate, configs |
| **Test Agent** | Haiku | Running verifications, updating test status |
| **Cleanup Agent** | Haiku | Code formatting, documentation, git commits |

### Model Selection Rules in Manifest

```json
{
  "model_rules": {
    "opus": {
      "use_for": ["architecture", "review", "complex_refactor", "phase_planning"],
      "max_tasks_per_session": 1,
      "requires_human_approval": true
    },
    "sonnet": {
      "use_for": ["feature", "integration", "bug_fix"],
      "max_tasks_per_session": 3,
      "requires_human_approval": false
    },
    "haiku": {
      "use_for": ["scaffold", "types", "test", "cleanup", "docs"],
      "max_tasks_per_session": 10,
      "requires_human_approval": false
    }
  }
}
```

---

## 5. Agent Session Protocol

Every agent session follows this strict protocol:

### Phase 1: Orient (Read-Only)
```bash
# 1. Check current directory
pwd

# 2. Read manifest to understand project state
if command -v jq >/dev/null; then
  cat .agent/manifest.json | jq '.phases[].tasks[] | select(.status == "pending") | .id'
else
  python - <<'PY'
import json
with open('.agent/manifest.json') as f:
    data = json.load(f)
for phase in data.get('phases', []):
    for task in phase.get('tasks', []):
        if task.get('status') == 'pending':
            print(task.get('id'))
PY
fi

# 3. Read progress log
cat .agent/progress.json | tail -20

# 4. Check git status
git log --oneline -10
git status

# 5. Find my assigned task (or pick next available)
cat .agent/current-agent.json
```

### Phase 2: Verify Environment
```bash
# Run init script
./scripts/init.sh

# Run smoke tests to ensure nothing is broken (skip if not defined)
pnpm -s run test:smoke --if-present

# If smoke fails, STOP and fix before new work
```

### Phase 3: Claim Task
```json
// Update .agent/current-agent.json
{
  "session_id": "agent_session_042",
  "model": "sonnet",
  "task_id": "feat_001",
  "started_at": "2026-01-04T10:00:00Z",
  "status": "working"
}
```

### Phase 4: BDD Red-Green Cycle

```
┌─────────────────────────────────────────────────────────┐
│  1. READ feature file                                   │
│     cat features/onboarding/anonymous-start.feature     │
├─────────────────────────────────────────────────────────┤
│  2. WRITE step definitions (if not exist)               │
│     Create: tests/steps/anonymous-start.steps.ts        │
├─────────────────────────────────────────────────────────┤
│  3. RUN tests (should be RED)                           │
│     pnpm test:bdd                                       │
│     Expected: 0/3 scenarios passing                     │
├─────────────────────────────────────────────────────────┤
│  4. IMPLEMENT minimum code to pass ONE scenario         │
│     Write: src/components/WelcomeScreen.tsx             │
├─────────────────────────────────────────────────────────┤
│  5. RUN tests again (should be GREEN for that scenario) │
│     pnpm test:bdd                                       │
│     Expected: 1/3 scenarios passing                     │
├─────────────────────────────────────────────────────────┤
│  6. COMMIT with descriptive message                     │
│     git add . && git commit -m "feat(onboarding):       │
│     implement welcome screen - scenario 1/3 passing"   │
├─────────────────────────────────────────────────────────┤
│  7. REPEAT steps 4-6 for remaining scenarios            │
├─────────────────────────────────────────────────────────┤
│  8. ALL GREEN? Update manifest and progress             │
└─────────────────────────────────────────────────────────┘
```

### Phase 5: Clean Exit

```bash
# 1. Run full verification
pnpm test:bdd
pnpm typecheck
pnpm lint

# 2. Update manifest.json (ONLY status, verification, and completed_* fields)
# Task status: "pending" -> "done"
# verification.passed: false -> true
# scenarios_passed: 0 -> 3

# 3. Write progress entry
{
  "session_id": "agent_session_042",
  "task_id": "feat_001",
  "completed_at": "2026-01-04T11:30:00Z",
  "summary": "Implemented anonymous start flow. All 3 BDD scenarios passing.",
  "files_changed": ["src/components/WelcomeScreen.tsx", "src/stores/user.ts"],
  "tests_added": 3,
  "notes": "Used device fingerprint lib for device ID. Consider adding fallback."
}

# 4. Final git commit
git add .
git commit -m "feat(onboarding): anonymous start complete - 3/3 scenarios"

# 5. Clear current-agent.json
{
  "session_id": null,
  "task_id": null,
  "status": "idle"
}
```

---

## 6. Verification Gates

No task can be marked "done" without passing ALL verification gates:

### Gate 1: Type Check
```bash
pnpm typecheck
# Must exit 0
```

### Gate 2: Lint
```bash
pnpm lint
# Must exit 0, no errors (warnings OK)
```

### Gate 3: Unit Tests
```bash
pnpm test:unit
# All tests must pass
```

### Gate 4: BDD Tests (if feature task)
```bash
pnpm test:bdd
# ALL scenarios must be GREEN
```

### Gate 5: Smoke Test
```bash
pnpm -s run test:smoke --if-present
# Critical paths must work
```

### Gate 6: Manual Verification (Opus review tasks only)
```json
{
  "requires_human_approval": true,
  "approved_by": "human",
  "approved_at": "2026-01-04T12:00:00Z"
}
```

---

## 7. Agent Prompts

### Initializer Agent Prompt (Opus)

```
You are the INITIALIZER AGENT for the DuolingoRU project.

YOUR ONE-TIME JOB:
1. Read the PRD at projects/anglo/PRD_Enhanced.md
2. Create .agent/manifest.json with ALL features broken into tasks
3. Create .agent/progress.json (empty array)
4. Create .agent/current-agent.json (idle state)
5. Generate ALL .feature files in features/ directory
6. Create scripts/init.sh for environment setup
7. Create initial ADRs in docs/adrs/
8. Make initial git commit

RULES:
- Break features into SMALL tasks (max 2 hours of work each)
- Each task must have clear verification criteria
- Feature tasks MUST reference a .feature file
- Assign model types: haiku for simple, sonnet for features, opus for architecture
- Do NOT implement any features - only scaffold and plan

OUTPUT:
- .agent/manifest.json with 50-100 tasks across phases
- 20-30 .feature files covering all user stories
- Clean git history with descriptive commits
```

### Feature Agent Prompt (Sonnet)

```
You are a FEATURE AGENT for DuolingoRU.

STARTUP SEQUENCE (always do this first):
1. pwd
2. if command -v jq >/dev/null; then
     cat .agent/manifest.json | jq '.phases[].tasks[] | select(.status == "pending")'
   else
     python - <<'PY'
import json
with open('.agent/manifest.json') as f:
    data = json.load(f)
for phase in data.get('phases', []):
    for task in phase.get('tasks', []):
        if task.get('status') == 'pending':
            print(task.get('id'))
PY
   fi
3. cat .agent/progress.json | tail -10
4. git log --oneline -5
5. ./scripts/init.sh
6. pnpm -s run test:smoke --if-present

TASK SELECTION:
- Pick the FIRST pending task where all depends_on are "done"
- Claim it by updating .agent/current-agent.json
- Your task is: [TASK_ID]

BDD WORKFLOW (strict):
1. Read the feature file: cat [feature_file]
2. Write step definitions if missing
3. Run tests - confirm they are RED
4. Implement MINIMUM code to pass ONE scenario
5. Run tests - confirm ONE scenario is GREEN
6. Git commit with message: "feat(scope): description - N/M scenarios"
7. Repeat 4-6 until ALL scenarios GREEN
8. Update manifest: task status = "done", verification.passed = true
9. Write progress entry
10. Final commit and clear current-agent.json

RULES:
- NEVER skip the red-green cycle
- NEVER mark task done if any scenario is red
- NEVER modify feature files (they are requirements)
- NEVER work on multiple tasks
- ALWAYS leave environment in clean state
- ALWAYS verify before marking done

If smoke tests fail at startup, FIX THEM before starting new work.
```

### Cleanup Agent Prompt (Haiku)

```
You are a CLEANUP AGENT for DuolingoRU.

YOUR JOB:
1. Run pnpm lint --fix
2. Run pnpm format
3. Check for TODO comments and log them
4. Verify all tests still pass
5. Update documentation if code changed
6. Make cleanup commit: "chore: cleanup and formatting"

RULES:
- Do NOT change functionality
- Do NOT add new features
- Only fix formatting, types, and docs
```

---

## 8. Compaction-Safe Artifacts

When context compacts, agents need these files to recover:

| File | Purpose | Read by |
|------|---------|---------|
| `.agent/manifest.json` | What needs to be done | All agents |
| `.agent/progress.json` | What was done recently | All agents |
| `.agent/current-agent.json` | Who's working now | All agents |
| `git log` | Code change history | All agents |
| `features/*.feature` | Acceptance criteria | Feature agents |
| `scripts/init.sh` | How to start env | All agents |

### Progress Entry Format

```json
{
  "session_id": "agent_session_042",
  "model": "sonnet",
  "task_id": "feat_001",
  "started_at": "2026-01-04T10:00:00Z",
  "completed_at": "2026-01-04T11:30:00Z",
  "duration_minutes": 90,
  "summary": "Implemented anonymous user start flow",
  "feature_file": "features/onboarding/anonymous-start.feature",
  "scenarios": {
    "total": 3,
    "passed": 3,
    "failed": 0
  },
  "files_changed": [
    "projects/anglo/apps/pwa/src/components/WelcomeScreen.tsx",
    "projects/anglo/apps/pwa/src/stores/user.ts",
    "tests/steps/anonymous-start.steps.ts"
  ],
  "commits": [
    "abc1234 feat(onboarding): welcome screen - 1/3",
    "def5678 feat(onboarding): start button - 2/3",
    "ghi9012 feat(onboarding): first exercise - 3/3"
  ],
  "blockers": [],
  "notes": "Used zustand for local state. Device ID via fingerprintjs."
}
```

---

## 9. Multi-Agent Orchestration Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (Human or Script)              │
├────────────────────────────────────────────────────────────────┤
│  1. Run INITIALIZER (Opus) - once at project start             │
│     Creates: manifest.json, features/, init.sh                 │
├────────────────────────────────────────────────────────────────┤
│  2. Loop until manifest complete:                              │
│                                                                │
│     a. Check manifest for next pending task                    │
│     b. Select model based on task.model field                  │
│     c. Spawn agent with appropriate prompt                     │
│     d. Wait for agent to complete or timeout                   │
│     e. Verify clean exit (tests pass, manifest updated)        │
│     f. If failed, spawn cleanup agent or retry                 │
│                                                                │
│  3. Periodically run REVIEW (Opus) on completed phases         │
│     Reviews: code quality, architecture adherence              │
├────────────────────────────────────────────────────────────────┤
│  4. On phase completion, run INTEGRATION tests                 │
│     pnpm test:integration                                      │
└────────────────────────────────────────────────────────────────┘
```

### Parallel Agent Rules

- Only ONE agent can work on a task at a time (current-agent.json lock)
- Multiple agents CAN work on different tasks in different packages
- Example: Haiku on `packages/types` while Sonnet on `projects/anglo/apps/pwa`
- Lock is per-task, not per-repo
- When updating `.agent/*.json`, acquire a filesystem lock (e.g., `mkdir .agent/.lock`), edit, then `rmdir .agent/.lock`; retry if lock exists

---

## 10. Recovery Protocol

If an agent crashes or times out:

```bash
# 1. Check what was being worked on
cat .agent/current-agent.json

# 2. Check git status for uncommitted work
git status
git diff

# 3. If partial work exists, either:
#    a. Commit with WIP: git commit -m "WIP: [task_id] - interrupted"
#    b. Or stash with untracked: git stash -u -m "WIP: [task_id] - interrupted"
#    c. Do NOT use git reset --hard without explicit approval

# 4. Run smoke tests
pnpm -s run test:smoke --if-present

# 5. If smoke fails, spawn cleanup agent

# 6. Reset current-agent.json to idle
echo '{"status": "idle"}' > .agent/current-agent.json

# 7. Re-spawn agent to retry task
```

---

## Summary: Key Principles

1. **JSON not Markdown** - Manifest and progress in JSON (agents less likely to corrupt)
2. **BDD-First** - Every feature has a .feature file before implementation
3. **Red-Green-Commit** - Small cycles, always verifiable
4. **Model Selection** - Right model for right task (Haiku cheap, Opus strategic)
5. **Clean Handoffs** - Every session ends with passing tests and updated manifest
6. **Verification Gates** - No task "done" without all checks passing
7. **Compaction-Safe** - All state recoverable from files, not memory
