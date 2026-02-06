@core
# Tier: @core
# Load-bearing for: Credibility (fair grading) + Review quality
# Psychological intent: Nothing breaks trust like 'I was right but you marked me wrong'. Provide transparent alternatives + appeal.
# MVP scope (preserve effect):
# - Accept common alternative answers (content-authored).
# - When rejected, show 'Why' or 'Accepted format' guidance.
# - One-tap 'Report: should be accepted' feedback.
# Pitfalls / anti-patterns:
# - Don't argue with the user; keep tone helpful.
# Success signals:
# - Rate of answer appeals
# - Reduction in 1-star review keywords: 'wrong'/'bug'
Feature: Answer Acceptance and Appeals
  As a learner
  I want fair grading and a way to appeal
  So that I trust the app's correctness

  Background:
    Given many prompts have multiple valid answers
    And the app uses an "accepted answers" set per exercise

  Scenario: Common alternative answers are accepted
    Given an exercise prompt that allows multiple correct answers
    When the learner submits an alternative that is listed as accepted
    Then the answer is marked correct
    And the learner is not penalized

  Scenario: When marked wrong, guidance is shown
    Given a learner submits an answer that is not accepted
    When it is marked incorrect
    Then the feedback shows:
      """
      - The expected answer (one example)
      - A brief hint about the format (if relevant)
      """
    And the tone is helpful

  Scenario: Learner can report "should be accepted"
    Given an answer was marked wrong
    When the learner taps "Report"
    Then they can select: "My answer should be accepted"
    And the app sends:
      """
      - Prompt id
      - Learner answer
      - Correct answer shown
      - Context (unit/lesson)
      """
