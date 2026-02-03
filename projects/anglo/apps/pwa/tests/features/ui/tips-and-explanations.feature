@core
# Tier: @core
# Load-bearing for: Credibility (learning depth)
# Psychological intent: Users need 'why' to feel it's a real course; reduces frustration on mistakes.
# MVP scope (preserve effect):
# - Per-unit Guidebook (short).
# - Inline 'Почему?' on incorrect answers (authored explanations).
# - Report content issue.
# Pitfalls / anti-patterns:
# - Don't hide explanations behind paywall.
Feature: Tips, Guidebooks, and "Почему?" Explanations
  As a learner
  I want short explanations of what I'm practicing
  So that I understand the language, not just guess

  Background:
    Given each unit has a short Guidebook (2–8 bullet points)
    And some exercises have authored micro-explanations for common mistakes
    And learners can report content issues

  Scenario: Guidebook is visible before starting a unit
    Given a learner is viewing a unit in the path
    When they tap "Guidebook"
    Then a panel opens showing:
      """
      - What you will learn in this unit
      - 2–8 tips (short)
      - 2–5 example sentences (short)
      """

  Scenario: Inline "Почему?" is available after mistakes
    Given a learner answers an exercise incorrectly
    When the feedback card appears
    Then it shows the correct answer
    And it shows a subtle link: "Почему?"
    When the learner taps "Почему?"
    Then they see a short explanation (1–2 sentences in Russian)
    And 1–2 example sentences
    And the explanation is available without a paywall

  Scenario: Accepted alternative answers can be shown (credibility, optional)
    Given an exercise supports multiple correct answers
    When a learner's answer is marked correct
    Then the UI can show (optional, hypothesis):
      """
      - "Также принимается:" + 1–3 alternatives
      """

  @retention
  Scenario: "Report an issue" is available from explanations
    Given a learner is viewing a Guidebook or a "Почему?" explanation
    When they tap "Report an issue"
    Then they can choose:
      """
      - "Answer marked wrong but should be accepted"
      - "Audio problem"
      - "Translation feels incorrect"
      - "Other"
      """
    And feedback is sent to support/content review

  @v2
  Scenario: Offline tips caching
    Given a learner viewed a Guidebook before
    When the learner is offline
    Then previously viewed Guidebooks can still load (optional)
