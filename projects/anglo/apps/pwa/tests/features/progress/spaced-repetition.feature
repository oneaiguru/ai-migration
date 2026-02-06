@core
# Tier: @core
# Load-bearing for: Learning efficacy + retention
# Psychological intent: Timely reviews prevent forgetting; 'I remember!' boosts confidence and keeps users returning.
# MVP scope (preserve effect):
# - Per-item strength model (e.g., 0–5 or half-life).
# - Daily due queue generation.
# - Mistakes prioritized for earlier review.
# - Review always available, even if new content is limited.
# Pitfalls / anti-patterns:
# - Don't rely on user manually choosing review—surface it.
# Success signals:
# - Review session engagement
# - Recall improvement proxy (error rate over time)
Feature: Spaced Repetition Review Engine
  As a learner
  I want the app to bring back words and patterns before I forget them
  So that I actually remember what I learned and feel progress

  Background:
    Given each learnable item (word, phrase, grammar pattern) has a memory strength model
    And the model updates based on correct/incorrect answers
    And items become "due" for review after a delay that grows with mastery
    And review sessions can be taken at any time

  Scenario: Item strength increases on correct answers
    Given an item "hello" has strength 1/5
    When the learner answers it correctly in a lesson
    Then its strength increases (e.g., 2/5)
    And its next review is scheduled further in the future

  Scenario: Item strength decreases on incorrect answers
    Given an item "goodbye" has strength 3/5
    When the learner answers it incorrectly
    Then its strength decreases (e.g., 2/5)
    And it becomes due sooner

  Scenario: App generates a daily review queue
    Given a learner has studied at least 20 items
    When they open the app today
    Then the app builds a review queue from items due today
    And the home screen shows a prompt like: "Повторение — N заданий"

  Scenario: Review session uses due + weak items first
    Given the learner starts a review session
    Then the session selects:
      """
      - Items due today
      - Recently missed items
      - A small mix of older items for reinforcement
      """
    And avoids repeating the same item too many times in a row

  Scenario: Completing a review counts for streak and daily goal
    Given a learner has not completed today's streak day yet
    When they complete a review session
    Then the day counts toward their streak
    And it counts toward their daily goal progress

  @core
  Scenario: Review is always available even if new content is limited
    Given the learner cannot or does not want to do a new lesson
    When they open the home screen
    Then a "Повторение — N заданий" action is always available
    And review provides meaningful progress

  @retention
  Scenario: Targeted review of mistakes is available
    Given the learner made mistakes in the last 3 lessons
    When they choose "Review mistakes"
    Then the review focuses on those missed items first

  @core
  Scenario: Review exercises are auto-interleaved into lessons
    Given a learner has more than 20 overdue review items
    And they have not completed a review session in 3 days
    When they start a new lesson
    Then the lesson includes up to 30% review exercises
    And review exercises are mixed with new exercises
    And the learner cannot distinguish review from new by UI

  @core
  Scenario: Path shows auto-generated practice nodes
    Given a learner has completed 5 lessons
    When they view the course map
    Then a "Practice" node appears after the 5th lesson
    And the node is labeled "Practice" with distinct styling
    And tapping it starts a review session from SRS queue
