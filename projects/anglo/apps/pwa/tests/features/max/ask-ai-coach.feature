@core
# Tier: @core
# Load-bearing for: Max value-add
# Psychological intent: Deeper coaching feels like a tutor, not a punishment gate.
Feature: Ask-AI Deeper Coaching (Max)
  As a learner
  I want to ask an AI coach for deeper explanations
  So that I can understand mistakes beyond the basic "Why?"

  Background:
    Given "Why?" explanations are free and authored
    And Ask-AI deeper coaching is Max-only

  Scenario: "Why?" remains free
    Given a free learner answers incorrectly
    When they tap "Why?"
    Then they see an authored explanation
    And no paywall appears

  Scenario: Ask-AI deeper coaching is gated for Free
    Given a free learner wants more detail
    When they tap "Ask AI"
    Then the Max paywall appears
    And the lesson remains playable without paying

  Scenario: Max unlock enables Ask-AI coaching
    Given a learner has Max active
    When they tap "Ask AI"
    Then a deeper coaching response is shown
    And the session can continue

  Scenario: Ask-AI works without VPN
    Given a learner is on a RU network without VPN
    And Max is active
    When they use Ask-AI coaching
    Then the response returns without VPN dependency
