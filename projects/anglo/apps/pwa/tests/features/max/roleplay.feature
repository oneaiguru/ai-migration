@core
# Tier: @core
# Load-bearing for: Max value-add
# Psychological intent: Conversation practice builds confidence without blocking core learning.
Feature: Roleplay (Max)
  As a learner
  I want to practice conversations with AI roles
  So that I can rehearse real-world scenarios

  Background:
    Given Roleplay is a Max-only value-add
    And core lessons and review remain free

  Scenario: Roleplay entry point is visible but gated for Free
    Given a free learner opens the Roleplay surface
    Then they see a preview or description
    And the Max paywall appears when they attempt to start

  Scenario: Roleplay does not block core learning
    Given a free learner dismisses the paywall
    Then they can continue lessons or review without restriction

  Scenario: Max unlock enables Roleplay
    Given a learner has Max active
    When they start a Roleplay session
    Then the session launches without a paywall
    And feedback is delivered after the conversation

  Scenario: Roleplay works without VPN
    Given a learner is on a RU network without VPN
    When they start Roleplay with Max active
    Then the session loads and responds normally
