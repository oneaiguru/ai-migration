@core
# Tier: @core
# Load-bearing for: Growth (first-session conversion) + Retention (habit seed)
# Psychological intent: Commitment ladder: goal → micro-win → streak start → reminder permission → (later) account.
# MVP scope (preserve effect):
# - Goal selection (lightweight) before first lesson.
# - Auto-start an easy intro lesson (exactly 6 exercises).
# - Show streak start immediately after completion.
# - Ask for notifications after the win (not before).
# Pitfalls / anti-patterns:
# - Avoid long tutorials, walls of text, or multi-screen setup before learning.
# - Avoid complex choices (too many goals) early.
# Success signals:
# - First-session completion rate
# - D1→D2 retention
Feature: First Launch Tutorial and Commitment Ladder
  As a new learner
  I want the first session to feel easy and successful
  So that I trust the app and want to come back tomorrow

  Background:
    Given the app uses a short first-session ladder:
      """
      - Goal selection (simple)
      - Micro-win lesson (30–90 seconds)
      - Streak starts
      - Reminder offer
      - (Later) Account creation to save progress
      """

  Scenario: Goal selection is quick and non-blocking
    Given a new learner launches the app
    When they are asked about a daily goal
    Then the screen has ≤4 choices
    And the learner can continue in one tap

  Scenario: First lesson delivers a micro-win fast
    Given the learner finished goal selection
    When the first lesson starts
    Then the lesson contains exactly 6 exercises
    And the learner can finish the lesson quickly

  @core
  Scenario: First two exercises are recognition-based and nearly impossible to fail
    Given a new learner starts the micro-win lesson
    When exercise 1 loads
    Then it is a "select_image" type exercise
    And it has exactly 4 image choices
    And it declares content metadata successRateTarget >= 0.95
    When exercise 2 loads
    Then it is a "translate_tap" type exercise with word bank
    And the correct answer requires tapping 2-3 words maximum
    And there are no near-synonym distractors

  @core
  Scenario: Micro-win follows the exact 6-item sequence
    Given a new learner starts the micro-win lesson
    Then the exercises appear in this exact order:
      """
      1) select_image (difficulty 1)
      2) translate_tap (difficulty 1, word bank 2-3 words)
      3) match_pairs (difficulty 2, max 3 pairs)
      4) listen_tap (difficulty 2, audio then 3 choices)
      5) translate_tap (difficulty 2, single-choice, 3 options)
      6) translate_tap (difficulty 2, 3-4 words)
      """
    And there is no typing in the micro-win lesson
    And the audio exercise is position 4

  Scenario: Streak starts immediately after the win
    Given the learner completes the micro-win lesson today
    When the completion screen appears
    Then the streak shows "🔥 1"
    And the UI highlights that returning tomorrow keeps it going

  Scenario: Reminder is offered after value is shown
    Given the learner just got "🔥 1"
    When the app offers reminders
    Then the prompt is optional
    And it does not block the next action

  @core
  Scenario: Notification permission is requested AFTER micro-win only
    Given a new learner launches the app
    When they have NOT yet completed the micro-win lesson
    Then no notification permission dialog is shown
    When they complete the micro-win lesson
    Then the notification permission prompt appears
    And the prompt says "Хотите ежедневное напоминание, чтобы не потерять свою серию?"

  @core
  Scenario: Notification permission is not requested after a micro-win interruption
    Given a new learner launches the app
    And they start the micro-win lesson
    When they force-close the app before completing the micro-win lesson
    And they reopen the app
    Then no notification permission dialog is shown
    When they complete the micro-win lesson
    Then the notification permission prompt appears
    And the prompt says "Хотите ежедневное напоминание, чтобы не потерять свою серию?"

  @retention
  Scenario: Show the journey so the course feels real
    Given the learner finishes their first lesson
    When they land on the home/path screen
    Then the app highlights the next node to continue
    And shows that many units exist ahead (depth signal)
