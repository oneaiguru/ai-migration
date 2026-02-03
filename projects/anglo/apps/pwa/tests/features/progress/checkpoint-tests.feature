@core
# Tier: @core
# Load-bearing for: Credibility + pacing control
# Psychological intent: Checkpoint tests signal 'this is a course' and provide a mastery moment; unlocks next section without paywalls.
# MVP scope (preserve effect):
# - Short test at end of each section (A1/A2/B1).
# - Pass unlocks next section; fail suggests review plan.
# - Shareable milestone card (optional).
# Pitfalls / anti-patterns:
# - Don't hard-fail users; always offer review and retry.
Feature: Checkpoint Tests (Section Mastery Gates)
  As a learner
  I want checkpoint tests at milestones
  So that I know I'm progressing and the course feels structured

  Background:
    Given the course has CEFR-ish sections (A1/A2/B1)
    And each section ends with a checkpoint test node

  Scenario: Checkpoint node appears at the end of a section
    Given a learner reaches the last unit of A1
    When they view the path
    Then a checkpoint test node is visible
    And it is required to unlock the next section (configurable)

  Scenario: Passing the checkpoint unlocks the next section
    Given a learner starts the A1 checkpoint test
    When they achieve a passing score
    Then the next section (A2) unlocks
    And a milestone celebration appears

  Scenario: Failing the checkpoint suggests a review plan
    Given a learner takes the checkpoint test
    When they do not pass
    Then the app shows:
      """
      - A short, encouraging message
      - A "Review weak items" action
      - A "Retry later" action
      """
    And the learner can retry (no paywall)

  @retention
  Scenario: Share a milestone card (optional)
    Given a learner passes a checkpoint
    When they tap "Share"
    Then a shareable card is generated (image)
