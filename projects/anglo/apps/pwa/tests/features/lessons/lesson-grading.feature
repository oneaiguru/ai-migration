@core
# Tier: @core
# Load-bearing for: Feel-smart loop
# Psychological intent: Instant feedback drives confidence; errors feel safe and learnable.
# MVP scope (preserve effect):
# - Feedback <=200ms for correct/incorrect.
# - Show correct answer + brief 'why' link for selected items.
# - Encouraging tone; no shame.
# Pitfalls / anti-patterns:
# - Don't punish users with long lockouts after mistakes.
# Success signals:
# - Lesson completion rate
# - Error-to-next-action rate
Feature: Lesson Grading and Feedback
  As a learner
  I want to receive clear feedback on my answers
  So that I can understand mistakes and learn correctly

  Background:
    Given an exercise is presented with an answer key

  @core @stub
  Scenario: Immediate feedback on correct answer
    Given the user submits a correct answer
    When the check button is pressed
    Then within 200ms:
      """
      - Green checkmark appears: "✓"
      - Positive message: "Correct!", "Great!", "Perfect!"
      - XP points display: "+10 XP"
      - Encouraging animation (optional)
      """

  @core @stub
  Scenario: Immediate feedback on incorrect answer
    Given the user submits an incorrect answer
    When the check button is pressed
    Then within 200ms:
      """
      - Red X appears: "✗"
      - Neutral message: "Not quite." or "Try again."
      - Correct answer is shown
      - A hint or explanation provided
      - No XP awarded
      - (If hearts are enabled for free users, this wrong attempt costs 1 heart)
      """

  @v2
  Scenario: Explanation of grammar mistake
    Given the user made a grammar error: "He go" instead of "He goes"
    When the correction screen appears
    Then a tip is shown: "3rd person singular needs -s: 'He/She/It GOES'"
    And an example: "I go, you go, he/she/it GOES"

  @v2
  Scenario: Vocabulary hint on wrong answer
    Given the user translated a word incorrectly
    When the correction screen appears
    Then the word is explained:
      """
      - English word: "house"
      - Translation: "дом"
      - Context example: "I live in a house." = "Я живу в доме."
      - Related words: "apartment (квартира), room (комната)"
      """

  @v2
  Scenario: Pronunciation feedback on listening exercise
    Given a user struggled with a listening exercise
    When they get it wrong
    Then a screen appears with:
      """
      - "You heard 'X' but it was actually 'Y'"
      - Audio of the correct word plays
      - Phonetic breakdown (if applicable)
      """

  @core @stub
  Scenario: Consistency across exercise types
    Given exercises of different types (tap, type, listen, match)
    When any answer is submitted
    Then feedback follows same UX pattern:
      """
      1. Visual indicator (✓ or ✗)
      2. Clear message
      3. Correct answer (if wrong)
      4. Explanation/hint
      5. Option to continue
      """

  @core
  Scenario: Per-answer feedback loop with progress indicator
    Given a lesson has 10 exercises
    When the learner answers an exercise correctly
    Then the progress indicator shows "X/10" and advances by one
    And the progress bar fills proportionally
    When the learner answers an exercise incorrectly
    Then the progress indicator remains visible
    And the learner must tap "Continue" to proceed

  @v2
  Scenario: Streak notification on correct answer
    Given the user is building a streak (5+ correct in a row)
    When they answer correctly again
    Then a "streak counter" updates: "6 in a row! 🔥"
    And this encourages continued correct answers

  @v2
  Scenario: Encouragement after struggle
    Given the user has gotten 2+ wrong answers in a row
    When they finally answer correctly
    Then a special message appears: "You got it! Great persistence! 💪"
    And bonus XP: "+15 XP (for determination)"

  @v2
  Scenario: Free user feedback on heart loss
    Given hearts are enabled
    And a free user has 1 heart remaining
    When they attempt another answer after a wrong attempt
    Then a warning appears before checking:
      """
      - "⚠️ This is your last heart!"
      - "Next wrong answer will cost your last heart."
      - "Ready?"
      """
    And if they proceed and fail, heart is lost with message:
      """
      - "❤️ You lost a heart! 0 remaining."
      """

  @v2
  Scenario: Learning path feedback (spaced repetition)
    Given a user learns a new word
    When they complete the lesson
    Then backend tracks:
      """
      - Word learned: "hello"
      - Performance: "Correct on first try" → Strength: 100%
      - Next review: "In 3 days"
      """
    And this word may appear in practice later

  @v2
  Scenario: Detailed answer analysis (optional)
    Given an advanced user completes a lesson
    When they visit the lesson stats/review
    Then they can see:
      | Metric | Value |
      | Total Questions | 12 |
      | Correct | 10 |
      | Accuracy | 83% |
      | Avg Time per Q | 6.5 sec |
      | Hardest Question | #7 (Match Pairs) |
      | Time Spent | 8:32 |
    And a breakdown by exercise type (tap: 8/8, type: 2/4, listen: 0/1, etc.)

  @core @stub
  Scenario: No frustration on learning exercises
    Given an exercise allows retry
    When a user retries after a wrong answer
    Then :
      """
      - No penalty beyond the heart cost for free tier on wrong attempts when hearts are enabled
      - Reset to fresh state
      - No judgment or negative message
      - "Try again!" is encouraging, not condescending
      """
