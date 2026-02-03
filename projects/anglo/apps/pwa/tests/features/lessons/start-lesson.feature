@core
# Tier: @core
# Load-bearing for: Core learning experience
# Psychological intent: Fast start; minimal friction from 'open app' to 'I’m learning'.
# MVP scope (preserve effect):
# - One-tap start from path (continue button).
# - Resume mid-lesson after interruptions.
# - Intro lesson is exactly 6 exercises.
# Pitfalls / anti-patterns:
# - Don't show paywalls before first lesson.
# Success signals:
# - Time-to-start-lesson
# - Lesson start success rate
Feature: Start Lesson
  As a learner
  I want to start (or continue) a lesson in one tap
  So that I can get into learning immediately

  Background:
    Given a learner can be anonymous or logged in
    And the learner is viewing their learning path

  Scenario: Continue button starts the next path lesson
    Given the home screen shows a "Continue" button
    When the learner taps "Continue"
    Then the next lesson loads
    And the first exercise appears

  Scenario: Intro lesson is intentionally short
    Given the learner is starting Lesson 1 for the first time
    When the lesson loads
    Then the lesson contains exactly 6 exercises
    And it is designed to be very easy

  @retention
  Scenario: Learner can resume a lesson after interruption
    Given a learner is halfway through a lesson
    When the app is closed or the network drops
    And the learner returns within 30 minutes
    Then the lesson resumes at the last exercise
    And previously answered items are preserved
