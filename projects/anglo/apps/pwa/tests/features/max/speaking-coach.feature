@core
# Tier: @core
# Load-bearing for: Max value-add
# Psychological intent: Speaking feedback boosts credibility; paywall should not block lessons.
Feature: Speaking Coach (Max)
  As a learner
  I want detailed speaking feedback
  So that I can improve pronunciation

  Background:
    Given basic speaking exercises are available in free
    And Speaking coach feedback is Max-only

  Scenario: Speaking coach entry point is gated for Free
    Given a free learner completes a speaking exercise
    When they tap "Speaking coach"
    Then the Max paywall appears
    And the lesson remains playable without paying

  Scenario: Max unlock enables speaking coach feedback
    Given a learner has Max active
    When they tap "Speaking coach"
    Then they receive pronunciation feedback
    And the lesson can continue

  Scenario: Speaking coach works without VPN
    Given a learner is on a RU network without VPN
    And Max is active
    When they request speaking coach feedback
    Then feedback loads without VPN dependency
