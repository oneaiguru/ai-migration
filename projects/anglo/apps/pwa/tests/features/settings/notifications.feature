@core
# Tier: @core
# Load-bearing for: Retention (external trigger)
# Psychological intent: Gentle reminders protect the streak and build routine without annoyance.
# MVP scope (preserve effect):
# - Post-win prompt to enable reminders.
# - Daily reminder window (user-chosen time).
# - Streak-at-risk reminder.
# Pitfalls / anti-patterns:
# - Don't request permission on first screen before any value.
# Success signals:
# - Opt-in rate
# - D2 retention among opted-in users
Feature: Notification Settings and Practice Reminders
  As a learner
  I want helpful reminders
  So that I remember to practice and don't accidentally lose my streak

  Background:
    Given reminders are optional and configurable
    And reminders are timed in the learner's local timezone

  Scenario: Ask for notification permission after the first win
    Given a new learner just completed their first lesson
    When the celebration screen appears
    Then the app asks (politely): "Хотите ежедневное напоминание, чтобы не потерять свою серию?"
    And explains the benefit in one short sentence
    And if the learner says "Не сейчас", learning continues normally
    And the app stores that preference immediately
    And the app does not ask again for 7 days

  Scenario: Daily reminder time can be chosen
    Given a learner enables reminders
    When they choose a reminder time window (e.g., 18:00–20:00)
    Then the app schedules reminders in that window

  Scenario: Streak-at-risk reminder
    Given a learner has an active streak
    And they have not completed today's streak day yet
    When it is late in their chosen window
    Then a reminder can be sent:
      """
      - "🔥 Keep your streak — 1 quick lesson is enough"
      """

  @retention
  Scenario: Notification categories can be toggled
    Given a learner opens Settings → Notifications
    Then they can toggle:
      """
      - Practice reminder (daily)
      - Streak at risk (optional)
      - Milestones (optional)
      """

  @v2
  Scenario: Smart reminder timing
    Given a learner has a consistent practice time
    When the system learns their habit (e.g., 7 days)
    Then reminders can shift toward that time automatically (optional)
