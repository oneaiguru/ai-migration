@core
# Tier: @core
# Load-bearing for: Habit formation
# Psychological intent: Creates a small, achievable daily commitment; fuels streak and feelings of progress.
# MVP scope (preserve effect):
# - Pick one of 3–4 goals (e.g., 5/10/15 min or 1/2/3 lessons).
# - Goal progress indicator during session/day.
# - Easy change from settings.
# Pitfalls / anti-patterns:
# - Don't ask for exact schedules before first lesson.
# - Don't shame users for missing goals.
# Success signals:
# - Goal selection completion
# - Goal hit rate (D1–D7)
Feature: Daily Learning Goal
  As a learner
  I want a small daily goal
  So that I know what "enough for today" is and can build a streak

  Background:
    Given a learner can be anonymous or logged in
    And a daily goal can be measured in minutes, lessons, or XP
    And the goal can be changed any day

  Scenario: Lightweight goal selection during onboarding
    Given a new learner launches the app
    When they reach the goal selection step
    Then they can choose one of 3–4 simple options:
      """
      - "Quick" (≈ 5 minutes)
      - "Regular" (≈ 10 minutes)
      - "Serious" (≈ 15 minutes)
      - (Optional) "Custom"
      """
    And they can start learning immediately

  Scenario: Goal progress is visible on the home screen
    Given a learner has a daily goal set
    When they complete exercises today
    Then the home screen shows progress:
      """
      - A ring/bar filling up
      - "3/10 minutes" or "1/2 lessons" (depending on goal type)
      """

  Scenario: Completing the goal triggers a small celebration
    Given a learner is at 9/10 minutes of their goal
    When they complete another short activity
    Then they reach 10/10
    And they see: "Goal complete!"
    And the app nudges: "Come back tomorrow to keep your streak"

  @retention
  Scenario: Learner can change goal from settings
    Given a learner opens Settings → Daily Goal
    When they select a different goal
    Then the new goal is saved for future days
    And today's progress is recalculated if needed
