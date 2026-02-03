@core
# Tier: @core
# Load-bearing for: Early competence
# Psychological intent: Recognition-based tasks make beginners feel capable quickly.
# MVP scope (preserve effect):
# - Word bank, tap-to-build sentence.
# - Hints and corrections.
# - No ad-gated continuation.
# Pitfalls / anti-patterns:
# - Don't make early items require typing; that's later.
Feature: Translate Tap Exercise
  As a learner
  I want to tap word blocks to form a translation
  So that I can practice word order and build sentences

  Background:
    Given a lesson is active
    And a "translate_tap" exercise is displayed

  @core @stub
  Scenario: Translate tap exercise presents correctly
    Given the exercise loads
    Then I should see:
      | Element | Content |
      | Prompt (Russian) | "Привет, как дела?" |
      | English Words | 5 scrambled word buttons: [Hello] [how] [am] [I] [you] |
      | Instruction | "Tap to translate" |
    And one word appears pre-highlighted (optional first word)

  @core @stub
  Scenario: User taps words in order
    Given the word bank shows: [Hello] [how] [are] [you]
    When the user taps:
      """
      1. [Hello]
      2. [how]
      3. [are]
      4. [you]
      """
    Then the words appear in the text field: "Hello how are you"
    And each word gets a checkmark or highlight as tapped
    And a "Check" button becomes active

  @core @stub
  Scenario: User can tap words out of order
    Given the word bank shows: [Hello] [how] [are] [you]
    When the user taps: [are] [you] [Hello] [how]
    Then the words appear in the order tapped: "are you Hello how"
    And the user can submit to check if correct

  @v2
  Scenario: User can undo taps
    Given the user has tapped: [Hello] [how] [are]
    When they click the "Undo" or "←" button
    Then the last word [are] is removed from the answer
    And [are] goes back to the word bank
    And they can tap another word or tap [are] again

  @core @stub
  Scenario: User submits correct answer
    Given the correct translation is: "Hello how are you"
    When the user taps words to form: "Hello how are you"
    And they click "Check"
    Then a success screen appears with:
      """
      - Green checkmark "✓ Correct!"
      - Encouraging message: "Great job!"
      - XP earned: "+10 XP"
      """
    And after 2 seconds, the next exercise auto-advances

  @core @stub
  Scenario: User submits incorrect answer
    Given the correct translation is: "Hello how are you"
    When the user taps: "Hello you are how"
    And clicks "Check"
    Then a correction screen appears:
      """
      - Red X "✗ Not quite."
      - Shows correct answer: "Hello how are you"
      - Gives a hint: "Word order matters in English"
      """
    And if hearts are enabled (free tier), this wrong attempt costs 1 heart

  @v2
  Scenario: User uses hint on translate tap
    Given an exercise is displayed
    When the user clicks the "Hint" button (💡)
    Then a hint appears: "The first word should be..."
    And one word is highlighted
    And the hint is consumed (marked used, though free users get limited hints)

  @v2
  Scenario: Special characters and punctuation
    Given an exercise where correct answer is: "Hello, how are you?"
    When the word bank includes: [Hello,] [how] [are] [you?]
    Then the user can tap these words with punctuation
    And the final answer matches exactly with punctuation

  @v2
  Scenario: Free user loses heart on wrong answer
    Given hearts are enabled
    And a free user with 2 hearts remaining
    When they submit an incorrect answer
    Then they lose a heart: "❤️ 2" → "❤️ 1"
    And a message: "Try again or lose a heart"

  @retention
  Scenario: If a learner runs out of hearts, they can recover via review
    Given hearts are enabled
    And a learner has 1 heart remaining
    When they submit another incorrect answer
    Then hearts reach 0
    And new lessons remain available (no blocking)
    And a message appears: "Let\'s review to regain hearts"
    And a "Review" button starts a spaced-repetition session
    And no ads are required to continue
