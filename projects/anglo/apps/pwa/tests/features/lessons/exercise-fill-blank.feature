@core
# Tier: @core
# Load-bearing for: Grammar scaffolding
# Psychological intent: Guided recall feels like 'I knew it' even when challenged.
# MVP scope (preserve effect):
# - Single blank with options or typing depending on level.
Feature: Fill in the Blank Exercise
  As a learner
  I want to fill in missing words in sentences
  So that I can practice grammar and vocabulary in context

  Background:
    Given a lesson is active
    And a "fill_blank" exercise is displayed

  @retention @stub
  Scenario: Fill blank exercise structure
    Given the exercise loads
    Then I should see:
      | Element | Content |
      | Sentence | "I _____ coffee every morning" |
      | Blank | A text input field (underlined) |
      | Options (optional) | Word bank below (or open-ended) |
      | Instruction | "Fill in the blank" |

  @retention @stub
  Scenario: Sentence with single blank
    Given a simple sentence: "She _____ to the park"
    When the user taps the blank
    Then a text input appears
    And they can type the missing word

  @retention @stub
  Scenario: User types correct answer
    Given the blank is "_____ are you from?"
    And the correct answer is "Where"
    When the user types "Where"
    And clicks "Check"
    Then :
      """
      - Sentence completes: "Where are you from?"
      - Success: "✓ Correct!"
      - XP awarded
      """

  @retention @stub
  Scenario: User types incorrect answer
    Given the blank is "_____ are you from?"
    When the user types "When" (wrong)
    And clicks "Check"
    Then :
      """
      - Error message: "✗ Not quite."
      - Correct answer shown: "Where"
      - Explanation: "We use 'Where' to ask about location"
      - (If hearts are enabled for free tier) This wrong attempt costs 1 heart
      """

  @retention @stub
  Scenario: Case-insensitive matching
    Given the correct answer is "Where"
    When the user types "where" (lowercase)
    Then it's accepted as correct
    And no correction needed

  @retention @stub
  Scenario: Synonym acceptance
    Given the correct answer is "large"
    And synonyms include: ["big", "huge"]
    When the user types "big"
    Then it's accepted: "✓ Correct! (big also works!)"

  @retention @stub
  Scenario: Multiple blanks in one sentence
    Given a sentence: "_____ _____ is your name?"
    And blanks are for "What" and "is"
    When the user fills both
    Then both must be correct for full credit
      """
      Or partial credit if only one correct
      """

  @retention @stub
  Scenario: Phrase fill instead of single word
    Given sentence: "I'm _______ to the store"
    And correct answer is "going" (or could accept "about to go")
    When the user enters answer
    Then flexible matching allows similar answers

  @retention @stub
  Scenario: Help/Hint on fill blank
    Given a difficult fill blank
    When the user clicks "Hint"
    Then hint appears:
      """
      - "First letter: W"
      - Or: "This is a question word"
      - Hint is consumed (limited per lesson)
      """

  @retention @stub
  Scenario: Free user heart penalty
    Given hearts are enabled
    And a free user with 2 hearts
    When they submit a wrong answer
    Then they lose a heart: "❤️ 2" → "❤️ 1"
    When they submit another wrong answer
    Then they lose a heart: "❤️ 1" → "❤️ 0"
    And the lesson continues (no blocking)
    And the app suggests review to regain hearts
