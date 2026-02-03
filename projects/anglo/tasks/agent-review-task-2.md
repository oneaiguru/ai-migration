# Task 2: Split feature review across two agents

Goal
- Two agents each review all Phase 1-5 task docs plus half of the .feature files.
- Split feature directories to keep context small while covering all feature specs.
- Each agent compares feature specs against task docs and reports mismatches/gaps.

Shared inputs (both agents must read)
- projects/anglo/tasks/master-tasks-phase-1.md (50038 bytes)
- projects/anglo/tasks/master-tasks-phase-2.md (76397 bytes)
- projects/anglo/tasks/master-tasks-phase-3.md (53271 bytes)
- projects/anglo/tasks/master-tasks-phase-4.md (57494 bytes)
- projects/anglo/tasks/master-tasks-phase-5.md (7702 bytes)

Feature directory inventory (count, bytes)
- projects/anglo/apps/pwa/tests/features/gamification (6, 20186)
- projects/anglo/apps/pwa/tests/features/lessons (10, 35903)
- projects/anglo/apps/pwa/tests/features/monetization (2, 9515)
- projects/anglo/apps/pwa/tests/features/offline (3, 13281)
- projects/anglo/apps/pwa/tests/features/onboarding (8, 24785)
- projects/anglo/apps/pwa/tests/features/payments (5, 19764)
- projects/anglo/apps/pwa/tests/features/progress (3, 13424)
- projects/anglo/apps/pwa/tests/features/reliability (2, 8831)
- projects/anglo/apps/pwa/tests/features/settings (4, 18101)
- projects/anglo/apps/pwa/tests/features/social (3, 11434)
- projects/anglo/apps/pwa/tests/features/support (1, 5111)
- projects/anglo/apps/pwa/tests/features/ui (3, 16976)

Split assignment (balanced by bytes)
- Agent A feature dirs (total 100638 bytes)
  - projects/anglo/apps/pwa/tests/features/lessons
  - projects/anglo/apps/pwa/tests/features/gamification
  - projects/anglo/apps/pwa/tests/features/onboarding
  - projects/anglo/apps/pwa/tests/features/payments
- Agent B feature dirs (total 96673 bytes)
  - projects/anglo/apps/pwa/tests/features/monetization
  - projects/anglo/apps/pwa/tests/features/offline
  - projects/anglo/apps/pwa/tests/features/progress
  - projects/anglo/apps/pwa/tests/features/reliability
  - projects/anglo/apps/pwa/tests/features/settings
  - projects/anglo/apps/pwa/tests/features/social
  - projects/anglo/apps/pwa/tests/features/support
  - projects/anglo/apps/pwa/tests/features/ui

Instructions for both agents
1) Read all task docs (Phase 1-5) first.
2) Review assigned feature directories against the task docs.
3) Record mismatches and missing support (API endpoints, policy config, entitlements, sync, offline rules, UX promises).
4) Flag scope creep vs PRD and task docs when present.

Report format (each agent)
- Summary: total files reviewed, count of gaps, count of mismatches.
- Findings table (one line per issue):
  - Feature file path
  - Issue summary
  - Impact (blocker/high/medium/low)
  - Suggested fix (task update vs feature update)

Terminal start commands
- Agent A: read task file projects/anglo/tasks/agent-review-task-2.md (Agent A section)
- Agent B: read task file projects/anglo/tasks/agent-review-task-2.md (Agent B section)
