@core
# Tier: @core
# Load-bearing for: Credibility (structured course)
# Psychological intent: Clear path reduces overwhelm; unlocks create anticipation.
# MVP scope (preserve effect):
# - Unit 1 unlocked by default.
# - Next unit unlocks on completion OR checkpoint pass.
# - Placement test can unlock multiple units.
# Pitfalls / anti-patterns:
# - Don't paywall skipping; use assessment instead.
Feature: Unit Unlock and Gating (Course Path)
  As a learner
  I want a clear path with milestones
  So that I always know what to do next and the course feels real

  Background:
    Given the course is divided into units
    And units are grouped into CEFR-ish sections (A1/A2/B1)
    And units can be completed by finishing their lessons OR passing a checkpoint test

  Scenario: Unit 1 is unlocked by default
    Given a new learner starts the course
    Then Unit 1 is unlocked
    And the next unit is visible but locked (depth signal)

  Scenario: Completing Unit 1 unlocks Unit 2
    Given Unit 1 is unlocked
    When the learner completes all required lessons in Unit 1
    Then Unit 2 becomes unlocked
    And the app celebrates a milestone

  @core
  Scenario: Placement test can unlock multiple units
    Given a learner chooses a placement test
    When they score into A2
    Then the app unlocks the recommended starting unit in A2
    And earlier units remain accessible for review

  @retention
  Scenario: Learner can always go back to earlier units
    Given a learner is currently in Unit 5
    When they tap Unit 2
    Then they can replay lessons for practice
    And replay does not lock or reset progress

  @v2
  Scenario: Optional soft preview of locked content
    Given a unit is locked
    When the learner taps it
    Then they can view:
      """
      - Unit title and goals
      - Example sentences
      - A note: "Complete the previous unit or pass the checkpoint to unlock"
      """
