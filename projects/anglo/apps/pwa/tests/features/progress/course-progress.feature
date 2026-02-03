@core
# Tier: @core
# Load-bearing for: Credibility signals
# Psychological intent: Visible depth + milestones convince users it's a real course.
# MVP scope (preserve effect):
# - Course map shows CEFR sections (A1/A2/B1).
# - Visible unit count and checkpoint gates.
# - Progress indicator: units completed + current unit.
# Pitfalls / anti-patterns:
# - Don't show tiny numbers that feel like a demo.
Feature: Course Progress and "Real Course" Signals
  As a learner
  I want to see how big the course is and where I am
  So that I feel I'm taking a real course, not a tiny demo

  Background:
    Given the course is organized into sections (A1/A2/B1)
    And each section has units
    And some units include Story/Dialogue nodes and checkpoint tests

  Scenario: Course map shows CEFR-ish sections
    Given a learner opens the course map
    Then they can see labeled sections:
      """
      - A1 (Beginner)
      - A2 (Elementary)
      - B1 (Intermediate)
      """
    And each section shows how many units it contains

  Scenario: Unit count is visible to signal depth
    Given the learner is in the course map
    Then the UI shows:
      """
      - "Unit 3 of 40" (example)
      - Or "Section 1: Unit 3 of 12"
      """
    And the learner can scroll to preview later units

  Scenario: Checkpoint tests appear at section boundaries
    Given a learner reaches the end of A1 section
    Then a checkpoint test node appears
    And passing it unlocks the next section

  Scenario: Stories/Dialogues appear as special nodes
    Given story content exists in the curriculum
    Then the path includes story nodes every N units (configurable)
    And story nodes are visibly different from lessons
    And they include audio + comprehension checks

  @retention
  Scenario: Progress screen shows streak, goal, and course position together
    Given a learner opens their profile or progress screen
    Then they see:
      """
      - Current streak
      - Today's goal progress
      - Current section/unit/lesson position
      """

  @core
  Scenario: Incident banner offers streak repair after outage
    Given an outage impacted yesterday
    And the learner missed yesterday with a prior streak
    When they open the home screen
    Then an incident banner appears with copy "Вчера произошёл сбой на сервере. Восстановить серию?"
    And there is a "Восстановить" button
    And there is a dismiss "✕" control

  @v2
  Scenario: Pace projection (optional)
    Given a learner has studied for 14 days
    When viewing progress insights
    Then the app may show a gentle estimate:
      """
      - "At this pace, you may reach A2 in ~X weeks"
      """
