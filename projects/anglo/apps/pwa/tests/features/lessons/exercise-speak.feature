@retention
# Tier: @retention
# Load-bearing for: Credibility/skill depth
# Psychological intent: Speaking adds 'this is real' feel and increases attachment; should be skippable.
# MVP scope (preserve effect):
# - Optional speaking prompts with mic permission.
# - Skip button.
# - Basic scoring (lenient) or 'record only' MVP.
# Pitfalls / anti-patterns:
# - Don't hard-require mic for progress.
Feature: Speaking/Pronunciation Exercise
  As a learner wanting to improve pronunciation
  I want to record myself speaking
  So that I can practice English pronunciation

  Background:
    Given a lesson is active
    And a "speak" exercise is displayed
    And the user has granted microphone permission

  @v2
  Scenario: Speaking exercise structure
    Given the exercise loads
    Then I should see:
      | Element | Content |
      | Prompt (English) | "Say: Hello, how are you?" |
      | Instruction | "Tap and speak" or "Press record" |
      | Record Button | Large microphone icon |
      | Playback | Speaker icon (to hear reference audio) |

  @v2
  Scenario: User grants microphone permission
    Given a speaking exercise
    When the user first attempts to record
    And permission dialog appears
    Then :
      """
      - "english.dance would like to access your microphone"
      - "Allow" / "Don't Allow" options
      - If Allow: microphone enabled
      - If Deny: message "Microphone required for speaking"
      """

  @v2
  Scenario: User records speech
    Given the record button is tapped
    When the user starts speaking
    Then :
      """
      - Recording indicator shows waveform
      - Timer counts elapsed time
      - User speaks phrase: "Hello, how are you?"
      - Visual feedback confirms recording
      """

  @v2
  Scenario: User stops recording
    Given recording is active
    When the user taps stop (or auto-stops after phrase)
    Then :
      """
      - Recording ends
      - Audio captured locally
      - Playback button available
      - "Check" button active
      """

  @v2
  Scenario: User reviews recording
    Given a recording was just made
    When the user taps playback
    Then :
      """
      - Their recorded voice plays back
      - Waveform visualized
      - Can listen to themselves
      """

  @v2
  Scenario: Reference audio comparison
    Given the exercise has reference audio
    When the user taps "Listen to example"
    Then :
      """
      - Native speaker version plays
      - User compares to their attempt
      """

  @v2
  Scenario: Pronunciation scoring
    Given recording is complete
    When the user clicks "Check"
    Then speech-to-text and pronunciation evaluated:
      """
      - Accuracy: "Transcribed: Hello how are you?" (matches prompt)
      - Pronunciation score: 85/100
      - Feedback: "Good pronunciation. Work on: 'are' sounds a bit rushed"
      """

  @v2
  Scenario: Perfect pronunciation
    Given user's speech matches well
    When evaluation completes
    Then :
      """
      - "✓ Excellent! Pronunciation sounds great!"
      - XP awarded
      - Advance to next exercise
      """

  @v2
  Scenario: Needs improvement
    Given user's pronunciation is off
    When evaluated
    Then :
      """
      - "Good try! Here's feedback:"
      - Specific tips: "Focus on the 'ow' sound in 'how'"
      - "Try again?" button
      - Can re-record and retry
      - (If hearts are enabled for free tier) This incorrect attempt costs 1 heart
      """

  @v2
  Scenario: Silent or no sound detection
    Given the user taps record but doesn't speak
    When they submit
    Then :
      """
      - Error: "No sound detected"
      - "Try again" prompt
      - No heart/XP lost (even if hearts are enabled)
      """

  @v2
  Scenario: Poor audio quality
    Given high background noise
    When the user records
    Then :
      """
      - Transcription may fail
      - Message: "Background noise too high. Try a quieter place"
      - User can retry
      """

  @v2
  Scenario: Free vs Max speaking coach feedback
    Given speaking exercises
    When a free user completes them
    Then :
      """
      - Core speaking exercise is available in free
      - AI coach feedback is gated behind Max
      - Paywall appears only when "Speaking coach" is tapped
      """
    And Max users get speaking coach feedback

  @v2
  Scenario: Speaking tips/pronunciation guide
    Given a difficult sound (e.g., "th")
    When the user accesses tips
    Then :
      """
      - Pronunciation guide: "Tongue between teeth: [θ]"
      - Slow-motion video of mouth (optional)
      - Example words: "think, thank, three"
      """

  @v2
  Scenario: Accessibility: Audio transcription option
    Given hearing-impaired users
    When speech exercise is displayed
    And user has enabled "Captions"
    Then :
      """
      - Transcript shown: "[Woman's voice] Hello, how are you?"
      - User can still practice but with text
      """

  @v2
  Scenario: Recording timeout
    Given a very long speaking exercise
    When user is still speaking after 60 seconds
    Then :
      """
      - Auto-stop: "Recording is limited to 60 seconds"
      - Allow submit of what's recorded
      - Or restart for another attempt
      """
