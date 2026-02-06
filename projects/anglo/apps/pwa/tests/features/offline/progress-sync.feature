@core
# Tier: @core
# Load-bearing for: Trust + streak integrity
# Psychological intent: Users must believe progress is safe; sync issues destroy trust and habits.
# MVP scope (preserve effect):
# - Local-first event log.
# - Sync on reconnect with idempotent writes.
# - Conflict resolution rules (newest wins with audit).
# Pitfalls / anti-patterns:
# - Don't drop offline completions; they must count for streak when synced.
Feature: Progress Synchronization (Offline ↔ Online)
  As a learner
  I want my offline progress to sync reliably
  So that I never lose learning or streak credit

  Background:
    Given lesson completions are written to a local event log first
    And sync runs when connectivity is available

  Scenario: Sync runs automatically on reconnect
    Given a learner completed lessons offline
    When connectivity returns
    Then sync starts automatically
    And queued events are uploaded safely (idempotent)
    And the learner does not need to do anything

  Scenario: Offline completions count for streak after sync
    Given the learner completed a qualifying activity offline yesterday
    When sync succeeds today
    Then the system credits the streak day correctly
    And does not reset the streak due to delayed sync

  @retention
  Scenario: Learner can see last sync status
    Given a learner opens their profile
    Then they can see:
      """
      - "Last sync: 2 minutes ago"
      - Or "Syncing…" while active
      """
