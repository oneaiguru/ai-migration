@core
# Tier: @core
# Load-bearing for: Reward & closure
# Psychological intent: Ends sessions on a win; reinforces identity (I did it) and nudges next session.
# MVP scope (preserve effect):
# - Completion screen with XP + streak/day progress.
# - Next recommended action: Continue path OR Review weak items.
# - Tiny celebration animation.
# Pitfalls / anti-patterns:
# - Don't bury 'Continue' behind upsells.
# Success signals:
# - Next-lesson click-through
# - D1 session length
Feature: Complete Lesson
  As a learner
  I want to finish a lesson and see a clear result
  So that I feel a sense of progress and know what to do next

  Background:
    Given a learner is in an active lesson
    And the lesson has a known number of exercises

  Scenario: Lesson completion shows a satisfying summary
    Given the learner completes the last exercise
    When the success screen appears
    Then they see:
      """
      - XP earned (with a small animation)
      - Streak / daily goal progress for today
      - A short encouraging message
      """

  Scenario: Completion screen offers the next best action
    Given the learner finished a lesson
    When the completion screen appears
    Then they see clear options:
      """
      - "Continue" (next path node)
      - "Review weak items" (spaced repetition)
      """
    And the default primary action is "Continue"

  @core
  Scenario: Completing a review also counts as a completed activity
    Given a learner completes a review session
    Then the completion screen still shows progress updates
    And it can count toward streak/day goal (if not already counted)

  @retention
  Scenario: Lesson completion persists across sessions
    Given a lesson is completed
    When the app is closed and reopened
    Then the lesson remains marked complete
    And progress persists across sessions
