@core
# Tier: @core
# Load-bearing for: Core loop (loss aversion)
# Psychological intent: Streak turns practice into identity; risk of loss pulls user back daily.
# MVP scope (preserve effect):
# - Streak visible on home.
# - Streak increments when daily goal met.
# - Streak-at-risk reminders.
# - Milestone at Day 10 (special celebration).
# Pitfalls / anti-patterns:
# - Don't break streak due to outages/offline sync issues.
# - Don't monetize fear (no ad/paywall to keep streak).
# Success signals:
# - Streak adoption
# - Streak length distribution
Feature: Streak Tracking
  As a learner
  I want to keep a daily streak
  So that I feel motivated to return every day and build a habit

  Background:
    Given a learner can be anonymous or logged in
    And the app defines a "streak day" in the learner's local timezone
    And a streak day counts as complete when the learner finishes ANY of:
      """
      - 1 path lesson, OR
      - 1 spaced-repetition review session, OR
      - reaches their configured daily goal (minutes / lessons / XP)
      """
    And the streak counter is visible on the home screen

  Scenario: New learners start with a 0-day streak
    Given a new learner opens the app for the first time
    Then they see a streak counter: "🔥 0"

  Scenario: First completed activity starts the streak
    Given a learner has "🔥 0"
    When they complete their first intro lesson today
    Then the streak becomes "🔥 1"
    And the completion screen celebrates: "Day 1 — you started!"

  Scenario: Streak increments only once per day
    Given a learner has already completed a streak day today
    When they complete another lesson today
    Then the streak remains the same
    And XP and progress still increase normally

  Scenario: Missing a day resets the streak
    Given a learner has an active streak: "🔥 5"
    And they have no streak freeze equipped
    And no incident protection applies for that day
    And streak repair is not offered for that day
    When the learner completes no qualifying activity before local midnight
    Then the next day their active streak resets to "🔥 0"
    And the app shows a gentle message about restarting (no shame)

  @core
  Scenario: Day 10 milestone has elevated celebration
    Given a learner has an active streak of 9 days
    When they complete a qualifying activity today
    Then their streak becomes 10
    And the celebration screen is larger than normal day celebrations
    And the celebration includes a unique Day 10 badge
    And the learner is granted 1 free streak freeze
    And the message emphasizes the milestone significance

  @retention
  Scenario: Best streak is tracked separately from current streak
    Given a learner once reached a 30-day streak
    And their current streak is 12 days
    When they view their profile
    Then they see:
      """
      - Current streak: 🔥 12
      - Best streak: 🏆 30
      """

  @core
  Scenario: Streak is not broken by mistake-limit mechanics
    Given a learner is having a hard lesson and makes many mistakes
    When the learner completes a review session instead of new content
    Then the day still counts toward the streak
    And the app encourages them: "Review counts — nice save!"

  @core
  Scenario: Streak is not lost due to offline completion
    Given the learner completed a lesson offline
    When the device comes back online and sync succeeds
    Then the completion counts for that day
    And the streak is updated accordingly

  @core
  Scenario: Streak is protected during incidents
    Given an incident is active affecting lesson completion
    And a learner has a 15-day streak
    When they attempt to start a lesson but cannot complete due to incident
    Then their streak is marked "protected" for that day
    And when the incident ends, their streak remains 15
    And they see a banner explaining their streak was protected

  @v2
  Scenario: Optional countdown timer until streak day ends
    Given a learner completed today's streak day
    When they view the home screen later that day
    Then a subtle timer may show (optional):
      """
      - "Next streak day begins in 8 hours"
      """
