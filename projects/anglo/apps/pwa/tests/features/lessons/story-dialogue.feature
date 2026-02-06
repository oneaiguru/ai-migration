@core
# Tier: @core
# Load-bearing for: Credibility (real course) + Retention (narrative)
# Psychological intent: Stories/dialogues make progress feel real and contextual; breaks monotony and increases attachment.
# MVP scope (preserve effect):
# - Story node appears every N units (configurable).
# - Includes audio + text + 3–6 comprehension questions.
# - Counts toward streak and daily goal.
# Pitfalls / anti-patterns:
# - Don't make story text too long early; keep beginner-friendly.
# Success signals:
# - Story completion rate
# - Retention lift on story days
Feature: Story / Dialogue Nodes
  As a learner
  I want short stories and dialogues in the path
  So that I can understand real language in context

  Background:
    Given the course path can include special "Story" nodes
    And story nodes include text + audio
    And story nodes end with short comprehension checks

  Scenario: Story node appears on the path
    Given a learner reaches a story milestone (e.g., every 3–5 units)
    When they view the path
    Then a story node is visible with a distinct icon/style
    And it is unlocked like a normal lesson node

  Scenario: Story provides audio + text
    Given a learner opens a story
    Then the story shows the dialogue text
    And each line has a tap-to-play audio button
    And the learner can replay audio freely

  Scenario: Story ends with comprehension questions
    Given a learner finishes reading/listening to the story
    When the questions begin
    Then there are 3–6 questions
    And early questions are recognition-based (easy)
    And feedback is instant

  Scenario: Completing a story counts toward streak and goal
    Given the learner has not completed today's streak day yet
    When they complete a story node
    Then the day counts as complete for streak purposes
    And daily goal progress increases
