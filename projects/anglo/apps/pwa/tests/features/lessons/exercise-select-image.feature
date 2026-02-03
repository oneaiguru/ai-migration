@core
# Tier: @core
# Load-bearing for: Onboarding micro-win
# Psychological intent: Pictures make the first exercises nearly impossible to fail.
# MVP scope (preserve effect):
# - Select correct image from 2–4 options.
# - Audio optional (tap to hear).
Feature: Select Image Exercise
  As a visual learner
  I want to match words or sentences with pictures
  So that I can practice vocabulary with visual context

  Background:
    Given a lesson is active
    And a "select_image" exercise is displayed

  @retention @stub
  Scenario: Select image exercise layout
    Given the exercise loads
    Then I should see:
      | Element | Content |
      | Prompt | English word or sentence: "dog" |
      | Images | 4 image choices arranged in grid |
      | Instruction | "Select the correct image" |

  @retention @stub
  Scenario: Simple word-to-image matching
    Given the prompt: "dog"
    And images: [dog, cat, bird, fish]
    When the user taps the dog image
    Then :
      """
      - Image highlights
      - "Check" button becomes active
      """

  @retention @stub
  Scenario: User selects correct image
    Given the prompt is "apple"
    And images include apple, orange, banana, grape
    When the user taps the apple image
    And clicks "Check"
    Then :
      """
      - Green highlight on image
      - "✓ Correct!"
      - XP awarded
      """

  @retention @stub
  Scenario: User selects wrong image
    Given the prompt is "apple"
    When the user taps orange (wrong)
    And clicks "Check"
    Then :
      """
      - Red highlight on wrong image
      - Correct image highlighted in green
      - "✗ Incorrect. Apple is..."
      - No XP awarded
      - (If hearts are enabled for free tier) This wrong attempt costs 1 heart
      """

  @retention @stub
  Scenario: Sentence-to-image matching
    Given the prompt: "A girl is reading a book"
    And images: [woman writing, girl reading, boy sleeping, man eating]
    When the user selects correct image (girl reading)
    Then it's accepted: "✓ Correct!"

  @retention @stub
  Scenario: Image deselection
    Given the user selected an image
    When they tap it again or tap another
    Then :
      """
      - Previous selection deselected
      - New image selected
      - Only one can be selected at a time
      """

  @retention @stub
  Scenario: Ambiguous/similar images
    Given images that are very similar
    When the user selects one
    Then the app accepts reasonable answers
      """
      Or provides hint: "Choose the one with..."
      """

  @retention @stub
  Scenario: Free user heart system
    Given hearts are enabled
    And a free user with 2 hearts
    When they select a wrong image
    Then they lose a heart: "❤️ 2" → "❤️ 1"
    When they retry with another wrong image
    Then they lose a heart: "❤️ 1" → "❤️ 0"
    And the lesson continues (no blocking)
    And the app suggests review to regain hearts

  @retention @stub
  Scenario: Hint reveals correct image
    Given a difficult image selection
    When the user clicks "Hint"
    Then :
      """
      - Correct image highlighted subtly
      - Or a clue: "The image on the left"
      - Hint is consumed
      """

  @retention @stub
  Scenario: Image quality and clarity
    Given the images used
    When the exercise displays
    Then :
      """
      - Images are clear and recognizable
      - High quality (not blurry)
      - Appropriate difficulty for level
      """
