@core
# Tier: @core
# Load-bearing for: Variety + speed
# Psychological intent: Fast mini-game style gives dopamine and keeps sessions lively.
# MVP scope (preserve effect):
# - Match vocab pairs with timer optional (v2).
# Pitfalls / anti-patterns:
# - Don't make it too hard early.
Feature: Match Pairs Exercise
  As a learner
  I want to match English words or phrases with their translations
  So that I can build vocabulary and comprehension

  Background:
    Given a lesson is active
    And a "match_pairs" exercise is displayed

  @retention @stub
  Scenario: Match pairs exercise layout
    Given the exercise loads
    Then I should see:
      | Element | Content |
      | Left Column | 5 Russian words/phrases |
      | Right Column | 5 English translations (scrambled) |
      | Instruction | "Match pairs - tap left then right" |
    And all items are presented as cards/buttons

  @retention @stub
  Scenario: User matches pairs correctly
    Given the left side has: ["кошка", "собака", "дом", "дерево", "рыба"]
    And the right side has (scrambled): ["fish", "tree", "house", "cat", "dog"]
    When the user taps "кошка" then "cat"
    Then the pair is highlighted/connected
    And it's marked as correct
    And the user continues to match remaining pairs

  @retention @stub
  Scenario: User completes all pairs
    Given the user has matched 4 out of 5 pairs
    When they tap "рыба" then "fish"
    Then all 5 pairs are complete
    And the exercise succeeds: "✓ Perfect! +50 XP"
    And they advance to next exercise

  @retention @stub
  Scenario: User can see connection lines (optional)
    Given pairs are being matched
    When a pair is tapped
    Then a visual line or highlight connects the two items
    And the connection remains visible until all pairs complete
    And the connection is colored (green for correct, red for error if wrong match detected)

  @retention @stub
  Scenario: User can undo a match
    Given the user has matched "кошка" with "cat"
    When they click an "Undo" button or tap the pair again
    Then the match is undone
    And both cards are available to match again

  @retention @stub
  Scenario: Wrong match detection (if strict mode)
    Given the user tries to match "кошка" with "dog" (incorrect)
    When they confirm this match
    And strict mode is on
    Then, if hearts are enabled, they lose a heart immediately
    And an error message: "Not quite. Кошка means cat, not dog"
    And they can try again

  @retention @stub
  Scenario: Hints available for match pairs
    Given a user is struggling with matches
    When they click the "Hint" button
    Then a hint highlights one correct pair
    And the user can follow the example for other pairs

  @retention @stub
  Scenario: Match pairs with sentences
    Given a more advanced exercise with full sentences
    And the left side has: ["Привет, как дела?", "Мне нравится кофе"]
    And the right side has: ["I like coffee", "Hello, how are you?"]
    When the user matches correctly
    Then the exercise succeeds

  @retention @stub
  Scenario: Free user's wrong match penalty
    Given hearts are enabled
    And a free user with 2 hearts
    When they make a wrong match and confirm
    Then they immediately lose a heart: "❤️ 2" → "❤️ 1"
    And they must correct all remaining matches with 1 heart left
    And another wrong match loses the last heart

  @retention @stub
  Scenario: Match pairs timer (optional)
    Given some match exercises have a timer
    When the exercise starts
    Then a countdown timer appears: "60 seconds"
    And as time decreases, visual indicator changes (yellow, then red)
    And if time expires, the exercise ends
    And the user can retry or move on (depending on settings)

  @retention @stub
  Scenario: Audio pronunciation on match pairs
    Given a vocabulary-heavy match exercise
    When the user taps a word/phrase
    Then audio plays the pronunciation
    And they can hear how to say the word
    And this helps confirm the correct match
