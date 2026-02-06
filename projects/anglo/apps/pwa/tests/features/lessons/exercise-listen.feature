@core
# Tier: @core
# Load-bearing for: Credibility (audio)
# Psychological intent: Audio makes it feel like a real course and improves comprehension.
# MVP scope (preserve effect):
# - Listen + choose/tap answer.
# - Replay audio, slow playback (v2).
# - Captions accessibility toggle.
# Pitfalls / anti-patterns:
# - Don't block learning if audio fails—fallback to text.
Feature: Listen Exercise
  As a learner
  I want to listen to audio and respond
  So that I can practice listening comprehension

  Background:
    Given a lesson is active
    And a "listen_tap" or "listen_type" exercise is displayed

  @core @stub
  Scenario: Listen and tap exercise
    Given the exercise loads
    Then I should see:
      | Element | Content |
      | Instruction | "Tap the sentence you hear" |
      | Audio Button | Play icon, ready to press |
      | Options | 3-4 English sentence choices |
    And the audio has not played yet

  @core @stub
  Scenario: Audio plays on user request
    Given the exercise shows the play button
    When the user taps the play/audio button
    Then audio plays with English sentence: "Hello, how are you?"
    And a waveform or timer shows playback progress
    And a repeat button appears (to play again)

  @core @stub
  Scenario: User selects correct option after listening
    Given the audio was: "Hello, how are you?"
    And options shown are:
      """
      - "Hello, how are you?"
      - "Goodbye, how are you?"
      - "Hello, who are you?"
      """
    When the user taps the first option (the one they heard)
    And clicks "Check" or it auto-submits
    Then success: "✓ Correct! +10 XP"

  @core @stub
  Scenario: User selects wrong option
    Given they heard "Hello, how are you?"
    When the user taps "Goodbye, how are you?"
    Then incorrect screen appears: "✗ Not quite. You heard: 'Hello, how are you?'"
    And if hearts are enabled (free tier), this wrong attempt costs 1 heart
    And the user can retry

  @core @stub
  Scenario: Listen and type exercise
    Given a "listen_type" exercise
    When the audio button is tapped
    And audio plays: "Hello"
    Then a text input appears below
    And the user can type "Hello"
    And submit to check

  @core @stub
  Scenario: Audio plays automatically on some exercises
    Given some exercises have auto-play enabled
    When the exercise loads
    Then audio automatically plays without needing a tap
    And a message: "Listen:" appears before playback
    And the user can still replay with the play button

  @core @stub
  Scenario: Pronunciation hints
    Given a listen exercise with tricky English sounds
    When the user clicks "Pronunciation Tips"
    Then a note appears: "English 'th' (θ) requires tongue between teeth"
    And a phonetic example: "think, thank, three"

  @core @stub
  Scenario: User can play audio multiple times
    Given a listen exercise is active
    When the user taps the play button 3 times
    Then audio plays all 3 times without limit
    And they can take time to understand

  @core @stub
  Scenario: Audio quality and clarity
    Given the audio recording
    Then it should be clear, native speaker pronunciation
    And at natural speed (maybe slower in early lessons, normal in later)
    And no background noise

  @core @stub
  Scenario: Hearing impairment accommodation
    Given a listen exercise
    And the user has enabled "Captions" in settings
    Then a transcript appears: "[Woman's voice] Hello, how are you?"
    And the user can still practice but with text backup

  @core @stub
  Scenario: Free user hearts on listen exercise
    Given hearts are enabled
    And a free user with 2 hearts
    When they give a wrong answer in a listen exercise
    Then they lose a heart: "❤️ 2" → "❤️ 1"
    When they give another wrong answer
    Then they lose a heart: "❤️ 1" → "❤️ 0"
    And the app offers: "Review to regain hearts" (no waiting, no upgrade required)
