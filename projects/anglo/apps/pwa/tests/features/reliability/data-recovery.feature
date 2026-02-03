@core
# Tier: @core
# Load-bearing for: Trust
# Psychological intent: Fear of losing progress kills habit; basic recovery is mandatory.
# MVP scope (preserve effect):
# - Session resume after crash.
# - Server-side progress snapshots.
# - Restore last known state on reinstall (logged-in).
Feature: Data Recovery and Progress Integrity
  As a learner
  I want my progress to be safe
  So that I never feel scared of losing what I earned

  Background:
    Given progress events are stored locally first
    And the server periodically snapshots user progress (for logged-in users)

  Scenario: Lesson progress is not lost after a crash
    Given a learner completes a lesson
    When the app crashes immediately after completion
    And the learner reopens the app
    Then the lesson remains completed
    And XP/streak updates are preserved

  Scenario: Reinstall restores progress after login
    Given a learner is logged in on Device A
    And their progress is synced to the server
    When they reinstall the app
    And log in again
    Then their course position and streak are restored

  @v2
  Scenario: User data export for portability (optional)
    Given a learner requests a data export
    Then the system can generate a machine-readable export (JSON/CSV)
