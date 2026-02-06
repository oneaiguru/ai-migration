@core
# Tier: @core
# Load-bearing for: Credibility
# Psychological intent: Clear errors preserve trust; confusion makes users churn.
# MVP scope (preserve effect):
# - Friendly network errors with retry.
# - Form validation errors.
# - Offline-safe messaging.
Feature: Error Handling and Edge Cases
  As a learner
  I want clear, calm error messages
  So that I understand what happened and can keep learning

  Background:
    Given network and server errors can happen
    And the app should fail gracefully

  Scenario: Friendly network error with retry
    Given a network request fails
    When the app cannot load fresh content
    Then the user sees:
      """
      - "Can't connect right now"
      - A "Try again" button
      - A hint: "You can still do Review if available"
      """

  Scenario: Form validation is clear
    Given a user is creating an account
    When they enter an invalid email
    Then an inline error appears: "Please enter a valid email"

  @core
  Scenario: Server outage does not destroy trust
    Given the server is temporarily unavailable
    When the learner opens the app
    Then the app shows a calm status message
    And provides any cached learning actions (review/offline lessons)
    And avoids scary or blamey language

  @v2
  Scenario: Rate limit handling (optional)
    Given a user triggers too many requests
    Then the system applies backoff automatically
