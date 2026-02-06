@core
# Tier: @core
# Load-bearing for: Production practice
# Psychological intent: Typing increases realism; should ramp gradually to avoid early frustration.
# MVP scope (preserve effect):
# - Type input with basic typo tolerance (diacritics, punctuation).
# - Optional word bank in early units.
# Pitfalls / anti-patterns:
# - Don't require perfect spelling in first unit.
Feature: Translate Type Exercise
  As a learner
  I want to type a translation
  So that I can practice writing and spelling in English

  Background:
    Given a lesson is active
    And a "translate_type" exercise is displayed

  @core @stub
  Scenario: Translate type exercise structure
    Given the exercise loads
    Then I should see:
      | Element | Content |
      | Prompt (Russian) | "Привет!" |
      | Instruction | "Type the English translation" |
      | Text Input Field | Empty, ready for typing |
      | Submit Button | "Check" |

  @core @stub
  Scenario: User types correct answer
    Given the prompt is "Привет!"
    And the correct answer is "Hello"
    When the user types "Hello" in the text field
    And clicks "Check"
    Then success screen appears: "✓ Correct! +10 XP"
    And they advance to the next exercise

  @v2
  Scenario: Fuzzy matching tolerates typos
    Given the correct answer is "Hello"
    When the user types "Helo" (missing 'l')
    And clicks "Check"
    Then a screen appears: "Close! Did you mean 'Hello'?"
    And options are "Yes" or "Try again"
    And clicking "Yes" counts as correct
    And clicking "Try again" allows another attempt

  @core @stub
  Scenario: Case insensitivity
    Given the correct answer is "Hello"
    When the user types "hello"
    And clicks "Check"
    Then it's accepted as correct: "✓ Correct!"

  @core @stub
  Scenario: Extra spaces are trimmed
    Given the correct answer is "Hello how are you"
    When the user types "  Hello  how  are  you  " (with extra spaces)
    And clicks "Check"
    Then the spaces are trimmed
    And the answer is accepted: "✓ Correct!"

  @v2
  Scenario: Synonym acceptance
    Given the correct answer is "Hello"
    And acceptable synonyms include: ["Hi", "Hey"]
    When the user types "Hi"
    And clicks "Check"
    Then it's accepted as correct: "✓ Correct! (Hi also works!)"

  @core @stub
  Scenario: Incorrect answer feedback
    Given the correct answer is "Hello"
    When the user types "Goodbye"
    And clicks "Check"
    Then an incorrect screen appears:
      """
      - "✗ Not quite."
      - Shows correct: "Hello"
      - Hint: "Привет means a greeting, not a farewell"
      - (If hearts are enabled for free tier) This wrong attempt costs 1 heart
      """

  @v2
  Scenario: Capitalization handling
    Given the correct answer is "Hello, how are you?"
    When the user types "hello, how are you?"
    And clicks "Check"
    Then a lenient check occurs
    And it's accepted or shows a hint about capitalization

  @v2
  Scenario: Free user's wrong answer limit
    Given hearts are enabled
    And a free user with 2 hearts
    When they submit a wrong answer
    Then they lose a heart: "❤️ 2" → "❤️ 1"
    When they submit another wrong answer
    Then they lose a heart: "❤️ 1" → "❤️ 0"
    And the lesson continues (no blocking)
    And the app suggests review to regain hearts

  @core @stub
  Scenario: User can clear and retype
    Given the user has typed "Hello"
    When they click the clear/X button
    Then the text field clears
    And they can type a new answer

  @v2
  Scenario: Keyboard input support
    Given the text field is focused
    When the user types on keyboard (desktop or mobile)
    Then characters appear in the field
    And backspace/delete works
    And pressing Enter submits the answer (or Tab to next)
