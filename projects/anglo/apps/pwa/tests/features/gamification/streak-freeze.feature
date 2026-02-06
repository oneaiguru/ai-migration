@retention
# Tier: @retention
# Load-bearing for: Churn prevention
# Psychological intent: Safety valve reduces rage-quits when life happens; still preserves loss aversion by being limited.
# MVP scope (preserve effect):
# - Users can equip 1 freeze.
# - Freeze is consumed automatically on missed day.
# - Earn freeze via streak milestone or quests.
# Pitfalls / anti-patterns:
# - Don't make freeze paid-only in RU.
# Success signals:
# - Churn after missed day
# - Freeze consumption rate
Feature: Streak Freeze (Grace Day)
  As a learner
  I want an occasional safety net for my streak
  So that one busy day doesn't erase weeks of effort

  Background:
    Given a learner has an active streak
    And a streak freeze is a limited-use item that protects ONE missed day
    And streak freezes are earned (not required to pay, no ads)

  Scenario: Learner can equip one streak freeze
    Given a learner owns 1 streak freeze
    When they open Streak settings
    Then they can toggle: "Streak freeze: Equipped"
    And the UI shows: "1 equipped / 0 spare"

  Scenario: Freeze is consumed automatically on a missed day
    Given a learner has "🔥 12"
    And they have 1 streak freeze equipped
    When they miss a day (no qualifying activity before local midnight)
    Then the streak remains "🔥 12"
    And the freeze is consumed
    And the next day the learner can continue the streak normally

  Scenario: Freeze is not consumed when the learner practices
    Given a learner has a streak freeze equipped
    When they complete a qualifying activity today
    Then the streak freeze remains available
    And it is not consumed

  Scenario: Freeze can be earned through a milestone
    Given a learner reaches a 10-day streak milestone
    When the milestone celebration appears
    Then they are granted 1 streak freeze
    And a message explains what it does in one sentence

  @retention
  Scenario: Freeze can be earned through quests
    Given daily quests are enabled
    When a learner completes all quests for the day
    Then they may receive a streak freeze as a reward (configurable)

  @v2
  Scenario: Learner can equip two freezes for longer streaks
    Given a learner has 2 streak freezes
    When they equip both
    Then the UI shows: "2 equipped"
    And two separate missed days can be protected
