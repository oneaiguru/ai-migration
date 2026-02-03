@retention
# Tier: @retention
# Load-bearing for: Optional stakes mechanic
# Psychological intent: Small 'stakes' can increase focus, but must not block learning (RU expectation).
# MVP scope (preserve effect):
# - Hearts as mistake buffer (optional, non-blocking).
# - When hearts hit 0: suggest review, but do not block lessons.
# - No Energy system; no ads to continue.
# Pitfalls / anti-patterns:
# - Don't daily-cap learning in RU MVP.
Feature: Mistake Buffer (Hearts) — No Daily Energy Cap
  As a learner
  I want mistakes to have small stakes
  So that I pay attention, but I can always keep learning

  Background:
    Given the product may optionally use a hearts-based mistake buffer
    And hearts never block learning in the RU MVP
    And there is no Energy-per-question system

  Scenario: Hearts decrease on mistakes (optional mode)
    Given hearts are enabled
    And a learner starts a lesson with 5 hearts
    When they answer incorrectly
    Then hearts decrease by 1
    And the feedback remains encouraging

  Scenario: When hearts reach 0, the learner can recover via review
    Given hearts are enabled
    And the learner reaches 0 hearts
    Then new lessons remain available
    And the app suggests:
      """
      - "Review to regain hearts" (recommended)
      """
    And no waiting timers are used
    And no ads are required

  Scenario: Review restores hearts gradually
    Given hearts are enabled and a learner has 0 hearts
    When they complete a review session
    Then hearts increase (e.g., +1 or +2)
    And the learner can return to new lessons

  @core
  Scenario: Review is always accessible regardless of hearts
    Given hearts are enabled
    When a learner opens the home screen
    Then "Review" is available
    And review can count for streak/day goal

  @core
  Scenario: RU default disables hearts (hearts_enabled = false)
    Given an admin/config toggle "hearts_enabled" exists
    When hearts_enabled = false (RU default)
    Then:
      """
      - No hearts UI is shown
      - Lessons are never paused due to mistakes
      - Review still exists (spaced repetition)
      """
